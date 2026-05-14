import { Document, model, models, Schema } from 'mongoose';

export interface IProjectSettings extends Document {
	baseUrl: string;
	authorization: Record<string, unknown>;
}

const ProjectSettingsSchema = new Schema<IProjectSettings>(
	{
		baseUrl: {
			type: String,
			default: '',
		},
		authorization: {
			type: Schema.Types.Mixed,
			default: null,
		},
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
