import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config({ path: './.env' })   

// Email transporter configuration
let transporter;
try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.error('Email configuration is missing. Please check your .env file');
        console.error('Required variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD');
    }

    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Only for testing with self-signed certificates
        }
    });

    // Verify connection configuration
    transporter.verify(function(error, success) {
        if (error) {
            console.error('Email server connection error:', error);
        } else {
            console.log('Email server is ready to take our messages');
        }
    });
} catch (error) {
    console.error('Failed to create email transporter:', error);
}

// Register a new user
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name cannot be more than 50 characters'),
    body('lastName').trim().notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name cannot be more than 50 characters'),
    body('email').isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phoneNumber
        });

        // Generate OTP
        const otp = user.createOTP();
        await user.save({ validateBeforeSave: false });
        console.log(`Generated OTP for ${email}:`, otp);

        // Send OTP to email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Verify Your Email - WorldClassTravels',
            text: `Your OTP for email verification is: ${otp}. This OTP is valid for 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Hello ${firstName},</p>
                    <p>Thank you for registering with WorldClassTravels. Please use the following OTP to verify your email address:</p>
                    <div style="background: #f4f4f4; padding: 10px; text-align: center; margin: 20px 0;">
                        <h1 style="margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>WorldClassTravels Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            status: 'success',
            message: 'OTP sent to your email. Please verify to complete registration.',
            userId: user._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Verify OTP
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email: originalEmail, otp } = req.body;
        console.log(`Verifying OTP for ${originalEmail}, OTP: ${otp}`);

        // Normalize email (convert to lowercase and remove dots from local part)
        const normalizedEmail = originalEmail.toLowerCase().split('@').map((part, i) => 
            i === 0 ? part.replace(/\./g, '') : part
        ).join('@');

        // Find user by normalized email
        const user = await User.findOne({ 
            $or: [
                { email: originalEmail },
                { email: normalizedEmail },
                { email: { $regex: `^${originalEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
            ]
        }).select('+otp +otpExpires');
        
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('Stored OTP:', user.otp);
            console.log('OTP Expires:', user.otpExpires);
            console.log('Current time:', new Date());
            console.log('OTP matches:', user.otp === otp);
            console.log('OTP not expired:', user.otpExpires > new Date());
        }

        // Manually verify OTP and expiration
        if (!user || !user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ 
                message: 'Invalid or expired OTP',
                details: {
                    userExists: !!user,
                    hasOtp: !!(user && user.otp),
                    otpMatches: !!(user && user.otp === otp),
                    otpNotExpired: !!(user && user.otpExpires > new Date())
                }
            });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
        );

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});

// Resend OTP
router.post('/resend-otp', [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new OTP
        const otp = user.createOTP();
        await user.save({ validateBeforeSave: false });

        // Send OTP to email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'New OTP - WorldClassTravels',
            text: `Your new OTP for email verification is: ${otp}. This OTP is valid for 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New OTP for Verification</h2>
                    <p>Hello ${user.firstName},</p>
                    <p>Here's your new OTP for email verification:</p>
                    <div style="background: #f4f4f4; padding: 10px; text-align: center; margin: 20px 0;">
                        <h1 style="margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>WorldClassTravels Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 'success',
            message: 'New OTP sent to your email',
            userId: user._id
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
});

export default router;