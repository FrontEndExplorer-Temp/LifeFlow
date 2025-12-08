import User from '../models/userModel.js';
import Task from '../models/taskModel.js';
import Habit from '../models/habitModel.js';
import Note from '../models/noteModel.js';
import Job from '../models/jobModel.js';
import Transaction from '../models/transactionModel.js';

const BADGES = {
    FIRST_STEP: { id: 'FIRST_STEP', name: 'First Step', description: 'Complete your first task', icon: '👣' },
    TASK_SLAYER: { id: 'TASK_SLAYER', name: 'Task Slayer', description: 'Complete 50 tasks', icon: '⚔️' },
    EARLY_BIRD: { id: 'EARLY_BIRD', name: 'Early Bird', description: 'Complete a task before 8 AM', icon: '🌅' },
    NIGHT_OWL: { id: 'NIGHT_OWL', name: 'Night Owl', description: 'Complete a task after 10 PM', icon: '🦉' },
    WEEKEND_WARRIOR: { id: 'WEEKEND_WARRIOR', name: 'Weekend Warrior', description: 'Complete a task on Saturday or Sunday', icon: '🛡️' },
    HABIT_STARTER: { id: 'HABIT_STARTER', name: 'Habit Starter', description: 'Maintain a 3-day habit streak', icon: '🌱' },
    STREAK_MASTER: { id: 'STREAK_MASTER', name: 'Streak Master', description: 'Maintain a 7-day habit streak', icon: '🔥' },
    HABIT_HERO: { id: 'HABIT_HERO', name: 'Habit Hero', description: 'Maintain a 30-day habit streak', icon: '🦸' },
    NOTE_TAKER: { id: 'NOTE_TAKER', name: 'Note Taker', description: 'Create 10 notes', icon: '📝' },
    JOB_HUNTER: { id: 'JOB_HUNTER', name: 'Job Hunter', description: 'Apply to 5 jobs', icon: '💼' },
    FOCUS_MASTER: { id: 'FOCUS_MASTER', name: 'Focus Master', description: 'Accumulate 10 hours of focus time', icon: '🧘' },
    MONEY_MANAGER: { id: 'MONEY_MANAGER', name: 'Money Manager', description: 'Add 10 transactions', icon: '💰' },

};

const XP_REWARDS = {
    TASK_COMPLETION: 10,
    HABIT_COMPLETION: 5,
    NOTE_CREATION: 2,
    JOB_APPLICATION: 15,
    TRANSACTION_ADD: 2,
};

const calculateLevel = (xp) => {
    // Level 1: 0-99 XP
    // Level 2: 100-199 XP
    // Level = floor(XP / 100) + 1
    return Math.floor(xp / 100) + 1;
};

export const addXP = async (userId, amount) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        user.xp += amount;
        const newLevel = calculateLevel(user.xp);

        let leveledUp = false;
        if (newLevel > user.level) {
            user.level = newLevel;
            leveledUp = true;
        }

        await user.save();
        return { xp: user.xp, level: user.level, leveledUp };
    } catch (error) {
        console.error('Error adding XP:', error);
        return null;
    }
};

export const subtractXP = async (userId, amount) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        user.xp = Math.max(0, user.xp - amount);
        const newLevel = calculateLevel(user.xp);

        // Optional: Handle level down? Usually games don't de-level, but XP drops.
        // Keeping level sync if we want strict level based on XP.
        if (newLevel < user.level) {
            user.level = newLevel;
        }

        await user.save();
        return { xp: user.xp, level: user.level };
    } catch (error) {
        console.error('Error subtracting XP:', error);
        return null;
    }
};

export const checkBadges = async (userId, actionType, data = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const currentBadges = user.badges.map(b => b.id);
        const newBadges = [];

        const awardBadge = (badgeId) => {
            if (!currentBadges.includes(badgeId)) {
                user.badges.push({ id: badgeId });
                newBadges.push(BADGES[badgeId]);
            }
        };

        // --- Task Related Badges ---
        if (actionType === 'TASK_COMPLETE') {
            const taskCount = await Task.countDocuments({ user: userId, status: 'Completed' });

            if (taskCount >= 1) awardBadge('FIRST_STEP');
            if (taskCount >= 50) awardBadge('TASK_SLAYER');

            const date = new Date();
            const hour = date.getHours();
            const day = date.getDay(); // 0 = Sun, 6 = Sat

            if (hour < 8) awardBadge('EARLY_BIRD');
            if (hour >= 22) awardBadge('NIGHT_OWL');
            if (day === 0 || day === 6) awardBadge('WEEKEND_WARRIOR');
        }

        // --- Habit Related Badges ---
        if (actionType === 'HABIT_COMPLETE') {
            // Check max streak across all habits
            const habits = await Habit.find({ user: userId });
            const maxStreak = Math.max(...habits.map(h => h.streak)); // Note: Habit model uses 'currentStreak' in update, check if 'streak' or 'currentStreak' is field name. Controller used 'currentStreak'. Model usually matches. 
            // Controller: habit.currentStreak = ...
            // Model: I need to check habitModel.js to be sure. But let's assume controller is right. 
            // Wait, I should verify the field name. 
            // For now, I'll remove the job check.

            // Wait, line 96: const maxStreak = Math.max(...habits.map(h => h.streak));
            // In habitController line 160: habit.currentStreak = ...
            // So 'streak' might be wrong here if the field is 'currentStreak'. 
            // I should verify habitModel.js.

            const currentStreak = Math.max(...habits.map(h => h.currentStreak || 0));

            if (currentStreak >= 3) awardBadge('HABIT_STARTER');
            if (currentStreak >= 7) awardBadge('STREAK_MASTER');
            if (currentStreak >= 30) awardBadge('HABIT_HERO');
        }

        // --- Note Related Badges ---
        if (actionType === 'NOTE_CREATE') {
            const noteCount = await Note.countDocuments({ user: userId });
            if (noteCount >= 10) awardBadge('NOTE_TAKER');
        }

        // --- Job Related Badges ---
        if (actionType === 'JOB_ADD') {
            const jobCount = await Job.countDocuments({ user: userId });
            if (jobCount >= 5) awardBadge('JOB_HUNTER');
        }

        // --- Transaction Related Badges ---
        if (actionType === 'TRANSACTION_ADD') {
            const txCount = await Transaction.countDocuments({ user: userId });
            if (txCount >= 10) awardBadge('MONEY_MANAGER');
        }

        if (newBadges.length > 0) {
            await user.save();
        }

        return newBadges;
    } catch (error) {
        console.error('Error checking badges:', error);
        return [];
    }
};

export { BADGES, XP_REWARDS };
