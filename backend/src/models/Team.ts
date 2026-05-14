import { Document, model, models, Schema, Types } from 'mongoose';

export interface ITeam extends Document {
	name: string;
	slug: string;

	description?: string;

	ownerId: Types.ObjectId;

	createdAt: Date;
	updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		slug: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},

		description: {
			type: String,
			default: '',
			trim: true,
		},

		ownerId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,

		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

TeamSchema.index({ ownerId: 1 });
TeamSchema.virtual('members', {
	ref: 'TeamMember',
	localField: '_id',
	foreignField: 'teamId',
});

export const Team = models.Team || model<ITeam>('Team', TeamSchema);
