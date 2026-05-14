import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { requireTeamRole } from '../middleware/auth';
import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { TeamMember, type TeamRole } from '../models/TeamMembers';

export const teamMemberRouter = Router();

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

// ─── List members of a team ──────────────────────────────────────────────────
teamMemberRouter.get(
	'/:teamId',
	asyncHandler(async (req, res) => {
		const { teamId } = req.params;
		if (!Types.ObjectId.isValid(teamId)) {
			res.status(400).json({ error: 'Invalid team ID' });
			return;
		}

		const teamOid = new Types.ObjectId(teamId);
		const isMember = await TeamMember.exists({
			teamId: teamOid,
			userId: new Types.ObjectId(req.user!.userId),
		});
		if (!isMember) {
			res.status(403).json({ error: 'You are not a member of this team' });
			return;
		}

		const members = await TeamMember.find({ teamId: teamOid })
			.populate('userId', 'name email status createdAt')
			.populate('projectId', 'name slug')
			.sort({ joinedAt: 1 })
			.lean();

		res.json({ data: members, total: members.length });
	})
);

// ─── Get shared projects for current user ────────────────────────────────────
teamMemberRouter.get(
	'/shared-projects/me',
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

		res.json({ data: projects, total: projects.length });
	})
);

// ─── Update member role ──────────────────────────────────────────────────────
teamMemberRouter.patch(
	'/:teamId/:userId',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { teamId, userId } = req.params;
		if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(userId)) {
			res.status(400).json({ error: 'Invalid team or user ID' });
			return;
		}

		const { role, projectId } = req.body ?? {};
		const allowed: TeamRole[] = ['admin', 'editor', 'viewer'];
		if (!allowed.includes(role)) {
			res.status(400).json({ error: 'role must be admin, editor, or viewer' });
			return;
		}

		const teamOid = new Types.ObjectId(teamId);
		const member = await TeamMember.findOne({
			teamId: teamOid,
			userId: new Types.ObjectId(userId),
		});
		if (!member) {
			res.status(404).json({ error: 'Member not found' });
			return;
		}
		if (member.role === 'owner') {
			res.status(400).json({ error: 'Owner role cannot be changed' });
			return;
		}

		member.role = role as TeamRole;
		if (role === 'admin') {
			member.projectId = null;
		} else if (projectId && Types.ObjectId.isValid(String(projectId))) {
			const project = await Project.findOne({
				_id: new Types.ObjectId(String(projectId)),
				teamId: teamOid,
			});
			if (project) {
				member.projectId = project._id as Types.ObjectId;
			}
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

// ─── Remove member from team ─────────────────────────────────────────────────
teamMemberRouter.delete(
	'/:teamId/:userId',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { teamId, userId } = req.params;
		if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(userId)) {
			res.status(400).json({ error: 'Invalid team or user ID' });
			return;
		}

		const teamOid = new Types.ObjectId(teamId);
		const member = await TeamMember.findOne({
			teamId: teamOid,
			userId: new Types.ObjectId(userId),
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

// ─── Leave a team ────────────────────────────────────────────────────────────
teamMemberRouter.post(
	'/:teamId/leave',
	asyncHandler(async (req, res) => {
		const { teamId } = req.params;
		if (!Types.ObjectId.isValid(teamId)) {
			res.status(400).json({ error: 'Invalid team ID' });
			return;
		}

		const teamOid = new Types.ObjectId(teamId);
		const member = await TeamMember.findOne({
			teamId: teamOid,
			userId: new Types.ObjectId(req.user!.userId),
		});
		if (!member) {
			res.status(404).json({ error: 'You are not a member of this team' });
			return;
		}
		if (member.role === 'owner') {
			res.status(400).json({
				error: 'Owner cannot leave the team. Transfer ownership first.',
			});
			return;
		}

		await member.deleteOne();
		res.json({ message: 'You have left the team' });
	})
);
