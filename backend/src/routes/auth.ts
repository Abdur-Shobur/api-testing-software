import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth, signAuthToken } from '../middleware/auth';
import { slugify } from '../lib/slugify';
import { resolveSessionTeam } from '../lib/sessionTeam';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMembers';
import { User } from '../models/User';

export const authRouter = Router();
const saltRounds = 12;

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

function publicUser(user: {
	_id: unknown;
	name: string;
	email: string;
	role: string;
	createdAt?: Date;
}) {
	return {
		id: String(user._id),
		_id: String(user._id),
		name: user.name,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt,
	};
}

authRouter.post(
	'/register',
	asyncHandler(async (req, res) => {
		const { name, email, password } = req.body ?? {};
		if (!name?.trim() || !email?.trim() || !password) {
			res.status(400).json({ error: 'name, email, and password are required' });
			return;
		}

		const normalizedEmail = String(email).toLowerCase().trim();
		const existing = await User.findOne({ email: normalizedEmail });
		if (existing) {
			res.status(409).json({ error: 'Email is already registered' });
			return;
		}

		const passwordHash = await bcrypt.hash(String(password), saltRounds);
		const user = await User.create({
			name: name.trim(),
			email: normalizedEmail,
			passwordHash,
			role: 'owner',
		});

		const team = await Team.create({
			name: `${name.trim()}'s Team`,
			slug: `${slugify(name)}-${String(user._id).slice(-6)}`,
			ownerId: user._id,
		});

		await TeamMember.create({
			teamId: team._id,
			userId: user._id,
			role: 'owner',
			projectId: null,
		});

		const token = signAuthToken({
			userId: String(user._id),
			email: user.email,
			teamId: String(team._id),
			teamRole: 'owner',
		});

		res.status(201).json({ data: { token, user: publicUser(user) } });
	}),
);

authRouter.post(
	'/login',
	asyncHandler(async (req, res) => {
		const { email, password } = req.body ?? {};
		if (!email?.trim() || !password) {
			res.status(400).json({ error: 'email and password are required' });
			return;
		}

		const user = await User.findOne({
			email: String(email).toLowerCase().trim(),
		});

		if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
			res.status(401).json({ error: 'Invalid email or password' });
			return;
		}
		if (user.status === 'blocked') {
			res.status(403).json({ error: 'Account is blocked' });
			return;
		}

		const session = await resolveSessionTeam(String(user._id));
		if (!session) {
			res.status(403).json({ error: 'User is not a member of any team' });
			return;
		}

		const token = signAuthToken({
			userId: String(user._id),
			email: user.email,
			teamId: session.teamId,
			teamRole: session.teamRole,
		});

		res.json({ data: { token, user: publicUser(user) } });
	}),
);

authRouter.get(
	'/me',
	requireAuth,
	asyncHandler(async (req, res) => {
		const user = await User.findById(req.user!.userId);
		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}
		res.json({ data: publicUser(user) });
	}),
);
