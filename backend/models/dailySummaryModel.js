import mongoose from 'mongoose';

const dailySummarySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: {
            type: String, // Format: YYYY-MM-DD
            required: true,
        },
        totalWorkSeconds: {
            type: Number,
            default: 0,
        },
        totalBreakSeconds: {
            type: Number,
            default: 0,
        },
        completedTasksCount: {
            type: Number,
            default: 0,
        },
        productivityScore: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one summary per user per day
dailySummarySchema.index({ user: 1, date: 1 }, { unique: true });

const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

export default DailySummary;
