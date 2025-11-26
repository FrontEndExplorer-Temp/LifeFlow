import express from 'express';
const router = express.Router();
import {
    authUser,
    registerUser,
    getUserProfile,
    getUserStats,
    updateUserProfile,
    verifyEmail,
    checkVerificationStatus,
    forgotPassword,
    resetPassword,
    getDashboardData,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

import passport from 'passport';
import generateToken from '../utils/generateToken.js';

import {
    validateRegistration,
    validateLogin,
    validateProfileUpdate
} from '../middleware/validationMiddleware.js';

router.post('/', validateRegistration, registerUser);
router.post('/login', validateLogin, authUser);
router.get('/verify/:token', verifyEmail);
router.get('/check-verification/:email', checkVerificationStatus);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to app with token (Update scheme/host for production)
    res.redirect(`exp://localhost:8081/--/auth?token=${token}`);
});

router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`exp://localhost:8081/--/auth?token=${token}`);
});

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validateProfileUpdate, updateUserProfile);
router.route('/stats').get(protect, getUserStats);
router.route('/dashboard/:date').get(protect, getDashboardData);

export default router;

