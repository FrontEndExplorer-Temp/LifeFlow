import React, { useEffect } from 'react';
import { Play, Pause, Square, RefreshCw } from 'lucide-react';
import useTimerStore from '../../store/timerStore';
import { cn } from '../../utils/cn';

const FocusTimerCard = () => {
    const {
        activeTimer,
        elapsedTime,
        isLoading,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        syncActiveTimer
    } = useTimerStore();

    useEffect(() => {
        syncActiveTimer();
        let interval;
        if (activeTimer && activeTimer.status === 'running') {
            interval = setInterval(() => {
                useTimerStore.getState().tick();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer?.status, syncActiveTimer]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        const formatNumber = (num) => String(num).padStart(2, '0');

        if (h > 0) {
            return (
                <div className="flex items-baseline gap-1">
                    <span>{h}</span>
                    <span className="text-2xl text-gray-300 font-light">:</span>
                    <span>{formatNumber(m)}</span>
                    <span className="text-2xl text-gray-300 font-light">:</span>
                    <span>{formatNumber(s)}</span>
                </div>
            );
        }
        return (
            <div className="flex items-baseline gap-1">
                <span>{formatNumber(m)}</span>
                <span className="text-4xl text-gray-300 font-light mx-1">:</span>
                <span>{formatNumber(s)}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            {/* Timer Display */}
            <div className="mb-8">
                <div className={cn(
                    "text-8xl font-light tracking-tighter tabular-nums flex items-center justify-center transition-colors duration-500",
                    activeTimer?.status === 'running' ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"
                )}>
                    {formatTime(elapsedTime)}
                </div>
                <div className="text-center h-6 mt-2">
                    {activeTimer && (
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-fade-in">
                            {activeTimer.description || 'Focus Session'}
                        </p>
                    )}
                </div>
            </div>

            {/* Minimal Controls */}
            <div className="flex items-center gap-6">
                {!activeTimer ? (
                    <button
                        onClick={() => startTimer('Focus Session', [])}
                        className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 transition-all duration-300 shadow-xl shadow-gray-200 dark:shadow-none"
                    >
                        <Play className="w-6 h-6 ml-1" />
                        <span className="absolute -bottom-8 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Start</span>
                    </button>
                ) : (
                    <>
                        {activeTimer.status === 'running' ? (
                            <button
                                onClick={pauseTimer}
                                className="group relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white transition-all duration-300"
                            >
                                <Pause className="w-6 h-6" />
                                <span className="absolute -bottom-8 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Pause</span>
                            </button>
                        ) : (
                            <button
                                onClick={resumeTimer}
                                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 transition-all duration-300 shadow-xl shadow-gray-200 dark:shadow-none"
                            >
                                <Play className="w-6 h-6 ml-1" />
                                <span className="absolute -bottom-8 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Resume</span>
                            </button>
                        )}

                        <button
                            onClick={stopTimer}
                            className="group relative flex items-center justify-center w-12 h-12 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-all duration-300"
                        >
                            <Square className="w-5 h-5 fill-current" />
                            <span className="absolute -bottom-8 text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Stop</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FocusTimerCard;
