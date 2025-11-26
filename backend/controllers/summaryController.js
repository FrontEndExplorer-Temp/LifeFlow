import asyncHandler from 'express-async-handler';
import DailySummary from '../models/dailySummaryModel.js';

// @desc    Get today's summary
// @route   GET /api/summary/today
// @access  Private
const getTodaySummary = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const summary = await DailySummary.findOne({
        user: req.user._id,
        date: today,
    });

    // Disable HTTP caching for summary responses to ensure clients always get fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (summary) {
        res.json(summary);
    } else {
        // Return empty stats if no summary exists yet
        const empty = {
            totalWorkSeconds: 0,
            totalBreakSeconds: 0,
            completedTasksCount: 0,
            productivityScore: 0,
        };
        res.json(empty);
    }
});

export { getTodaySummary };
