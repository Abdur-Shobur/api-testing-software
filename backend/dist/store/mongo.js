"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCollections = getAllCollections;
exports.getAssignedCollections = getAssignedCollections;
exports.getCollectionById = getCollectionById;
exports.createCollection = createCollection;
exports.updateCollection = updateCollection;
exports.deleteCollection = deleteCollection;
exports.getCollectionChildren = getCollectionChildren;
exports.getCollectionTree = getCollectionTree;
exports.createTestCase = createTestCase;
exports.getTestCaseById = getTestCaseById;
exports.updateTestCase = updateTestCase;
exports.deleteTestCase = deleteTestCase;
const mongoose_1 = require("mongoose");
const Collection_1 = require("../models/Collection");
const Documentation_1 = require("../models/Documentation");
const TestCase_1 = require("../models/TestCase");
function objectId(id) {
    return new mongoose_1.Types.ObjectId(id);
}
function normalizeId(value) {
    if (!value)
        return null;
    return String(value);
}
function serializeTestCase(testCase) {
    const obj = testCase.toObject({ virtuals: true });
    return {
        ...obj,
        id: obj.id ?? String(obj._id),
        _id: String(obj._id),
        collectionId: normalizeId(obj.collectionId) ?? undefined,
        createdAt: obj.createdAt.toISOString(),
        updatedAt: obj.updatedAt.toISOString(),
    };
}
async function serializeCollection(collection) {
    const obj = collection.toObject({ virtuals: true });
    const testCases = await TestCase_1.TestCase.find({ collectionId: collection._id }).sort({
        createdAt: 1,
    });
    return {
        ...obj,
        id: obj.id ?? String(obj._id),
        _id: String(obj._id),
        parentId: normalizeId(obj.parentId),
        teamId: normalizeId(obj.teamId) ?? undefined,
        projectId: normalizeId(obj.projectId) ?? undefined,
        assignedUserIds: (obj.assignedUserIds ?? []).map((id) => String(id)),
        testCases: testCases.map(serializeTestCase),
        createdAt: obj.createdAt.toISOString(),
        updatedAt: obj.updatedAt.toISOString(),
    };
}
async function getAllCollections(teamId, projectId) {
    const filter = { teamId, parentId: null };
    if (projectId !== undefined)
        filter.projectId = projectId ? objectId(projectId) : null;
    const collections = await Collection_1.Collection.find(filter).sort({
        createdAt: 1,
    });
    return Promise.all(collections.map(serializeCollection));
}
async function getAssignedCollections(teamId, userId) {
    const collections = await Collection_1.Collection.find({
        teamId,
        parentId: null,
        assignedUserIds: objectId(userId),
    }).sort({
        createdAt: 1,
    });
    return Promise.all(collections.map(serializeCollection));
}
async function getCollectionById(id, teamId) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return undefined;
    const collection = await Collection_1.Collection.findOne({ _id: id, teamId });
    return collection ? serializeCollection(collection) : undefined;
}
async function createCollection(dto, teamId) {
    const collection = await Collection_1.Collection.create({
        name: dto.name.trim(),
        description: dto.description ?? '',
        parentId: dto.parentId ? objectId(dto.parentId) : null,
        teamId: objectId(teamId),
        projectId: dto.projectId ? objectId(dto.projectId) : null,
        assignedUserIds: (dto.assignedUserIds ?? []).map(objectId),
    });
    return serializeCollection(collection);
}
async function updateCollection(id, teamId, dto) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return undefined;
    const collection = await Collection_1.Collection.findOneAndUpdate({ _id: id, teamId }, {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.parentId !== undefined
            ? { parentId: dto.parentId ? objectId(dto.parentId) : null }
            : {}),
        ...(dto.projectId !== undefined
            ? { projectId: dto.projectId ? objectId(dto.projectId) : null }
            : {}),
        ...(dto.assignedUserIds !== undefined
            ? { assignedUserIds: dto.assignedUserIds.map(objectId) }
            : {}),
    }, { new: true });
    return collection ? serializeCollection(collection) : undefined;
}
async function collectDescendantIds(rootId, teamId) {
    const ids = [rootId];
    let frontier = [rootId];
    while (frontier.length > 0) {
        const children = await Collection_1.Collection.find({
            teamId,
            parentId: { $in: frontier.map(objectId) },
        }).select('_id');
        frontier = children.map((child) => String(child._id));
        ids.push(...frontier);
    }
    return ids;
}
async function deleteCollection(id, teamId) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return false;
    const collection = await Collection_1.Collection.findOne({ _id: id, teamId });
    if (!collection)
        return false;
    const ids = await collectDescendantIds(id, teamId);
    await Promise.all([
        Collection_1.Collection.deleteMany({ _id: { $in: ids } }),
        TestCase_1.TestCase.deleteMany({ collectionId: { $in: ids } }),
        Documentation_1.Documentation.deleteMany({ collectionId: { $in: ids } }),
    ]);
    return true;
}
async function getCollectionChildren(id, teamId, projectId) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return [];
    const filter = { teamId, parentId: id };
    if (projectId !== undefined)
        filter.projectId = projectId ? objectId(projectId) : null;
    const children = await Collection_1.Collection.find(filter).sort({
        createdAt: 1,
    });
    return Promise.all(children.map(serializeCollection));
}
async function getCollectionTree(id, teamId, maxDepth = 10) {
    const root = await getCollectionById(id, teamId);
    if (!root)
        return undefined;
    const nodes = new Map([
        [id, { ...root, children: [] }],
    ]);
    let frontier = [id];
    let depth = 0;
    while (frontier.length > 0 && depth < maxDepth) {
        const rootProjectId = root.projectId ?? null;
        const children = await Collection_1.Collection.find({
            teamId,
            projectId: rootProjectId ? objectId(String(rootProjectId)) : null,
            parentId: { $in: frontier.map(objectId) },
        }).sort({ createdAt: 1 });
        const serialized = await Promise.all(children.map(serializeCollection));
        const nextFrontier = [];
        for (const child of serialized) {
            const node = { ...child, children: [] };
            nodes.set(child.id, node);
            if (child.parentId) {
                nodes.get(child.parentId)?.children.push(node);
            }
            nextFrontier.push(child.id);
        }
        frontier = nextFrontier;
        depth += 1;
    }
    return nodes.get(id);
}
async function createTestCase(collectionId, teamId, dto) {
    const collection = await Collection_1.Collection.findOne({ _id: collectionId, teamId });
    if (!collection)
        return undefined;
    const testCase = await TestCase_1.TestCase.create({
        name: dto.name.trim(),
        description: dto.description ?? '',
        collectionId: collection._id,
        request: {
            method: dto.request.method,
            url: dto.request.url,
            headers: dto.request.headers ?? [],
            queryParams: dto.request.queryParams ?? [],
            body: dto.request.body ?? { type: 'none', content: '' },
            timeoutMs: dto.request.timeoutMs ?? 10000,
        },
        expectedResponse: dto.expectedResponse ?? {},
    });
    return serializeTestCase(testCase);
}
async function getTestCaseById(collectionId, testId, teamId) {
    const collection = await Collection_1.Collection.exists({ _id: collectionId, teamId });
    if (!collection || !mongoose_1.Types.ObjectId.isValid(testId))
        return undefined;
    const testCase = await TestCase_1.TestCase.findOne({ _id: testId, collectionId });
    return testCase ? serializeTestCase(testCase) : undefined;
}
async function updateTestCase(collectionId, testId, teamId, dto) {
    const collection = await Collection_1.Collection.exists({ _id: collectionId, teamId });
    if (!collection || !mongoose_1.Types.ObjectId.isValid(testId))
        return undefined;
    const existing = await TestCase_1.TestCase.findOne({ _id: testId, collectionId });
    if (!existing)
        return undefined;
    if (dto.name !== undefined)
        existing.name = dto.name.trim();
    if (dto.description !== undefined)
        existing.description = dto.description;
    if (dto.request)
        existing.request = { ...existing.request, ...dto.request };
    if (dto.expectedResponse) {
        existing.expectedResponse = {
            ...existing.expectedResponse,
            ...dto.expectedResponse,
        };
    }
    await existing.save();
    return serializeTestCase(existing);
}
async function deleteTestCase(collectionId, testId, teamId) {
    const collection = await Collection_1.Collection.exists({ _id: collectionId, teamId });
    if (!collection || !mongoose_1.Types.ObjectId.isValid(testId))
        return false;
    const result = await TestCase_1.TestCase.deleteOne({ _id: testId, collectionId });
    return result.deletedCount === 1;
}
//# sourceMappingURL=mongo.js.map