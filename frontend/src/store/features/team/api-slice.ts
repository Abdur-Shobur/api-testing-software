import type { Team, TeamMemberRow } from '@/type';
import { apiSlice } from '../api/apiSlice';
import { Collection } from '../collection/collection-type';
import { Project } from '../project/type';

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
			{ data: TeamMemberRow[] },
			{ email: string; role: 'admin' | 'editor' | 'viewer'; projectId: string }
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

		GetSharedProjects: builder.query<{ data: Project[]; total: number }, void>({
			query: () => ({
				url: '/teams/shared-projects',
				method: 'GET',
			}),
			providesTags: ['PROJECTS'],
		}),
	}),
});

export const {
	useGetMyTeamQuery,
	useInviteTeamMemberMutation,
	useRemoveTeamMemberMutation,
	useGetMyTeamCollectionsQuery,
	useGetSharedProjectsQuery,
} = teamApi;
