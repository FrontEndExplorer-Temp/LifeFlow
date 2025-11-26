import asyncHandler from 'express-async-handler';
import Timer from '../models/timerModel.js';
import DailySummary from '../models/dailySummaryModel.js';

// @desc    Start a new timer
// @route   POST /api/timers/start
// @access  Private
const startTimer = asyncHandler(async (req, res) => {
    const { description, tags } = req.body;

    // Check if there is already a running timer
    const activeTimer = await Timer.findOne({
        user: req.user._id,
        status: { $in: ['running', 'paused'] },
    });

    if (activeTimer) {
        res.status(400);
        throw new Error('You already have an active timer');
    }

    const timer = await Timer.create({
        user: req.user._id,
        startTime: new Date(),
        description,
        tags,
        status: 'running',
    });

    res.status(201).json(timer);
});

// @desc    Stop active timer
// @route   POST /api/timers/stop
// @access  Private
const stopTimer = asyncHandler(async (req, res) => {
    const timer = await Timer.findOne({
        user: req.user._id,
        status: { $in: ['running', 'paused'] },
    });

    if (!timer) {
        res.status(404);
        throw new Error('No active timer found');
    }

    const now = new Date();
    let duration = 0;

    // Calculate duration
    // Total time = (endTime - startTime) - (total pause duration)

    // If currently paused, we need to close the last pause
    if (timer.status === 'paused') {
        const lastPause = timer.pauses[timer.pauses.length - 1];
        if (!lastPause.end) {
            lastPause.end = now;
        }
    }

    const totalTime = now - timer.startTime; // in ms

    let totalPauseTime = 0;
    timer.pauses.forEach(pause => {
        if (pause.end && pause.start) {
            totalPauseTime += (pause.end - pause.start);
        }
    });

    duration = Math.floor((totalTime - totalPauseTime) / 1000); // in seconds

    timer.endTime = now;
    timer.status = 'completed';
    timer.duration = duration;

    await timer.save();

    // --- AGGREGATION START ---
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const updatedWork = await DailySummary.findOneAndUpdate(
        { user: req.user._id, date: today },
        {
            $inc: { totalWorkSeconds: duration },
            $setOnInsert: { user: req.user._id, date: today }
        },
        { upsert: true, new: true }
    );
    // If we closed a pause when stopping the timer, add that last pause time to totalBreakSeconds
    try {
        if (timer.status === 'completed' && timer.pauses && timer.pauses.length > 0) {
            const lastPause = timer.pauses[timer.pauses.length - 1];
            if (lastPause && lastPause.start && lastPause.end) {
                const pauseSec = Math.floor((lastPause.end - lastPause.start) / 1000);
                if (pauseSec > 0) {
                    const updated = await DailySummary.findOneAndUpdate(
                        { user: req.user._id, date: today },
                        { $inc: { totalBreakSeconds: pauseSec }, $setOnInsert: { user: req.user._id, date: today } },
                        { upsert: true, new: true }
                    );
                    

                    // Recompute productivity score
                    const work = updated.totalWorkSeconds || 0;
                    const br = updated.totalBreakSeconds || 0;
                    let score = 0;
                    if (work + br > 0) score = Math.round((work / (work + br)) * 100);
                    if (updated.completedTasksCount) score = Math.min(100, score + (updated.completedTasksCount * 2));
                    await DailySummary.findByIdAndUpdate(updated._id, { $set: { productivityScore: score } });
                }
            }
        }
    } catch (e) {
        console.error('Error updating break seconds/productivity for DailySummary:', e.message || e);
    }
    // --- AGGREGATION END ---

    res.json(timer);
});

// @desc    Pause active timer
// @route   POST /api/timers/pause
// @access  Private
const pauseTimer = asyncHandler(async (req, res) => {
    const timer = await Timer.findOne({
        user: req.user._id,
        status: 'running',
    });

    if (!timer) {
        res.status(404);
        throw new Error('No running timer found');
    }

    timer.status = 'paused';
    timer.pauses.push({ start: new Date() });

    await timer.save();

    res.json(timer);
});

// @desc    Resume active timer
// @route   POST /api/timers/resume
// @access  Private
const resumeTimer = asyncHandler(async (req, res) => {
    const timer = await Timer.findOne({
        user: req.user._id,
        status: 'paused',
    });

    if (!timer) {
        res.status(404);
        throw new Error('No paused timer found');
    }

    const lastPause = timer.pauses[timer.pauses.length - 1];
    if (lastPause && !lastPause.end) {
        lastPause.end = new Date();
        // Add this pause duration to DailySummary
        try {
            const today = new Date().toISOString().split('T')[0];
            const pauseSec = Math.floor((lastPause.end - lastPause.start) / 1000);
                    if (pauseSec > 0) {
                        // updated logged above

                // Recompute productivity score
                const work = updated.totalWorkSeconds || 0;
                const br = updated.totalBreakSeconds || 0;
                let score = 0;
                if (work + br > 0) score = Math.round((work / (work + br)) * 100);
                if (updated.completedTasksCount) score = Math.min(100, score + (updated.completedTasksCount * 2));
                await DailySummary.findByIdAndUpdate(updated._id, { $set: { productivityScore: score } });
            }
        } catch (e) {
            console.error('Error updating break seconds on resume:', e.message || e);
        }
    }

    timer.status = 'running';

    await timer.save();

    res.json(timer);
});

// @desc    Get active timer
// @route   GET /api/timers/active
// @access  Private
const getActiveTimer = asyncHandler(async (req, res) => {
    const timer = await Timer.findOne({
        user: req.user._id,
        status: { $in: ['running', 'paused'] },
    });

    if (timer) {
        res.json(timer);
    } else {
        res.json(null);
    }
});

export { startTimer, stopTimer, pauseTimer, resumeTimer, getActiveTimer };
