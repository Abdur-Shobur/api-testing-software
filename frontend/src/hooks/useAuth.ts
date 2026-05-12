'use client';

import {
	AuthUser,
	clearToken,
	getToken,
	loginRequest,
	meRequest,
	registerRequest,
} from '@/lib/auth';
import { useCallback, useEffect, useState } from 'react';

export function useAuth() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setTokenState] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const existing = getToken();
		setTokenState(existing);
		if (!existing) {
			setLoading(false);
			return;
		}
		meRequest()
			.then(setUser)
			.catch(() => {
				clearToken();
				setTokenState(null);
				setUser(null);
			})
			.finally(() => setLoading(false));
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const result = await loginRequest(email, password);
		setTokenState(result.token);
		setUser(result.user);
		return result;
	}, []);

	const register = useCallback(
		async (name: string, email: string, password: string) => {
			const result = await registerRequest(name, email, password);
			setTokenState(result.token);
			setUser(result.user);
			return result;
		},
		[],
	);

	const logout = useCallback(() => {
		clearToken();
		setTokenState(null);
		setUser(null);
	}, []);

	return { user, token, login, register, logout, loading };
}
