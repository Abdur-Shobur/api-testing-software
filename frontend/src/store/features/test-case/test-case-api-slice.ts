import { apiSlice } from '../api/apiSlice';
import {
	CollectionRunResult,
	iTestCase,
	TestCaseResult,
	TestRun,
} from './type';

export const testCaseApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// ─── Queries ───
		GetTestCases: builder.query<{ data: iTestCase[]; total: number }, string>({
			query: (colId) => `/collections/${colId}/tests`,
			providesTags: ['COLLECTIONS'],
		}),

		GetTestCase: builder.query<
			{ data: iTestCase },
			{ colId: string; testId: string }
		>({
			query: ({ colId, testId }) => `/collections/${colId}/tests/${testId}`,
			providesTags: ['COLLECTIONS'],
		}),

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
		RunCollection: builder.mutation<
			{ data: CollectionRunResult },
			{
				colId: string;
				projectId: string;
				mode?: 'sequential' | 'parallel';
				stopOnFail?: boolean;
			}
		>({
			query: (arg) => ({
				url: `/run/${arg.colId}`,
				method: 'POST',
				body: {
					mode: arg.mode ?? undefined,
					stopOnFail: arg.stopOnFail ?? undefined,
					projectId: arg.projectId,
				},
			}),
		}),

		GetTestHistory: builder.query<{ data: TestRun[] }, string>({
			query: (testId) => ({
				url: `/test-cases/${testId}/history`,
				method: 'GET',
			}),
			providesTags: ['HISTORY'],
		}),

		RunTestCase: builder.mutation<
			{ data: TestCaseResult },
			{ colId: string; testId: string; projectId: string }
		>({
			query: ({ colId, testId, projectId }) => ({
				url: `/run/${colId}/${testId}`,
				method: 'POST',
				body: { projectId },
			}),
			invalidatesTags: ['HISTORY'],
		}),
	}),
});

export const {
	useGetTestCasesQuery,
	useGetTestCaseQuery,
	useCreateTestCaseMutation,
	useUpdateTestCaseMutation,
	useDeleteTestCaseMutation,
	useRunCollectionMutation,
	useRunTestCaseMutation,
	useGetTestHistoryQuery,
} = testCaseApi;
