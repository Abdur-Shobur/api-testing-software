import { apiSlice } from '../api/apiSlice';
import { Collection } from './type';

export const collectionApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// ─── Collections ───
		GetCollections: builder.query<{ data: Collection[]; total: number }, void>({
			query: () => ({
				url: '/collections',
				method: 'GET',
			}),
			providesTags: ['COLLECTIONS'],
		}),

		GetCollection: builder.query<Collection, string>({
			query: (id) => `/collections/${id}`,
			providesTags: ['COLLECTIONS'],
		}),

		CreateCollection: builder.mutation<
			{ data: Collection; success: boolean },
			{ name: string; description?: string }
		>({
			query: (body) => ({
				url: '/collections',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['COLLECTIONS'],
		}),

		UpdateCollection: builder.mutation<
			{ data: Collection; success: boolean },
			{ id: string; body: { name?: string; description?: string } }
		>({
			query: ({ id, body }) => ({
				url: `/collections/${id}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['COLLECTIONS'],
		}),

		DeleteCollection: builder.mutation<
			{ message: string; success: boolean; status: number },
			string
		>({
			query: (id) => ({
				url: `/collections/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['COLLECTIONS'],
		}),
	}),
});

export const {
	useGetCollectionsQuery,
	useGetCollectionQuery,
	useCreateCollectionMutation,
	useUpdateCollectionMutation,
	useDeleteCollectionMutation,
} = collectionApi;
