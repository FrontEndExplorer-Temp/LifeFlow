import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 });
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
});

// Helper to create notification (internal use)
const createNotification = async (userId, title, message, type = 'info', data = null) => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            data
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = asyncHandler(async (req, res) => {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'All notifications cleared' });
});

export { getNotifications, markAsRead, markAllAsRead, clearAllNotifications, createNotification };
