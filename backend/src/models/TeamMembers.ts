import { Document, model, models, Schema, Types } from 'mongoose';

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface ITeamMember extends Document {
	teamId: Types.ObjectId;

	userId: Types.ObjectId;

	role: TeamRole;

	/**
	 * Optional project restriction.
	 * If set, user can only access this project.
	 */
	projectId?: Types.ObjectId | null;

	invitedBy?: Types.ObjectId;

	joinedAt: Date;

	createdAt: Date;
	updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
	{
		teamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			required: true,
		},

		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		role: {
			type: String,
			enum: ['owner', 'admin', 'editor', 'viewer'],
			required: true,
			default: 'viewer',
		},

		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
			default: null,
		},

		invitedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},

		joinedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

TeamMemberSchema.index(
	{
		teamId: 1,
		userId: 1,
	},
	{
		unique: true,
	}
);

TeamMemberSchema.index({
	userId: 1,
});

export const TeamMember =
	models.TeamMember || model<ITeamMember>('TeamMember', TeamMemberSchema);
