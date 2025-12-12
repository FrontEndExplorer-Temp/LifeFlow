import mongoose from 'mongoose';

const adminLogSchema = mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
            // Examples: "BAN_USER", "UNBAN_USER", "PROMOTE_ADMIN", "DEMOTE_ADMIN", "BROADCAST_SENT"
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Not all actions have a target user (e.g. Broadcast)
        },
        details: {
            type: Object, // Flexible field for extra info (e.g. ban duration, browser info)
            required: false,
        }
    },
    {
        timestamps: true, // Creates createdAt and updatedAt
    }
);

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

export default AdminLog;
