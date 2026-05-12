import { NextFunction, Request, Response, Router } from 'express';
import { CollectionRun } from '../models/CollectionRun';
import {
	createCollection,
	createTestCase,
	deleteCollection,
	deleteTestCase,
	getCollectionChildren,
	getCollectionById,
	getCollectionTree,
	getAllCollections,
	getTestCaseById,
	updateCollection,
	updateTestCase,
} from '../store';
import {
	CreateCollectionDto,
	CreateTestCaseDto,
	UpdateCollectionDto,
	UpdateTestCaseDto,
} from '../types';

export const collectionsRouter = Router();

// ─── Helper ──────────────────────────────────────────────────────────────────

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════

// GET /collections
collectionsRouter.get(
	'/',
	asyncHandler(async (req, res) => {
		const projectIdRaw = req.query.projectId;
		const projectId =
			projectIdRaw === undefined
				? undefined
				: projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
					? null
					: String(projectIdRaw);
		const collections = await getAllCollections(req.user!.teamId, projectId);
		res.json({ data: collections, total: collections.length });
	}),
);

// POST /collections
collectionsRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const dto = req.body as CreateCollectionDto;
		if (!dto.name?.trim()) {
			res.status(400).json({ error: 'name is required' });
			return;
		}
		const collection = await createCollection(
			{
				...dto,
				parentId: req.body.parentId ?? null,
				projectId: req.body.projectId ?? null,
				assignedUserIds: req.body.assignedUserIds ?? [],
			},
			req.user!.teamId,
		);
		res.status(201).json({ data: collection, success: true });
	}),
);

// GET /collections/:collectionId/children
collectionsRouter.get(
	'/:collectionId/children',
	asyncHandler(async (req, res) => {
		const projectIdRaw = req.query.projectId;
		const projectId =
			projectIdRaw === undefined
				? undefined
				: projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
					? null
					: String(projectIdRaw);
		const children = await getCollectionChildren(
			req.params.collectionId,
			req.user!.teamId,
			projectId,
		);
		res.json({ data: children, total: children.length });
	}),
);

// GET /collections/:collectionId/tree
collectionsRouter.get(
	'/:collectionId/tree',
	asyncHandler(async (req, res) => {
		const tree = await getCollectionTree(req.params.collectionId, req.user!.teamId);
		if (!tree) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		res.json({ data: tree });
	}),
);

// GET /collections/:collectionId/runs
collectionsRouter.get(
	'/:collectionId/runs',
	asyncHandler(async (req, res) => {
		const col = await getCollectionById(
			req.params.collectionId,
			req.user!.teamId,
		);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		const runs = await CollectionRun.find({
			collectionId: req.params.collectionId,
			teamId: req.user!.teamId,
		})
			.sort({ runAt: -1 })
			.limit(10);
		res.json({ data: runs });
	}),
);

// GET /collections/:collectionId
collectionsRouter.get(
	'/:collectionId',
	asyncHandler(async (req, res) => {
		const col = await getCollectionById(
			req.params.collectionId,
			req.user!.teamId,
		);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		res.json({ data: col });
	}),
);

// PATCH /collections/:collectionId
collectionsRouter.patch(
	'/:collectionId',
	asyncHandler(async (req, res) => {
		const dto = req.body as UpdateCollectionDto & {
			parentId?: string | null;
			assignedUserIds?: string[];
			projectId?: string | null;
		};
		const updated = await updateCollection(
			req.params.collectionId,
			req.user!.teamId,
			dto,
		);
		if (!updated) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		res.json({ data: updated, success: true });
	}),
);

// DELETE /collections/:collectionId
collectionsRouter.delete(
	'/:collectionId',
	asyncHandler(async (req, res) => {
		const deleted = await deleteCollection(
			req.params.collectionId,
			req.user!.teamId,
		);
		if (!deleted) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		res
			.status(200)
			.json({ message: 'Delete Success', success: true, status: 200 });
	}),
);

// ═══════════════════════════════════════════════════════════════════════════
// TEST CASES  (nested under a collection)
// ═══════════════════════════════════════════════════════════════════════════

// GET /collections/:collectionId/tests
collectionsRouter.get(
	'/:collectionId/tests',
	asyncHandler(async (req, res) => {
		const col = await getCollectionById(
			req.params.collectionId,
			req.user!.teamId,
		);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		res.json({ data: col.testCases, total: col.testCases.length });
	}),
);

// POST /collections/:collectionId/tests
collectionsRouter.post(
	'/:collectionId/tests',
	asyncHandler(async (req, res) => {
		const dto = req.body as CreateTestCaseDto;
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

		const testCase = await createTestCase(
			req.params.collectionId,
			req.user!.teamId,
			dto,
		);
		if (!testCase) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		res.status(201).json({ data: testCase });
	}),
);

// GET /collections/:collectionId/tests/:testId
collectionsRouter.get(
	'/:collectionId/tests/:testId',
	asyncHandler(async (req, res) => {
		const tc = await getTestCaseById(
			req.params.collectionId,
			req.params.testId,
			req.user!.teamId,
		);
		if (!tc) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}
		res.json({ data: tc });
	}),
);

// PATCH /collections/:collectionId/tests/:testId
collectionsRouter.patch(
	'/:collectionId/tests/:testId',
	asyncHandler(async (req, res) => {
		const dto = req.body as UpdateTestCaseDto;
		const updated = await updateTestCase(
			req.params.collectionId,
			req.params.testId,
			req.user!.teamId,
			dto,
		);
		if (!updated) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}
		res.json({ data: updated, success: true });
	}),
);

// DELETE /collections/:collectionId/tests/:testId
collectionsRouter.delete(
	'/:collectionId/tests/:testId',
	asyncHandler(async (req, res) => {
		const deleted = await deleteTestCase(
			req.params.collectionId,
			req.params.testId,
			req.user!.teamId,
		);
		if (!deleted) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}
		res
			.status(200)
			.json({ message: 'Delete Success', success: true, status: 200 });
	}),
);
