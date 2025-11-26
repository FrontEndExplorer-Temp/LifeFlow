import express from 'express';
const router = express.Router();
import {
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    parseJobLink,
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getJobs).post(protect, createJob);
router.post('/parse', protect, parseJobLink);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

export default router;
