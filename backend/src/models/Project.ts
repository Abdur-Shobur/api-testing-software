import { Document, model, models, Schema, Types } from 'mongoose';
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

const ProjectSchema = new Schema<IProject>(
	{
		teamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			required: true,
		},

		name: {
			type: String,
			required: true,
			trim: true,
		},

		slug: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},

		description: {
			type: String,
			default: '',
		},

		icon: {
			type: String,
			default: '',
		},

		color: {
			type: String,
			default: '#6366f1',
		},

		visibility: {
			type: String,
			enum: ['private', 'team', 'public'],
			default: 'private',
		},

		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		settings: {
			type: Schema.Types.ObjectId,
			ref: 'ProjectSettings',
			default: undefined,
		},
	},
	{
		timestamps: true,

		toJSON: {
			virtuals: true,
		},

		toObject: {
			virtuals: true,
		},
	},
);

ProjectSchema.index(
	{
		teamId: 1,
		slug: 1,
	},
	{
		unique: true,
	},
);

ProjectSchema.index({
	createdBy: 1,
});

export const Project =
	models.Project || model<IProject>('Project', ProjectSchema);
