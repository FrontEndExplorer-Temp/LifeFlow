import express from 'express';
import { getHabits, createHabit, updateHabit, deleteHabit, toggleCompletion } from '../controllers/habitController.js';
import { protect, checkMaintenanceMode } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, checkMaintenanceMode, getHabits)
    .post(protect, checkMaintenanceMode, createHabit);

router.route('/:id')
    .put(protect, checkMaintenanceMode, updateHabit)
    .delete(protect, checkMaintenanceMode, deleteHabit);

router.route('/:id/toggle').put(protect, checkMaintenanceMode, toggleCompletion);

export default router;
