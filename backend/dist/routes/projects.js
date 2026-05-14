"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRouter = void 0;
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const memberProjectScope_1 = require("../lib/memberProjectScope");
const slugify_1 = require("../lib/slugify");
const Collection_1 = require("../models/Collection");
const Documentation_1 = require("../models/Documentation");
const Project_1 = require("../models/Project");
const ProjectSetting_1 = require("../models/ProjectSetting");
const TestCase_1 = require("../models/TestCase");
exports.projectsRouter = (0, express_1.Router)();
async function uniqueProjectSlug(teamId, baseName) {
    let slug = (0, slugify_1.slugify)(baseName) || 'project';
    let n = 0;
    while (await Project_1.Project.exists({ teamId, slug })) {
        n += 1;
        slug = `${(0, slugify_1.slugify)(baseName) || 'project'}-${n}`;
    }
    return slug;
}
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
exports.projectsRouter.get('/', asyncHandler(async (req, res) => {
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const filter = { teamId: req.user.teamId };
    if (restricted)
        filter._id = new mongoose_1.Types.ObjectId(restricted);
    const projects = await Project_1.Project.find(filter)
        .sort({
        createdAt: 1,
    })
        .populate('settings');
    res.json({ data: projects, total: projects.length });
}));
// get projects by team id
exports.projectsRouter.get('/team/:teamId', asyncHandler(async (req, res) => {
    const projects = await Project_1.Project.find({
        teamId: new mongoose_1.Types.ObjectId(req.params.teamId),
    });
    res.json({ data: projects });
}));
exports.projectsRouter.post('/', asyncHandler(async (req, res) => {
    const { name, description = '', visibility = 'private', teamId, } = req.body ?? {};
    if (!teamId || !mongoose_1.Types.ObjectId.isValid(teamId)) {
        res.status(400).json({ error: 'teamId is required' });
        return;
    }
    if (!name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const teamOid = new mongoose_1.Types.ObjectId(teamId);
    const slug = await uniqueProjectSlug(teamOid, String(name));
    const settings = await ProjectSetting_1.ProjectSettings.create({
        baseUrl: '',
        authorization: '',
    });
    const project = await Project_1.Project.create({
        name: String(name).trim(),
        slug,
        description: String(description ?? ''),
        teamId: teamOid,
        createdBy: new mongoose_1.Types.ObjectId(req.user.userId),
        visibility: visibility === 'team' || visibility === 'public'
            ? visibility
            : 'private',
        settings: settings._id,
    });
    const populated = (await Project_1.Project.findById(project._id).populate('settings')) ?? project;
    res.status(201).json({ data: populated });
}));
exports.projectsRouter.get('/:projectId', asyncHandler(async (req, res) => {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const project = await Project_1.Project.findOne({
        _id: req.params.projectId,
    }).populate('settings');
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
    const { name, description, visibility, baseUrl, authorization } = req.body ?? {};
    const update = {};
    if (name !== undefined) {
        if (!String(name).trim()) {
            res.status(400).json({ error: 'name cannot be empty' });
            return;
        }
        update.name = String(name).trim();
        update.slug = (0, slugify_1.slugify)(String(name).trim());
    }
    if (description !== undefined)
        update.description = String(description ?? '');
    if (visibility !== undefined) {
        if (!['private', 'team', 'public'].includes(String(visibility))) {
            res.status(400).json({ error: 'invalid visibility' });
            return;
        }
        update.visibility = visibility;
    }
    const project = await Project_1.Project.findOneAndUpdate({
        _id: req.params.projectId,
        teamId: req.user.teamId,
    }, update, { new: true });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    if (baseUrl !== undefined || authorization !== undefined) {
        let settingsId = project.settings;
        if (!settingsId) {
            const created = await ProjectSetting_1.ProjectSettings.create({
                baseUrl: '',
                authorization: '',
            });
            settingsId = created._id;
            project.settings = settingsId;
            await project.save();
        }
        const settingsUpdate = {};
        if (baseUrl !== undefined)
            settingsUpdate.baseUrl = String(baseUrl ?? '');
        if (authorization !== undefined)
            settingsUpdate.authorization = authorization;
        if (Object.keys(settingsUpdate).length > 0) {
            await ProjectSetting_1.ProjectSettings.findByIdAndUpdate(settingsId, settingsUpdate, {
                new: true,
            });
        }
    }
    const fresh = await Project_1.Project.findById(project._id).populate('settings');
    res.json({ data: fresh ?? project });
}));
exports.projectsRouter.delete('/:projectId', asyncHandler(async (req, res) => {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const result = await Project_1.Project.deleteOne({
        _id: req.params.projectId,
        teamId: req.user.teamId,
        ...(restricted ? { _id: new mongoose_1.Types.ObjectId(restricted) } : {}),
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
    if (!req.params.projectId) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const project = await Project_1.Project.exists({
        _id: req.params.projectId,
    });
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    const projectId = new mongoose_1.Types.ObjectId(req.params.projectId);
    const collections = await Collection_1.Collection.find({
        projectId,
        deletedAt: null,
    }).sort({
        createdAt: 1,
    });
    const collectionIds = collections.map((c) => c._id);
    const [docs, tests] = await Promise.all([
        Documentation_1.Documentation.find({ collectionId: { $in: collectionIds } }),
        TestCase_1.TestCase.find({ collectionId: { $in: collectionIds } }).sort({
            createdAt: 1,
        }),
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