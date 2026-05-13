export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export interface KeyValuePair {
    key: string;
    value: string;
    enabled: boolean;
}
export interface TestRequest {
    method: HttpMethod;
    url: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    body?: {
        type: 'none' | 'json' | 'form' | 'text';
        content: string;
    };
    timeoutMs?: number;
}
export type BodyMatchMode = 'exact' | 'contains' | 'schema' | 'ignore';
export interface ExpectedResponse {
    status?: number;
    headers?: KeyValuePair[];
    body?: {
        mode: BodyMatchMode;
        content: string;
    };
}
export type AssertionStatus = 'pass' | 'fail' | 'skip';
export interface AssertionResult {
    field: string;
    status: AssertionStatus;
    expected: unknown;
    actual: unknown;
    message: string;
}
export interface TestCase {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    collectionId?: string;
    request: TestRequest;
    expectedResponse: ExpectedResponse;
    createdAt: string;
    updatedAt: string;
}
export interface Collection {
    id: string;
    _id?: string;
    name: string;
    description?: string;
    parentId?: string | null;
    teamId?: string;
    projectId?: string | null;
    assignedUserIds?: string[];
    testCases: TestCase[];
    createdAt: string;
    updatedAt: string;
}
export interface CollectionTreeNode extends Collection {
    children: CollectionTreeNode[];
}
export type RunStatus = 'pass' | 'fail' | 'error';
export interface TestCaseResult {
    testCaseId: string;
    testCaseName: string;
    status: RunStatus;
    durationMs: number;
    request: {
        method: string;
        url: string;
    };
    actual: {
        status: number;
        headers: Record<string, string>;
        body: unknown;
    } | null;
    assertions: AssertionResult[];
    error?: string;
}
export interface CollectionRunResult {
    collectionId: string;
    collectionName: string;
    runAt: string;
    totalTests: number;
    passed: number;
    failed: number;
    errored: number;
    durationMs: number;
    results: TestCaseResult[];
}
export type CreateCollectionDto = Pick<Collection, 'name' | 'description'>;
export type UpdateCollectionDto = Partial<Pick<Collection, 'name' | 'description'>>;
export type CreateTestCaseDto = Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTestCaseDto = Partial<CreateTestCaseDto>;
export interface RunTestCaseDto {
    /** Override the saved request (optional – useful for ad-hoc runs) */
    request?: Partial<TestRequest>;
}
export interface RunCollectionDto {
    mode?: 'sequential' | 'parallel';
    stopOnFail?: boolean;
}
//# sourceMappingURL=index.d.ts.map