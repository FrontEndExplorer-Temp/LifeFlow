import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock, RotateCcw } from 'lucide-react';
import useTimerStore from '../store/timerStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';

const Timer = () => {
    const {
        activeTimer,
        elapsedTime,
        dailyStats,
        syncActiveTimer,
        syncDailyStats,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        isLoading
    } = useTimerStore();

    const [description, setDescription] = useState('');

    useEffect(() => {
        syncActiveTimer();
        syncDailyStats();
        return () => useTimerStore.getState().stopTicker();
    }, [syncActiveTimer, syncDailyStats]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (description.trim()) {
            startTimer(description, []);
            setDescription('');
        }
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Focus Timer</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Stay focused and track your productivity</p>
            </div>

            {/* Timer Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-7xl font-mono font-bold text-gray-900 dark:text-white mb-8 tracking-wider">
                    {formatTime(elapsedTime)}
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center space-x-6">
                    {!activeTimer ? (
                        <div className="flex flex-col items-center w-full max-w-md space-y-4">
                            <Input
                                placeholder="What are you working on?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="text-center text-lg"
                            />
                            <Button
                                onClick={handleStart}
                                size="lg"
                                className="w-full rounded-full"
                                disabled={!description.trim() || isLoading}
                            >
                                <Play className="w-6 h-6 mr-2" />
                                Start Focus
                            </Button>
                        </div>
                    ) : (
                        <>
                            {activeTimer.status === 'running' ? (
                                <Button
                                    onClick={pauseTimer}
                                    size="lg"
                                    variant="secondary"
                                    className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
                                >
                                    <Pause className="w-8 h-8" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={resumeTimer}
                                    size="lg"
                                    className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
                                >
                                    <Play className="w-8 h-8 ml-1" />
                                </Button>
                            )}

                            <Button
                                onClick={stopTimer}
                                size="lg"
                                variant="danger"
                                className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
                            >
                                <Square className="w-6 h-6 fill-current" />
                            </Button>
                        </>
                    )}
                </div>

                {activeTimer && (
                    <div className="mt-6 text-gray-500 dark:text-gray-400">
                        Working on: <span className="font-medium text-gray-900 dark:text-white">{activeTimer.description}</span>
                    </div>
                )}
            </div>

            {/* Daily Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Focus Time</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatTime(dailyStats.totalWorkSeconds)}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <RotateCcw className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Break Time</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatTime(dailyStats.totalBreakSeconds)}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="w-8 h-8 rounded-full border-4 border-purple-500 mx-auto mb-3 flex items-center justify-center text-xs font-bold text-purple-500">
                        {dailyStats.productivityScore}
                    </div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Productivity Score</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {dailyStats.productivityScore}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Timer;
