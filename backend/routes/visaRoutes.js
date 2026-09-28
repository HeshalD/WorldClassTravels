import express from 'express';
import Visa from '../models/Visa.js';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import uploadVisaImage from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// @route   POST /api/visas
// @desc    Create a new visa
// @access  Private/Admin
router.post('/', protect, isAdmin, uploadVisaImage, [
    body('country', 'Country is required').trim().notEmpty(),
    body('duration', 'Duration is required').trim().notEmpty(),
    body('price', 'Valid price is required').isNumeric().isFloat({ min: 0 }),
    body('description', 'Description is required').trim().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { country, duration, price, description } = req.body;

        const existingVisa = await Visa.findOne({ country });
        if (existingVisa) {
            return res.status(400).json({
                success: false,
                message: 'Visa for this country already exists'
            });
        }

        const newVisa = new Visa({
            country,
            duration,
            price,
            description,
            coverImage: req.file?.path,      // Cloudinary URL  ✅
            imagePath: req.file?.filename    // Cloudinary public_id ✅
        });

        await newVisa.save();
        res.status(201).json({ success: true, data: newVisa });

    } catch (error) {
        console.error('Error creating visa:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/visas
// @desc    Get all visas
// @access  Public
router.get('/', async (req, res) => {
    try {
        const visas = await Visa.find().sort({ country: 1 });
        res.status(200).json({ success: true, count: visas.length, data: visas });
    } catch (error) {
        console.error('Error fetching visas:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/visas/:id
// @desc    Get visa by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid visa ID' });
        }
        const visa = await Visa.findById(req.params.id);
        if (!visa) {
            return res.status(404).json({ success: false, message: 'Visa not found' });
        }
        res.status(200).json({ success: true, data: visa });
    } catch (error) {
        console.error('Error fetching visa:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/visas/country/:country
// @desc    Get visa by country name
// @access  Public
router.get('/country/:country', async (req, res) => {
    try {
        const visa = await Visa.findOne({
            country: { $regex: new RegExp('^' + req.params.country + '$', 'i') }
        });
        if (!visa) {
            return res.status(404).json({ success: false, message: 'Visa not found for the specified country' });
        }
        res.status(200).json({ success: true, data: visa });
    } catch (error) {
        console.error('Error fetching visa by country:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/visas/:id
// @desc    Update a visa
// @access  Private/Admin
router.put('/:id', protect, isAdmin, uploadVisaImage, [
    body('country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
    body('duration').optional().trim().notEmpty().withMessage('Duration cannot be empty'),
    body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid visa ID' });
        }

        if (req.body.country) {
            const existingVisa = await Visa.findOne({
                _id: { $ne: req.params.id },
                country: req.body.country
            });
            if (existingVisa) {
                return res.status(400).json({ success: false, message: 'Visa for this country already exists' });
            }
        }

        const updateFields = {};
        if (req.body.country) updateFields.country = req.body.country;
        if (req.body.duration) updateFields.duration = req.body.duration;
        if (req.body.price) updateFields.price = req.body.price;
        if (req.body.description) updateFields.description = req.body.description;

        // Handle image update — FIX: coverImage = URL (path), imagePath = public_id (filename)
        if (req.file) {
            const oldVisa = await Visa.findById(req.params.id);

            // Delete old image from Cloudinary if it exists
            if (oldVisa?.imagePath) {
                try {
                    await cloudinary.uploader.destroy(oldVisa.imagePath);
                } catch (err) {
                    console.error('Error deleting old Cloudinary image:', err);
                }
            }

            updateFields.coverImage = req.file.path;      // Cloudinary URL ✅
            updateFields.imagePath = req.file.filename;   // Cloudinary public_id ✅
        }

        const updatedVisa = await Visa.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedVisa) {
            return res.status(404).json({ success: false, message: 'Visa not found' });
        }

        res.status(200).json({ success: true, data: updatedVisa });

    } catch (error) {
        console.error('Error updating visa:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/visas/:id
// @desc    Delete a visa
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const visa = await Visa.findById(req.params.id);
        if (!visa) {
            return res.status(404).json({ success: false, message: 'Visa not found' });
        }

        // Delete image from Cloudinary
        if (visa.imagePath) {
            try {
                await cloudinary.uploader.destroy(visa.imagePath);
            } catch (err) {
                console.error('Error deleting Cloudinary image:', err);
            }
        }

        await Visa.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Visa deleted successfully' });

    } catch (error) {
        console.error('Error deleting visa:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;