import express from 'express';
import { body, validationResult } from 'express-validator';
import Ticket from '../models/Tickets.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const router = express.Router();
dotenv.config({ path: './.env' });

// Email transporter configuration (same as in authRoutes)
const transporter = nodemailer.createTransport({
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

// Helper function to send ticket confirmation email
const sendTicketConfirmationEmail = async (ticket) => {
    try {
        const mailOptions = {
            from: `"WorldClassTravels" <${process.env.EMAIL_USERNAME}>`,
            to: ticket.userEmail,
            subject: 'Your Flight Booking Request - WorldClassTravels',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Thank You for Your Flight Booking Request</h2>
                    <p>Dear ${ticket.userFirstName} ${ticket.userLastName},</p>
                    
                    <p>We've received your flight booking request with the following details:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Booking Details</h3>
                        <p><strong>Trip Type:</strong> ${ticket.tripType}</p>
                        <p><strong>Departure:</strong> ${ticket.departureLocation}</p>
                        <p><strong>Arrival:</strong> ${ticket.arrivalLocation}</p>
                        <p><strong>Departure Date:</strong> ${new Date(ticket.departureDate).toLocaleDateString()}</p>
                        ${ticket.returnDate ? `<p><strong>Return Date:</strong> ${new Date(ticket.returnDate).toLocaleDateString()}</p>` : ''}
                        <p><strong>Cabin Class:</strong> ${ticket.cabinType}</p>
                        <p><strong>Passengers:</strong> ${ticket.passengers}</p>
                    </div>
                    
                    <p>Our team is currently processing your request and will contact you shortly to confirm your booking and discuss the next steps.</p>
                    
                    <p>If you have any questions or need immediate assistance, please don't hesitate to contact our customer support at ${process.env.SUPPORT_EMAIL || 'support@worldclasstravels.com'} or call us at ${process.env.SUPPORT_PHONE || '+1 (555) 123-4567'}.</p>
                    
                    <p>Thank you for choosing WorldClassTravels for your travel needs!</p>
                    
                    <p>Best regards,<br>The WorldClassTravels Team</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending ticket confirmation email:', error);
        // Don't throw error, just log it
    }
};

// @route   POST /api/tickets
// @desc    Create a new ticket
// @access  Private
router.post('/', [
    body('userID').isMongoId().withMessage('Valid user ID is required'),
    body('userFirstName').trim().notEmpty().withMessage('First name is required'),
    body('userLastName').trim().notEmpty().withMessage('Last name is required'),
    body('userPhoneNumber').matches(/^[0-9]{10,15}$/).withMessage('Valid phone number is required'),
    body('userEmail').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('tripType').isIn(['one-way', 'round-trip', 'multi-city']).withMessage('Valid trip type is required'),
    body('departureLocation').trim().notEmpty().withMessage('Departure location is required'),
    body('arrivalLocation').trim().notEmpty().withMessage('Arrival location is required'),
    body('departureDate').isISO8601().withMessage('Valid departure date is required'),
    body('returnDate').optional({ nullable: true, checkFalsy: true }).isISO8601()
        .custom((value, { req }) => {
            if (req.body.tripType === 'round-trip' && !value) {
                throw new Error('Return date is required for round-trip tickets');
            }
            return true;
        }),
    body('cabinType').isIn(['economy', 'premium economy', 'business', 'first class']).withMessage('Valid cabin type is required'),
    body('passengers').isInt({ min: 1, max: 10 }).withMessage('Number of passengers must be between 1 and 10')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            userID,
            userFirstName,
            userLastName,
            userPhoneNumber,
            userEmail,
            tripType,
            departureLocation,
            arrivalLocation,
            departureDate,
            returnDate,
            cabinType,
            passengers
        } = req.body;

        // Verify user exists
        const user = await User.findById(userID).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'User not found' });
        }

        // Create new ticket
        const ticket = new Ticket({
            userID,
            userFirstName,
            userLastName,
            userPhoneNumber,
            userEmail: userEmail.toLowerCase(),
            tripType,
            departureLocation,
            arrivalLocation,
            departureDate: new Date(departureDate),
            returnDate: returnDate ? new Date(returnDate) : null,
            cabinType,
            passengers,
            status: 'pending'
        });

        await ticket.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Send confirmation email (don't wait for it to complete)
        sendTicketConfirmationEmail(ticket).catch(console.error);

        res.status(201).json({
            message: 'Ticket request submitted successfully',
            ticket
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/tickets
// @desc    Get all tickets (admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tickets/user/:userId
// @desc    Get tickets by user ID
// @access  Private
router.get('/user/:userId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const tickets = await Ticket.find({ userID: req.params.userId })
            .sort({ createdAt: -1 });
            
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ticket ID' });
        }

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tickets/:id
// @desc    Update a ticket
// @access  Private/Admin
router.put('/:id', [
    body('status').optional().isIn(['pending', 'processing', 'confirmed', 'cancelled'])
        .withMessage('Invalid status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ticket ID' });
        }

        const updateData = { ...req.body };
        
        // Convert date strings to Date objects if they exist
        if (updateData.departureDate) {
            updateData.departureDate = new Date(updateData.departureDate);
        }
        if (updateData.returnDate) {
            updateData.returnDate = new Date(updateData.returnDate);
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({
            message: 'Ticket updated successfully',
            ticket
        });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
