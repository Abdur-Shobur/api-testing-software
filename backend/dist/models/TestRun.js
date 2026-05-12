"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRun = void 0;
const mongoose_1 = require("mongoose");
const TestRunSchema = new mongoose_1.Schema({
    testCaseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TestCase', required: true, index: true },
    collectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true,
        index: true,
    },
    status: { type: String, enum: ['pass', 'fail', 'error'], required: true },
    durationMs: { type: Number, required: true },
    assertions: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    actual: { type: mongoose_1.Schema.Types.Mixed, default: null },
    runBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    runAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.TestRun = mongoose_1.models.TestRun || (0, mongoose_1.model)('TestRun', TestRunSchema);
//# sourceMappingURL=TestRun.js.map