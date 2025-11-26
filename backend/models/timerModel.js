import mongoose from 'mongoose';

const pauseSchema = mongoose.Schema({
    start: { type: Date, required: true },
    end: { type: Date },
});

const timerSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
        },
        duration: {
            type: Number, // in seconds
            default: 0,
        },
        status: {
            type: String,
            enum: ['running', 'paused', 'completed'],
            default: 'running',
        },
        pauses: [pauseSchema],
        description: {
            type: String,
        },
        tags: [{
            type: String,
        }],
    },
    {
        timestamps: true,
    }
);

const Timer = mongoose.model('Timer', timerSchema);

export default Timer;
