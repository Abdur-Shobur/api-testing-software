import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { slugify } from '../lib/slugify';
import { requireTeamRole } from '../middleware/auth';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMembers';
import { getAllCollections } from '../store';

export const teamRouter = Router();

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

// ─── Create team ──────────────────────────────────────────────────────────────
teamRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const { name, description } = req.body ?? {};
		if (!name?.trim()) {
			res.status(400).json({ error: 'name is required' });
			return;
		}

		const team = await Team.create({
			name: name.trim(),
			slug: `${slugify(name)}-${req.user!.userId.slice(-6)}`,
			description: description?.trim() ?? '',
			ownerId: new Types.ObjectId(req.user!.userId),
		});

		await TeamMember.create({
			teamId: team._id,
			userId: new Types.ObjectId(req.user!.userId),
			role: 'owner',
			projectId: null,
		});

		res.status(201).json({ data: team });
	})
);

// ─── List all teams the current user belongs to ──────────────────────────────
teamRouter.get(
	'/',
	asyncHandler(async (req, res) => {
		const userId = new Types.ObjectId(req.user!.userId);

		// Get teams owned by the user
		const teams = await Team.find({
			ownerId: userId,
		}).populate({
			path: 'members',
			populate: {
				path: 'userId',
				select: 'name email',
			},
		});

		res.json({ data: teams });
	})
);

// ─── Get current session team with members ───────────────────────────────────
teamRouter.get(
	'/my',
	asyncHandler(async (req, res) => {
		const team = await Team.findById(req.user!.teamId).lean();
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}

		const members = await TeamMember.find({ teamId: team._id })
			.populate('userId', 'name email status createdAt')
			.populate('projectId', 'name slug')
			.sort({ joinedAt: 1 })
			.lean();

		res.json({ data: { ...team, members } });
	})
);

// ─── Get collections for current team ────────────────────────────────────────
teamRouter.get(
	'/my/collections',
	requireTeamRole('viewer'),
	asyncHandler(async (req, res) => {
		const team = await Team.exists({ _id: req.user!.teamId });
		if (!team) {
			res.status(404).json({ error: 'Team not found for current user' });
			return;
		}

		const member = await TeamMember.exists({
			teamId: req.user!.teamId,
			userId: req.user!.userId,
		});
		if (!member) {
			res.status(403).json({ error: 'Not a member of this team' });
			return;
		}

		const collections = await getAllCollections(req.user!.teamId);
		res.json({ data: collections, total: collections.length });
	})
);

// ─── Get a specific team by ID ───────────────────────────────────────────────
teamRouter.get(
	'/:teamId',
	asyncHandler(async (req, res) => {
		const { teamId } = req.params;

		if (!Types.ObjectId.isValid(teamId)) {
			res.status(400).json({
				error: 'Invalid team ID',
			});
			return;
		}

		const membership = await TeamMember.findOne({
			teamId: new Types.ObjectId(teamId),
			userId: new Types.ObjectId(req.user!.userId),
		}).lean();

		if (!membership) {
			res.status(403).json({
				error: 'You are not a member of this team',
			});
			return;
		}

		const team = await Team.findById(teamId)
			.populate({
				path: 'members',
				populate: [
					{
						path: 'userId',
						select: 'name email status createdAt',
					},
					{
						path: 'projectId',
						select: 'name slug',
					},
				],
				options: {
					sort: { joinedAt: 1 },
				},
			})
			.lean();

		if (!team) {
			res.status(404).json({
				error: 'Team not found',
			});
			return;
		}

		res.json({
			data: team,
		});
	})
);

// ─── Update team ─────────────────────────────────────────────────────────────
teamRouter.patch(
	'/:teamId',
	asyncHandler(async (req, res) => {
		const { teamId } = req.params;
		if (!Types.ObjectId.isValid(teamId)) {
			res.status(400).json({ error: 'Invalid team ID' });
			return;
		}

		const membership = await TeamMember.findOne({
			teamId: new Types.ObjectId(teamId),
			userId: new Types.ObjectId(req.user!.userId),
			role: { $in: ['owner', 'admin'] },
		});
		if (!membership) {
			res
				.status(403)
				.json({ error: 'Only owner or admin can update the team' });
			return;
		}

		const { name, description } = req.body ?? {};
		const updates: Record<string, unknown> = {};
		if (name?.trim()) {
			updates.name = name.trim();
			updates.slug = `${slugify(name)}-${teamId.slice(-6)}`;
		}
		if (description !== undefined) {
			updates.description = description?.trim() ?? '';
		}

		if (Object.keys(updates).length === 0) {
			res.status(400).json({ error: 'Nothing to update' });
			return;
		}

		const team = await Team.findByIdAndUpdate(teamId, updates, {
			new: true,
		}).lean();
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}

		res.json({ data: team });
	})
);

// ─── Delete team ─────────────────────────────────────────────────────────────
teamRouter.delete(
	'/:teamId',
	asyncHandler(async (req, res) => {
		const { teamId } = req.params;
		if (!Types.ObjectId.isValid(teamId)) {
			res.status(400).json({ error: 'Invalid team ID' });
			return;
		}

		const team = await Team.findById(teamId);
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}

		if (String(team.ownerId) !== req.user!.userId) {
			res
				.status(403)
				.json({ error: 'Only the team owner can delete the team' });
			return;
		}

		await TeamMember.deleteMany({ teamId: team._id });
		await team.deleteOne();

		res.json({ message: 'Team deleted successfully' });
	})
);
