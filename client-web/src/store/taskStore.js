import { create } from 'zustand';
import api from '../services/api';
import useAuthStore from './authStore';
import toast from 'react-hot-toast';

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
            toast.success('Task created successfully');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to create task');
            return false;
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

            // Handle Gamification (simplified for web for now)
            if (updatedTask.gamification) {
                const { xpResult } = updatedTask.gamification;
                if (xpResult) {
                    toast.success(`Task Completed! +${xpResult.xp} XP`);
                }
            }
        } catch (error) {
            // Revert on failure
            console.error('Update failed', error);
            get().fetchTasks();
            toast.error('Failed to update task');
        }
    },

    deleteTask: async (id) => {
        try {
            set((state) => ({
                tasks: state.tasks.filter((t) => t._id !== id),
            }));

            await api.delete(`/tasks/${id}`);
            toast.success('Task deleted');
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchTasks();
            toast.error('Failed to delete task');
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
            toast.error('Failed to generate subtasks');
            return [];
        }
    },

    reset: () => set({ tasks: [], isLoading: false, error: null }),
}));

export default useTaskStore;
