import { Document, model, models, Schema, Types } from 'mongoose';

export interface ITeamInvite extends Document {
	teamId: Types.ObjectId;

	email: string;

	role: 'admin' | 'editor' | 'viewer';

	projectId?: Types.ObjectId | null;

	status: 'pending' | 'accepted' | 'expired' | 'cancelled';

	invitedBy: Types.ObjectId;

	expiresAt: Date;

	acceptedAt?: Date | null;

	createdAt: Date;
	updatedAt: Date;
}

const TeamInviteSchema = new Schema<ITeamInvite>(
	{
		teamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			required: true,
		},

		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},

		role: {
			type: String,
			enum: ['admin', 'editor', 'viewer'],
			default: 'viewer',
		},

		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
			default: null,
		},

		status: {
			type: String,
			enum: ['pending', 'accepted', 'expired', 'cancelled'],
			default: 'pending',
		},

		invitedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		expiresAt: {
			type: Date,
			required: true,
		},

		acceptedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

TeamInviteSchema.index({
	email: 1,
	teamId: 1,
});

export const TeamInvite =
	models.TeamInvite || model<ITeamInvite>('TeamInvite', TeamInviteSchema);
