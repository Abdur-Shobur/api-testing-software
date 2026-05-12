import { Document, Types } from 'mongoose';
export interface ICollection extends Document {
    name: string;
    description?: string;
    parentId: Types.ObjectId | null;
    teamId: Types.ObjectId;
    projectId: Types.ObjectId | null;
    assignedUserIds: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Collection: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Collection.d.ts.map