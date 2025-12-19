import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: './.env' });

const router = express.Router();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN;

// Hardcoded admin credentials
const HARDCODED_ADMIN = {
    id: '1',
    name: 'Admin User',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'superadmin'
};

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if email matches hardcoded admin
        if (email !== HARDCODED_ADMIN.email) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password (direct comparison since we're using plain text in this case)
        if (password !== HARDCODED_ADMIN.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create and return JWT token
        const payload = {
            admin: {
                id: HARDCODED_ADMIN.id,
                role: HARDCODED_ADMIN.role
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    success: true, 
                    token,
                    admin: {
                        id: HARDCODED_ADMIN.id,
                        name: HARDCODED_ADMIN.name,
                        email: HARDCODED_ADMIN.email,
                        role: HARDCODED_ADMIN.role
                    }
                });
            }
        );
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   POST /api/admin/logout
// @desc    Logout admin (client should remove the token)
// @access  Private (Admin)
router.post('/logout', (req, res) => {
    // Since JWT is stateless, the client needs to remove the token
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

// @route   GET /api/admin/me
// @desc    Get current admin profile
// @access  Private (Admin)
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');
        
        // Check if no token
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token, authorization denied' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if admin ID matches hardcoded admin
        if (decoded.admin.id !== HARDCODED_ADMIN.id) {
            return res.status(404).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }

        const { password, ...adminData } = HARDCODED_ADMIN;
        res.json({ 
            success: true, 
            admin: adminData 
        });
    } catch (err) {
        console.error('Get admin profile error:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token is not valid' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Middleware to verify admin token
export const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');
        
        // Check if no token
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token, authorization denied' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if admin ID matches hardcoded admin
        if (decoded.admin.id !== HARDCODED_ADMIN.id) {
            return res.status(404).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }

        // Add admin to request object
        const { password, ...adminData } = HARDCODED_ADMIN;
        req.admin = adminData;
        next();
    } catch (err) {
        console.error('Admin auth middleware error:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token is not valid' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

export default router;
