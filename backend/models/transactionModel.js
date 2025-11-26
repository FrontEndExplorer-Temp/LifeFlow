import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['Income', 'Expense'],
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        description: {
            type: String,
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'],
            default: 'Cash',
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
