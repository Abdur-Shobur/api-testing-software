import { Document, Types } from 'mongoose';
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';
export interface ITeamMember extends Document {
    teamId: Types.ObjectId;
    userId: Types.ObjectId;
    role: TeamRole;
    /**
     * Optional project restriction.
     * If set, user can only access this project.
     */
    projectId?: Types.ObjectId | null;
    invitedBy?: Types.ObjectId;
    joinedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TeamMember: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=TeamMembers.d.ts.map