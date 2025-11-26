import mongoose from 'mongoose';

const budgetSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        category: {
            type: String,
            required: true,
        },
        monthlyLimit: {
            type: Number,
            required: true,
        },
        month: {
            type: String, // Format: YYYY-MM
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one budget per user per category per month
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
