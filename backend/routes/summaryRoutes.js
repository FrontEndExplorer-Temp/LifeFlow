import express from 'express';
const router = express.Router();
import { getTodaySummary } from '../controllers/summaryController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/today', protect, getTodaySummary);

export default router;
