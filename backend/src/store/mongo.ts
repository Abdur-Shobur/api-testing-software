import { Types } from 'mongoose';
import { Collection as CollectionModel, ICollection } from '../models/Collection';
import { Documentation } from '../models/Documentation';
import { TestCase as TestCaseModel, ITestCase } from '../models/TestCase';
import {
	Collection,
	CollectionTreeNode,
	CreateCollectionDto,
	CreateTestCaseDto,
	TestCase,
	UpdateCollectionDto,
	UpdateTestCaseDto,
} from '../types';

function objectId(id: string): Types.ObjectId {
	return new Types.ObjectId(id);
}

function normalizeId(value: unknown): string | null {
	if (!value) return null;
	return String(value);
}

function serializeTestCase(testCase: ITestCase): TestCase {
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

async function serializeCollection(collection: ICollection): Promise<Collection> {
	const obj = collection.toObject({ virtuals: true });
	const testCases = await TestCaseModel.find({ collectionId: collection._id }).sort({
		createdAt: 1,
	});

	return {
		...obj,
		id: obj.id ?? String(obj._id),
		_id: String(obj._id),
		parentId: normalizeId(obj.parentId),
		teamId: normalizeId(obj.teamId) ?? undefined,
		projectId: normalizeId((obj as any).projectId) ?? undefined,
		assignedUserIds: (obj.assignedUserIds ?? []).map((id: unknown) => String(id)),
		testCases: testCases.map(serializeTestCase),
		createdAt: obj.createdAt.toISOString(),
		updatedAt: obj.updatedAt.toISOString(),
	};
}

export async function getAllCollections(
	teamId: string,
	projectId?: string | null,
): Promise<Collection[]> {
	const filter: Record<string, unknown> = { teamId, parentId: null };
	if (projectId !== undefined) filter.projectId = projectId ? objectId(projectId) : null;
	const collections = await CollectionModel.find(filter).sort({
		createdAt: 1,
	});
	return Promise.all(collections.map(serializeCollection));
}

export async function getAssignedCollections(
	teamId: string,
	userId: string,
): Promise<Collection[]> {
	const collections = await CollectionModel.find({
		teamId,
		parentId: null,
		assignedUserIds: objectId(userId),
	}).sort({
		createdAt: 1,
	});
	return Promise.all(collections.map(serializeCollection));
}

export async function getCollectionById(
	id: string,
	teamId: string,
): Promise<Collection | undefined> {
	if (!Types.ObjectId.isValid(id)) return undefined;
	const collection = await CollectionModel.findOne({ _id: id, teamId });
	return collection ? serializeCollection(collection) : undefined;
}

export async function createCollection(
	dto: CreateCollectionDto & {
		parentId?: string | null;
		assignedUserIds?: string[];
		projectId?: string | null;
	},
	teamId: string,
): Promise<Collection> {
	const collection = await CollectionModel.create({
		name: dto.name.trim(),
		description: dto.description ?? '',
		parentId: dto.parentId ? objectId(dto.parentId) : null,
		teamId: objectId(teamId),
		projectId: dto.projectId ? objectId(dto.projectId) : null,
		assignedUserIds: (dto.assignedUserIds ?? []).map(objectId),
	});
	return serializeCollection(collection);
}

export async function updateCollection(
	id: string,
	teamId: string,
	dto: UpdateCollectionDto & {
		parentId?: string | null;
		assignedUserIds?: string[];
		projectId?: string | null;
	},
): Promise<Collection | undefined> {
	if (!Types.ObjectId.isValid(id)) return undefined;
	const collection = await CollectionModel.findOneAndUpdate(
		{ _id: id, teamId },
		{
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
		},
		{ new: true },
	);
	return collection ? serializeCollection(collection) : undefined;
}

async function collectDescendantIds(rootId: string, teamId: string): Promise<string[]> {
	const ids = [rootId];
	let frontier = [rootId];

	while (frontier.length > 0) {
		const children = await CollectionModel.find({
			teamId,
			parentId: { $in: frontier.map(objectId) },
		}).select('_id');
		frontier = children.map((child) => String(child._id));
		ids.push(...frontier);
	}

	return ids;
}

export async function deleteCollection(id: string, teamId: string): Promise<boolean> {
	if (!Types.ObjectId.isValid(id)) return false;
	const collection = await CollectionModel.findOne({ _id: id, teamId });
	if (!collection) return false;

	const ids = await collectDescendantIds(id, teamId);
	await Promise.all([
		CollectionModel.deleteMany({ _id: { $in: ids } }),
		TestCaseModel.deleteMany({ collectionId: { $in: ids } }),
		Documentation.deleteMany({ collectionId: { $in: ids } }),
	]);
	return true;
}

export async function getCollectionChildren(
	id: string,
	teamId: string,
	projectId?: string | null,
): Promise<Collection[]> {
	if (!Types.ObjectId.isValid(id)) return [];
	const filter: Record<string, unknown> = { teamId, parentId: id };
	if (projectId !== undefined) filter.projectId = projectId ? objectId(projectId) : null;
	const children = await CollectionModel.find(filter).sort({
		createdAt: 1,
	});
	return Promise.all(children.map(serializeCollection));
}

export async function getCollectionTree(
	id: string,
	teamId: string,
	maxDepth = 10,
): Promise<CollectionTreeNode | undefined> {
	const root = await getCollectionById(id, teamId);
	if (!root) return undefined;

	const nodes = new Map<string, CollectionTreeNode>([
		[id, { ...root, children: [] }],
	]);
	let frontier = [id];
	let depth = 0;

	while (frontier.length > 0 && depth < maxDepth) {
		const rootProjectId = (root as any).projectId ?? null;
		const children = await CollectionModel.find({
			teamId,
			projectId: rootProjectId ? objectId(String(rootProjectId)) : null,
			parentId: { $in: frontier.map(objectId) },
		}).sort({ createdAt: 1 });
		const serialized = await Promise.all(children.map(serializeCollection));
		const nextFrontier: string[] = [];

		for (const child of serialized) {
			const node: CollectionTreeNode = { ...child, children: [] };
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

export async function createTestCase(
	collectionId: string,
	teamId: string,
	dto: CreateTestCaseDto,
): Promise<TestCase | undefined> {
	const collection = await CollectionModel.findOne({ _id: collectionId, teamId });
	if (!collection) return undefined;

	const testCase = await TestCaseModel.create({
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

export async function getTestCaseById(
	collectionId: string,
	testId: string,
	teamId: string,
): Promise<TestCase | undefined> {
	const collection = await CollectionModel.exists({ _id: collectionId, teamId });
	if (!collection || !Types.ObjectId.isValid(testId)) return undefined;
	const testCase = await TestCaseModel.findOne({ _id: testId, collectionId });
	return testCase ? serializeTestCase(testCase) : undefined;
}

export async function updateTestCase(
	collectionId: string,
	testId: string,
	teamId: string,
	dto: UpdateTestCaseDto,
): Promise<TestCase | undefined> {
	const collection = await CollectionModel.exists({ _id: collectionId, teamId });
	if (!collection || !Types.ObjectId.isValid(testId)) return undefined;
	const existing = await TestCaseModel.findOne({ _id: testId, collectionId });
	if (!existing) return undefined;

	if (dto.name !== undefined) existing.name = dto.name.trim();
	if (dto.description !== undefined) existing.description = dto.description;
	if (dto.request) existing.request = { ...existing.request, ...dto.request };
	if (dto.expectedResponse) {
		existing.expectedResponse = {
			...existing.expectedResponse,
			...dto.expectedResponse,
		};
	}

	await existing.save();
	return serializeTestCase(existing);
}

export async function deleteTestCase(
	collectionId: string,
	testId: string,
	teamId: string,
): Promise<boolean> {
	const collection = await CollectionModel.exists({ _id: collectionId, teamId });
	if (!collection || !Types.ObjectId.isValid(testId)) return false;
	const result = await TestCaseModel.deleteOne({ _id: testId, collectionId });
	return result.deletedCount === 1;
}
