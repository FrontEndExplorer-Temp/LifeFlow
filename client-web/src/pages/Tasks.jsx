import React, { useEffect, useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';

const Tasks = () => {
    const { tasks, fetchTasks, addTask, isLoading } = useTaskStore();
    const [filter, setFilter] = useState('all'); // all, todo, in-progress, done
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'done') return task.status === 'done';
        if (filter === 'todo') return task.status === 'todo';
        if (filter === 'in-progress') return task.status === 'in-progress';
        return true;
    });

    const onSubmit = async (data) => {
        const success = await addTask({
            ...data,
            status: 'todo', // Default status
        });
        if (success) {
            setIsModalOpen(false);
            reset();
        }
    };

    const tabs = [
        { id: 'all', label: 'All Tasks' },
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Completed' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your daily tasks and projects</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Task
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                            filter === tab.id
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            {isLoading ? (
                <div className="text-center py-12">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No tasks found. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </div>
            )}

            {/* Add Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Task"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Title"
                        placeholder="What needs to be done?"
                        {...register('title', { required: 'Title is required' })}
                        error={errors.title?.message}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Priority
                            </label>
                            <select
                                {...register('priority')}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <Input
                            label="Due Date"
                            type="date"
                            {...register('dueDate')}
                        />
                    </div>

                    <Input
                        label="Category"
                        placeholder="e.g., Work, Personal"
                        {...register('category')}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;
