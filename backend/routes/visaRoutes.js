import express from 'express';
import Visa from '../models/Visa.js';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/visas
// @desc    Create a new visa
// @access  Private/Admin
router.post('/', protect , isAdmin, [
    body('country', 'Country is required').trim().notEmpty(),
    body('duration', 'Duration is required').trim().notEmpty(),
    body('price', 'Valid price is required').isNumeric().isFloat({ min: 0 }),
    body('description', 'Description is required').trim().notEmpty(),
    body('coverImage', 'Cover image URL is required').trim().isURL()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { country, duration, price, description, coverImage } = req.body;
        
        // Check if visa for this country already exists
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
            coverImage
        });

        const savedVisa = await newVisa.save();
        res.status(201).json({ success: true, data: savedVisa });
    } catch (error) {
        console.error('Error creating visa:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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

// @route   GET /api/visas/country/:country
// @desc    Get visa by country name
// @access  Public
router.get('/country/:country', async (req, res) => {
    try {
        const visa = await Visa.findOne({ 
            country: { $regex: new RegExp('^' + req.params.country + '$', 'i') } 
        });
        
        if (!visa) {
            return res.status(404).json({ 
                success: false, 
                message: 'Visa not found for the specified country' 
            });
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
router.put('/:id', protect, isAdmin, [
    body('country', 'Country is required').optional().trim().notEmpty(),
    body('duration', 'Duration is required').optional().trim().notEmpty(),
    body('price', 'Valid price is required').optional().isNumeric().isFloat({ min: 0 }),
    body('description', 'Description is required').optional().trim().notEmpty(),
    body('coverImage', 'Valid URL is required').optional().trim().isURL()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid visa ID' 
            });
        }

        // Check if country already exists for another visa
        if (req.body.country) {
            const existingVisa = await Visa.findOne({ 
                _id: { $ne: req.params.id },
                country: req.body.country 
            });
            
            if (existingVisa) {
                return res.status(400).json({
                    success: false,
                    message: 'Visa for this country already exists'
                });
            }
        }

        const updatedVisa = await Visa.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedVisa) {
            return res.status(404).json({ 
                success: false, 
                message: 'Visa not found' 
            });
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
router.delete('/:id', protect , isAdmin, async (req, res) => {
    try {
        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid visa ID' 
            });
        }

        const deletedVisa = await Visa.findByIdAndDelete(req.params.id);
        
        if (!deletedVisa) {
            return res.status(404).json({ 
                success: false, 
                message: 'Visa not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Visa deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting visa:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
