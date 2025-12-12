import express from 'express';
const router = express.Router();
import { getBudgets, setBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect, checkMaintenanceMode } from '../middleware/authMiddleware.js';

router.route('/').get(protect, checkMaintenanceMode, getBudgets).post(protect, checkMaintenanceMode, setBudget);
router.route('/:id').delete(protect, checkMaintenanceMode, deleteBudget);

export default router;
