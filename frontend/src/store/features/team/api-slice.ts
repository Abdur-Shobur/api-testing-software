import { Team } from '@/type';
import { apiSlice } from '../api/apiSlice';
import { Collection } from '../collections/type';

export const teamApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		GetMyTeam: builder.query<{ data: Team }, void>({
			query: () => ({
				url: '/teams/my',
				method: 'GET',
			}),
			providesTags: ['TEAM'],
		}),

		InviteTeamMember: builder.mutation<
			{ data: Team },
			{ email: string; role: 'admin' | 'member' }
		>({
			query: (body) => ({
				url: '/teams/invite',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['TEAM'],
		}),

		RemoveTeamMember: builder.mutation<{ data: Team }, string>({
			query: (userId) => ({
				url: `/teams/members/${userId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['TEAM'],
		}),

		GetMyTeamCollections: builder.query<{ data: Collection[] }, void>({
			query: () => ({
				url: '/teams/my/collections',
				method: 'GET',
			}),
			providesTags: ['COLLECTIONS'],
		}),
	}),
});

export const {
	useGetMyTeamQuery,
	useInviteTeamMemberMutation,
	useRemoveTeamMemberMutation,
	useGetMyTeamCollectionsQuery,
} = teamApi;
