import { Document, Schema, model, models, Types } from 'mongoose';

export interface IEnvironmentVariable extends Document {
	key: string;
	value: string;
	teamId: Types.ObjectId;
	projectId?: Types.ObjectId | null;
}

const EnvironmentVariableSchema = new Schema<IEnvironmentVariable>(
	{
		key: { type: String, required: true, trim: true },
		value: { type: String, default: '' },
		teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true,   },
		projectId: { type: Schema.Types.ObjectId, ref: 'Project', default: null,  },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

EnvironmentVariableSchema.index({ teamId: 1, projectId: 1, key: 1 }, { unique: true });

export const EnvironmentVariable =
	models.EnvironmentVariable ||
	model<IEnvironmentVariable>('EnvironmentVariable', EnvironmentVariableSchema);
