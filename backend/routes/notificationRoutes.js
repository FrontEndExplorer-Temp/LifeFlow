import express from 'express';
const router = express.Router();
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getNotifications).delete(protect, clearAllNotifications);
router.route('/:id/read').put(protect, markAsRead);
router.route('/read-all').put(protect, markAllAsRead);

export default router;
