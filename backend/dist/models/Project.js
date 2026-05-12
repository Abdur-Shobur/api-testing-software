"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ProjectAuthSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['none', 'bearer', 'basic', 'apiKey'], default: 'none' },
    bearerToken: { type: String, default: '' },
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    apiKeyKey: { type: String, default: '' },
    apiKeyValue: { type: String, default: '' },
    apiKeyIn: { type: String, enum: ['header', 'query'], default: 'header' },
}, { _id: false });
const ProjectSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    baseUrl: { type: String, default: '' },
    auth: { type: ProjectAuthSchema, default: { type: 'none' } },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
ProjectSchema.index({ teamId: 1, name: 1 });
exports.Project = mongoose_1.models.Project || (0, mongoose_1.model)('Project', ProjectSchema);
//# sourceMappingURL=Project.js.map