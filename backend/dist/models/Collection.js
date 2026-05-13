"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const mongoose_1 = require("mongoose");
const CollectionVariableSchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        trim: true,
    },
    value: {
        type: String,
        default: '',
    },
    secret: {
        type: Boolean,
        default: false,
    },
}, {
    _id: false,
});
const CollectionSchema = new mongoose_1.Schema({
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
        index: true,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Collection',
        default: null,
        index: true,
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
    sortOrder: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    },
    path: {
        type: String,
        default: '/',
        index: true,
    },
    assignedUserIds: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    variables: {
        type: [CollectionVariableSchema],
        default: [],
    },
    settings: {
        collapsedByDefault: {
            type: Boolean,
            default: false,
        },
        inheritVariables: {
            type: Boolean,
            default: true,
        },
        inheritAuth: {
            type: Boolean,
            default: true,
        },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    archived: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
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
CollectionSchema.index({
    teamId: 1,
    projectId: 1,
    parentId: 1,
    sortOrder: 1,
});
CollectionSchema.index({
    projectId: 1,
    path: 1,
});
CollectionSchema.index({
    assignedUserIds: 1,
});
CollectionSchema.index({
    createdBy: 1,
});
CollectionSchema.index({
    archived: 1,
});
CollectionSchema.index({
    deletedAt: 1,
});
CollectionSchema.index({
    projectId: 1,
    slug: 1,
    parentId: 1,
}, {
    unique: true,
});
exports.Collection = mongoose_1.models.Collection || (0, mongoose_1.model)('Collection', CollectionSchema);
//# sourceMappingURL=Collection.js.map