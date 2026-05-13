import { Document, Types } from 'mongoose';
import './ProjectSetting';
export type ProjectVisibility = 'private' | 'team' | 'public';
export interface IProject extends Document {
    teamId: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    visibility: ProjectVisibility;
    createdBy: Types.ObjectId;
    settings?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Project: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Project.d.ts.map