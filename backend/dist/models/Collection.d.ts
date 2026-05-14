import { Document, Types } from 'mongoose';
export interface ICollection extends Document {
    projectId: Types.ObjectId;
    /**
     * Parent collection
     * null = root collection
     */
    parentId: Types.ObjectId | null;
    name: string;
    slug: string;
    description?: string;
    /**
     * UI icon
     */
    icon?: string;
    /**
     * Sidebar color
     */
    color?: string;
    /**
     * Sidebar ordering
     */
    sortOrder: number;
    /**
     * Depth level
     * root = 0
     */
    level: number;
    /**
     * Full tree path
     * Example:
     * /auth/admin/login
     */
    path: string;
    /**
     * Restrict access
     */
    assignedUserIds: Types.ObjectId[];
    /**
     * Collection variables
     */
    variables: {
        key: string;
        value: string;
        secret?: boolean;
    }[];
    /**
     * Folder settings
     */
    settings: {
        collapsedByDefault: boolean;
        inheritVariables: boolean;
        inheritAuth: boolean;
    };
    createdBy: Types.ObjectId;
    archived: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Collection: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Collection.d.ts.map