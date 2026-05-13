import { NextFunction, Request, Response } from 'express';
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
export declare function signAuthToken(payload: AuthUser): string;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireTeamRole(minRole: TeamRole): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map