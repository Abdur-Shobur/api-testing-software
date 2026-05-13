"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docsRouter = void 0;
const express_1 = require("express");
const memberProjectScope_1 = require("../lib/memberProjectScope");
const Collection_1 = require("../models/Collection");
const Documentation_1 = require("../models/Documentation");
exports.docsRouter = (0, express_1.Router)({ mergeParams: true });
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
async function assertCollection(req, res) {
    const col = await Collection_1.Collection.findOne({
        _id: req.params.collectionId,
        teamId: req.user.teamId,
        deletedAt: null,
    }).lean();
    if (!col) {
        res.status(404).json({ error: 'Collection not found' });
        return false;
    }
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const cp = col.projectId ? String(col.projectId) : null;
    if (restricted && cp !== restricted) {
        res.status(404).json({ error: 'Collection not found' });
        return false;
    }
    return true;
}
exports.docsRouter.get('/', asyncHandler(async (req, res) => {
    if (!(await assertCollection(req, res)))
        return;
    const docs = await Documentation_1.Documentation.findOne({
        collectionId: req.params.collectionId,
    });
    res.json({ data: docs });
}));
exports.docsRouter.post('/', asyncHandler(async (req, res) => {
    if (!(await assertCollection(req, res)))
        return;
    const { title = 'Documentation', content = '' } = req.body ?? {};
    const docs = await Documentation_1.Documentation.findOneAndUpdate({ collectionId: req.params.collectionId }, { title, content }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ data: docs });
}));
exports.docsRouter.delete('/', asyncHandler(async (req, res) => {
    if (!(await assertCollection(req, res)))
        return;
    await Documentation_1.Documentation.deleteOne({ collectionId: req.params.collectionId });
    res.json({ data: { deleted: true } });
}));
//# sourceMappingURL=docs.js.map