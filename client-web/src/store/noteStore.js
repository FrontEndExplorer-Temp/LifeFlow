import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

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

            set((state) => ({
                notes: [response.data, ...state.notes],
                isLoading: false
            }));

            if (response.data.gamification) {
                const { xpResult } = response.data.gamification;
                if (xpResult) {
                    toast.success(`Note created! +${xpResult.xp} XP`, {
                        icon: '🌟',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                } else {
                    toast.success('Note created');
                }
            } else {
                toast.success('Note created');
            }
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error('Failed to create note');
            return false;
        }
    },

    updateNote: async (id, updates) => {
        try {
            // Optimistic update
            set((state) => ({
                notes: state.notes.map((n) => (n._id === id ? { ...n, ...updates } : n)),
            }));

            await api.put(`/notes/${id}`, updates);
            toast.success('Note updated');
        } catch (error) {
            console.error('Update failed', error);
            get().fetchNotes();
            toast.error('Failed to update note');
        }
    },

    deleteNote: async (id) => {
        try {
            set((state) => ({
                notes: state.notes.filter((n) => n._id !== id),
            }));
            await api.delete(`/notes/${id}`);
            toast.success('Note deleted');
        } catch (error) {
            console.error('Delete failed', error);
            get().fetchNotes();
            toast.error('Failed to delete note');
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
            toast.error('Failed to summarize note');
            return null;
        }
    },

    reset: () => set({ notes: [], isLoading: false, error: null }),
}));

export default useNoteStore;
