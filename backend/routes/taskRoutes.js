import express from 'express';
const router = express.Router();
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController.js';
import { protect, checkMaintenanceMode } from '../middleware/authMiddleware.js';

router.route('/').get(protect, checkMaintenanceMode, getTasks).post(protect, checkMaintenanceMode, createTask);
router.route('/:id').put(protect, checkMaintenanceMode, updateTask).delete(protect, checkMaintenanceMode, deleteTask);

export default router;
