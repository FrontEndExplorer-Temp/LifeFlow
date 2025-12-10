import mongoose from 'mongoose';

const roadmapItemSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    estimatedMinutes: Number,
    phaseName: String,
    order: Number,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
});

const skillSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        default: 'General'
    },
    currentLevel: {
        type: String, // e.g., 'Beginner', 'Intermediate'
        default: 'Beginner'
    },
    targetLevel: {
        type: String, // e.g., 'Advanced'
        default: 'Advanced'
    },
    minutesPerDay: {
        type: Number,
        default: 30
    },
    status: {
        type: String,
        enum: ['learning', 'practicing', 'archived', 'completed'],
        default: 'learning'
    },
    roadmap: [roadmapItemSchema],
    lastActivityDate: Date,
    currentStreak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
