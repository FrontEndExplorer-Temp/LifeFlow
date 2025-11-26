import { create } from 'zustand';
import api from '../services/api';
import useAuthStore from './authStore';

const useSummaryStore = create((set) => ({
    todaySummary: {
        totalWorkSeconds: 0,
        totalBreakSeconds: 0,
        productivityScore: 0,
        completedTasksCount: 0,
    },
    isLoading: false,
    error: null,

    fetchTodaySummary: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/summary/today');
            set({
                todaySummary: response.data,
                isLoading: false
            });
        } catch (error) {
            console.error('[summaryStore] Failed to fetch today\'s summary:', error);
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Failed to fetch summary'
            });
        }
    },

    reset: () => set({
        todaySummary: {
            totalWorkSeconds: 0,
            totalBreakSeconds: 0,
            productivityScore: 0,
            completedTasksCount: 0,
        },
        isLoading: false,
        error: null
    }),
}));

export default useSummaryStore;
