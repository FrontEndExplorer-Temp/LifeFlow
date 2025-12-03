import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

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

            set((state) => ({
                transactions: [response.data, ...state.transactions],
                isLoading: false
            }));

            // Refresh stats
            const date = new Date(transactionData.date);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            get().fetchMonthlyStats(monthStr);

            toast.success('Transaction added');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to add transaction');
            return false;
        }
    },

    deleteTransaction: async (id) => {
        try {
            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id)
            }));
            await api.delete(`/transactions/${id}`);

            // Refresh stats
            const today = new Date();
            const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            get().fetchMonthlyStats(monthStr);

            toast.success('Transaction deleted');
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchTransactions();
            toast.error('Failed to delete transaction');
        }
    },

    fetchMonthlyStats: async (month) => {
        try {
            const response = await api.get(`/transactions/stats/${month}`);
            set({ monthlyStats: response.data });
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    },

    reset: () => set({ transactions: [], budgets: [], monthlyStats: null, isLoading: false, error: null }),
}));

export default useFinanceStore;
