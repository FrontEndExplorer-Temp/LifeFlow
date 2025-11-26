import express from 'express';
const router = express.Router();
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

export default router;
