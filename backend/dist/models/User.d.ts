import { Document } from 'mongoose';
export type UserRole = 'owner' | 'admin' | 'member';
export type UserStatus = 'active' | 'blocked';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    status: UserStatus;
}
export declare const User: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=User.d.ts.map