"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentVariable = void 0;
const mongoose_1 = require("mongoose");
const EnvironmentVariableSchema = new mongoose_1.Schema({
    key: { type: String, required: true, trim: true },
    value: { type: String, default: '' },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
EnvironmentVariableSchema.index({ teamId: 1, projectId: 1, key: 1 }, { unique: true });
exports.EnvironmentVariable = mongoose_1.models.EnvironmentVariable ||
    (0, mongoose_1.model)('EnvironmentVariable', EnvironmentVariableSchema);
//# sourceMappingURL=EnvironmentVariable.js.map