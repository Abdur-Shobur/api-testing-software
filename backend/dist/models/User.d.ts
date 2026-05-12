import { Document, Types } from 'mongoose';
export type UserRole = 'owner' | 'admin' | 'member';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    teamId?: Types.ObjectId;
    createdAt: Date;
}
export declare const User: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=User.d.ts.map