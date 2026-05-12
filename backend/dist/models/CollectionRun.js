"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRun = void 0;
const mongoose_1 = require("mongoose");
const CollectionRunSchema = new mongoose_1.Schema({
    collectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true,
        index: true,
    },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    runBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    summary: { type: mongoose_1.Schema.Types.Mixed, required: true },
    runAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.CollectionRun = mongoose_1.models.CollectionRun || (0, mongoose_1.model)('CollectionRun', CollectionRunSchema);
//# sourceMappingURL=CollectionRun.js.map