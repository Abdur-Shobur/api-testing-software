import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { slugify } from '../lib/slugify';
import { requireTeamRole } from '../middleware/auth';
import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { TeamMember, type TeamRole } from '../models/TeamMembers';
import { User } from '../models/User';
import { getAllCollections } from '../store';

export const teamsRouter = Router();

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

teamsRouter.post(
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

teamsRouter.get(
	'/shared-projects',
	asyncHandler(async (req, res) => {
		const userId = req.user!.userId;

		const memberships = await TeamMember.find({
			userId: new Types.ObjectId(userId),
			projectId: { $ne: null },
			role: { $in: ['editor', 'viewer'] },
		}).populate('projectId', 'name slug teamId');

		const projects = memberships
			.map((m) => m.projectId)
			.filter(
				(p): p is NonNullable<typeof p> => p != null && typeof p === 'object'
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

		res.json({
			data: {
				...team,
				members,
			},
		});
	})
);

teamsRouter.get(
	'/my/collections',
	requireTeamRole('viewer'),
	asyncHandler(async (req, res) => {
		const team = await Team.exists({
			_id: req.user!.teamId,
		});
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

teamsRouter.post(
	'/invite',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { email, role = 'viewer', projectId, teamId } = req.body ?? {};
		if (!teamId || !Types.ObjectId.isValid(String(teamId))) {
			res.status(400).json({ error: 'valid teamId is required' });
			return;
		}
		const allowed: TeamRole[] = ['admin', 'editor', 'viewer'];
		if (!email?.trim() || !allowed.includes(role)) {
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

		const teamOid = new Types.ObjectId(teamId);
		const project = await Project.findOne({
			_id: new Types.ObjectId(String(projectId)),
			teamId: teamOid,
		});
		if (!project) {
			res.status(404).json({ error: 'Project not found for this team' });
			return;
		}

		const projectOid = project._id as Types.ObjectId;
		const userOid = user._id as Types.ObjectId;

		await TeamMember.findOneAndUpdate(
			{ teamId: teamOid, userId: userOid },
			{
				teamId: teamOid,
				userId: userOid,
				role: role as TeamRole,
				projectId: role === 'admin' || role === 'owner' ? null : projectOid,
				invitedBy: new Types.ObjectId(req.user!.userId),
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		const populated = await TeamMember.find({ teamId: teamOid })
			.populate('userId', 'name email status createdAt')
			.populate('projectId', 'name slug')
			.sort({ joinedAt: 1 })
			.lean();

		res.status(201).json({ data: populated });
	})
);

teamsRouter.patch(
	'/members/:userId',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { role } = req.body ?? {};
		const allowed: TeamRole[] = ['admin', 'editor', 'viewer'];
		if (!allowed.includes(role)) {
			res.status(400).json({ error: 'role must be admin, editor, or viewer' });
			return;
		}

		const teamOid = new Types.ObjectId(req.user!.teamId);
		const member = await TeamMember.findOne({
			teamId: teamOid,
			userId: new Types.ObjectId(req.params.userId),
		});
		if (!member) {
			res.status(404).json({ error: 'Member not found' });
			return;
		}
		if (member.role === 'owner') {
			res.status(400).json({ error: 'Owner role cannot be changed here' });
			return;
		}
		member.role = role as TeamRole;
		if (role === 'admin') {
			member.projectId = null;
		}
		await member.save();

		const team = await Team.findById(teamOid).lean();
		const members = await TeamMember.find({ teamId: teamOid })
			.populate('userId', 'name email status createdAt')
			.populate('projectId', 'name slug')
			.sort({ joinedAt: 1 })
			.lean();

		res.json({ data: { ...team, members } });
	})
);

teamsRouter.delete(
	'/members/:userId',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const teamOid = new Types.ObjectId(req.user!.teamId);
		const member = await TeamMember.findOne({
			teamId: teamOid,
			userId: new Types.ObjectId(req.params.userId),
		});
		if (!member) {
			res.status(404).json({ error: 'Member not found' });
			return;
		}
		if (member.role === 'owner') {
			res.status(400).json({ error: 'Cannot remove team owner' });
			return;
		}
		await member.deleteOne();

		const team = await Team.findById(teamOid).lean();
		const members = await TeamMember.find({ teamId: teamOid })
			.populate('userId', 'name email status createdAt')
			.populate('projectId', 'name slug')
			.sort({ joinedAt: 1 })
			.lean();

		res.json({ data: { ...team, members } });
	})
);
