import express from 'express';
const router = express.Router();
import { getUsers, deleteUser, toggleBan, updateUserRole, getSystemStats, broadcastNotification, getAdminLogs, getSystemSettings, toggleMaintenanceMode, updateGlobalKey } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);
router.route('/users/:id/ban').post(protect, admin, toggleBan);
router.route('/users/:id/role').put(protect, admin, updateUserRole);
router.route('/stats').get(protect, admin, getSystemStats);
router.route('/broadcast').post(protect, admin, broadcastNotification);
router.route('/logs').get(protect, admin, getAdminLogs);
router.route('/settings').get(protect, admin, getSystemSettings);
router.route('/maintenance').put(protect, admin, toggleMaintenanceMode);
router.route('/ai-key').put(protect, admin, updateGlobalKey);

export default router;
