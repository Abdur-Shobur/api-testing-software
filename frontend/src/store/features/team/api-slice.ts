import type { Team, TeamMemberRow } from '@/type';
import { apiSlice } from '../api/apiSlice';
import { Collection } from '../collection/collection-type';
import { Project } from '../project/type';

export interface TeamInvite {
	_id: string;
	teamId:
		| { _id: string; name: string; slug: string; description: string }
		| string;
	email: string;
	role: 'admin' | 'editor' | 'viewer';
	projectId?: { _id: string; name: string; slug: string } | string | null;
	status: 'pending' | 'accepted' | 'expired' | 'cancelled';
	invitedBy: { _id: string; name: string; email: string } | string;
	expiresAt: string;
	acceptedAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export const teamApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// ─── Team ─────────────────────────────────────────────────────────
		GetMyTeam: builder.query<{ data: Team }, void>({
			query: () => ({
				url: '/teams/my',
				method: 'GET',
			}),
			providesTags: ['TEAM'],
		}),

		CreateTeam: builder.mutation<
			{ data: Team },
			{ name: string; description?: string }
		>({
			query: (body) => ({
				url: '/teams',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['TEAM'],
		}),

		GetAllTeams: builder.query<{ data: Team[]; total: number }, void>({
			query: () => ({
				url: '/teams',
				method: 'GET',
			}),
			providesTags: ['TEAM'],
		}),

		GetTeamById: builder.query<{ data: Team }, string>({
			query: (teamId) => ({
				url: `/teams/${teamId}`,
				method: 'GET',
			}),
			providesTags: ['TEAM'],
		}),

		UpdateTeam: builder.mutation<
			{ data: Team },
			{ teamId: string; name?: string; description?: string }
		>({
			query: ({ teamId, ...body }) => ({
				url: `/teams/${teamId}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['TEAM'],
		}),

		DeleteTeam: builder.mutation<{ message: string }, string>({
			query: (teamId) => ({
				url: `/teams/${teamId}`,
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

		// ─── Team Members ─────────────────────────────────────────────────
		GetTeamMembers: builder.query<
			{ data: TeamMemberRow[]; total: number },
			string
		>({
			query: (teamId) => ({
				url: `/team-members/${teamId}`,
				method: 'GET',
			}),
			providesTags: ['TEAM'],
		}),

		UpdateMemberRole: builder.mutation<
			{ data: Team },
			{
				teamId: string;
				userId: string;
				role: 'admin' | 'editor' | 'viewer';
				projectId?: string;
			}
		>({
			query: ({ teamId, userId, ...body }) => ({
				url: `/team-members/${teamId}/${userId}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['TEAM'],
		}),

		RemoveTeamMember: builder.mutation<
			{ data: Team },
			{ teamId: string; userId: string }
		>({
			query: ({ teamId, userId }) => ({
				url: `/team-members/${teamId}/${userId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['TEAM'],
		}),

		LeaveTeam: builder.mutation<{ message: string }, string>({
			query: (teamId) => ({
				url: `/team-members/${teamId}/leave`,
				method: 'POST',
			}),
			invalidatesTags: ['TEAM'],
		}),

		GetSharedProjects: builder.query<{ data: Project[]; total: number }, void>({
			query: () => ({
				url: '/team-members/shared-projects/me',
				method: 'GET',
			}),
			providesTags: ['PROJECTS'],
		}),

		// ─── Team Invites ─────────────────────────────────────────────────
		SendInvite: builder.mutation<
			{ data: TeamInvite },
			{
				teamId: string;
				email: string;
				role: 'admin' | 'editor' | 'viewer';
				projectId?: string;
			}
		>({
			query: (body) => ({
				url: '/team-invites',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['TEAM', 'INVITES'],
		}),

		GetTeamInvites: builder.query<
			{ data: TeamInvite[]; total: number },
			{ teamId: string; status?: string }
		>({
			query: ({ teamId, status }) => ({
				url: `/team-invites/team/${teamId}${status ? `?status=${status}` : ''}`,
				method: 'GET',
			}),
			providesTags: ['INVITES'],
		}),

		GetMyInvites: builder.query<{ data: TeamInvite[]; total: number }, void>({
			query: () => ({
				url: '/team-invites/my',
				method: 'GET',
			}),
			providesTags: ['INVITES'],
		}),

		AcceptInvite: builder.mutation<
			{ message: string; data: { team: Team; role: string } },
			string
		>({
			query: (inviteId) => ({
				url: `/team-invites/${inviteId}/accept`,
				method: 'POST',
			}),
			invalidatesTags: ['TEAM', 'INVITES'],
		}),

		DeclineInvite: builder.mutation<{ message: string }, string>({
			query: (inviteId) => ({
				url: `/team-invites/${inviteId}/decline`,
				method: 'POST',
			}),
			invalidatesTags: ['INVITES'],
		}),

		CancelInvite: builder.mutation<{ message: string }, string>({
			query: (inviteId) => ({
				url: `/team-invites/${inviteId}/cancel`,
				method: 'POST',
			}),
			invalidatesTags: ['INVITES'],
		}),

		ResendInvite: builder.mutation<
			{ message: string; data: TeamInvite },
			string
		>({
			query: (inviteId) => ({
				url: `/team-invites/${inviteId}/resend`,
				method: 'POST',
			}),
			invalidatesTags: ['INVITES'],
		}),

		DeleteInvite: builder.mutation<{ message: string }, string>({
			query: (inviteId) => ({
				url: `/team-invites/${inviteId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['INVITES'],
		}),
	}),
});

export const {
	// Team
	useGetMyTeamQuery,
	useCreateTeamMutation,
	useGetAllTeamsQuery,
	useGetTeamByIdQuery,
	useUpdateTeamMutation,
	useDeleteTeamMutation,
	useGetMyTeamCollectionsQuery,
	// Team Members
	useGetTeamMembersQuery,
	useUpdateMemberRoleMutation,
	useRemoveTeamMemberMutation,
	useLeaveTeamMutation,
	useGetSharedProjectsQuery,
	// Team Invites
	useSendInviteMutation,
	useGetTeamInvitesQuery,
	useGetMyInvitesQuery,
	useAcceptInviteMutation,
	useDeclineInviteMutation,
	useCancelInviteMutation,
	useResendInviteMutation,
	useDeleteInviteMutation,
} = teamApi;
