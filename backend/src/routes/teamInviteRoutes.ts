import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { requireTeamRole } from '../middleware/auth';
import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { TeamInvite } from '../models/TeamInvite';
import { TeamMember, type TeamRole } from '../models/TeamMembers';
import { User } from '../models/User';

export const teamInviteRouter = Router();

const INVITE_EXPIRY_DAYS = 7;

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

function getExpiryDate(): Date {
	const date = new Date();
	date.setDate(date.getDate() + INVITE_EXPIRY_DAYS);
	return date;
}

// ─── Send invitation ─────────────────────────────────────────────────────────
teamInviteRouter.post(
	'/',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { email, role = 'viewer', projectId, teamId } = req.body ?? {};

		if (!teamId || !Types.ObjectId.isValid(String(teamId))) {
			res.status(400).json({ error: 'Valid teamId is required' });
			return;
		}

		const allowed: TeamRole[] = ['admin', 'editor', 'viewer'];
		if (!email?.trim() || !allowed.includes(role)) {
			res.status(400).json({ error: 'Valid email and role are required' });
			return;
		}

		const normalizedEmail = String(email).toLowerCase().trim();
		const teamOid = new Types.ObjectId(String(teamId));

		const team = await Team.findById(teamOid);
		if (!team) {
			res.status(404).json({ error: 'Team not found' });
			return;
		}

		if (normalizedEmail === req.user!.email) {
			res.status(400).json({ error: 'You cannot invite yourself' });
			return;
		}

		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) {
			const alreadyMember = await TeamMember.findOne({
				teamId: teamOid,
				userId: existingUser._id,
			});
			if (alreadyMember) {
				res.status(409).json({ error: 'User is already a member of this team' });
				return;
			}
		}

		const existingInvite = await TeamInvite.findOne({
			teamId: teamOid,
			email: normalizedEmail,
			status: 'pending',
		});
		if (existingInvite) {
			res.status(409).json({
				error: 'A pending invite already exists for this email',
				data: existingInvite,
			});
			return;
		}

		let projectOid: Types.ObjectId | null = null;
		if (
			projectId &&
			Types.ObjectId.isValid(String(projectId)) &&
			role !== 'admin'
		) {
			const project = await Project.findOne({
				_id: new Types.ObjectId(String(projectId)),
				teamId: teamOid,
			});
			if (!project) {
				res.status(404).json({ error: 'Project not found for this team' });
				return;
			}
			projectOid = project._id as Types.ObjectId;
		}

		const invite = await TeamInvite.create({
			teamId: teamOid,
			email: normalizedEmail,
			role,
			projectId: projectOid,
			status: 'pending',
			invitedBy: new Types.ObjectId(req.user!.userId),
			expiresAt: getExpiryDate(),
		});

		const populated = await TeamInvite.findById(invite._id)
			.populate('teamId', 'name slug')
			.populate('invitedBy', 'name email')
			.populate('projectId', 'name slug')
			.lean();

		res.status(201).json({ data: populated });
	})
);

// ─── List invites for a team (admin view) ────────────────────────────────────
teamInviteRouter.get(
	'/team/:teamId',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { teamId } = req.params;
		if (!Types.ObjectId.isValid(teamId)) {
			res.status(400).json({ error: 'Invalid team ID' });
			return;
		}

		const { status } = req.query;
		const filter: Record<string, unknown> = {
			teamId: new Types.ObjectId(teamId),
		};
		if (
			status &&
			['pending', 'accepted', 'expired', 'cancelled'].includes(
				String(status)
			)
		) {
			filter.status = status;
		}

		const invites = await TeamInvite.find(filter)
			.populate('invitedBy', 'name email')
			.populate('projectId', 'name slug')
			.sort({ createdAt: -1 })
			.lean();

		// Auto-expire overdue pending invites
		const now = new Date();
		for (const invite of invites) {
			if (invite.status === 'pending' && invite.expiresAt < now) {
				await TeamInvite.findByIdAndUpdate(invite._id, {
					status: 'expired',
				});
				invite.status = 'expired';
			}
		}

		res.json({ data: invites, total: invites.length });
	})
);

// ─── List invites received by current user ───────────────────────────────────
teamInviteRouter.get(
	'/my',
	asyncHandler(async (req, res) => {
		const now = new Date();

		await TeamInvite.updateMany(
			{ email: req.user!.email, status: 'pending', expiresAt: { $lt: now } },
			{ status: 'expired' }
		);

		const invites = await TeamInvite.find({
			email: req.user!.email,
		})
			.populate('teamId', 'name slug')
			.populate('invitedBy', 'name email')
			.populate('projectId', 'name slug')
			.sort({ createdAt: -1 })
			.lean();

		res.json({ data: invites, total: invites.length });
	})
);

