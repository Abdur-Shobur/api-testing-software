import { NextFunction, Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
	deleteCollection,
	getAllCollections,
	getCollectionById,
	saveCollection,
} from '../store';
import {
	Collection,
	CreateCollectionDto,
	CreateTestCaseDto,
	TestCase,
	UpdateCollectionDto,
	UpdateTestCaseDto,
} from '../types';

export const collectionsRouter = Router();

const now = () => new Date().toISOString();

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
	asyncHandler(async (_req, res) => {
		const collections = await getAllCollections();
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
		const collection: Collection = {
			id: uuidv4(),
			name: dto.name.trim(),
			description: dto.description ?? '',
			testCases: [],
			createdAt: now(),
			updatedAt: now(),
		};
		await saveCollection(collection);
		res.status(201).json({ data: collection, success: true });
	}),
);

// GET /collections/:collectionId
collectionsRouter.get(
	'/:collectionId',
	asyncHandler(async (req, res) => {
		const col = await getCollectionById(req.params.collectionId);
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
		const col = await getCollectionById(req.params.collectionId);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		const dto = req.body as UpdateCollectionDto;
		const updated: Collection = {
			...col,
			name: dto.name?.trim() ?? col.name,
			description: dto.description ?? col.description,
			updatedAt: now(),
		};
		await saveCollection(updated);
		res.json({ data: updated, success: true });
	}),
);

// DELETE /collections/:collectionId
collectionsRouter.delete(
	'/:collectionId',
	asyncHandler(async (req, res) => {
		const deleted = await deleteCollection(req.params.collectionId);
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
		const col = await getCollectionById(req.params.collectionId);
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
		const col = await getCollectionById(req.params.collectionId);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}

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

		const testCase: TestCase = {
			id: uuidv4(),
			name: dto.name.trim(),
			description: dto.description ?? '',
			request: {
				method: dto.request.method,
				url: dto.request.url,
				headers: dto.request.headers ?? [],
				queryParams: dto.request.queryParams ?? [],
				body: dto.request.body,
				timeoutMs: dto.request.timeoutMs ?? 10000,
			},
			expectedResponse: dto.expectedResponse ?? {},
			createdAt: now(),
			updatedAt: now(),
		};

		col.testCases.push(testCase);
		col.updatedAt = now();
		await saveCollection(col);
		res.status(201).json({ data: testCase });
	}),
);

// GET /collections/:collectionId/tests/:testId
collectionsRouter.get(
	'/:collectionId/tests/:testId',
	asyncHandler(async (req, res) => {
		const col = await getCollectionById(req.params.collectionId);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		const tc = col.testCases.find((t) => t.id === req.params.testId);
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
		const col = await getCollectionById(req.params.collectionId);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		const idx = col.testCases.findIndex((t) => t.id === req.params.testId);
		if (idx === -1) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}

		const dto = req.body as UpdateTestCaseDto;
		const existing = col.testCases[idx];
		const updated: TestCase = {
			...existing,
			name: dto.name?.trim() ?? existing.name,
			description: dto.description ?? existing.description,
			request: dto.request
				? { ...existing.request, ...dto.request }
				: existing.request,
			expectedResponse: dto.expectedResponse
				? { ...existing.expectedResponse, ...dto.expectedResponse }
				: existing.expectedResponse,
			updatedAt: now(),
		};
		col.testCases[idx] = updated;
		col.updatedAt = now();
		await saveCollection(col);
		res.json({ data: updated, success: true });
	}),
);

// DELETE /collections/:collectionId/tests/:testId
collectionsRouter.delete(
	'/:collectionId/tests/:testId',
	asyncHandler(async (req, res) => {
		const col = await getCollectionById(req.params.collectionId);
		if (!col) {
			res.status(404).json({ error: 'Collection not found' });
			return;
		}
		const before = col.testCases.length;
		col.testCases = col.testCases.filter((t) => t.id !== req.params.testId);
		if (col.testCases.length === before) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}
		col.updatedAt = now();
		await saveCollection(col);
		res
			.status(200)
			.json({ message: 'Delete Success', success: true, status: 200 });
	}),
);
