import { Document, Schema, model, models, Types } from 'mongoose';
import { ExpectedResponse, TestRequest } from '../types';

export interface ITestCase extends Document {
	name: string;
	description?: string;
	collectionId: Types.ObjectId;
	request: TestRequest;
	expectedResponse: ExpectedResponse;
	createdAt: Date;
	updatedAt: Date;
}

const KeyValuePairSchema = new Schema(
	{
		key: { type: String, required: true },
		value: { type: String, default: '' },
		enabled: { type: Boolean, default: true },
	},
	{ _id: false },
);

const TestCaseSchema = new Schema<ITestCase>(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, default: '' },
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: 'Collection',
			required: true,
			index: true,
		},
		request: {
			method: { type: String, required: true },
			url: { type: String, required: true },
			headers: { type: [KeyValuePairSchema], default: [] },
			queryParams: { type: [KeyValuePairSchema], default: [] },
			body: {
				type: {
					type: String,
					enum: ['none', 'json', 'form', 'text'],
					default: 'none',
				},
				content: { type: String, default: '' },
			},
			timeoutMs: { type: Number, default: 10000 },
		},
		expectedResponse: {
			status: Number,
			headers: { type: [KeyValuePairSchema], default: [] },
			body: {
				mode: {
					type: String,
					enum: ['exact', 'contains', 'schema', 'ignore'],
					default: 'ignore',
				},
				content: { type: String, default: '' },
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const TestCase =
	models.TestCase || model<ITestCase>('TestCase', TestCaseSchema);
