import { Document, Schema, model, models, Types } from 'mongoose';

export type ProjectAuthType = 'none' | 'bearer' | 'basic' | 'apiKey';

export interface IProjectAuthSettings {
	type: ProjectAuthType;
	// bearer
	bearerToken?: string;
	// basic
	username?: string;
	password?: string;
	// apiKey
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

const ProjectAuthSchema = new Schema<IProjectAuthSettings>(
	{
		type: { type: String, enum: ['none', 'bearer', 'basic', 'apiKey'], default: 'none' },
		bearerToken: { type: String, default: '' },
		username: { type: String, default: '' },
		password: { type: String, default: '' },
		apiKeyKey: { type: String, default: '' },
		apiKeyValue: { type: String, default: '' },
		apiKeyIn: { type: String, enum: ['header', 'query'], default: 'header' },
	},
	{ _id: false },
);

const ProjectSchema = new Schema<IProject>(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, default: '' },
		teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
		baseUrl: { type: String, default: '' },
		auth: { type: ProjectAuthSchema, default: { type: 'none' } },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

ProjectSchema.index({ teamId: 1, name: 1 });

export const Project = models.Project || model<IProject>('Project', ProjectSchema);

