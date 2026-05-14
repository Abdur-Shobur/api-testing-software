"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamInvite = void 0;
const mongoose_1 = require("mongoose");
const TeamInviteSchema = new mongoose_1.Schema({
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'editor', 'viewer'],
        default: 'viewer',
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired', 'cancelled'],
        default: 'pending',
    },
    invitedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    acceptedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
TeamInviteSchema.index({
    email: 1,
    teamId: 1,
});
exports.TeamInvite = mongoose_1.models.TeamInvite || (0, mongoose_1.model)('TeamInvite', TeamInviteSchema);
//# sourceMappingURL=TeamInvite.js.map