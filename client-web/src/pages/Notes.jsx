import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import useNoteStore from '../store/noteStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

const NoteCard = ({ note, onClick, onDelete }) => (
    <div
        onClick={onClick}
        className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group flex flex-col h-64"
    >
        <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{note.title}</h3>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
        <div className="flex-1 overflow-hidden text-sm text-gray-500 dark:text-gray-400 prose dark:prose-invert max-w-none">
            <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex justify-between items-center">
            <span>{format(new Date(note.updatedAt || note.createdAt), 'MMM d, yyyy')}</span>
            {note.tags && note.tags.length > 0 && (
                <div className="flex gap-1">
                    {note.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const Notes = () => {
    const { notes, fetchNotes, addNote, updateNote, deleteNote, summarizeNote, isLoading } = useNoteStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { register, handleSubmit, reset, setValue, watch } = useForm();

    const content = watch('content');

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (note = null) => {
        if (note) {
            setSelectedNote(note);
            setValue('title', note.title);
            setValue('content', note.content);
            setValue('tags', note.tags?.join(', '));
        } else {
            setSelectedNote(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        const noteData = {
            ...data,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        };

        if (selectedNote) {
            await updateNote(selectedNote._id, noteData);
        } else {
            await addNote(noteData);
        }
        setIsModalOpen(false);
        reset();
    };

    const handleSummarize = async () => {
        if (!content) return;
        const summary = await summarizeNote(content);
        if (summary) {
            // Append summary to content or show it (for now appending)
            setValue('content', content + '\n\n**AI Summary:**\n' + summary);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Capture your ideas and thoughts</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Note
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Notes Grid */}
            {isLoading && !notes.length ? (
                <div className="text-center py-12">Loading notes...</div>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No notes found. Create one to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredNotes.map((note) => (
                        <NoteCard
                            key={note._id}
                            note={note}
                            onClick={() => handleOpenModal(note)}
                            onDelete={deleteNote}
                        />
                    ))}
                </div>
            )}

            {/* Note Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedNote ? 'Edit Note' : 'New Note'}
                className="max-w-2xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        placeholder="Note Title"
                        className="text-lg font-semibold border-none px-0 focus:ring-0 rounded-none border-b border-gray-200 dark:border-gray-700"
                        {...register('title', { required: 'Title is required' })}
                    />

                    <div className="relative">
                        <textarea
                            {...register('content', { required: 'Content is required' })}
                            rows={12}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none font-mono text-sm"
                            placeholder="Start typing..."
                        />
                        <button
                            type="button"
                            onClick={handleSummarize}
                            className="absolute bottom-2 right-2 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Summarize with AI"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>

                    <Input
                        placeholder="Tags (comma separated)"
                        {...register('tags')}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {selectedNote ? 'Update Note' : 'Create Note'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Notes;
