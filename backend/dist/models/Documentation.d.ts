import { Document, Types } from 'mongoose';
export interface IDocumentation extends Document {
    collectionId: Types.ObjectId;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Documentation: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Documentation.d.ts.map