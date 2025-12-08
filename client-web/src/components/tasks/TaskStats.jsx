import React from 'react';
import { ListTodo, CheckCircle2, Clock, Zap } from 'lucide-react';

const TaskStats = ({ tasks }) => {
    const stats = {
        total: tasks.length,
        today: tasks.filter(t => t.status === 'Today').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    const statCards = [
        { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-600' },
        { label: 'Today', value: stats.today, icon: Clock, color: 'text-purple-600' },
        { label: 'In Progress', value: stats.inProgress, icon: Zap, color: 'text-orange-600' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskStats;
