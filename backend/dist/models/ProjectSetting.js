"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSettings = void 0;
const mongoose_1 = require("mongoose");
const ProjectSettingsSchema = new mongoose_1.Schema({
    baseUrl: { type: String, default: '' },
    auth: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.ProjectSettings = mongoose_1.models.ProjectSettings ||
    (0, mongoose_1.model)('ProjectSettings', ProjectSettingsSchema);
//# sourceMappingURL=ProjectSetting.js.map