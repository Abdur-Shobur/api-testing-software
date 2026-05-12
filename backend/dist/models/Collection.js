"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const mongoose_1 = require("mongoose");
const CollectionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Collection', default: null },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    assignedUserIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: [] }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
CollectionSchema.index({ teamId: 1, parentId: 1 });
CollectionSchema.index({ teamId: 1, projectId: 1, parentId: 1 });
CollectionSchema.index({ teamId: 1, assignedUserIds: 1 });
exports.Collection = mongoose_1.models.Collection || (0, mongoose_1.model)('Collection', CollectionSchema);
//# sourceMappingURL=Collection.js.map