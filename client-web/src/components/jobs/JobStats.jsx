import React from 'react';
import { Briefcase, Calendar, Trophy } from 'lucide-react';

const JobStats = ({ jobs }) => {
    const stats = {
        total: jobs.length,
        interviews: jobs.filter(j => j.status === 'Interview').length,
        offers: jobs.filter(j => j.status === 'Offer').length,
    };

    const statCards = [
        { label: 'Total Applications', value: stats.total, icon: Briefcase, color: 'text-purple-600' },
        { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-blue-600' },
        { label: 'Offers', value: stats.offers, icon: Trophy, color: 'text-green-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

export default JobStats;
