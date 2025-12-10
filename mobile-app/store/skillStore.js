import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import { Platform } from 'react-native';

// Configure base URL based on environment (similar to your likely authStore setup)
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const useSkillStore = create((set, get) => ({
    skills: [],
    isLoading: false,
    error: null,

    fetchSkills: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.get(`${API_URL}/skills`, config);
            set({ skills: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch skills',
                isLoading: false
            });
        }
    },

    createSkill: async (skillData) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.post(`${API_URL}/skills`, skillData, config);
            set(state => ({
                skills: [...state.skills, response.data],
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create skill',
                isLoading: false
            });
            throw error;
        }
    },

    generateRoadmap: async (skillId) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.post(`${API_URL}/skills/${skillId}/roadmap`, {}, config);

            // Update local state
            set(state => ({
                skills: state.skills.map(skill =>
                    skill._id === skillId
                        ? { ...skill, roadmap: response.data.roadmap }
                        : skill
                ),
                isLoading: false
            }));

            return response.data.roadmap;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to generate roadmap',
                isLoading: false
            });
            throw error;
        }
    },

    generateDailyLearning: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.post(`${API_URL}/skills/daily-learning`, params, config);
            set({ isLoading: false });
            return response.data; // { message, tasks }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to generate learning tasks',
                isLoading: false
            });
            throw error;
        }
    },

    generateDailyPractice: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.post(`${API_URL}/skills/daily-practice`, params, config);
            set({ isLoading: false });
            return response.data; // { message, tasks }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to generate practice tasks',
                isLoading: false
            });
            throw error;
        }
    },

    generateDailyPlan: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.post(`${API_URL}/skills/daily-plan`, params, config);
            set({ isLoading: false });
            return response.data; // { message, totalTasks, tasks }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to generate daily plan',
                isLoading: false
            });
            throw error;
        }
    },

    toggleRoadmapItem: async (skillId, itemIndex) => {
        try {
            const token = useAuthStore.getState().token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Optimistic Update
            set(state => ({
                skills: state.skills.map(skill => {
                    if (skill._id === skillId) {
                        const newRoadmap = [...skill.roadmap];
                        if (newRoadmap[itemIndex]) {
                            newRoadmap[itemIndex] = { ...newRoadmap[itemIndex], isCompleted: !newRoadmap[itemIndex].isCompleted };
                        }
                        return { ...skill, roadmap: newRoadmap };
                    }
                    return skill;
                })
            }));

            await axios.patch(`${API_URL}/skills/${skillId}/roadmap/${itemIndex}`, {}, config);
        } catch (error) {
            console.error('Failed to toggle roadmap item', error);
            get().fetchSkills();
        }
    }
}));

export default useSkillStore;
