import React, { useEffect, useState } from 'react';
import { Plus, Flame, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useHabitStore from '../store/habitStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';

const Habits = () => {
    const { habits, fetchHabits, addHabit, toggleCompletion, deleteHabit, isLoading } = useHabitStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const onSubmit = async (data) => {
        const success = await addHabit(data);
        if (success) {
            setIsModalOpen(false);
            reset();
        }
    };

    const isCompletedToday = (habit) => {
        const today = new Date().toISOString().split('T')[0];
        return habit.completedDates.some(d => d.startsWith(today));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h1>
                    <p className="text-gray-500 dark:text-gray-400">Build better habits, one day at a time</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Habit
                </Button>
            </div>

            {/* Habits List */}
            {isLoading && !habits.length ? (
                <div className="text-center py-12">Loading habits...</div>
            ) : habits.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No habits found. Start building one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map((habit) => (
                        <div key={habit._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
                                    <div className="flex items-center text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full text-xs font-medium">
                                        <Flame className="w-3.5 h-3.5 mr-1" />
                                        {habit.streak} day streak
                                    </div>
                                </div>
                                {habit.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{habit.description}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => deleteHabit(habit._id)}
                                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => toggleCompletion(habit._id, new Date().toISOString())}
                                    className={cn(
                                        "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                        isCompletedToday(habit)
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    )}
                                >
                                    {isCompletedToday(habit) ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Completed
                                        </>
                                    ) : (
                                        "Mark Complete"
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Habit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Habit"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Habit Name"
                        placeholder="e.g., Read 30 mins"
                        {...register('name', { required: 'Name is required' })}
                        error={errors.name?.message}
                    />

                    <Input
                        label="Description (Optional)"
                        placeholder="Why do you want to build this habit?"
                        {...register('description')}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create Habit
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Habits;
