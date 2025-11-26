import { create } from 'zustand';
import api from '../services/api';
import { Alert } from 'react-native';

const useAdminStore = create((set, get) => ({
    users: [],
    isLoading: false,

    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/admin/users');
            set({ users: response.data, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch users:', error);
            set({ isLoading: false });
            Alert.alert('Error', 'Failed to fetch users');
        }
    },

    deleteUser: async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            set((state) => ({
                users: state.users.filter((user) => user._id !== id),
            }));
            Alert.alert('Success', 'User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            Alert.alert('Error', 'Failed to delete user');
        }
    },
}));

export default useAdminStore;
