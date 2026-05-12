import { Document, Schema, model, models, Types } from 'mongoose';
import { AssertionResult, RunStatus } from '../types';

export interface ITestRun extends Document {
	testCaseId: Types.ObjectId;
	collectionId: Types.ObjectId;
	status: RunStatus;
	durationMs: number;
	assertions: AssertionResult[];
	actual: unknown;
	runBy: Types.ObjectId;
	runAt: Date;
}

const TestRunSchema = new Schema<ITestRun>(
	{
		testCaseId: { type: Schema.Types.ObjectId, ref: 'TestCase', required: true, index: true },
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: 'Collection',
			required: true,
			index: true,
		},
		status: { type: String, enum: ['pass', 'fail', 'error'], required: true },
		durationMs: { type: Number, required: true },
		assertions: { type: [Schema.Types.Mixed as unknown as object], default: [] },
		actual: { type: Schema.Types.Mixed, default: null },
		runBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		runAt: { type: Date, default: Date.now },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const TestRun = models.TestRun || model<ITestRun>('TestRun', TestRunSchema);
