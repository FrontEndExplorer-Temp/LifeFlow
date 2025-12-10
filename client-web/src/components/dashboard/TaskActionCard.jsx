import React, { useState } from 'react';
import { Play, Pause, CheckCircle, Square } from 'lucide-react';
import useTimerStore from '../../store/timerStore';
import useTaskStore from '../../store/taskStore';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const TaskActionCard = ({ task, icon: Icon, color, subColor }) => {
    const { activeTimer, startTimer, stopTimer, pauseTimer, resumeTimer } = useTimerStore();
    const { updateTask } = useTaskStore();
    const [isUpdating, setIsUpdating] = useState(false);

    const isActive = activeTimer?.taskId === task._id;
    const isRunning = isActive && activeTimer.status === 'running';

    const handleAction = async () => {
        if (isActive) {
            if (isRunning) {
                pauseTimer();
            } else {
                resumeTimer();
            }
        } else {
            // Stop current timer if running
            if (activeTimer) {
                stopTimer();
            }
            startTimer(task.title, task.tags || [], task._id);
        }
    };

    const handleComplete = async () => {
        if (isActive) {
            stopTimer();
        }
        setIsUpdating(true);
        try {
            await updateTask(task._id, { status: 'completed' });
            toast.success('Task completed!');
        } catch (error) {
            console.error('Failed to complete task:', error);
            toast.error('Failed to complete task');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn("p-2 rounded-lg transition-colors", isActive ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-gray-50 dark:bg-gray-700/50")}>
                    <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500")} />
                </div>
                <div className="min-w-0">
                    <h4 className={cn("font-medium truncate transition-colors", isActive ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white")}>
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
                <button
                    onClick={handleAction}
                    className={cn(
                        "p-2 rounded-lg transition-all",
                        isActive
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none"
                            : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                    )}
                >
                    {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                    onClick={handleComplete}
                    disabled={isUpdating}
                    className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Mark as Done"
                >
                    <CheckCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default TaskActionCard;
