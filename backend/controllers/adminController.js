import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import Task from '../models/taskModel.js';
import Habit from '../models/habitModel.js';
import AdminLog from '../models/adminLogModel.js';
import SystemSetting from '../models/systemSettingModel.js';
import asyncHandler from 'express-async-handler';
import { createNotification } from './notificationController.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();

        // Log Action
        await AdminLog.create({
            admin: req.user._id,
            action: 'DELETE_USER',
            details: { deletedUserName: user.name, deletedUserEmail: user.email }
        });

        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle user ban status (with optional timeout)
// @route   POST /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBan = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const { banDuration } = req.body; // duration in hours (optional)

    if (user) {
        user.isBanned = !user.isBanned;

        // Handle Temporary Ban
        if (user.isBanned && banDuration) {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + parseInt(banDuration));
            user.bannedExpiresAt = expiresAt;
        } else {
            user.bannedExpiresAt = null;
        }

        await user.save();

        // Log Action
        await AdminLog.create({
            admin: req.user._id,
            action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
            target: user._id,
            details: {
                duration: banDuration ? `${banDuration} hours` : 'Permanent',
                expiresAt: user.bannedExpiresAt
            }
        });

        res.json({
            _id: user._id,
            isBanned: user.isBanned,
            bannedExpiresAt: user.bannedExpiresAt,
            message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user role (Promote/Demote)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isAdmin = !user.isAdmin;
        await user.save();

        // Log Action
        await AdminLog.create({
            admin: req.user._id,
            action: user.isAdmin ? 'PROMOTE_ADMIN' : 'DEMOTE_ADMIN',
            target: user._id,
        });

        res.json({
            _id: user._id,
            isAdmin: user.isAdmin,
            message: `User ${user.isAdmin ? 'promoted to Admin' : 'demoted to User'}`
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get admin activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAdminLogs = asyncHandler(async (req, res) => {
    const logs = await AdminLog.find({})
        .populate('admin', 'name email')
        .populate('target', 'name email')
        .sort({ createdAt: -1 })
        .limit(100);
    res.json(logs);
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = asyncHandler(async (req, res) => {
    const settings = await SystemSetting.findOne();
    if (settings) {
        res.json({
            isMaintenanceMode: settings.isMaintenanceMode,
            hasGlobalKey: !!settings.globalGeminiKey // Don't return the actual key for security if looking at plain settings
        });
    } else {
        res.json({ isMaintenanceMode: false, hasGlobalKey: false });
    }
});

// @desc    Toggle Maintenance Mode
// @route   PUT /api/admin/maintenance
// @access  Private/Admin
const toggleMaintenanceMode = asyncHandler(async (req, res) => {
    let settings = await SystemSetting.findOne();
    if (!settings) {
        settings = await SystemSetting.create({});
    }

    settings.isMaintenanceMode = !settings.isMaintenanceMode;
    await settings.save();

    await AdminLog.create({
        admin: req.user._id,
        action: settings.isMaintenanceMode ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
        details: { mode: settings.isMaintenanceMode }
    });

    res.json({
        message: `Maintenance Mode ${settings.isMaintenanceMode ? 'Enabled' : 'Disabled'}`,
        isMaintenanceMode: settings.isMaintenanceMode
    });
});

// @desc    Update Global AI Key
// @route   PUT /api/admin/ai-key
// @access  Private/Admin
const updateGlobalKey = asyncHandler(async (req, res) => {
    const { key } = req.body;

    let settings = await SystemSetting.findOne();
    if (!settings) {
        settings = await SystemSetting.create({});
    }

    settings.globalGeminiKey = key;
    await settings.save();

    await AdminLog.create({
        admin: req.user._id,
        action: 'UPDATE_GLOBAL_KEY',
        details: { hasKey: !!key }
    });

    res.json({
        message: 'Global AI Key updated successfully',
        hasGlobalKey: !!settings.globalGeminiKey
    });
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({});
    const totalTasks = await Task.countDocuments({});
    const totalHabits = await Habit.countDocuments({});

    // Calculate new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
        totalUsers,
        totalTasks,
        totalHabits,
        newUsers
    });
});

// @desc    Broadcast notification to all users
// @route   POST /api/admin/broadcast
// @access  Private/Admin
const broadcastNotification = asyncHandler(async (req, res) => {
    const { title, message, type } = req.body;

    if (!title || !message) {
        res.status(400);
        throw new Error('Title and Message are required');
    }

    const users = await User.find({}).select('_id');
    const notifications = users.map(user => ({
        user: user._id,
        title,
        message,
        type: type || 'info',
        isRead: false
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    // Log Action
    await AdminLog.create({
        admin: req.user._id,
        action: 'BROADCAST_SENT',
        details: { title, message, recipientCount: users.length }
    });

    res.json({ message: `Broadcast sent to ${users.length} users` });
});

export {
    getUsers,
    deleteUser,
    toggleBan,
    updateUserRole,
    getSystemStats,
    broadcastNotification,
    getAdminLogs,
    getSystemSettings,
    toggleMaintenanceMode,
    updateGlobalKey
};
