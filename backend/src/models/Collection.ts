import { Document, Schema, model, models, Types } from 'mongoose';

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

const CollectionSchema = new Schema<ICollection>(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, default: '' },
		parentId: { type: Schema.Types.ObjectId, ref: 'Collection', default: null },
		teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
		projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
		assignedUserIds: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

CollectionSchema.index({ teamId: 1, parentId: 1 });
CollectionSchema.index({ teamId: 1, projectId: 1, parentId: 1 });
CollectionSchema.index({ teamId: 1, assignedUserIds: 1 });

export const Collection =
	models.Collection || model<ICollection>('Collection', CollectionSchema);
