import { NextFunction, Request, Response } from 'express';
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
export declare function signAuthToken(payload: AuthUser): string;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireRole(role: UserRole): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map