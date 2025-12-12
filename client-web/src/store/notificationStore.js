import { create } from 'zustand';
import api from '../services/api';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await get().apiCallWithRetry(() => api.get('/notifications'));
            const unread = res.data.filter(n => !n.isRead).length;
            set({ notifications: res.data, unreadCount: unread, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            // Optimistic update
            set(state => {
                const updated = state.notifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updated,
                    unreadCount: updated.filter(n => !n.isRead).length
                };
            });
            await api.put(`/notifications/${id}/read`);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Revert on failure could be added here
        }
    },

    markAllAsRead: async () => {
        try {
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
            await api.put('/notifications/read-all');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    clearAllNotifications: async () => {
        try {
            // Optimistic update
            set({ notifications: [], unreadCount: 0 });
            await api.delete('/notifications');
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            // Could revert here if needed
            get().fetchNotifications();
        }
    },

    // Helper for potential future retry logic
    apiCallWithRetry: async (fn, retries = 0) => {
        try {
            return await fn();
        } catch (err) {
            if (retries > 0) {
                return get().apiCallWithRetry(fn, retries - 1);
            }
            throw err;
        }
    }
}));

export default useNotificationStore;
