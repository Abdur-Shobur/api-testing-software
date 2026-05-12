import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { requireRole } from '../middleware/auth';
import { ITeamMember, Team } from '../models/Team';
import { User, UserRole } from '../models/User';
import { getAllCollections } from '../store';

export const teamsRouter = Router();

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

teamsRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const { name } = req.body ?? {};
		if (!name?.trim()) {
			res.status(400).json({ error: 'name is required' });
			return;
		}

		const team = await Team.create({
			name: name.trim(),
			slug: `${slugify(name)}-${req.user!.userId.slice(-6)}`,
			ownerId: req.user!.userId,
			members: [{ userId: req.user!.userId, role: 'owner' }],
		});
		await User.findByIdAndUpdate(req.user!.userId, {
			teamId: team._id,
			role: 'owner',
		});
		res.status(201).json({ data: team });
	})
);

teamsRouter.get(
	'/my',
	asyncHandler(async (req, res) => {
		const team = await Team.findById(req.user!.teamId).populate(
			'members.userId',
			'name email role createdAt'
		);
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}
		res.json({ data: team });
	})
);

teamsRouter.get(
	'/my/collections',
	requireRole('member'),
	asyncHandler(async (req, res) => {
		const team = await Team.exists({
			_id: req.user!.teamId,
			'members.userId': req.user!.userId,
		});
		if (!team) {
			res.status(404).json({ error: 'Team not found for current user' });
			return;
		}

		const collections = await getAllCollections(req.user!.teamId);
		res.json({ data: collections, total: collections.length });
	})
);

teamsRouter.post(
	'/invite',
	requireRole('admin'),
	asyncHandler(async (req, res) => {
		const { email, role = 'member' } = req.body ?? {};
		if (!email?.trim() || !['admin', 'member'].includes(role)) {
			res.status(400).json({ error: 'valid email and role are required' });
			return;
		}

		const user = await User.findOne({
			email: String(email).toLowerCase().trim(),
		});
		if (!user) {
			res
				.status(404)
				.json({ error: 'User must register before being invited' });
			return;
		}

		const team = await Team.findById(req.user!.teamId);
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}

		const existing = team.members.find((member: ITeamMember) =>
			member.userId.equals(user._id as Types.ObjectId)
		);
		if (existing) existing.role = role as UserRole;
		else team.members.push({ userId: user._id as Types.ObjectId, role });

		user.teamId = team._id as Types.ObjectId;
		user.role = role as UserRole;
		await Promise.all([team.save(), user.save()]);
		res.status(201).json({ data: team });
	})
);

teamsRouter.patch(
	'/members/:userId',
	requireRole('admin'),
	asyncHandler(async (req, res) => {
		const { role } = req.body ?? {};
		if (!['admin', 'member'].includes(role)) {
			res.status(400).json({ error: 'role must be admin or member' });
			return;
		}

		const team = await Team.findById(req.user!.teamId);
		const member = team?.members.find(
			(item: ITeamMember) => String(item.userId) === req.params.userId
		);
		if (!team || !member) {
			res.status(404).json({ error: 'Member not found' });
			return;
		}
		if (member.role === 'owner') {
			res.status(400).json({ error: 'Owner role cannot be changed here' });
			return;
		}
		member.role = role;
		await Promise.all([
			team.save(),
			User.findByIdAndUpdate(req.params.userId, { role }),
		]);
		res.json({ data: team });
	})
);

teamsRouter.delete(
	'/members/:userId',
	requireRole('admin'),
	asyncHandler(async (req, res) => {
		const team = await Team.findById(req.user!.teamId);
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}
		const before = team.members.length;
		team.members = team.members.filter(
			(member: ITeamMember) =>
				String(member.userId) !== req.params.userId || member.role === 'owner'
		);
		if (team.members.length === before) {
			res
				.status(404)
				.json({ error: 'Member not found or cannot remove owner' });
			return;
		}
		await Promise.all([
			team.save(),
			User.findByIdAndUpdate(req.params.userId, { $unset: { teamId: 1 } }),
		]);
		res.json({ data: team });
	})
);
