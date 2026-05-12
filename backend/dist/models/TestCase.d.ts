import { Document, Types } from 'mongoose';
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
export declare const TestCase: import("mongoose").Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=TestCase.d.ts.map