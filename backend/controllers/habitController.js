import asyncHandler from 'express-async-handler';
import Habit from '../models/habitModel.js';
import { addXP, checkBadges, XP_REWARDS } from '../services/gamificationService.js';

// Helper function to normalize date to start of day
const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper function to calculate streak
const calculateStreak = (completions) => {
    if (completions.length === 0) return 0;

    const sortedDates = completions
        .map(d => normalizeDate(d))
        .sort((a, b) => b - a);

    const today = normalizeDate(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if last completion was today or yesterday
    const lastCompletion = sortedDates[0];
    if (lastCompletion < yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const current = sortedDates[i];
        const previous = sortedDates[i - 1];
        const dayDiff = Math.floor((previous - current) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

// @desc    Get all habits
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
});

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
    const { name, description, frequency, targetDays, color } = req.body;

    const habit = await Habit.create({
        user: req.user._id,
        name,
        description,
        frequency,
        targetDays,
        color,
    });

    res.status(201).json(habit);
});

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedHabit);
});

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await habit.deleteOne();

    res.json({ message: 'Habit removed' });
});

// @desc    Toggle habit completion for a date
// @route   POST /api/habits/:id/toggle
// @access  Private
const toggleCompletion = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const { date } = req.body;
    const targetDate = normalizeDate(date || new Date());

    // Check if date already exists in completions
    const existingIndex = habit.completions.findIndex(
        d => normalizeDate(d).getTime() === targetDate.getTime()
    );

    let gamification = {};

    if (existingIndex > -1) {
        // Remove completion
        habit.completions.splice(existingIndex, 1);
    } else {
        // Add completion
        habit.completions.push(targetDate);

        // --- Gamification Logic ---
        try {
            const xpResult = await addXP(req.user._id, XP_REWARDS.HABIT_COMPLETION);
            const newBadges = await checkBadges(req.user._id, 'HABIT_COMPLETE');
            gamification = { xpResult, newBadges };
        } catch (e) {
            console.error('Gamification error:', e);
        }
    }

    // Recalculate streak
    habit.currentStreak = calculateStreak(habit.completions);
    if (habit.currentStreak > habit.bestStreak) {
        habit.bestStreak = habit.currentStreak;
    }

    await habit.save();
    res.json({ ...habit.toObject(), gamification });
});

export {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion
};
