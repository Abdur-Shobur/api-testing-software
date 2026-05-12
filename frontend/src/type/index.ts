// ─── Types ───────────────────────────────────────────────────────────────────

import { Dispatch, SetStateAction } from 'react';
export const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export type Method = (typeof METHODS)[number];
export type Status = 'pass' | 'fail' | 'pending' | 'error';
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

export type DetailTab = 'body' | 'headers' | 'assertions' | 'history';

export interface Documentation {
	id: string;
	_id: string;
	collectionId: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface EnvVar {
	id: string;
	_id: string;
	key: string;
	value: string;
	teamId: string;
}

export interface TeamMemberUser {
	id: string;
	_id: string;
	name: string;
	email: string;
	role: 'owner' | 'admin' | 'member';
}

export interface Team {
	id: string;
	_id: string;
	name: string;
	slug: string;
	ownerId: string;
	members: { userId: TeamMemberUser; role: 'owner' | 'admin' | 'member' }[];
}
