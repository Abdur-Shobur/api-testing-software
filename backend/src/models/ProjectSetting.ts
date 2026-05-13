import { Document, model, models, Schema } from 'mongoose';

export interface IProjectSettings extends Document {
	baseUrl: string;
	auth: Record<string, unknown>;
}

const ProjectSettingsSchema = new Schema<IProjectSettings>(
	{
		baseUrl: { type: String, default: '' },
		auth: { type: Schema.Types.Mixed, default: {} },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const ProjectSettings =
	models.ProjectSettings ||
	model<IProjectSettings>('ProjectSettings', ProjectSettingsSchema);
