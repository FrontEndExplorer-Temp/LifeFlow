import { create } from 'zustand';
import api from '../services/api';
import useNotificationStore from './notificationStore';
import useAuthStore from './authStore';

const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });
        try {
            const response = await api.get('/tasks');
            set({ tasks: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addTask: async (taskData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/tasks', taskData);
            const newTask = response.data;

            set((state) => ({
                tasks: [newTask, ...state.tasks],
                isLoading: false
            }));

            // Schedule notification if task has due date
            if (newTask.dueDate) {
                useNotificationStore.getState().scheduleTaskNotification(newTask);
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateTask: async (id, updates) => {
        try {
            // Optimistic update
            set((state) => ({
                tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...updates } : t)),
            }));

            const response = await api.put(`/tasks/${id}`, updates);
            const updatedTask = response.data;

            // Handle Gamification
            if (updatedTask.gamification) {
                const { xpResult, newBadges } = updatedTask.gamification;
                const useAuthStore = require('./authStore').default;
                useAuthStore.getState().updateGamification(xpResult, newBadges);
            }

            // Update notification if due date changed
            if (updates.dueDate) {
                useNotificationStore.getState().cancelTaskNotification(id);
                useNotificationStore.getState().scheduleTaskNotification(updatedTask);
            }
        } catch (error) {
            // Revert on failure
            console.error('Update failed', error);
            get().fetchTasks();
        }
    },

    deleteTask: async (id) => {
        try {
            set((state) => ({
                tasks: state.tasks.filter((t) => t._id !== id),
            }));

            await api.delete(`/tasks/${id}`);

            // Cancel notification
            useNotificationStore.getState().cancelTaskNotification(id);

            // Update daily summary after deletion
            const { fetchTodaySummary } = require('./summaryStore').default.getState();
            fetchTodaySummary();
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchTasks();
        }
    },

    generateSubtasks: async (title, description) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/ai/breakdown', { title, description });
            set({ isLoading: false });
            return response.data.subtasks;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return [];
        }
    },

    reset: () => set({ tasks: [], isLoading: false, error: null }),
}));

export default useTaskStore;
