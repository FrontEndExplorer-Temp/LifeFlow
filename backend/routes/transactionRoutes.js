import express from 'express';
const router = express.Router();
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyStats,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/stats/:month').get(protect, getMonthlyStats);
router.route('/:id').put(protect, updateTransaction).delete(protect, deleteTransaction);

export default router;
