import { Document, Types } from 'mongoose';
export type ProjectAuthType = 'none' | 'bearer' | 'basic' | 'apiKey';
export interface IProjectAuthSettings {
    type: ProjectAuthType;
    bearerToken?: string;
    username?: string;
    password?: string;
    apiKeyKey?: string;
    apiKeyValue?: string;
    apiKeyIn?: 'header' | 'query';
}
export interface IProject extends Document {
    name: string;
    description?: string;
    teamId: Types.ObjectId;
    baseUrl?: string;
    auth?: IProjectAuthSettings;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Project: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Project.d.ts.map