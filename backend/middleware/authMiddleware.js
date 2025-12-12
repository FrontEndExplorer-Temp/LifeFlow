import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

const checkMaintenanceMode = asyncHandler(async (req, res, next) => {
    // Import SystemSetting here to avoid circular dependencies if any (though unlikely)
    // Dynamic import inside async function or top level if clean. Sticking to top level import is better but let's see.
    // NOTE: Need to import SystemSetting at the top.

    // Allow admins to bypass maintenance
    if (req.user && req.user.isAdmin) {
        return next();
    }

    const { default: SystemSetting } = await import('../models/systemSettingModel.js');
    const settings = await SystemSetting.findOne();

    if (settings && settings.isMaintenanceMode) {
        res.status(503);
        throw new Error('System is currently under maintenance. Please try again later.');
    }

    next();
});

export { protect, admin, checkMaintenanceMode };
