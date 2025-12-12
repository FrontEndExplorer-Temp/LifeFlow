import express from 'express';
const router = express.Router();
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from '../controllers/noteController.js';
import { protect, checkMaintenanceMode } from '../middleware/authMiddleware.js';

router.route('/').get(protect, checkMaintenanceMode, getNotes).post(protect, checkMaintenanceMode, createNote);
router.route('/:id').put(protect, checkMaintenanceMode, updateNote).delete(protect, checkMaintenanceMode, deleteNote);

export default router;
