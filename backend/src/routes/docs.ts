import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { getRestrictedProjectIdForMember } from '../lib/memberProjectScope';
import { Collection } from '../models/Collection';
import { Documentation } from '../models/Documentation';

export const docsRouter = Router({ mergeParams: true });

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

async function assertCollection(req: Request, res: Response): Promise<boolean> {
	const col = await Collection.findOne({
		_id: req.params.collectionId,
		teamId: req.user!.teamId,
	}).lean<{ projectId?: Types.ObjectId | null }>();
	if (!col) {
		res.status(404).json({ error: 'Collection not found' });
		return false;
	}
	const restricted = await getRestrictedProjectIdForMember(
		req.user!.userId,
		req.user!.teamId,
		req.user!.role,
	);
	const cp = col.projectId ? String(col.projectId) : null;
	if (restricted && cp !== restricted) {
		res.status(404).json({ error: 'Collection not found' });
		return false;
	}
	return true;
}

docsRouter.get(
	'/',
	asyncHandler(async (req, res) => {
		if (!(await assertCollection(req, res))) return;
		const docs = await Documentation.findOne({
			collectionId: req.params.collectionId,
		});
		res.json({ data: docs });
	}),
);

docsRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		if (!(await assertCollection(req, res))) return;
		const { title = 'Documentation', content = '' } = req.body ?? {};
		const docs = await Documentation.findOneAndUpdate(
			{ collectionId: req.params.collectionId },
			{ title, content },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		);
		res.json({ data: docs });
	}),
);

docsRouter.delete(
	'/',
	asyncHandler(async (req, res) => {
		if (!(await assertCollection(req, res))) return;
		await Documentation.deleteOne({ collectionId: req.params.collectionId });
		res.json({ data: { deleted: true } });
	}),
);
