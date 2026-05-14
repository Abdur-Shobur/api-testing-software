import { Document, Types } from 'mongoose';
export interface ITeamInvite extends Document {
    teamId: Types.ObjectId;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    projectId?: Types.ObjectId | null;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    invitedBy: Types.ObjectId;
    expiresAt: Date;
    acceptedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TeamInvite: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=TeamInvite.d.ts.map