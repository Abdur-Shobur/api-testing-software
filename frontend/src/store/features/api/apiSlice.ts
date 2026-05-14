import { env } from '@/lib';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'sonner';

const getBaseAPI = () => {
	if (!env.baseAPI) {
		toast.error('API NOT FOUND');
	}
	return env.baseAPI;
};
const baseQuery = fetchBaseQuery({
	baseUrl: getBaseAPI(),
	prepareHeaders: async (headers) => {
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('api_runner_token');
			if (token) headers.set('Authorization', `Bearer ${token}`);
		}
		return headers;
	},
});

export const apiSlice = createApi({
	reducerPath: 'api',
	baseQuery,
	endpoints: () => ({}),
	refetchOnReconnect: true,
	refetchOnMountOrArgChange: true,
	refetchOnFocus: env.production ? false : true,
	keepUnusedDataFor: 50000,
	tagTypes: ['COLLECTIONS', 'DOCS', 'ENV_VARS', 'TEAM', 'HISTORY', 'PROJECTS', 'INVITES'],
});
