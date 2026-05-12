import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserRole } from '../models/User';

export interface AuthUser {
	userId: string;
	email: string;
	teamId: string;
	role?: UserRole;
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

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	const header = req.headers.authorization;
	if (!header?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Authentication required' });
		return;
	}

	try {
		const token = header.slice('Bearer '.length);
		const payload = jwt.verify(token, getJwtSecret()) as AuthUser;
		if (
			!payload.userId ||
			!payload.email ||
			!payload.teamId ||
			!Types.ObjectId.isValid(payload.userId) ||
			!Types.ObjectId.isValid(payload.teamId)
		) {
			res.status(401).json({ error: 'Invalid token' });
			return;
		}
		req.user = payload;
		next();
	} catch {
		res.status(401).json({ error: 'Invalid or expired token' });
	}
}

const roleRank: Record<UserRole, number> = {
	member: 1,
	admin: 2,
	owner: 3,
};

export function requireRole(role: UserRole) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const userRole = req.user?.role;
		if (!userRole || roleRank[userRole] < roleRank[role]) {
			res.status(403).json({ error: 'Insufficient permissions' });
			return;
		}
		next();
	};
}
