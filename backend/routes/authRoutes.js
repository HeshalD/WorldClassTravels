import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import TempUser from '../models/TempUser.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';

const router = express.Router();
dotenv.config({ path: './.env' });   

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

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
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

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

const normalizeEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.toLowerCase().trim().split('@');
    if (domain === 'gmail.com') {
        return `${local.replace(/\./g, '')}@${domain}`;
    }
    return email.toLowerCase().trim();
};

// Register a new user (temporary)
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
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { firstName, lastName, email, password, phoneNumber } = req.body;
            const normalizedEmail = normalizeEmail(email);

            // Check if user already exists in User collection
            const existingUser = await User.findOne({ email: normalizedEmail }).session(session);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            // Delete any existing temp user with this email
            await TempUser.deleteOne({ email: normalizedEmail }).session(session);
            
            // Create and save new temp user
            const tempUser = new TempUser({
                firstName,
                lastName,
                email: normalizedEmail,
                password,
                phoneNumber
            });

            // Generate and save OTP
            const otp = tempUser.createOTP();
            await tempUser.save({ session });

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

            res.status(200).json({
                status: 'success',
                message: 'OTP sent to your email. Please verify to complete registration.',
                tempUserId: tempUser._id
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message 
        });
    } finally {
        await session.endSession();
    }
});

// Verify OTP and create user
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;
        const normalizedEmail = normalizeEmail(email);

        // Find and delete temp user, explicitly including the password field
        const tempUser = await TempUser.findOneAndDelete({ 
            email: normalizedEmail,
            otp,
            otpExpires: { $gt: Date.now() }
        })
        .select('+password') // Explicitly include the password field
        .session(session);

        if (!tempUser) {
         // Check if user is already verified
        const existingUser = await User.findOne({ email: normalizedEmail }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'This email is already registered and verified' });
        }
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
        }

        // Create actual user with hashed password from TempUser
        const user = new User({
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            email: tempUser.email,
            password: tempUser.password, // Already hashed in TempUser pre-save hook
            phoneNumber: tempUser.phoneNumber,
            isVerified: true
        });

        // Explicitly validate the user before saving
        const validationError = user.validateSync();
        if (validationError) {
            console.error('User validation error:', validationError);
            throw new Error('User validation failed');
        }

        await user.save({ session });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
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
        await session.abortTransaction();
        session.endSession();
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
});

// Resend OTP
router.post('/resend-otp', [
    body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email } = req.body;
            const normalizedEmail = normalizeEmail(email);

            // Find temp user with case-insensitive email search
            const tempUser = await TempUser.findOne({ 
                email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
            }).session(session);

            if (!tempUser) {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'No pending registration found for this email. Please register again.' 
                });
            }

            // Check if user is already verified
            const existingUser = await User.findOne({ 
                email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
            }).session(session);
            
            if (existingUser) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'This email is already registered and verified' 
                });
            }

            // Generate new OTP
            const otp = tempUser.createOTP();
            await tempUser.save({ session });

            // Send new OTP to email
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: normalizedEmail,
                subject: 'New OTP - WorldClassTravels',
                text: `Your new OTP for email verification is: ${otp}. This OTP is valid for 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>New OTP for Verification</h2>
                        <p>Hello ${tempUser.firstName},</p>
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
                message: 'New OTP sent to your email'
            });
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error resending OTP', 
            error: error.message 
        });
    } finally {
        await session.endSession();
    }
});

// Login route
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').exists().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        // 1) Check if user exists and is verified
        const user = await User.findOne({ email: normalizedEmail, isVerified: true }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // 2) Verify password
        const isPasswordCorrect = await user.correctPassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        // 3) Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 4) Remove password from output
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred during login. Please try again later.'
        });
    }
});

// Protect middleware - verifies JWT token
const protect = async (req, res, next) => {
    try {
        let token;
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists and include password field
        const currentUser = await User.findById(decoded.id).select('+password');
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
        }
        
        // Attach the user without the password to the request
        req.user = currentUser;

        // Grant access to protected route
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

// Update user account
router.patch('/update-account', protect, [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty')
        .isLength({ max: 50 }).withMessage('First name cannot be more than 50 characters'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty')
        .isLength({ max: 50 }).withMessage('Last name cannot be more than 50 characters'),
    body('email').custom((value, { req }) => {
        if (value) {
            throw new Error('Email address cannot be changed. Please contact support if you need to update your email.');
        }
        return true;
    }),
    body('phoneNumber').optional().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('currentPassword').if(body('newPassword').exists()).notEmpty().withMessage('Current password is required when changing password'),
    body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword, email, ...updateData } = req.body;
        const user = req.user;

        // Remove email from updateData if somehow it's still there
        if (email) {
            delete updateData.email;
        }

        // If changing password
        if (newPassword) {
            // Verify current password
            const isPasswordCorrect = await user.correctPassword(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Current password is incorrect.'
                });
            }
            updateData.password = newPassword;
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -otp -otpExpires -__v');

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating your account. Please try again later.'
        });
    }
});

// Delete user account
router.delete('/delete-account', protect, [
    body('password').exists().withMessage('Password is required to confirm account deletion')
], async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { password } = req.body;
            const user = req.user;

            // Verify password
            const isPasswordCorrect = await user.correctPassword(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Incorrect password. Please try again.'
                });
            }

            // Delete user
            await User.findByIdAndDelete(user._id).session(session);

            // Here you might want to delete any associated data in other collections
            // For example: await SomeOtherModel.deleteMany({ user: user._id }).session(session);

            res.status(204).json({
                status: 'success',
                data: null
            });
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting your account. Please try again later.'
        });
    } finally {
        await session.endSession();
    }
});

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to user's email
const sendOTPEmail = async (email, otp) => {
    if (!transporter) {
        throw new Error('Email transporter is not configured');
    }

    const mailOptions = {
        from: `"World Class Travels" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Use the following OTP to proceed:</p>
                <div style="background: #f4f4f4; padding: 10px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                    ${otp}
                </div>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
// @access  Public
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email }).select('+otp +otpExpires');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'If an account with this email exists, a password reset OTP has been sent' 
            });
        }

        // Generate OTP and set expiry (10 minutes from now)
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP to user
        user.otp = await bcrypt.hash(otp, 12);
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false });

        // Send OTP to user's email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            email: email // Return the email for the frontend to use in the next step
        });

    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing your request. Please try again.' 
        });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-password-otp', [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, otp } = req.body;

    try {
        // Find user with unexpired OTP
        const user = await User.findOne({
            email,
            otpExpires: { $gt: Date.now() }
        }).select('+otp +otpExpires');

        if (!user || !(await user.correctPassword(otp, user.otp))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        // Set token expiry (1 hour from now)
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
        
        // Clear the OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            resetToken
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP. Please try again.'
        });
    }
});

// @route   PATCH /api/auth/reset-password
// @desc    Reset password after OTP verification
// @access  Public
router.patch('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, password } = req.body;

    try {
        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user by token and check if it's not expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired'
            });
        }

        // Update password and clear reset token
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // TODO: Send password change confirmation email

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password. Please try again.'
        });
    }
});

export default router;