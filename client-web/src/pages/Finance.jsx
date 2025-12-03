import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFinanceStore from '../store/financeStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

const Finance = () => {
    const { transactions, monthlyStats, fetchTransactions, fetchMonthlyStats, addTransaction, isLoading } = useFinanceStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        fetchTransactions();
        fetchMonthlyStats(monthStr);
    }, [fetchTransactions, fetchMonthlyStats]);

    const onSubmit = async (data) => {
        const success = await addTransaction(data);
        if (success) {
            setIsModalOpen(false);
            reset();
        }
    };

    const chartData = [
        { name: 'Income', amount: monthlyStats?.totalIncome || 0 },
        { name: 'Expense', amount: monthlyStats?.totalExpense || 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your income and expenses</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Transaction
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">This Month</span>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        ${monthlyStats?.totalIncome?.toFixed(2) || '0.00'}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">This Month</span>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expense</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        ${monthlyStats?.totalExpense?.toFixed(2) || '0.00'}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Net Balance</h3>
                    <p className={cn(
                        "text-2xl font-bold mt-1",
                        (monthlyStats?.totalIncome - monthlyStats?.totalExpense) >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    )}>
                        ${((monthlyStats?.totalIncome || 0) - (monthlyStats?.totalExpense || 0)).toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {transactions.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions yet.</p>
                        ) : (
                            transactions.slice(0, 5).map((t) => (
                                <div key={t._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            t.type === 'income'
                                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                        )}>
                                            {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{t.category}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(t.date), 'MMM d')}</p>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "font-medium",
                                        t.type === 'income' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    )}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Transaction"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <select
                                {...register('type', { required: true })}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>

                        <Input
                            label="Amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amount', { required: 'Amount is required' })}
                            error={errors.amount?.message}
                        />
                    </div>

                    <Input
                        label="Category"
                        placeholder="e.g., Food, Salary, Rent"
                        {...register('category', { required: 'Category is required' })}
                        error={errors.category?.message}
                    />

                    <Input
                        label="Date"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        {...register('date', { required: 'Date is required' })}
                        error={errors.date?.message}
                    />

                    <Input
                        label="Description (Optional)"
                        placeholder="Add notes..."
                        {...register('description')}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Add Transaction
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Finance;
