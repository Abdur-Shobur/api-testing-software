import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { Collection } from '../models/Collection';
import { TestCase } from '../models/TestCase';
import { TestRun } from '../models/TestRun';

export const testCasesRouter = Router();

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

testCasesRouter.get(
	'/:testId/history',
	asyncHandler(async (req, res) => {
		const testCase = await TestCase.findById(req.params.testId);
		if (!testCase) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}
		const collection = await Collection.findOne({
			_id: testCase.collectionId,
			deletedAt: null,
		}).lean<{ projectId?: Types.ObjectId | null }>();
		if (!collection) {
			res.status(404).json({ error: 'Test case not found' });
			return;
		}

		const runs = await TestRun.find({ testCaseId: req.params.testId })
			.sort({ runAt: -1 })
			.limit(20);
		res.json({ data: runs });
	}),
);
