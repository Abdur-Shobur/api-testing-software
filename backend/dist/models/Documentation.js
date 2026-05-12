"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Documentation = void 0;
const mongoose_1 = require("mongoose");
const DocumentationSchema = new mongoose_1.Schema({
    collectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true,
        unique: true,
        index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.Documentation = mongoose_1.models.Documentation ||
    (0, mongoose_1.model)('Documentation', DocumentationSchema);
//# sourceMappingURL=Documentation.js.map