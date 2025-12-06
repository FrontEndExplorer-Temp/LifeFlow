import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit2, Sparkles, Pin, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import useNoteStore from '../store/noteStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

const COLORS = ['#ffffff', '#ffebee', '#e8f5e9', '#e3f2fd', '#fff3e0', '#f3e5f5'];
const DARK_COLORS = ['#1f2937', '#451e1e', '#1e3b24', '#1e2f45', '#452f1e', '#361e45'];

const NoteCard = ({ note, onClick, onDelete, onPin }) => {
    // Determine background color based on theme (simplified logic for now)
    // Ideally we'd use a context or helper to switch between light/dark variants of the stored color
    // For now, we'll use the stored color directly, but add a class for dark mode override if needed

    // A better approach for the web:
    // If the note has a color, apply it.
    // Ensure text contrast is sufficient.

    return (
        <div
            onClick={onClick}
            className="rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group flex flex-col h-64 relative overflow-hidden"
            style={{ backgroundColor: note.color || (document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff') }}
        >
            {/* Background color handling for dark mode needs to be smarter, 
                but for parity with mobile's simple implementation, we'll rely on the stored color 
                or default to white/dark-gray if none. 
                
                Actually, to support the same palette as mobile, we should ideally map them.
                Let's use a style override from the note.color if it exists and isn't white.
             */}

            <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 pr-2">{note.title}</h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPin(note); }}
                        className={cn(
                            "transition-colors p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10",
                            note.isPinned ? "text-blue-500" : "text-gray-400 opacity-0 group-hover:opacity-100"
                        )}
                        title={note.isPinned ? "Unpin note" : "Pin note"}
                    >
                        <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(note._id); }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        title="Delete note"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none mb-2">
                <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
            <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <span>{format(new Date(note.updatedAt || note.createdAt), 'MMM d, yyyy')}</span>
                {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                        {note.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                #{tag}
                            </span>
                        ))}
                        {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

const Notes = () => {
    const { notes, fetchNotes, addNote, updateNote, deleteNote, summarizeNote, isLoading } = useNoteStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const { register, handleSubmit, reset, setValue, watch, getValues } = useForm();

    const content = watch('content');
    const currentTags = watch('tags') || [];

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Client-side sorting: Pinned first, then UpdatedAt desc
    // Although backend sends it sorted, doing it here ensures immediate update on pin toggle
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        }
        return a.isPinned ? -1 : 1;
    });

    const filteredNotes = sortedNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (note = null) => {
        if (note) {
            setSelectedNote(note);
            setValue('title', note.title);
            setValue('content', note.content);
            setValue('tags', note.tags || []);
            setSelectedColor(note.color || COLORS[0]);
        } else {
            setSelectedNote(null);
            reset();
            setValue('tags', []);
            setSelectedColor(COLORS[0]);
        }
        setTagInput('');
        setIsModalOpen(true);
    };

    const handlePinToggle = async (note) => {
        await updateNote(note._id, { isPinned: !note.isPinned });
    };

    const onSubmit = async (data) => {
        const noteData = {
            ...data,
            tags: data.tags, // Already an array from hook-form state
            color: selectedColor
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
            setValue('content', content + '\n\n**AI Summary:**\n' + summary);
        }
    };

    const handleAddTag = (e) => {
        e?.preventDefault();
        const trimmed = tagInput.trim();
        if (trimmed) {
            const current = getValues('tags') || [];
            if (!current.includes(trimmed)) {
                setValue('tags', [...current, trimmed]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        const current = getValues('tags') || [];
        setValue('tags', current.filter(t => t !== tagToRemove));
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
                            onPin={handlePinToggle}
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
                            rows={10}
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

                    {/* Tags Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {currentTags && currentTags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-600">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                                placeholder="Add tag + Enter"
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                        <div className="flex gap-3">
                            {COLORS.map((color, index) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110",
                                        selectedColor === color ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : ""
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>


                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
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
