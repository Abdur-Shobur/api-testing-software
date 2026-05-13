import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { getRestrictedProjectIdForMember } from '../lib/memberProjectScope';
import { EnvironmentVariable } from '../models/EnvironmentVariable';

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
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.role,
		);
		const projectIdRaw = req.query.projectId;
		const projectId =
			projectIdRaw === undefined
				? undefined
				: projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
					? null
					: String(projectIdRaw);
		const filter: Record<string, unknown> = { teamId: req.user!.teamId };
		if (restricted) {
			filter.$or = [
				{ projectId: null },
				{ projectId: new Types.ObjectId(restricted) },
			];
		} else if (projectId !== undefined) {
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
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.role,
		);
		let bodyPid: string | null | undefined;
		if (projectId === undefined) bodyPid = undefined;
		else if (!projectId) bodyPid = null;
		else bodyPid = String(projectId);
		if (restricted && bodyPid && bodyPid !== restricted) {
			res.status(403).json({ error: 'Cannot set env vars for this project' });
			return;
		}
		const effectivePid = restricted
			? bodyPid === undefined
				? restricted
				: bodyPid
			: bodyPid === undefined
				? null
				: bodyPid;
		const envVar = await EnvironmentVariable.findOneAndUpdate(
			{
				teamId: req.user!.teamId,
				projectId: effectivePid ? new Types.ObjectId(effectivePid) : null,
				key: key.trim(),
			},
			{
				value,
				projectId: effectivePid ? new Types.ObjectId(effectivePid) : null,
			},
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		);
		res.json({ data: envVar });
	}),
);

envVarsRouter.delete(
	'/:key',
	asyncHandler(async (req, res) => {
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.role,
		);
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
		let deleteProjectId: Types.ObjectId | null | undefined;
		if (restricted) {
			if (
				projectId !== undefined &&
				projectId !== null &&
				String(projectId) !== restricted
			) {
				res.status(403).json({ error: 'Cannot delete env vars for this project' });
				return;
			}
			deleteProjectId =
				projectId === undefined
					? new Types.ObjectId(restricted)
					: projectId === null
						? null
						: new Types.ObjectId(String(projectId));
		} else {
			deleteProjectId =
				projectId === undefined
					? undefined
					: projectId === null
						? null
						: new Types.ObjectId(String(projectId));
		}
		await EnvironmentVariable.deleteOne({
			teamId: req.user!.teamId,
			...(deleteProjectId !== undefined
				? { projectId: deleteProjectId }
				: {}),
			key: req.params.key,
		});
		res.json({ data: { deleted: true } });
	}),
);
