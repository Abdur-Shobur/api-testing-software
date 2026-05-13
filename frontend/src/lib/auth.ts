'use client';

import axios from 'axios';
import { env } from '@/lib';
import { decodeJwtPayload } from '@/lib/jwtPayload';

export const TOKEN_KEY = 'api_runner_token';

/** Global account role from `User` (not team permissions). */
export type UserRole = 'owner' | 'admin' | 'member';

/** Team-scoped role from JWT (`teamRole`), same as backend `TeamMember.role`. */
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface AuthUser {
	id: string;
	_id: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt?: string;
	/** Present when merged from JWT after login or session refresh. */
	teamId?: string;
	teamRole?: TeamRole;
}

function normalizeTeamRoleFromJwt(raw: unknown): TeamRole | undefined {
	if (raw === 'member') return 'viewer';
	if (
		raw === 'viewer' ||
		raw === 'editor' ||
		raw === 'admin' ||
		raw === 'owner'
	) {
		return raw;
	}
	return undefined;
}

export function mergeAuthUserWithToken(
	user: AuthUser,
	token: string | null,
): AuthUser {
	if (!token) return user;
	const payload = decodeJwtPayload(token);
	if (!payload) return user;
	const teamId =
		typeof payload.teamId === 'string' ? payload.teamId : user.teamId;
	const teamRole =
		normalizeTeamRoleFromJwt(payload.teamRole) ??
		normalizeTeamRoleFromJwt(payload.role) ??
		user.teamRole;
	return { ...user, teamId, teamRole };
}

export function getToken(): string | null {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
	localStorage.removeItem(TOKEN_KEY);
}

export async function loginRequest(email: string, password: string) {
	const { data } = await axios.post<{
		data: { token: string; user: AuthUser };
	}>(`${env.baseAPI}/auth/login`, { email, password });
	setToken(data.data.token);
	return {
		token: data.data.token,
		user: mergeAuthUserWithToken(data.data.user, data.data.token),
	};
}

export async function registerRequest(
	name: string,
	email: string,
	password: string,
) {
	const { data } = await axios.post<{
		data: { token: string; user: AuthUser };
	}>(`${env.baseAPI}/auth/register`, { name, email, password });
	setToken(data.data.token);
	return {
		token: data.data.token,
		user: mergeAuthUserWithToken(data.data.user, data.data.token),
	};
}

export async function meRequest() {
	const token = getToken();
	const { data } = await axios.get<{ data: AuthUser }>(`${env.baseAPI}/auth/me`, {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
	});
	return mergeAuthUserWithToken(data.data, token);
}
