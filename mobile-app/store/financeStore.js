import { create } from 'zustand';
import api from '../services/api';

const useFinanceStore = create((set, get) => ({
    transactions: [],
    budgets: [],
    monthlyStats: null,
    isLoading: false,
    error: null,

    fetchTransactions: async (startDate, endDate) => {
        set({ isLoading: true });
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get('/transactions', { params });
            set({ transactions: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addTransaction: async (transactionData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/transactions', transactionData);

            // Handle Gamification
            if (response.data.gamification) {
                const { xpResult, newBadges } = response.data.gamification;
                const useAuthStore = require('./authStore').default;
                useAuthStore.getState().updateGamification(xpResult, newBadges);
            }

            set((state) => ({
                transactions: [response.data, ...state.transactions],
                isLoading: false
            }));
            // Refresh stats
            get().fetchMonthlyStats(transactionData.date.substring(0, 7));
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateTransaction: async (id, updates) => {
        try {
            set((state) => ({
                transactions: state.transactions.map((t) => (t._id === id ? { ...t, ...updates } : t)),
            }));
            await api.put(`/transactions/${id}`, updates);
            // Refresh stats for current month
            get().fetchMonthlyStats(new Date().toISOString().substring(0, 7));
        } catch (error) {
            get().fetchTransactions();
        }
    },

    deleteTransaction: async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id)
            }));
            get().fetchMonthlyStats(new Date().toISOString().substring(0, 7));
        } catch (error) {
            // Silent fail
        }
    },

    fetchMonthlyStats: async (month) => {
        try {
            const response = await api.get(`/transactions/stats/${month}`);
            set({ monthlyStats: response.data });
        } catch (error) {
            // Silent fail
        }
    },

    fetchBudgets: async (month) => {
        try {
            const response = await api.get(`/budgets?month=${month}`);
            set({ budgets: response.data });
        } catch (error) {
            // Silent fail
        }
    },

    setBudget: async (budgetData) => {
        try {
            const response = await api.post('/budgets', budgetData);
            set((state) => ({
                budgets: [...state.budgets.filter(b =>
                    !(b.category === budgetData.category && b.month === budgetData.month)
                ), response.data]
            }));
        } catch (error) {
            // Silent fail
        }
    },

    deleteBudget: async (id) => {
        try {
            set((state) => ({
                budgets: state.budgets.filter((b) => b._id !== id),
            }));
            await api.delete(`/budgets/${id}`);
        } catch (error) {
            get().fetchBudgets();
        }
    },

    fetchInsights: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post('/ai/finance-insights');
            set({ isLoading: false });
            return response.data.insights;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    reset: () => set({ transactions: [], budgets: [], monthlyStats: null, isLoading: false, error: null }),
}));

export default useFinanceStore;
