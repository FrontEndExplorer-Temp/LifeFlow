import express from 'express';
const router = express.Router();
import {
    generateDailyPlan,
    getTaskSuggestions,
    getHabitInsights,
    getTaskBreakdown,
    getFinanceInsights,
    summarizeNote,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/daily-plan').post(protect, generateDailyPlan);
router.route('/task-suggestions').post(protect, getTaskSuggestions);
router.route('/habit-insights').post(protect, getHabitInsights);
router.route('/breakdown').post(protect, getTaskBreakdown);
router.route('/finance-insights').post(protect, getFinanceInsights);
router.route('/summarize-note').post(protect, summarizeNote);

export default router;
