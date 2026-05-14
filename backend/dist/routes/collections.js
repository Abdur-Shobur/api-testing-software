"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionsRouter = void 0;
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const memberProjectScope_1 = require("../lib/memberProjectScope");
const slugify_1 = require("../lib/slugify");
const Collection_1 = require("../models/Collection");
const CollectionRun_1 = require("../models/CollectionRun");
const TestCase_1 = require("../models/TestCase");
const store_1 = require("../store");
exports.collectionsRouter = (0, express_1.Router)();
// ─── Helper ──────────────────────────────────────────────────────────────────
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
function parseQueryProjectId(req) {
    const projectIdRaw = req.query.projectId;
    if (projectIdRaw === undefined)
        return undefined;
    if (projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null')
        return null;
    return String(projectIdRaw);
}
async function effectiveListProjectId(req) {
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    if (restricted)
        return restricted;
    return parseQueryProjectId(req);
}
// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════
// GET /collections
exports.collectionsRouter.get('/', asyncHandler(async (req, res) => {
    const projectId = await effectiveListProjectId(req);
    const collections = await (0, store_1.getAllCollections)(req.user.teamId, projectId);
    res.json({ data: collections, total: collections.length });
}));
// get collections by project id
// GET /collections/project/:projectId
exports.collectionsRouter.get('/project/:projectId', asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;
    const collections = await Collection_1.Collection.find({
        projectId: new mongoose_1.Types.ObjectId(projectId),
        parentId: null,
    });
    res.json({ data: collections });
}));
// POST /collections
exports.collectionsRouter.post('/', asyncHandler(async (req, res) => {
    const dto = req.body;
    if (!dto.name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const create = await Collection_1.Collection.create({
        name: dto.name,
        teamId: req.user.teamId,
        createdBy: new mongoose_1.Types.ObjectId(req.user.userId),
        description: dto.description ?? '',
        projectId: dto.projectId ? new mongoose_1.Types.ObjectId(dto.projectId) : null,
        parentId: dto.parentId ? new mongoose_1.Types.ObjectId(dto.parentId) : null,
        slug: (0, slugify_1.slugify)(dto.name),
    });
    res.status(201).json({ data: create, success: true });
}));
// GET /collections/:collectionId/children
exports.collectionsRouter.get('/:collectionId/children', asyncHandler(async (req, res) => {
    const projectId = await effectiveListProjectId(req);
    const children = await (0, store_1.getCollectionChildren)(req.params.collectionId, projectId);
    res.json({ data: children, total: children.length });
}));
// GET /collections/:collectionId/tree
exports.collectionsRouter.get('/:collectionId/tree', asyncHandler(async (req, res) => {
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const tree = await (0, store_1.getCollectionTree)(req.params.collectionId, req.user.teamId);
    if (!tree) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    if (!(0, memberProjectScope_1.collectionProjectMatches)(restricted, tree.projectId)) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: tree });
}));
// GET /collections/:collectionId/runs
exports.collectionsRouter.get('/:collectionId/runs', asyncHandler(async (req, res) => {
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const col = await (0, store_1.getCollectionById)(req.params.collectionId);
    if (!col || !(0, memberProjectScope_1.collectionProjectMatches)(restricted, col.projectId)) {
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
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const col = await (0, store_1.getCollectionById)(req.params.collectionId);
    if (!col || !(0, memberProjectScope_1.collectionProjectMatches)(restricted, col.projectId)) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: col });
}));
// PATCH /collections/:collectionId
exports.collectionsRouter.patch('/:collectionId', asyncHandler(async (req, res) => {
    const dto = req.body;
    const updated = await Collection_1.Collection.findOneAndUpdate({
        _id: req.params.collectionId,
    }, {
        ...dto,
    });
    if (!updated) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.json({ data: updated, success: true });
}));
// DELETE /collections/:collectionId
exports.collectionsRouter.delete('/:collectionId', asyncHandler(async (req, res) => {
    const deleted = await Collection_1.Collection.deleteOne({
        _id: req.params.collectionId,
    });
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
    const col = await TestCase_1.TestCase.find({
        collectionId: new mongoose_1.Types.ObjectId(req.params.collectionId),
    });
    res.json({ data: col, total: col.length });
}));
// POST /collections/:collectionId/tests
exports.collectionsRouter.post('/:collectionId/tests', asyncHandler(async (req, res) => {
    const dto = req.body;
    console.log(dto);
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
    const testCase = await (0, store_1.createTestCase)(req.params.collectionId, dto);
    if (!testCase) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    res.status(201).json({ data: testCase });
}));
// GET /collections/:collectionId/tests/:testId
exports.collectionsRouter.get('/:collectionId/tests/:testId', asyncHandler(async (req, res) => {
    const tc = await (0, store_1.getTestCaseById)(req.params.collectionId, req.params.testId);
    if (!tc) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    res.json({ data: tc });
}));
// PATCH /collections/:collectionId/tests/:testId
exports.collectionsRouter.patch('/:collectionId/tests/:testId', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId);
    if (!col) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    const dto = req.body;
    const updated = await (0, store_1.updateTestCase)(req.params.collectionId, req.params.testId, dto);
    if (!updated) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    res.json({ data: updated, success: true });
}));
// DELETE /collections/:collectionId/tests/:testId
exports.collectionsRouter.delete('/:collectionId/tests/:testId', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId);
    if (!col) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    const deleted = await (0, store_1.deleteTestCase)(req.params.collectionId, req.params.testId);
    if (!deleted) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    res
        .status(200)
        .json({ message: 'Delete Success', success: true, status: 200 });
}));
//# sourceMappingURL=collections.js.map