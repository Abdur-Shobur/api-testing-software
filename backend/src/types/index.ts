// ─── HTTP ────────────────────────────────────────────────────────────────────

export type HttpMethod =
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'HEAD'
	| 'OPTIONS';

export interface KeyValuePair {
	key: string;
	value: string;
	enabled: boolean;
}

// ─── Request ─────────────────────────────────────────────────────────────────

export interface TestRequest {
	method: HttpMethod;
	url: string;
	headers: KeyValuePair[];
	queryParams: KeyValuePair[];
	body?: {
		type: 'none' | 'json' | 'form' | 'text';
		content: string; // raw string (JSON stringified, form-encoded, or plain text)
	};
	timeoutMs?: number; // default 10000
}

// ─── Expected Response ───────────────────────────────────────────────────────

export type BodyMatchMode =
	| 'exact' // full deep-equal
	| 'contains' // actual must contain all keys from expected
	| 'schema' // keys + types must match, values ignored
	| 'ignore'; // skip body comparison

export interface ExpectedResponse {
	status?: number;
	headers?: KeyValuePair[]; // only enabled entries are checked
	body?: {
		mode: BodyMatchMode;
		content: string; // raw string
	};
}

// ─── Assertion Result ────────────────────────────────────────────────────────

export type AssertionStatus = 'pass' | 'fail' | 'skip';

export interface AssertionResult {
	field: string; // e.g. "status", "headers.content-type", "body.user.id"
	status: AssertionStatus;
	expected: unknown;
	actual: unknown;
	message: string;
}

// ─── Test Case ───────────────────────────────────────────────────────────────

export interface TestCase {
	id: string;
	_id?: string;
	name: string;
	description?: string;
	collectionId?: string;
	request: TestRequest;
	expectedResponse: ExpectedResponse;
	createdAt: string; // ISO
	updatedAt: string; // ISO
}

// ─── Collection / Suite ──────────────────────────────────────────────────────

export interface Collection {
	id: string;
	_id?: string;
	name: string;
	description?: string;
	parentId?: string | null;
	teamId?: string;
	assignedUserIds?: string[];
	testCases: TestCase[];
	createdAt: string;
	updatedAt: string;
}

export interface CollectionTreeNode extends Collection {
	children: CollectionTreeNode[];
}

// ─── Run Results ─────────────────────────────────────────────────────────────

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
	error?: string; // network / timeout error message
}

export interface CollectionRunResult {
	collectionId: string;
	collectionName: string;
	runAt: string; // ISO
	totalTests: number;
	passed: number;
	failed: number;
	errored: number;
	durationMs: number;
	results: TestCaseResult[];
}

// ─── API Payloads ────────────────────────────────────────────────────────────

export type CreateCollectionDto = Pick<Collection, 'name' | 'description'>;
export type UpdateCollectionDto = Partial<
	Pick<Collection, 'name' | 'description'>
>;

export type CreateTestCaseDto = Omit<
	TestCase,
	'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateTestCaseDto = Partial<CreateTestCaseDto>;

export interface RunTestCaseDto {
	/** Override the saved request (optional – useful for ad-hoc runs) */
	request?: Partial<TestRequest>;
}

export interface RunCollectionDto {
	mode?: 'sequential' | 'parallel';
	stopOnFail?: boolean;
}
