import asyncHandler from 'express-async-handler';
import Budget from '../models/budgetModel.js';

// @desc    Get budgets for a month
// @route   GET /api/budgets?month=YYYY-MM
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
    const { month } = req.query;

    if (!month) {
        res.status(400);
        throw new Error('Month parameter is required');
    }

    const budgets = await Budget.find({
        user: req.user._id,
        month
    });

    res.json(budgets);
});

// @desc    Set/Update budget
// @route   POST /api/budgets
// @access  Private
const setBudget = asyncHandler(async (req, res) => {
    const { category, monthlyLimit, month } = req.body;

    const budget = await Budget.findOneAndUpdate(
        { user: req.user._id, category, month },
        { monthlyLimit },
        { upsert: true, new: true }
    );

    res.status(201).json(budget);
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
        res.status(404);
        throw new Error('Budget not found');
    }

    if (budget.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await budget.deleteOne();

    res.json({ message: 'Budget removed' });
});

export { getBudgets, setBudget, deleteBudget };
