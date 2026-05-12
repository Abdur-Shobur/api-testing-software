import { NextFunction, Request, Response, Router } from 'express';
import { EnvironmentVariable } from '../models/EnvironmentVariable';
import { Types } from 'mongoose';

export const envVarsRouter = Router();

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

envVarsRouter.get(
	'/',
	asyncHandler(async (req, res) => {
		const projectIdRaw = req.query.projectId;
		const projectId =
			projectIdRaw === undefined
				? undefined
				: projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
					? null
					: String(projectIdRaw);
		const filter: Record<string, unknown> = { teamId: req.user!.teamId };
		if (projectId !== undefined) {
			filter.projectId = projectId ? new Types.ObjectId(projectId) : null;
		}
		const vars = await EnvironmentVariable.find(filter).sort({
			key: 1,
		});
		res.json({ data: vars, total: vars.length });
	}),
);

envVarsRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const { key, value = '', projectId } = req.body ?? {};
		if (!key?.trim()) {
			res.status(400).json({ error: 'key is required' });
			return;
		}
		if (projectId && !Types.ObjectId.isValid(String(projectId))) {
			res.status(400).json({ error: 'invalid projectId' });
			return;
		}
		const envVar = await EnvironmentVariable.findOneAndUpdate(
			{
				teamId: req.user!.teamId,
				projectId: projectId ? new Types.ObjectId(String(projectId)) : null,
				key: key.trim(),
			},
			{ value, projectId: projectId ? new Types.ObjectId(String(projectId)) : null },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		);
		res.json({ data: envVar });
	}),
);

envVarsRouter.delete(
	'/:key',
	asyncHandler(async (req, res) => {
		const projectIdRaw = req.query.projectId;
		const projectId =
			projectIdRaw === undefined
				? undefined
				: projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
					? null
					: String(projectIdRaw);
		if (projectId && !Types.ObjectId.isValid(projectId)) {
			res.status(400).json({ error: 'invalid projectId' });
			return;
		}
		await EnvironmentVariable.deleteOne({
			teamId: req.user!.teamId,
			...(projectId !== undefined
				? { projectId: projectId ? new Types.ObjectId(projectId) : null }
				: {}),
			key: req.params.key,
		});
		res.json({ data: { deleted: true } });
	}),
);
