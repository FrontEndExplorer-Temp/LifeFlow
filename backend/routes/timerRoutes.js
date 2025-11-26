import express from 'express';
const router = express.Router();
import {
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getActiveTimer,
} from '../controllers/timerController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/start', protect, startTimer);
router.post('/stop', protect, stopTimer);
router.post('/pause', protect, pauseTimer);
router.post('/resume', protect, resumeTimer);
router.get('/active', protect, getActiveTimer);

export default router;
