import { create } from 'zustand';
import api from '../services/api';

const useJobStore = create((set, get) => ({
    jobs: [],
    isLoading: false,
    error: null,

    fetchJobs: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/jobs');
            set({ jobs: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addJob: async (jobData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/jobs', jobData);

            // Handle Gamification
            if (response.data.gamification) {
                const { xpResult, newBadges } = response.data.gamification;
                const useAuthStore = require('./authStore').default;
                useAuthStore.getState().updateGamification(xpResult, newBadges);
            }

            set((state) => ({
                jobs: [response.data, ...state.jobs],
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateJob: async (id, updates) => {
        try {
            // Optimistic update
            set((state) => ({
                jobs: state.jobs.map((j) => (j._id === id ? { ...j, ...updates } : j)),
            }));

            await api.put(`/jobs/${id}`, updates);
        } catch (error) {
            console.error('Update failed', error);
            get().fetchJobs();
        }
    },

    deleteJob: async (id) => {
        try {
            set((state) => ({
                jobs: state.jobs.filter((j) => j._id !== id),
            }));
            await api.delete(`/jobs/${id}`);
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchJobs();
        }
    },

    parseJobLink: async (url) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/jobs/parse', { url });
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    reset: () => set({ jobs: [], isLoading: false, error: null }),
}));

export default useJobStore;
