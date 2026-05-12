'use client';

import axios from 'axios';
import { env } from '@/lib';

export const TOKEN_KEY = 'api_runner_token';

export interface AuthUser {
	id: string;
	_id: string;
	name: string;
	email: string;
	role: 'owner' | 'admin' | 'member';
	teamId: string;
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
	return data.data;
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
	return data.data;
}

export async function meRequest() {
	const token = getToken();
	const { data } = await axios.get<{ data: AuthUser }>(`${env.baseAPI}/auth/me`, {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
	});
	return data.data;
}
