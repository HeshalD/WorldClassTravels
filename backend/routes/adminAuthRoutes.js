import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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

// Helper — reads token from Authorization: Bearer header
const getTokenFromHeader = (req) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
};

// @route   POST /api/admin/login
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
        if (email !== HARDCODED_ADMIN.email) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (password !== HARDCODED_ADMIN.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const payload = {
            admin: {
                id: HARDCODED_ADMIN.id,
                role: HARDCODED_ADMIN.role
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }, (err, token) => {
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
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/logout
// @access  Private
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// @route   GET /api/admin/me
// @access  Private (Admin)
router.get('/me', async (req, res) => {
    try {
        // FIX: read from Authorization: Bearer instead of x-auth-token
        const token = getTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.admin.id !== HARDCODED_ADMIN.id) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const { password, ...adminData } = HARDCODED_ADMIN;
        res.json({ success: true, admin: adminData });
    } catch (err) {
        console.error('Get admin profile error:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token is not valid' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Admin auth middleware
// FIX: reads from Authorization: Bearer instead of x-auth-token
export const adminAuth = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req);

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.admin.id !== HARDCODED_ADMIN.id) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const { password, ...adminData } = HARDCODED_ADMIN;
        req.admin = adminData;
        next();
    } catch (err) {
        console.error('Admin auth middleware error:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token is not valid' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export default router;