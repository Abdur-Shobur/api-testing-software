"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCasesRouter = void 0;
const express_1 = require("express");
const Collection_1 = require("../models/Collection");
const TestCase_1 = require("../models/TestCase");
const TestRun_1 = require("../models/TestRun");
exports.testCasesRouter = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
exports.testCasesRouter.get('/:testId/history', asyncHandler(async (req, res) => {
    const testCase = await TestCase_1.TestCase.findById(req.params.testId);
    if (!testCase) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    const collection = await Collection_1.Collection.findOne({
        _id: testCase.collectionId,
        deletedAt: null,
    }).lean();
    if (!collection) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    const runs = await TestRun_1.TestRun.find({ testCaseId: req.params.testId })
        .sort({ runAt: -1 })
        .limit(20);
    res.json({ data: runs });
}));
//# sourceMappingURL=testCases.js.map