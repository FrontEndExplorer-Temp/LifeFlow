import { create } from 'zustand';
import api from '../services/api';

const useNoteStore = create((set, get) => ({
    notes: [],
    isLoading: false,
    error: null,

    fetchNotes: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/notes');
            set({ notes: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addNote: async (noteData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/notes', noteData);

            // Handle Gamification
            if (response.data.gamification) {
                const { xpResult, newBadges } = response.data.gamification;
                const useAuthStore = require('./authStore').default;
                useAuthStore.getState().updateGamification(xpResult, newBadges);
            }

            set((state) => ({
                notes: [response.data, ...state.notes],
                isLoading: false
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    updateNote: async (id, updates) => {
        try {
            // Optimistic update
            set((state) => ({
                notes: state.notes.map((n) => (n._id === id ? { ...n, ...updates } : n)),
            }));

            await api.put(`/notes/${id}`, updates);
        } catch (error) {
            console.error('Update failed', error);
            get().fetchNotes();
        }
    },

    deleteNote: async (id) => {
        try {
            set((state) => ({
                notes: state.notes.filter((n) => n._id !== id),
            }));
            await api.delete(`/notes/${id}`);
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchNotes();
        }
    },

    summarizeNote: async (content) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/ai/summarize-note', { content });
            set({ isLoading: false });
            return response.data.summary;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return null;
        }
    },

    reset: () => set({ notes: [], isLoading: false, error: null }),
}));

export default useNoteStore;
