import { Document, model, models, Schema, Types } from 'mongoose';

export interface ICollection extends Document {

	projectId: Types.ObjectId;

	/**
	 * Parent collection
	 * null = root collection
	 */
	parentId: Types.ObjectId | null;

	name: string;

	slug: string;

	description?: string;

	/**
	 * UI icon
	 */
	icon?: string;

	/**
	 * Sidebar color
	 */
	color?: string;

	/**
	 * Sidebar ordering
	 */
	sortOrder: number;

	/**
	 * Depth level
	 * root = 0
	 */
	level: number;

	/**
	 * Full tree path
	 * Example:
	 * /auth/admin/login
	 */
	path: string;

	/**
	 * Restrict access
	 */
	assignedUserIds: Types.ObjectId[];

	/**
	 * Collection variables
	 */
	variables: {
		key: string;
		value: string;
		secret?: boolean;
	}[];

	/**
	 * Folder settings
	 */
	settings: {
		collapsedByDefault: boolean;

		inheritVariables: boolean;

		inheritAuth: boolean;
	};

	createdBy: Types.ObjectId;

	archived: boolean;

	deletedAt?: Date | null;

	createdAt: Date;
	updatedAt: Date;
}

const CollectionVariableSchema = new Schema(
	{
		key: {
			type: String,
			required: true,
			trim: true,
		},

		value: {
			type: String,
			default: '',
		},

		secret: {
			type: Boolean,
			default: false,
		},
	},
	{
		_id: false,
	}
);

const CollectionSchema = new Schema<ICollection>(
	{
		projectId: {
			type: Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
		},

		parentId: {
			type: Schema.Types.ObjectId,
			ref: 'Collection',
			default: null,
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

		sortOrder: {
			type: Number,
			default: 0,
		},

		level: {
			type: Number,
			default: 0,
		},

		path: {
			type: String,
			default: '/',
		},

		assignedUserIds: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],

		variables: {
			type: [CollectionVariableSchema],
			default: [],
		},

		settings: {
			collapsedByDefault: {
				type: Boolean,
				default: false,
			},

			inheritVariables: {
				type: Boolean,
				default: true,
			},

			inheritAuth: {
				type: Boolean,
				default: true,
			},
		},

		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},

		archived: {
			type: Boolean,
			default: false,
		},

		deletedAt: {
			type: Date,
			default: null,
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
	}
);

CollectionSchema.index({
	projectId: 1,
	parentId: 1,
	sortOrder: 1,
});

CollectionSchema.index({
	projectId: 1,
	path: 1,
});

CollectionSchema.index({
	assignedUserIds: 1,
});

CollectionSchema.index({
	createdBy: 1,
});

CollectionSchema.index({
	archived: 1,
});

CollectionSchema.index({
	deletedAt: 1,
});

CollectionSchema.index(
	{
		projectId: 1,
		slug: 1,
		parentId: 1,
	},
	{
		unique: true,
	}
);

export const Collection =
	models.Collection || model<ICollection>('Collection', CollectionSchema);
