import express from 'express';
const router = express.Router();
import {
    getSyncStatus,
    bulkSync,
} from '../controllers/syncController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/status').get(protect, getSyncStatus);
router.route('/bulk').post(protect, bulkSync);

export default router;
