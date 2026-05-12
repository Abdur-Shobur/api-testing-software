import { Document, Types } from 'mongoose';
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
export declare const TestRun: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=TestRun.d.ts.map