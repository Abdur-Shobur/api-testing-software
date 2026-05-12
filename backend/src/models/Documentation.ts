import { Document, Schema, model, models, Types } from 'mongoose';

export interface IDocumentation extends Document {
	collectionId: Types.ObjectId;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

const DocumentationSchema = new Schema<IDocumentation>(
	{
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: 'Collection',
			required: true,
			unique: true,
			index: true,
		},
		title: { type: String, required: true, trim: true },
		content: { type: String, default: '' },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const Documentation =
	models.Documentation ||
	model<IDocumentation>('Documentation', DocumentationSchema);
