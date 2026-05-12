import { Document, Types } from 'mongoose';
import { UserRole } from './User';
export interface ITeamMember {
    userId: Types.ObjectId;
    role: UserRole;
}
export interface ITeam extends Document {
    name: string;
    slug: string;
    ownerId: Types.ObjectId;
    members: ITeamMember[];
    createdAt: Date;
}
export declare const Team: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Team.d.ts.map