import express from 'express';
const router = express.Router();
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);

export default router;
