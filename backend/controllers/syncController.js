import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import Note from '../models/noteModel.js';
import Habit from '../models/habitModel.js';
import Transaction from '../models/transactionModel.js';

// @desc    Get sync status
// @route   GET /api/sync/status
// @access  Private
const getSyncStatus = asyncHandler(async (req, res) => {
    const { lastSync } = req.query;

    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    // Count pending changes since last sync
    const [taskCount, noteCount, habitCount, transactionCount] = await Promise.all([
        Task.countDocuments({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }),
        Note.countDocuments({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }),
        Habit.countDocuments({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }),
        Transaction.countDocuments({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }),
    ]);

    res.json({
        lastSync: lastSyncDate,
        serverTime: new Date(),
        pendingChanges: {
            tasks: taskCount,
            notes: noteCount,
            habits: habitCount,
            transactions: transactionCount,
            total: taskCount + noteCount + habitCount + transactionCount,
        },
    });
});

// @desc    Bulk sync data
// @route   POST /api/sync/bulk
// @access  Private
const bulkSync = asyncHandler(async (req, res) => {
    const { lastSync } = req.body;

    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    // Fetch all changed data since last sync
    const [tasks, notes, habits, transactions] = await Promise.all([
        Task.find({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }).sort({ updatedAt: 1 }),
        Note.find({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }).sort({ updatedAt: 1 }),
        Habit.find({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }).sort({ updatedAt: 1 }),
        Transaction.find({ user: req.user._id, updatedAt: { $gt: lastSyncDate } }).sort({ updatedAt: 1 }),
    ]);

    res.json({
        syncTime: new Date(),
        data: {
            tasks,
            notes,
            habits,
            transactions,
        },
        counts: {
            tasks: tasks.length,
            notes: notes.length,
            habits: habits.length,
            transactions: transactions.length,
        },
    });
});

export { getSyncStatus, bulkSync };
