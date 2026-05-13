import { Document, model, models, Schema, Types } from 'mongoose';
import { CollectionRunResult } from '../types';

export interface ICollectionRun extends Document {
	collectionId: Types.ObjectId;
	teamId: Types.ObjectId;
	runBy: Types.ObjectId;
	summary: CollectionRunResult;
	runAt: Date;
}

const CollectionRunSchema = new Schema<ICollectionRun>(
	{
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: 'Collection',
			required: true,
			index: true,
		},
		teamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			required: true,
			index: true,
		},
		runBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		summary: { type: Schema.Types.Mixed, required: true },
		runAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

export const CollectionRun =
	models.CollectionRun ||
	model<ICollectionRun>('CollectionRun', CollectionRunSchema);
