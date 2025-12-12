import { create } from 'zustand';
import api from '../services/api';
import { Alert } from 'react-native';

const useAdminStore = create((set, get) => ({
    stats: null,
    logs: [],

    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/admin/users');
            set({ users: response.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    fetchStats: async () => {
        try {
            const response = await api.get('/admin/stats');
            set({ stats: response.data });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    fetchLogs: async () => {
        try {
            const response = await api.get('/admin/logs');
            set({ logs: response.data });
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    },

    broadcastNotification: async (title, message) => {
        try {
            await api.post('/admin/broadcast', { title, message });
            Alert.alert('Success', 'Broadcast sent successfully');
            return true;
        } catch (error) {
            console.error('Failed to broadcast:', error);
            Alert.alert('Error', 'Failed to send broadcast');
            return false;
        }
    },

    toggleBan: async (id, duration = null) => {
        try {
            const response = await api.post(`/admin/users/${id}/ban`, { banDuration: duration });
            set(state => ({
                users: state.users.map(user =>
                    user._id === id ? {
                        ...user,
                        isBanned: response.data.isBanned,
                        bannedExpiresAt: response.data.bannedExpiresAt
                    } : user
                )
            }));
            return true;
        } catch (error) {
            console.error('Failed to toggle ban:', error);
            Alert.alert('Error', 'Failed to update ban status');
            return false;
        }
    },

    updateRole: async (id) => {
        try {
            const response = await api.put(`/admin/users/${id}/role`);
            set(state => ({
                users: state.users.map(user =>
                    user._id === id ? { ...user, isAdmin: response.data.isAdmin } : user
                )
            }));
            Alert.alert('Success', response.data.message);
        } catch (error) {
            console.error('Failed to update role:', error);
            Alert.alert('Error', 'Failed to update user role');
        }
    },

    deleteUser: async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            set(state => ({
                users: state.users.filter(user => user._id !== id)
            }));
        } catch (error) {
            console.error(error);
            alert('Failed to delete user');
        }
    },
}));

export default useAdminStore;
