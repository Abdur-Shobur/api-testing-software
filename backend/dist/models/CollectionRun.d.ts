import { Document, Types } from 'mongoose';
import { CollectionRunResult } from '../types';
export interface ICollectionRun extends Document {
    collectionId: Types.ObjectId;
    teamId: Types.ObjectId;
    runBy: Types.ObjectId;
    summary: CollectionRunResult;
    runAt: Date;
}
export declare const CollectionRun: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=CollectionRun.d.ts.map