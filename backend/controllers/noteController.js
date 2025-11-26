import asyncHandler from 'express-async-handler';
import Note from '../models/noteModel.js';
import { addXP, checkBadges, XP_REWARDS } from '../services/gamificationService.js';

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user._id })
        .sort({ isPinned: -1, updatedAt: -1 }); // Pinned first, then newest
    res.json(notes);
});

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
    const { title, content, tags, isPinned, color } = req.body;

    const note = await Note.create({
        user: req.user._id,
        title,
        content,
        tags,
        isPinned,
        color,
    });

    let gamification = {};
    try {
        const xpResult = await addXP(req.user._id, XP_REWARDS.NOTE_CREATION);
        const newBadges = await checkBadges(req.user._id, 'NOTE_CREATE');
        gamification = { xpResult, newBadges };
    } catch (e) {
        console.error('Gamification error:', e);
    }

    res.status(201).json({ ...note.toObject(), gamification });
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Ensure user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedNote);
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    if (note.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await note.deleteOne();

    res.json({ message: 'Note removed' });
});

export { getNotes, createNote, updateNote, deleteNote };
