import { apiSlice } from '../api/apiSlice';
import { Collection } from './type';

export const collectionApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// ─── Collections ───
		GetCollections: builder.query<
			{ data: Collection[]; total: number },
			{ projectId?: string | null } | void
		>({
			query: (arg) => {
				const projectId = (arg as any)?.projectId;
				const params =
					projectId === undefined ? undefined : { projectId: projectId ?? 'null' };
				return { url: '/collections', method: 'GET', params };
			},
			providesTags: ['COLLECTIONS'],
		}),

		GetCollection: builder.query<{ data: Collection }, string>({
			query: (id) => `/collections/${id}`,
			providesTags: ['COLLECTIONS'],
		}),

		GetCollectionChildren: builder.query<
			{ data: Collection[]; total: number },
			{ id: string; projectId?: string | null }
		>({
			query: ({ id, projectId }) => {
				const params =
					projectId === undefined ? undefined : { projectId: projectId ?? 'null' };
				return { url: `/collections/${id}/children`, method: 'GET', params };
			},
			providesTags: ['COLLECTIONS'],
		}),

		CreateCollection: builder.mutation<
			{ data: Collection; success: boolean },
			{
				name: string;
				description?: string;
				parentId?: string | null;
				/** Required by API (root collections are always scoped to a project). */
				projectId: string;
			}
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
	useGetCollectionChildrenQuery,
	useCreateCollectionMutation,
	useUpdateCollectionMutation,
	useDeleteCollectionMutation,
} = collectionApi;
