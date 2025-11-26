import asyncHandler from 'express-async-handler';
import Task from '../models/taskModel.js';
import DailySummary from '../models/dailySummaryModel.js';
import { addXP, checkBadges, XP_REWARDS } from '../services/gamificationService.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority, tags, subtasks, dueDate } = req.body;

    const task = await Task.create({
        user: req.user._id,
        title,
        description,
        status,
        priority,
        tags,
        subtasks,
        dueDate,
    });

    res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Ensure user owns the task
    if (task.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const prevStatus = task.status;

    const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    // If task transitioned to Completed, increment daily summary completedTasksCount
    try {
        const newStatus = (updatedTask.status || '').toString().toLowerCase();
        const oldStatus = (prevStatus || '').toString().toLowerCase();
        if (oldStatus !== 'completed' && newStatus === 'completed') {
            const today = new Date().toISOString().split('T')[0];
            const updated = await DailySummary.findOneAndUpdate(
                { user: req.user._id, date: today },
                { $inc: { completedTasksCount: 1 }, $setOnInsert: { user: req.user._id, date: today } },
                { upsert: true, new: true }
            );

            // Recompute productivity score using work and break
            const work = updated.totalWorkSeconds || 0;
            const br = updated.totalBreakSeconds || 0;
            let score = 0;
            if (work + br > 0) score = Math.round((work / (work + br)) * 100);
            // Give small bonus per completed task
            if (updated.completedTasksCount) score = Math.min(100, score + (updated.completedTasksCount * 2));
            await DailySummary.findByIdAndUpdate(updated._id, { $set: { productivityScore: score } });
        }

        // --- Gamification Logic ---
        let gamification = {};
        if (oldStatus !== 'completed' && newStatus === 'completed') {
            const xpResult = await addXP(req.user._id, XP_REWARDS.TASK_COMPLETION);
            const newBadges = await checkBadges(req.user._id, 'TASK_COMPLETE');
            gamification = { xpResult, newBadges };
        }

        res.json({ ...updatedTask.toObject(), gamification });
        return;

    } catch (e) {
        console.error('Error updating DailySummary/Gamification on task complete:', e.message || e);
    }

    res.json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await task.deleteOne();

    res.json({ message: 'Task removed' });
});

export { getTasks, createTask, updateTask, deleteTask };
