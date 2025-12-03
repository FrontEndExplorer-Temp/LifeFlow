import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import useTaskStore from '../../store/taskStore';

const TaskCard = ({ task }) => {
    const { updateTask, deleteTask } = useTaskStore();

    const priorityColors = {
        low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    const handleStatusChange = () => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        updateTask(task._id, { status: newStatus });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            checked={task.status === 'done'}
                            onChange={handleStatusChange}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>
                    <div>
                        <h3 className={cn(
                            "text-base font-medium text-gray-900 dark:text-white",
                            task.status === 'done' && "line-through text-gray-500 dark:text-gray-400"
                        )}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="mt-3 flex items-center space-x-3">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", priorityColors[task.priority] || priorityColors.low)}>
                                {task.priority}
                            </span>

                            {task.dueDate && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                </div>
                            )}

                            {task.category && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>
                                    {task.category}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => deleteTask(task._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
