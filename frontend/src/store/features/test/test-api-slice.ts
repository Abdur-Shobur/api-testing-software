import { apiSlice } from '../api/apiSlice';

const api = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		test: builder.query<any, any>({
			query: (data) => ({
				url: 'https://jsonplaceholder.typicode.com/posts',
				method: 'GET',
			}),
		}),
	}),
});

export const { useTestQuery } = api;
