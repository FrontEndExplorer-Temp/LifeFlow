import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, Edit2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import useTaskStore from '../../store/taskStore';

const TaskCard = ({ task, onEdit }) => {
    const { updateTask, deleteTask } = useTaskStore();

    const priorityColors = {
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    const handleStatusChange = () => {
        const newStatus = task.status === 'Completed' ? 'Today' : 'Completed';
        updateTask(task._id, { status: newStatus });
    };

    const handleSubtaskToggle = (index) => {
        const updatedSubtasks = task.subtasks.map((st, i) =>
            i === index ? { ...st, completed: !st.completed } : st
        );
        updateTask(task._id, { subtasks: updatedSubtasks });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            checked={task.status === 'Completed'}
                            onChange={handleStatusChange}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className={cn(
                            "text-base font-medium text-gray-900 dark:text-white",
                            task.status === 'Completed' && "line-through text-gray-500 dark:text-gray-400"
                        )}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {task.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-3 space-y-1">
                                {task.subtasks.map((subtask, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={subtask.completed}
                                            onChange={() => handleSubtaskToggle(index)}
                                            className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className={cn(
                                            "text-sm text-gray-600 dark:text-gray-300",
                                            subtask.completed && "line-through text-gray-400"
                                        )}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-3 flex items-center space-x-3">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", priorityColors[task.priority] || priorityColors.Low)}>
                                {task.priority}
                            </span>

                            {task.dueDate && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1 ml-2">
                    <button
                        onClick={onEdit}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit Task"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => deleteTask(task._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete Task"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
