import { Document, model, models, Schema, Types } from 'mongoose';
import { UserRole } from './User';

export interface ITeamMember {
	userId: Types.ObjectId;
	role: UserRole;
	/** When set (invitees with role member), API access is limited to this project. */
	projectId?: Types.ObjectId | null;
}

export interface ITeam extends Document {
	name: string;
	slug: string;
	ownerId: Types.ObjectId;
	members: ITeamMember[];
	createdAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		role: {
			type: String,
			enum: ['owner', 'admin', 'member'],
			required: true,
		},
		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
			default: null,
		},
	},
	{ _id: false }
);

const TeamSchema = new Schema<ITeam>(
	{
		name: { type: String, required: true, trim: true },
		slug: { type: String, required: true, unique: true, lowercase: true },
		ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		members: { type: [TeamMemberSchema], default: [] },
		createdAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

export const Team = models.Team || model<ITeam>('Team', TeamSchema);
