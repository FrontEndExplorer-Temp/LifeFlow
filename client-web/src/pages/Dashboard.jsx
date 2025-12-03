import React, { useEffect } from 'react';
import { Clock, CheckCircle, Zap, Coffee } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSummaryStore from '../store/summaryStore';
import { cn } from '../utils/cn';

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

    useEffect(() => {
        fetchTodaySummary();
    }, [fetchTodaySummary]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Here's what's happening with your projects today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Focus Time"
                    value={formatTime(todaySummary.totalWorkSeconds)}
                    icon={Clock}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Tasks Completed"
                    value={todaySummary.completedTasksCount}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Productivity"
                    value={`${todaySummary.productivityScore}%`}
                    icon={Zap}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Break Time"
                    value={formatTime(todaySummary.totalBreakSeconds)}
                    icon={Coffee}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity / Placeholder for now */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Tasks</h2>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Task list coming soon...</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Finance Overview</h2>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>Finance chart coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
