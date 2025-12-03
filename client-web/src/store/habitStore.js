import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useHabitStore = create((set, get) => ({
    habits: [],
    isLoading: false,
    error: null,

    fetchHabits: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/habits');
            set({ habits: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addHabit: async (habitData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/habits', habitData);

            set((state) => ({
                habits: [response.data, ...state.habits],
                isLoading: false
            }));
            toast.success('Habit created');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to create habit');
            return false;
        }
    },

    updateHabit: async (id, updates) => {
        try {
            set((state) => ({
                habits: state.habits.map((h) => (h._id === id ? { ...h, ...updates } : h)),
            }));

            await api.put(`/habits/${id}`, updates);
            toast.success('Habit updated');
        } catch (error) {
            console.error('Update failed', error);
            get().fetchHabits();
            toast.error('Failed to update habit');
        }
    },

    deleteHabit: async (id) => {
        try {
            set((state) => ({
                habits: state.habits.filter((h) => h._id !== id),
            }));
            await api.delete(`/habits/${id}`);
            toast.success('Habit deleted');
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchHabits();
            toast.error('Failed to delete habit');
        }
    },

    toggleCompletion: async (id, date) => {
        try {
            const response = await api.post(`/habits/${id}/toggle`, { date });
            const updatedHabit = response.data;

            // Handle Gamification (simplified)
            if (updatedHabit.gamification) {
                const { xpResult } = updatedHabit.gamification;
                if (xpResult) {
                    toast.success(`Habit Completed! +${xpResult.xp} XP`);
                }
            }

            set((state) => ({
                habits: state.habits.map((h) => (h._id === id ? updatedHabit : h)),
            }));
        } catch (error) {
            console.error('Toggle failed', error);
            get().fetchHabits();
            toast.error('Failed to toggle habit');
        }
    },

    reset: () => set({ habits: [], isLoading: false, error: null }),
}));

export default useHabitStore;
