import mongoose from 'mongoose';

const noteSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        tags: [{
            type: String,
        }],
        isPinned: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            default: '#ffffff', // Default white
        },
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
