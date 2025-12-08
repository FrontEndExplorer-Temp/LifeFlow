import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

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

            set((state) => ({
                jobs: [response.data, ...state.jobs],
                isLoading: false
            }));
            toast.success('Job added');
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to add job');
            return false;
        }
    },

    updateJob: async (id, updates) => {
        try {
            set((state) => ({
                jobs: state.jobs.map((j) => (j._id === id ? { ...j, ...updates } : j)),
            }));

            await api.put(`/jobs/${id}`, updates);
            toast.success('Job updated');
        } catch (error) {
            console.error('Update failed', error);
            get().fetchJobs();
            toast.error('Failed to update job');
        }
    },

    deleteJob: async (id) => {
        try {
            set((state) => ({
                jobs: state.jobs.filter((j) => j._id !== id),
            }));
            await api.delete(`/jobs/${id}`);
            toast.success('Job deleted');
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchJobs();
            toast.error('Failed to delete job');
        }
    },

    getInterviewPrep: async (role, skills) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/jobs/prep', { role, skills });
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to generate interview prep');
            return null;
        }
    },

    reset: () => set({ jobs: [], isLoading: false, error: null }),
}));

export default useJobStore;
