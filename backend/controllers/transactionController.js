import asyncHandler from 'express-async-handler';
import Transaction from '../models/transactionModel.js';
import Budget from '../models/budgetModel.js';
import { addXP, checkBadges, XP_REWARDS } from '../services/gamificationService.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let query = { user: req.user._id };

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
});

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
    const { type, category, amount, date, description, paymentMethod } = req.body;

    // If this is an expense, check the budget for the month/category
    if (type === 'Expense') {
        const txDate = date ? new Date(date) : new Date();
        const month = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

        // find budget for this user/category/month
        const budget = await Budget.findOne({ user: req.user._id, category, month });

        if (budget && typeof budget.monthlyLimit === 'number') {
            // compute current spent in this month for this category
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

            const agg = await Transaction.aggregate([
                { $match: { user: req.user._id, category, type: 'Expense', date: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const currentSpent = (agg[0] && agg[0].total) ? agg[0].total : 0;
            const projected = currentSpent + Number(amount || 0);

            if (projected > budget.monthlyLimit) {
                res.status(400);
                throw new Error(`Budget limit exceeded for ${category}. Limit: ${budget.monthlyLimit}, current: ${currentSpent}, attempted: ${amount}`);
            }
        }
    }

    const transaction = await Transaction.create({
        user: req.user._id,
        type,
        category,
        amount,
        date,
        description,
        paymentMethod,
    });

    let gamification = {};
    try {
        const xpResult = await addXP(req.user._id, XP_REWARDS.TRANSACTION_ADD);
        const newBadges = await checkBadges(req.user._id, 'TRANSACTION_ADD');
        gamification = { xpResult, newBadges };
    } catch (e) {
        console.error('Gamification error:', e);
    }

    res.status(201).json({ ...transaction.toObject(), gamification });
});

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Enforce budget for expense updates: compute projected total excluding this transaction
    const { type, category, amount, date } = req.body;

    if ((type && type === 'Expense') || (transaction.type === 'Expense' && (amount || category || date))) {
        // determine the month for the updated transaction (use provided date or existing)
        const txDate = date ? new Date(date) : transaction.date ? new Date(transaction.date) : new Date();
        const month = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

        // find budget for this user/category/month
        const budget = await Budget.findOne({ user: req.user._id, category: category || transaction.category, month });

        if (budget && typeof budget.monthlyLimit === 'number') {
            // compute current spent in this month for this category excluding this transaction
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

            const agg = await Transaction.aggregate([
                { $match: { user: req.user._id, category: category || transaction.category, type: 'Expense', date: { $gte: startDate, $lte: endDate }, _id: { $ne: transaction._id } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const currentSpent = (agg[0] && agg[0].total) ? agg[0].total : 0;
            const newAmount = Number(amount != null ? amount : transaction.amount);
            const projected = currentSpent + newAmount;

            if (projected > budget.monthlyLimit) {
                res.status(400);
                throw new Error(`Budget limit exceeded for ${category || transaction.category}. Limit: ${budget.monthlyLimit}, current: ${currentSpent}, attempted: ${newAmount}`);
            }
        }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedTransaction);
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await transaction.deleteOne();

    res.json({ message: 'Transaction removed' });
});

// @desc    Get monthly stats
// @route   GET /api/transactions/stats/:month
// @access  Private
const getMonthlyStats = asyncHandler(async (req, res) => {
    const { month } = req.params; // Format: YYYY-MM

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const transactions = await Transaction.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
        if (t.type === 'Income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        }
    });

    res.json({
        month,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryBreakdown,
    });
});

export {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyStats
};
