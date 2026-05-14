"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
require("./ProjectSetting");
const ProjectSchema = new mongoose_1.Schema({
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '#6366f1',
    },
    visibility: {
        type: String,
        enum: ['private', 'team', 'public'],
        default: 'private',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    settings: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ProjectSettings',
        default: undefined,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});
ProjectSchema.index({
    teamId: 1,
    slug: 1,
}, {
    unique: true,
});
ProjectSchema.index({
    createdBy: 1,
});
exports.Project = mongoose_1.models.Project || (0, mongoose_1.model)('Project', ProjectSchema);
//# sourceMappingURL=Project.js.map