import { NextFunction, Request, Response, Router } from 'express';
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
		const collection = await Collection.exists({
			_id: testCase.collectionId,
			teamId: req.user!.teamId,
		});
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
