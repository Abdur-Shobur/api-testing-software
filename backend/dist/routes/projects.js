"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const Collection_1 = require("../models/Collection");
const Documentation_1 = require("../models/Documentation");
const Project_1 = require("../models/Project");
const TestCase_1 = require("../models/TestCase");
exports.projectsRouter = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
exports.projectsRouter.get('/', asyncHandler(async (req, res) => {
    const projects = await Project_1.Project.find({ teamId: req.user.teamId }).sort({
        createdAt: 1,
    });
    res.json({ data: projects, total: projects.length });
}));
exports.projectsRouter.post('/', asyncHandler(async (req, res) => {
    const { name, description = '' } = req.body ?? {};
    if (!name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const project = await Project_1.Project.create({
        name: String(name).trim(),
        description: String(description ?? ''),
        teamId: new mongoose_1.Types.ObjectId(req.user.teamId),
    });
    res.status(201).json({ data: project });
}));
exports.projectsRouter.get('/:projectId', asyncHandler(async (req, res) => {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const project = await Project_1.Project.findOne({
        _id: req.params.projectId,
        teamId: req.user.teamId,
    });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json({ data: project });
}));
exports.projectsRouter.patch('/:projectId', asyncHandler(async (req, res) => {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const { name, description, baseUrl, auth } = req.body ?? {};
    const update = {};
    if (name !== undefined) {
        if (!String(name).trim()) {
            res.status(400).json({ error: 'name cannot be empty' });
            return;
        }
        update.name = String(name).trim();
    }
    if (description !== undefined)
        update.description = String(description ?? '');
    if (baseUrl !== undefined)
        update.baseUrl = String(baseUrl ?? '');
    if (auth !== undefined)
        update.auth = auth;
    const project = await Project_1.Project.findOneAndUpdate({ _id: req.params.projectId, teamId: req.user.teamId }, update, { new: true });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json({ data: project });
}));
exports.projectsRouter.delete('/:projectId', asyncHandler(async (req, res) => {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const result = await Project_1.Project.deleteOne({
        _id: req.params.projectId,
        teamId: req.user.teamId,
    });
    if (result.deletedCount !== 1) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json({ data: { deleted: true } });
}));
exports.projectsRouter.get('/:projectId/documentation', asyncHandler(async (req, res) => {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const project = await Project_1.Project.exists({
        _id: req.params.projectId,
        teamId: req.user.teamId,
    });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const projectId = new mongoose_1.Types.ObjectId(req.params.projectId);
    const teamId = new mongoose_1.Types.ObjectId(req.user.teamId);
    const collections = await Collection_1.Collection.find({ teamId, projectId }).sort({
        createdAt: 1,
    });
    const collectionIds = collections.map((c) => c._id);
    const [docs, tests] = await Promise.all([
        Documentation_1.Documentation.find({ collectionId: { $in: collectionIds } }),
        TestCase_1.TestCase.find({ collectionId: { $in: collectionIds } }).sort({ createdAt: 1 }),
    ]);
    const docsByCollectionId = new Map();
    for (const d of docs)
        docsByCollectionId.set(String(d.collectionId), d);
    const testsByCollectionId = new Map();
    for (const t of tests) {
        const key = String(t.collectionId);
        const arr = testsByCollectionId.get(key) ?? [];
        arr.push(t);
        testsByCollectionId.set(key, arr);
    }
    const nodes = new Map();
    for (const c of collections) {
        const obj = c.toObject({ virtuals: true });
        const id = obj.id ?? String(obj._id);
        const _id = String(obj._id);
        const parentId = obj.parentId ? String(obj.parentId) : null;
        const doc = docsByCollectionId.get(_id) ?? null;
        const testCases = (testsByCollectionId.get(_id) ?? []).map((tc) => {
            const tco = tc.toObject({ virtuals: true });
            return {
                ...tco,
                id: tco.id ?? String(tco._id),
                _id: String(tco._id),
                collectionId: String(tco.collectionId),
                createdAt: tco.createdAt.toISOString(),
                updatedAt: tco.updatedAt.toISOString(),
            };
        });
        nodes.set(_id, {
            ...obj,
            id,
            _id,
            parentId,
            teamId: String(obj.teamId),
            projectId: String(obj.projectId),
            description: obj.description ?? '',
            createdAt: obj.createdAt.toISOString(),
            updatedAt: obj.updatedAt.toISOString(),
            documentation: doc
                ? {
                    ...doc.toObject({ virtuals: true }),
                    id: doc.id ?? String(doc._id),
                    _id: String(doc._id),
                    collectionId: String(doc.collectionId),
                    createdAt: doc.createdAt.toISOString(),
                    updatedAt: doc.updatedAt.toISOString(),
                }
                : null,
            testCases,
            children: [],
        });
    }
    const roots = [];
    for (const node of nodes.values()) {
        if (!node.parentId) {
            roots.push(node);
            continue;
        }
        const parent = nodes.get(node.parentId);
        if (parent)
            parent.children.push(node);
        else
            roots.push(node); // fallback
    }
    res.json({ data: { projectId: req.params.projectId, tree: roots } });
}));
//# sourceMappingURL=projects.js.map