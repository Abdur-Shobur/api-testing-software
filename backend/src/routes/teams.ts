import { NextFunction, Request, Response, Router } from 'express';
import mongoose, { Types } from 'mongoose';
import { requireRole } from '../middleware/auth';
import { Project } from '../models/Project';
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
	'/shared-projects',
	asyncHandler(async (req, res) => {
		const userId = req.user!.userId;

		const teams = await Team.find({
			'members.userId': new mongoose.Types.ObjectId(userId),
			'members.role': { $in: ['member', 'admin'] },
		}).populate('members.projectId', 'name');

		if (!teams || teams.length === 0) {
			res.status(404).json({ error: 'Teams not found' });
			return;
		}

		// extract projects only
		const projects = teams.flatMap((team) =>
			team.members
				.filter(
					(member) => member.projectId && member.userId.toString() === userId
				)
				.map((member) => member.projectId)
		);

		res.json({
			data: projects,
			total: projects.length,
		});
	})
);

teamsRouter.get(
	'/my',
	asyncHandler(async (req, res) => {
		const team = await Team.findById(req.user!.teamId)
			.populate('members.userId', 'name email role createdAt')
			.populate('members.projectId', 'name');
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
		const { email, role = 'member', projectId } = req.body ?? {};
		if (!email?.trim() || !['admin', 'member'].includes(role)) {
			res.status(400).json({ error: 'valid email and role are required' });
			return;
		}
		if (!projectId || !Types.ObjectId.isValid(String(projectId))) {
			res.status(400).json({ error: 'valid projectId is required' });
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

		const project = await Project.findOne({
			_id: new Types.ObjectId(String(projectId)),
			teamId: team._id,
		});
		if (!project) {
			res.status(404).json({ error: 'Project not found for this team' });
			return;
		}

		const projectOid = project._id as Types.ObjectId;
		const existing = team.members.find((member: ITeamMember) =>
			member.userId.equals(user._id as Types.ObjectId)
		);
		if (existing) {
			existing.role = role as UserRole;
			existing.projectId = projectOid;
		} else {
			team.members.push({
				userId: user._id as Types.ObjectId,
				role: role as UserRole,
				projectId: projectOid,
			});
		}

		await team.save();
		const populated = await Team.findById(team._id)
			.populate('members.userId', 'name email role createdAt')
			.populate('members.projectId', 'name');
		res.status(201).json({ data: populated });
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
		if (role === 'owner' || role === 'admin') {
			member.projectId = null;
		}
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
