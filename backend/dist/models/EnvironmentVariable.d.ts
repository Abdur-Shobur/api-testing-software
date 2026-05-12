import { Document, Types } from 'mongoose';
export interface IEnvironmentVariable extends Document {
    key: string;
    value: string;
    teamId: Types.ObjectId;
    projectId?: Types.ObjectId | null;
}
export declare const EnvironmentVariable: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=EnvironmentVariable.d.ts.map