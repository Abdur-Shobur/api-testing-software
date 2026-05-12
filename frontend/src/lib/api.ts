'use client';

import axios from 'axios';
import { env } from '@/lib';
import { getToken } from './auth';

export const apiClient = axios.create({
	baseURL: env.baseAPI,
});

apiClient.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
