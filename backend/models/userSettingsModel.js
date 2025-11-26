import mongoose from 'mongoose';

const userSettingsSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        periodLength: {
            type: Number,
            default: 30, // Default 30 days
        },
        currentPeriodStart: {
            type: Date,
            default: Date.now,
        },
        // Add other settings here later (e.g., theme, notifications)
    },
    {
        timestamps: true,
    }
);

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
