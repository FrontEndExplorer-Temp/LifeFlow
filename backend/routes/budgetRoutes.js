import express from 'express';
const router = express.Router();
import {
    getBudgets,
    setBudget,
    deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getBudgets).post(protect, setBudget);
router.route('/:id').delete(protect, deleteBudget);

export default router;
