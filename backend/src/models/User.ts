import { Document, model, models, Schema } from 'mongoose';

export type UserRole = 'owner' | 'admin' | 'member';
export type UserStatus = 'active' | 'blocked';

export interface IUser extends Document {
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	createdAt: Date;
	status: UserStatus;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		passwordHash: { type: String, required: true },
		role: {
			type: String,
			enum: ['owner', 'admin', 'member'],
			default: 'member',
		},
		status: {
			type: String,
			enum: ['active', 'blocked'],
			default: 'active',
		},
		createdAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

export const User = models.User || model<IUser>('User', UserSchema);
