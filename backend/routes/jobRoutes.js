import express from 'express';
const router = express.Router();
import { getJobs, createJob, updateJob, deleteJob, getJobStats } from '../controllers/jobController.js';
import { protect, checkMaintenanceMode } from '../middleware/authMiddleware.js';

router.route('/').get(protect, checkMaintenanceMode, getJobs).post(protect, checkMaintenanceMode, createJob);
router.route('/stats').get(protect, checkMaintenanceMode, getJobStats);
router.route('/:id').put(protect, checkMaintenanceMode, updateJob).delete(protect, checkMaintenanceMode, deleteJob);

export default router;
