"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMember = void 0;
const mongoose_1 = require("mongoose");
const TeamMemberSchema = new mongoose_1.Schema({
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'editor', 'viewer'],
        required: true,
        default: 'viewer',
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        default: null,
    },
    invitedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
TeamMemberSchema.index({
    teamId: 1,
    userId: 1,
}, {
    unique: true,
});
TeamMemberSchema.index({
    userId: 1,
});
exports.TeamMember = mongoose_1.models.TeamMember || (0, mongoose_1.model)('TeamMember', TeamMemberSchema);
//# sourceMappingURL=TeamMembers.js.map