import React, { useEffect, useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import AIBreakdownModal from '../components/tasks/AIBreakdownModal';
import { cn } from '../utils/cn';

const Tasks = () => {
    const { tasks, fetchTasks, addTask, isLoading } = useTaskStore();
    const [filter, setFilter] = useState('Today'); // Backlog, Today, In Progress, Completed
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

    const taskTitle = watch('title');
    const taskDescription = watch('description');

    // Custom state for array fields
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [subtaskInput, setSubtaskInput] = useState('');

    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // ... (filters logic)
    const filteredTasks = tasks.filter(task => {
        return task.status === filter;
    });

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (subtaskInput.trim()) {
            setSubtasks([...subtasks, { title: subtaskInput.trim(), completed: false }]);
            setSubtaskInput('');
        }
    };

    const handleRemoveSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleAddSubtasksFromAI = (newSubtasks) => {
        const formattedSubtasks = newSubtasks.map(title => ({ title, completed: false }));
        setSubtasks([...subtasks, ...formattedSubtasks]);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTags(task.tags || []);
        setSubtasks(task.subtasks || []);
        // Reset form with task values
        reset({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            category: task.category
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setTags([]);
        setSubtasks([]);
        reset({
            title: '',
            description: '',
            priority: 'Medium',
            dueDate: '',
            category: ''
        });
    };

    const onSubmit = async (data) => {
        const taskData = {
            ...data,
            tags,
            subtasks,
            status: editingTask ? editingTask.status : 'Backlog',
        };

        let success;
        if (editingTask) {
            success = await useTaskStore.getState().updateTask(editingTask._id, taskData);
        } else {
            success = await addTask(taskData);
        }

        if (success !== false) { // updateTask might not return explicit true/false in store, checking if not failed
            handleCloseModal();
        }
    };

    const tabs = [
        { id: 'Backlog', label: 'Backlog' },
        { id: 'Today', label: 'Today' },
        { id: 'In Progress', label: 'In Progress' },
        { id: 'Completed', label: 'Completed' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your daily tasks and projects</p>
                </div>
                <Button onClick={() => {
                    setEditingTask(null);
                    reset({
                        title: '',
                        description: '',
                        priority: 'Medium',
                        dueDate: '',
                        category: ''
                    });
                    setTags([]);
                    setSubtasks([]);
                    setIsModalOpen(true);
                }}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Task
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
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
            {isLoading && !tasks.length ? (
                <div className="text-center py-12">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No tasks in {filter}. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={() => handleEditTask(task)}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingTask ? "Edit Task" : "Create New Task"}
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
                                defaultValue="Medium"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <Input
                            label="Due Date"
                            type="date"
                            {...register('dueDate')}
                        />
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tags
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="Add a tag..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                            />
                            <Button type="button" onClick={handleAddTag} size="sm">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    #{tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-blue-500 hover:text-blue-700">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks Input */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Subtasks
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsAIModalOpen(true)}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center"
                            >
                                ✨ AI Breakdown
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={subtaskInput}
                                onChange={(e) => setSubtaskInput(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                placeholder="Add a subtask..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(e)}
                            />
                            <Button type="button" onClick={handleAddSubtask} size="sm">Add</Button>
                        </div>
                        <div className="mt-2 space-y-2">
                            {subtasks.map((subtask, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">• {subtask.title}</span>
                                    <button type="button" onClick={() => handleRemoveSubtask(index)} className="text-gray-400 hover:text-red-500">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {editingTask ? 'Update Task' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <AIBreakdownModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                taskTitle={taskTitle}
                taskDescription={taskDescription}
                onAddSubtasks={handleAddSubtasksFromAI}
            />
        </div>
    );
};

export default Tasks;
