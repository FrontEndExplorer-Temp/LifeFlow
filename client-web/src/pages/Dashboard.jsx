import React, { useEffect } from 'react';
import { Clock, CheckCircle, Zap, Coffee, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSummaryStore from '../store/summaryStore';
import useTaskStore from '../store/taskStore';
import useFinanceStore from '../store/financeStore';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-lg", color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {subtext && <span className="text-xs text-gray-500 dark:text-gray-400">{subtext}</span>}
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
);

const Dashboard = () => {
    const { user } = useAuthStore();
    const { todaySummary, fetchTodaySummary, isLoading } = useSummaryStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { monthlyStats, fetchMonthlyStats } = useFinanceStore();

    useEffect(() => {
        fetchTodaySummary();
        fetchTasks();

        // Fetch current month stats
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        fetchMonthlyStats(monthStr);
    }, [fetchTodaySummary, fetchTasks, fetchMonthlyStats]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const statusColors = {
        'backlog': 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        'today': 'bg-blue-200 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
        'in-progress': 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
        'completed': 'bg-green-200 dark:bg-green-900/50 text-green-700 dark:text-green-300'
    };

    // Get recent tasks (last 5)
    const recentTasks = tasks.slice(0, 5);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 5) return 'Late Night Hustle? 🌙';
        if (h < 12) return 'Good Morning, ☀️';
        if (h < 17) return 'Good Afternoon, 🌤️';
        return 'Good Evening, 🌙';
    };

    return (
        <div className="space-y-8">
            {/* Minimal Professional Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-baseline gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {getGreeting()}
                    </h1>
                    <span className="text-3xl font-light text-gray-400 dark:text-gray-500">|</span>
                    <h1 className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
                        {user?.name?.split(' ')[0]}
                    </h1>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Focus Time"
                    value={formatTime(todaySummary.totalWorkSeconds)}
                    icon={Clock}
                    color="bg-blue-500"
                    index={0}
                />
                <StatCard
                    title="Tasks Completed"
                    value={todaySummary.completedTasksCount}
                    icon={CheckCircle}
                    color="bg-green-500"
                    index={1}
                />
                <StatCard
                    title="Productivity"
                    value={`${todaySummary.productivityScore}%`}
                    icon={Zap}
                    color="bg-purple-500"
                    index={2}
                />
                <StatCard
                    title="Break Time"
                    value={formatTime(todaySummary.totalBreakSeconds)}
                    icon={Coffee}
                    color="bg-orange-500"
                    index={3}
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Tasks */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Tasks</h2>
                    <div className="space-y-3">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium truncate",
                                            task.status === 'completed'
                                                ? "text-gray-400 dark:text-gray-500 line-through"
                                                : "text-gray-900 dark:text-white"
                                        )}>
                                            {task.title}
                                        </p>
                                        {task.category && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {task.category}
                                            </p>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "ml-3 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                                        statusColors[task.status] || statusColors['backlog']
                                    )}>
                                        {task.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p className="text-sm">No tasks yet. Create your first task to get started!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Finance Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Finance Overview</h2>
                    {monthlyStats ? (
                        <div className="space-y-4">
                            {/* Income */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500">
                                        <ArrowUpRight className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(monthlyStats.totalIncome)}
                                        </p>
                                    </div>
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>

                            {/* Expenses */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-500">
                                        <ArrowDownRight className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                            {formatCurrency(monthlyStats.totalExpense)}
                                        </p>
                                    </div>
                                </div>
                                <TrendingDown className="w-5 h-5 text-red-500" />
                            </div>

                            {/* Net Balance */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Balance</p>
                                    <p className={cn(
                                        "text-2xl font-bold",
                                        (monthlyStats.totalIncome - monthlyStats.totalExpense) >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                    )}>
                                        {formatCurrency(monthlyStats.totalIncome - monthlyStats.totalExpense)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No financial data for this month.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
