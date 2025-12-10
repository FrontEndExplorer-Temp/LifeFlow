import React, { useEffect, useState } from 'react';
import { Clock, RotateCcw, Zap } from 'lucide-react';
import useTimerStore from '../store/timerStore';
import FocusTimerCard from '../components/dashboard/FocusTimerCard';
import { cn } from '../utils/cn';

const Timer = () => {
    const {
        activeTimer,
        dailyStats,
        syncActiveTimer,
        syncDailyStats,
    } = useTimerStore();

    useEffect(() => {
        syncActiveTimer();
        syncDailyStats();
        // Setup stats polling
        const interval = setInterval(() => {
            syncDailyStats();
        }, 60000);
        return () => clearInterval(interval);
    }, [syncActiveTimer, syncDailyStats]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Minimal Header */}
            <div className="flex items-center gap-3 mb-12 border-b border-gray-100 dark:border-gray-800 pb-4">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Focus Timer</h1>
                    <p className="text-sm text-gray-500">Stay focused and track your productivity.</p>
                </div>
            </div>

            {/* Reused Minimal Timer Component */}
            <FocusTimerCard />

            {/* Minimal Stats Footer */}
            <div className="mt-16 grid grid-cols-3 gap-8 text-center border-t border-gray-100 dark:border-gray-800 pt-8">
                <div>
                    <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                        {formatTime(dailyStats.totalWorkSeconds)}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Focus
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                        {formatTime(dailyStats.totalBreakSeconds)}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Break
                    </div>
                </div>
                <div>
                    <div className="text-2xl font-light text-gray-900 dark:text-white mb-1">
                        {dailyStats.productivityScore}%
                    </div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3" /> Score
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timer;
