import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Use the same secret that was used to sign the token in adminAuthRoutes
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}

// Protect middleware - verifies JWT token
export const protect = async (req, res, next) => {
    try {
        let token;
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token received:', token);
        } else {
            console.log('No token found in Authorization header');
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // Verify token
        console.log('Using JWT_SECRET:', JWT_SECRET ? 'Secret is set' : 'Secret is NOT set');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Handle both admin token structure and regular user token structure
        let userId, userRole;
        
        if (decoded.admin) {
            // This is an admin token (from adminAuthRoutes)
            userId = decoded.admin.id;
            userRole = decoded.admin.role;
        } else if (decoded.id) {
            // This is a regular user token
            userId = decoded.id;
            userRole = decoded.role;
        } else {
            console.error('Invalid token structure:', decoded);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token format.'
            });
        }

        // For admin users, we don't need to check the database
        if (userRole === 'admin' || userRole === 'superadmin') {
            req.user = {
                id: userId,
                role: userRole,
                isAdmin: true
            };
            return next();
        }

        // For regular users, check if they exist in the database
        console.log('Looking for user with ID:', userId);
        const currentUser = await User.findById(userId).select('+password');
        
        if (!currentUser) {
            console.error('No user found with ID:', userId);
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
        }
        
        // Attach the user without the password to the request
        req.user = currentUser;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token. Please log in again.'
        });
    }
};

// Middleware to check if user is admin or superadmin
export const isAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
        return res.status(403).json({ 
            success: false, 
            message: 'Not authorized to perform this action. Admin access required.' 
        });
    }
    next();
};
