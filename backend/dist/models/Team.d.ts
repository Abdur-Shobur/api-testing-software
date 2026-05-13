import { Document, Types } from 'mongoose';
export interface ITeam extends Document {
    name: string;
    slug: string;
    description?: string;
    ownerId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Team: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Team.d.ts.map