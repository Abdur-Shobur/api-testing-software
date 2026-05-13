import { Document } from 'mongoose';
export interface IProjectSettings extends Document {
    baseUrl: string;
    auth: Record<string, unknown>;
}
export declare const ProjectSettings: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=ProjectSetting.d.ts.map