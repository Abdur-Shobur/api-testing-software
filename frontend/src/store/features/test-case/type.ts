import {
	AssertionStatus,
	KeyValuePair,
	Method,
	RunResult,
	Status,
} from '@/type';

export interface TestCase {
	id: string;
	name: string;
	method: Method;
	url: string;
	expectedStatus: number;
	bodyMode: 'contains' | 'exact' | 'none';
	bodyContent: string;
	lastResult?: RunResult;
}

export interface TestCaseResult {
	testCaseId: string;
	testCaseName: string;
	status: Status;
	durationMs: number;
	request: { method: string; url: string };
	actual: {
		status: number;
		headers: Record<string, string>;
		body: unknown;
	} | null;
	assertions: AssertionResult[];
	error?: string;
}

export interface AssertionResult {
	field: string;
	status: AssertionStatus;
	expected: unknown;
	actual: unknown;
	message: string;
}

export interface AssertionResult {
	field: string;
	status: AssertionStatus;
	expected: unknown;
	actual: unknown;
	message: string;
}

export type iTestCase = {
	id: string;
	name: string;
	description: string;

	request: {
		method: Method;
		url: string;
		headers: KeyValuePair[];
		queryParams: KeyValuePair[];
		body: {
			type: 'none' | 'json' | 'form' | 'text';
			content: string;
		};
		timeoutMs: number;
	};
	expectedResponse: {
		status: number;
		headers: KeyValuePair[];
		body: {
			mode: string;
			content: string;
		};
	};

	createdAt: string;
	updatedAt: string;
};
