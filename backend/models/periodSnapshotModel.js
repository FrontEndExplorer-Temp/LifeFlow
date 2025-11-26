import mongoose from 'mongoose';

const periodSnapshotSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
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
        averageProductivity: {
            type: Number,
            default: 0,
        },
        jobApplicationsCount: {
            type: Number,
            default: 0,
        },
        habitCompletionRate: {
            type: Number, // Percentage
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const PeriodSnapshot = mongoose.model('PeriodSnapshot', periodSnapshotSchema);

export default PeriodSnapshot;
