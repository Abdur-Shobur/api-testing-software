import { apiSlice } from '../api/apiSlice';
import { TestCase, TestCaseResult } from './type';

export const collectionApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// ─── Test Cases ───
		CreateTestCase: builder.mutation<
			TestCase,
			{ colId: string; body: Partial<TestCase> }
		>({
			query: ({ colId, body }) => ({
				url: `/collections/${colId}/tests`,
				method: 'POST',
				body,
			}),
		}),

		UpdateTestCase: builder.mutation<
			TestCase,
			{ colId: string; testId: string; body: Partial<TestCase> }
		>({
			query: ({ colId, testId, body }) => ({
				url: `/collections/${colId}/tests/${testId}`,
				method: 'PATCH',
				body,
			}),
			transformResponse: (res: { data: TestCase }) => res.data,
		}),

		DeleteTestCase: builder.mutation<void, { colId: string; testId: string }>({
			query: ({ colId, testId }) => ({
				url: `/collections/${colId}/tests/${testId}`,
				method: 'DELETE',
			}),
		}),

		// ─── Run ───
		RunCollection: builder.mutation<CollectionRunResult, string>({
			query: (colId) => ({
				url: `/run/${colId}`,
				method: 'POST',
			}),
			transformResponse: (res: { data: CollectionRunResult }) => res.data,
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
