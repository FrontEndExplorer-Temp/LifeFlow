import mongoose from 'mongoose';

const subtaskSchema = mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const taskSchema = mongoose.Schema(
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
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Backlog', 'Today', 'In Progress', 'Completed'],
            default: 'Backlog',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        tags: [{
            type: String,
        }],
        subtasks: [subtaskSchema],
        dueDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
