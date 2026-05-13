import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import type { TeamRole } from '../models/TeamMembers';

export interface AuthUser {
	userId: string;
	email: string;
	teamId: string;
	teamRole: TeamRole;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}

function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('JWT_SECRET is not configured');
	}
	return secret;
}

export function signAuthToken(payload: AuthUser): string {
	return jwt.sign(payload, getJwtSecret(), {
		expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
	});
}

const teamRoleRank: Record<TeamRole, number> = {
	viewer: 1,
	editor: 2,
	admin: 3,
	owner: 4,
};

/** Accept legacy JWT payloads that used User.role "member" as team viewer. */
function normalizeTeamRole(raw: unknown): TeamRole | undefined {
	if (raw === 'member') return 'viewer';
	if (raw === 'viewer' || raw === 'editor' || raw === 'admin' || raw === 'owner') {
		return raw;
	}
	return undefined;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	const header = req.headers.authorization;
	if (!header?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Authentication required' });
		return;
	}

	try {
		const token = header.slice('Bearer '.length);
		const payload = jwt.verify(token, getJwtSecret()) as AuthUser & { role?: unknown };
		const teamRole = payload.teamRole ?? normalizeTeamRole(payload.role);
		if (
			!payload.userId ||
			!payload.email ||
			!payload.teamId ||
			!teamRole ||
			!Types.ObjectId.isValid(payload.userId) ||
			!Types.ObjectId.isValid(payload.teamId)
		) {
			res.status(401).json({ error: 'Invalid token' });
			return;
		}
		req.user = {
			userId: payload.userId,
			email: payload.email,
			teamId: payload.teamId,
			teamRole,
		};
		next();
	} catch {
		res.status(401).json({ error: 'Invalid or expired token' });
	}
}

export function requireTeamRole(minRole: TeamRole) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const userRole = req.user?.teamRole;
		if (!userRole || teamRoleRank[userRole] < teamRoleRank[minRole]) {
			res.status(403).json({ error: 'Insufficient permissions' });
			return;
		}
		next();
	};
}
