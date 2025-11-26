import { create } from 'zustand';
import api from '../services/api';
import useNotificationStore from './notificationStore';

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
            const newHabit = response.data;

            set((state) => ({
                habits: [newHabit, ...state.habits],
                isLoading: false
            }));

            // Schedule notification
            useNotificationStore.getState().scheduleHabitNotification(newHabit);
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateHabit: async (id, updates) => {
        try {
            set((state) => ({
                habits: state.habits.map((h) => (h._id === id ? { ...h, ...updates } : h)),
            }));

            const response = await api.put(`/habits/${id}`, updates);
            const updatedHabit = response.data;

            // Update notification
            useNotificationStore.getState().cancelHabitNotification(id);
            useNotificationStore.getState().scheduleHabitNotification(updatedHabit);
        } catch (error) {
            console.error('Update failed', error);
            get().fetchHabits();
        }
    },

    deleteHabit: async (id) => {
        try {
            set((state) => ({
                habits: state.habits.filter((h) => h._id !== id),
            }));

            await api.delete(`/habits/${id}`);

            // Cancel notification
            useNotificationStore.getState().cancelHabitNotification(id);
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchHabits();
        }
    },

    toggleCompletion: async (id, date) => {
        try {
            const response = await api.post(`/habits/${id}/toggle`, { date });
            const updatedHabit = response.data;

            // Handle Gamification
            if (updatedHabit.gamification) {
                const { xpResult, newBadges } = updatedHabit.gamification;
                const useAuthStore = require('./authStore').default;
                useAuthStore.getState().updateGamification(xpResult, newBadges);
            }

            set((state) => ({
                habits: state.habits.map((h) => (h._id === id ? updatedHabit : h)),
            }));

            // Check for streak milestones
            if (updatedHabit.streak > 0) {
                useNotificationStore.getState().sendStreakNotification(updatedHabit.name, updatedHabit.streak);
            }
        } catch (error) {
            console.error('Toggle failed', error);
            get().fetchHabits();
        }
    },

    reset: () => set({ habits: [], isLoading: false, error: null }),
}));

export default useHabitStore;
