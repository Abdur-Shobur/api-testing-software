import { apiSlice } from '../api/apiSlice';
import { CollectionRunResult, iTestCase, TestCaseResult } from './type';

export const collectionApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// ─── Test Cases ───
		CreateTestCase: builder.mutation<
			iTestCase,
			{ colId: string; body: Partial<iTestCase> }
		>({
			query: ({ colId, body }) => ({
				url: `/collections/${colId}/tests`,
				method: 'POST',
				body,
			}),
			invalidatesTags: ['COLLECTIONS'],
		}),

		UpdateTestCase: builder.mutation<
			{ data: iTestCase; success: boolean },
			{ colId: string; testId: string; body: Partial<iTestCase> }
		>({
			query: ({ colId, testId, body }) => ({
				url: `/collections/${colId}/tests/${testId}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['COLLECTIONS'],
		}),

		DeleteTestCase: builder.mutation<
			{ success: boolean; message: string },
			{ colId: string; testId: string }
		>({
			query: ({ colId, testId }) => ({
				url: `/collections/${colId}/tests/${testId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['COLLECTIONS'],
		}),

		// ─── Run ───
		RunCollection: builder.mutation<{ data: CollectionRunResult }, string>({
			query: (colId) => ({
				url: `/run/${colId}`,
				method: 'POST',
			}),
		}),

		RunTestCase: builder.mutation<
			{ data: TestCaseResult },
			{ colId: string; testId: string }
		>({
			query: ({ colId, testId }) => ({
				url: `/run/${colId}/${testId}`,
				method: 'POST',
			}),
		}),
	}),
});

export const {
	useCreateTestCaseMutation,
	useUpdateTestCaseMutation,
	useDeleteTestCaseMutation,
	useRunCollectionMutation,
	useRunTestCaseMutation,
} = collectionApi;
