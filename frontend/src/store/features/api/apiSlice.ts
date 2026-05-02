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
		// const session = await getSession();
		// headers.set('Authorization', `Bearer ${session?.accessToken}`);
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
	tagTypes: ['COLLECTIONS'],
});
