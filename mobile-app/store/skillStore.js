import { create } from 'zustand';
import api from '../services/api';

const useSkillStore = create((set, get) => ({
    skills: [],
    isLoading: false,
    error: null,

    fetchSkills: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/skills');
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
            const response = await api.post('/skills', skillData);
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
            const response = await api.post(`/skills/${skillId}/roadmap`);

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
            const response = await api.post('/skills/daily-learning', params);
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
            const response = await api.post('/skills/daily-practice', params);
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
            const response = await api.post('/skills/daily-plan', params);
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

            await api.patch(`/skills/${skillId}/roadmap/${itemIndex}`);
        } catch (error) {
            console.error('Failed to toggle roadmap item', error);
            // Revert on failure (simple refetch for now)
            get().fetchSkills();
        }
    }
}));

export default useSkillStore;
