import cron from 'node-cron';
import DailySummary from '../models/dailySummaryModel.js';
import PeriodSnapshot from '../models/periodSnapshotModel.js';
import UserSettings from '../models/userSettingsModel.js';
import Timer from '../models/timerModel.js';
import User from '../models/userModel.js';

const initCronJobs = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running midnight cron job...');

        try {
            const users = await User.find({});

            for (const user of users) {
                await processUserPeriod(user);
                await cleanupOldData(user);
            }

            console.log('Midnight cron job completed.');
        } catch (error) {
            console.error('Error in midnight cron job:', error);
        }
    });
};

const processUserPeriod = async (user) => {
    let settings = await UserSettings.findOne({ user: user._id });

    if (!settings) {
        // Create default settings if not exists
        settings = await UserSettings.create({ user: user._id });
    }

    const now = new Date();
    const currentPeriodStart = new Date(settings.currentPeriodStart);
    const periodLength = settings.periodLength;

    // Calculate end date of current period
    const periodEndDate = new Date(currentPeriodStart);
    periodEndDate.setDate(periodEndDate.getDate() + periodLength);

    // Check if period has ended
    if (now >= periodEndDate) {
        console.log(`Period ended for user ${user.name}. Generating snapshot...`);

        // Aggregate data for the period
        const summaries = await DailySummary.find({
            user: user._id,
            date: {
                $gte: currentPeriodStart.toISOString().split('T')[0],
                $lt: periodEndDate.toISOString().split('T')[0]
            }
        });

        let totalWork = 0;
        let totalBreak = 0;

        summaries.forEach(summary => {
            totalWork += summary.totalWorkSeconds;
            totalBreak += summary.totalBreakSeconds;
        });

        // Create Snapshot
        await PeriodSnapshot.create({
            user: user._id,
            startDate: currentPeriodStart,
            endDate: periodEndDate,
            totalWorkSeconds: totalWork,
            totalBreakSeconds: totalBreak,
            // Add other aggregations here
        });

        // Start new period
        settings.currentPeriodStart = periodEndDate; // Or 'now' if we want to be strict
        await settings.save();

        console.log(`New period started for user ${user.name}`);
    }
};

const cleanupOldData = async (user) => {
    // Retention Rule: Delete data older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    try {
        // Delete old timers
        const deletedTimers = await Timer.deleteMany({
            user: user._id,
            createdAt: { $lt: ninetyDaysAgo }
        });

        // Delete old transactions
        const Transaction = (await import('../models/transactionModel.js')).default;
        const deletedTransactions = await Transaction.deleteMany({
            user: user._id,
            date: { $lt: ninetyDaysAgo }
        });

        // Delete old completed tasks
        const Task = (await import('../models/taskModel.js')).default;
        const deletedTasks = await Task.deleteMany({
            user: user._id,
            status: 'Done',
            updatedAt: { $lt: ninetyDaysAgo }
        });

        console.log(`Cleanup for user ${user.name}: ${deletedTimers.deletedCount} timers, ${deletedTransactions.deletedCount} transactions, ${deletedTasks.deletedCount} tasks`);
    } catch (error) {
        console.error(`Error cleaning up data for user ${user.name}:`, error);
    }

    // We keep DailySummaries, PeriodSnapshots, Notes, Jobs, and Habits forever
};

export default initCronJobs;
