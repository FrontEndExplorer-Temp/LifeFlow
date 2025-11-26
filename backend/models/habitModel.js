import mongoose from 'mongoose';

const habitSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        frequency: {
            type: String,
            enum: ['Daily', 'Weekly', 'Custom'],
            default: 'Daily',
        },
        targetDays: [{
            type: String, // ['Mon', 'Tue', 'Wed', etc.]
        }],
        currentStreak: {
            type: Number,
            default: 0,
        },
        bestStreak: {
            type: Number,
            default: 0,
        },
        completions: [{
            type: Date,
        }],
        color: {
            type: String,
            default: '#007AFF',
        },
    },
    {
        timestamps: true,
    }
);

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