// ─── Accept invitation ───────────────────────────────────────────────────────
teamInviteRouter.post(
	'/:inviteId/accept',
	asyncHandler(async (req, res) => {
		const { inviteId } = req.params;
		if (!Types.ObjectId.isValid(inviteId)) {
			res.status(400).json({ error: 'Invalid invite ID' });
			return;
		}

		const invite = await TeamInvite.findById(inviteId);
		if (!invite) {
			res.status(404).json({ error: 'Invite not found' });
			return;
		}

		if (invite.email !== req.user!.email) {
			res.status(403).json({ error: 'This invite is not for you' });
			return;
		}

		if (invite.status !== 'pending') {
			res.status(400).json({ error: `Invite is already ${invite.status}` });
			return;
		}

		if (invite.expiresAt < new Date()) {
			invite.status = 'expired';
			await invite.save();
			res.status(400).json({ error: 'Invite has expired' });
			return;
		}

		const alreadyMember = await TeamMember.findOne({
			teamId: invite.teamId,
			userId: new Types.ObjectId(req.user!.userId),
		});
		if (alreadyMember) {
			invite.status = 'accepted';
			invite.acceptedAt = new Date();
			await invite.save();
			res.status(409).json({ error: 'You are already a member of this team' });
			return;
		}

		await TeamMember.create({
			teamId: invite.teamId,
			userId: new Types.ObjectId(req.user!.userId),
			role: invite.role as TeamRole,
			projectId:
				invite.role === 'admin' ? null : (invite.projectId ?? null),
			invitedBy: invite.invitedBy,
		});

		invite.status = 'accepted';
		invite.acceptedAt = new Date();
		await invite.save();

		const team = await Team.findById(invite.teamId)
			.select('name slug')
			.lean();

		res.json({
			message: 'Invite accepted successfully',
			data: { team, role: invite.role },
		});
	})
);

// ─── Decline invitation ──────────────────────────────────────────────────────
teamInviteRouter.post(
	'/:inviteId/decline',
	asyncHandler(async (req, res) => {
		const { inviteId } = req.params;
		if (!Types.ObjectId.isValid(inviteId)) {
			res.status(400).json({ error: 'Invalid invite ID' });
			return;
		}

		const invite = await TeamInvite.findById(inviteId);
		if (!invite) {
			res.status(404).json({ error: 'Invite not found' });
			return;
		}

		if (invite.email !== req.user!.email) {
			res.status(403).json({ error: 'This invite is not for you' });
			return;
		}

		if (invite.status !== 'pending') {
			res.status(400).json({ error: `Invite is already ${invite.status}` });
			return;
		}

		invite.status = 'cancelled';
		await invite.save();

		res.json({ message: 'Invite declined' });
	})
);

// ─── Cancel invitation (by team admin/owner) ─────────────────────────────────
teamInviteRouter.post(
	'/:inviteId/cancel',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { inviteId } = req.params;
		if (!Types.ObjectId.isValid(inviteId)) {
			res.status(400).json({ error: 'Invalid invite ID' });
			return;
		}

		const invite = await TeamInvite.findById(inviteId);
		if (!invite) {
			res.status(404).json({ error: 'Invite not found' });
			return;
		}

		if (String(invite.teamId) !== req.user!.teamId) {
			res
				.status(403)
				.json({ error: 'You can only cancel invites for your team' });
			return;
		}

		if (invite.status !== 'pending') {
			res.status(400).json({ error: `Invite is already ${invite.status}` });
			return;
		}

		invite.status = 'cancelled';
		await invite.save();

		res.json({ message: 'Invite cancelled' });
	})
);

// ─── Resend invitation (reset expiry) ────────────────────────────────────────
teamInviteRouter.post(
	'/:inviteId/resend',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { inviteId } = req.params;
		if (!Types.ObjectId.isValid(inviteId)) {
			res.status(400).json({ error: 'Invalid invite ID' });
			return;
		}

		const invite = await TeamInvite.findById(inviteId);
		if (!invite) {
			res.status(404).json({ error: 'Invite not found' });
			return;
		}

		if (String(invite.teamId) !== req.user!.teamId) {
			res
				.status(403)
				.json({ error: 'You can only resend invites for your team' });
			return;
		}

		if (invite.status === 'accepted') {
			res.status(400).json({ error: 'Invite was already accepted' });
			return;
		}

		invite.status = 'pending';
		invite.expiresAt = getExpiryDate();
		await invite.save();

		const populated = await TeamInvite.findById(invite._id)
			.populate('teamId', 'name slug')
			.populate('invitedBy', 'name email')
			.populate('projectId', 'name slug')
			.lean();

		res.json({ message: 'Invite resent', data: populated });
	})
);

// ─── Get a single invite by ID ───────────────────────────────────────────────
teamInviteRouter.get(
	'/:inviteId',
	asyncHandler(async (req, res) => {
		const { inviteId } = req.params;
		if (!Types.ObjectId.isValid(inviteId)) {
			res.status(400).json({ error: 'Invalid invite ID' });
			return;
		}

		const invite = await TeamInvite.findById(inviteId)
			.populate('teamId', 'name slug')
			.populate('invitedBy', 'name email')
			.populate('projectId', 'name slug')
			.lean();

		if (!invite) {
			res.status(404).json({ error: 'Invite not found' });
			return;
		}

		const isRecipient = invite.email === req.user!.email;
		const isTeamMember = await TeamMember.exists({
			teamId: invite.teamId,
			userId: new Types.ObjectId(req.user!.userId),
		});
		if (!isRecipient && !isTeamMember) {
			res.status(403).json({ error: 'Access denied' });
			return;
		}

		res.json({ data: invite });
	})
);

// ─── Delete invite permanently ───────────────────────────────────────────────
teamInviteRouter.delete(
	'/:inviteId',
	requireTeamRole('admin'),
	asyncHandler(async (req, res) => {
		const { inviteId } = req.params;
		if (!Types.ObjectId.isValid(inviteId)) {
			res.status(400).json({ error: 'Invalid invite ID' });
			return;
		}

		const invite = await TeamInvite.findById(inviteId);
		if (!invite) {
			res.status(404).json({ error: 'Invite not found' });
			return;
		}

		if (String(invite.teamId) !== req.user!.teamId) {
			res
				.status(403)
				.json({ error: 'You can only delete invites for your team' });
			return;
		}

		await invite.deleteOne();

		res.json({ message: 'Invite deleted' });
	})
);
