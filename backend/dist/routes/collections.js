"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionsRouter = void 0;
const express_1 = require("express");
const CollectionRun_1 = require("../models/CollectionRun");
const store_1 = require("../store");
exports.collectionsRouter = (0, express_1.Router)();
// ─── Helper ──────────────────────────────────────────────────────────────────
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════
// GET /collections
exports.collectionsRouter.get('/', asyncHandler(async (req, res) => {
    const projectIdRaw = req.query.projectId;
    const projectId = projectIdRaw === undefined
        ? undefined
        : projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
            ? null
            : String(projectIdRaw);
    const collections = await (0, store_1.getAllCollections)(req.user.teamId, projectId);
    res.json({ data: collections, total: collections.length });
}));
// POST /collections
exports.collectionsRouter.post('/', asyncHandler(async (req, res) => {
    const dto = req.body;
    if (!dto.name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const collection = await (0, store_1.createCollection)({
        ...dto,
        parentId: req.body.parentId ?? null,
        projectId: req.body.projectId ?? null,
        assignedUserIds: req.body.assignedUserIds ?? [],
    }, req.user.teamId);
    res.status(201).json({ data: collection, success: true });
}));
// GET /collections/:collectionId/children
exports.collectionsRouter.get('/:collectionId/children', asyncHandler(async (req, res) => {
    const projectIdRaw = req.query.projectId;
    const projectId = projectIdRaw === undefined
        ? undefined
        : projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
            ? null
            : String(projectIdRaw);
    const children = await (0, store_1.getCollectionChildren)(req.params.collectionId, req.user.teamId, projectId);
    res.json({ data: children, total: children.length });
}));
// GET /collections/:collectionId/tree
exports.collectionsRouter.get('/:collectionId/tree', asyncHandler(async (req, res) => {
    const tree = await (0, store_1.getCollectionTree)(req.params.collectionId, req.user.teamId);
    if (!tree) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: tree });
}));
// GET /collections/:collectionId/runs
exports.collectionsRouter.get('/:collectionId/runs', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId, req.user.teamId);
    if (!col) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    const runs = await CollectionRun_1.CollectionRun.find({
        collectionId: req.params.collectionId,
        teamId: req.user.teamId,
    })
        .sort({ runAt: -1 })
        .limit(10);
    res.json({ data: runs });
}));
// GET /collections/:collectionId
exports.collectionsRouter.get('/:collectionId', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId, req.user.teamId);
    if (!col) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: col });
}));
// PATCH /collections/:collectionId
exports.collectionsRouter.patch('/:collectionId', asyncHandler(async (req, res) => {
    const dto = req.body;
    const updated = await (0, store_1.updateCollection)(req.params.collectionId, req.user.teamId, dto);
    if (!updated) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: updated, success: true });
}));
// DELETE /collections/:collectionId
exports.collectionsRouter.delete('/:collectionId', asyncHandler(async (req, res) => {
    const deleted = await (0, store_1.deleteCollection)(req.params.collectionId, req.user.teamId);
    if (!deleted) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res
        .status(200)
        .json({ message: 'Delete Success', success: true, status: 200 });
}));
// ═══════════════════════════════════════════════════════════════════════════
// TEST CASES  (nested under a collection)
// ═══════════════════════════════════════════════════════════════════════════
// GET /collections/:collectionId/tests
exports.collectionsRouter.get('/:collectionId/tests', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId, req.user.teamId);
    if (!col) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: col.testCases, total: col.testCases.length });
}));
// POST /collections/:collectionId/tests
exports.collectionsRouter.post('/:collectionId/tests', asyncHandler(async (req, res) => {
    const dto = req.body;
    if (!dto.name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    if (!dto.request?.url) {
        res.status(400).json({ error: 'request.url is required' });
        return;
    }
    if (!dto.request?.method) {
        res.status(400).json({ error: 'request.method is required' });
        return;
    }
    const testCase = await (0, store_1.createTestCase)(req.params.collectionId, req.user.teamId, dto);
    if (!testCase) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.status(201).json({ data: testCase });
}));
// GET /collections/:collectionId/tests/:testId
exports.collectionsRouter.get('/:collectionId/tests/:testId', asyncHandler(async (req, res) => {
    const tc = await (0, store_1.getTestCaseById)(req.params.collectionId, req.params.testId, req.user.teamId);
    if (!tc) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    res.json({ data: tc });
}));
// PATCH /collections/:collectionId/tests/:testId
exports.collectionsRouter.patch('/:collectionId/tests/:testId', asyncHandler(async (req, res) => {
    const dto = req.body;
    const updated = await (0, store_1.updateTestCase)(req.params.collectionId, req.params.testId, req.user.teamId, dto);
    if (!updated) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    res.json({ data: updated, success: true });
}));
// DELETE /collections/:collectionId/tests/:testId
exports.collectionsRouter.delete('/:collectionId/tests/:testId', asyncHandler(async (req, res) => {
    const deleted = await (0, store_1.deleteTestCase)(req.params.collectionId, req.params.testId, req.user.teamId);
    if (!deleted) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    res
        .status(200)
        .json({ message: 'Delete Success', success: true, status: 200 });
}));
//# sourceMappingURL=collections.js.map