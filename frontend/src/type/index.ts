// ─── Types ───────────────────────────────────────────────────────────────────

import { Dispatch, SetStateAction } from 'react';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type Status = 'pass' | 'fail' | 'pending';
export type iState<T> = Dispatch<SetStateAction<T>>;
export type AssertionStatus = 'pass' | 'fail' | 'skip';

export interface KeyValuePair {
	key: string;
	value: string;
	enabled: boolean;
}
export interface RunResult {
	status: Status;
	durationMs: number;
	httpStatus: number;
	responseBody: string;
	assertions: Assertion[];
}

export interface Assertion {
	name: string;
	description: string;
	passed: boolean;
}

export type DetailTab = 'body' | 'headers' | 'assertions';
