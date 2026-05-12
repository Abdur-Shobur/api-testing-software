"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCase = void 0;
const mongoose_1 = require("mongoose");
const KeyValuePairSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
}, { _id: false });
const TestCaseSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    collectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true,
        index: true,
    },
    request: {
        method: { type: String, required: true },
        url: { type: String, required: true },
        headers: { type: [KeyValuePairSchema], default: [] },
        queryParams: { type: [KeyValuePairSchema], default: [] },
        body: {
            type: {
                type: String,
                enum: ['none', 'json', 'form', 'text'],
                default: 'none',
            },
            content: { type: String, default: '' },
        },
        timeoutMs: { type: Number, default: 10000 },
    },
    expectedResponse: {
        status: Number,
        headers: { type: [KeyValuePairSchema], default: [] },
        body: {
            mode: {
                type: String,
                enum: ['exact', 'contains', 'schema', 'ignore'],
                default: 'ignore',
            },
            content: { type: String, default: '' },
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.TestCase = mongoose_1.models.TestCase || (0, mongoose_1.model)('TestCase', TestCaseSchema);
//# sourceMappingURL=TestCase.js.map