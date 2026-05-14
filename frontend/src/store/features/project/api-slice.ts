import { apiSlice } from '../api/apiSlice';
import { Collection } from '../collection/collection-type';
import type { Project, ProjectVisibility } from './type';

export type UpdateProjectBody = Partial<
	Pick<
		Project,
		'name' | 'description' | 'visibility' | 'baseUrl' | 'authorization'
	>
> & {
	baseUrl?: string;
	auth?: unknown;
};

export const projectsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		GetProjects: builder.query<{ data: Project[]; total: number }, void>({
			query: () => ({ url: '/projects', method: 'GET' }),
			providesTags: ['PROJECTS'],
		}),
		GetProject: builder.query<{ data: Project }, string>({
			query: (id) => ({ url: `/projects/${id}`, method: 'GET' }),
			providesTags: ['PROJECTS'],
		}),
		GetCollectionsByProjectId: builder.query<{ data: Collection[] }, string>({
			query: (projectId) => ({
				url: `/collections/project/${projectId}`,
				method: 'GET',
			}),
			providesTags: ['COLLECTIONS'],
		}),

		// get project by team id
		GetProjectByTeamId: builder.query<{ data: Collection[] }, string>({
			query: (teamId) => ({
				url: `/projects/team/${teamId}`,
				method: 'GET',
			}),
			providesTags: ['COLLECTIONS', 'PROJECTS'],
		}),
		CreateProject: builder.mutation<
			{ data: Project },
			{
				name: string;
				description?: string;
				visibility?: ProjectVisibility;
				teamId: string;
			}
		>({
			query: (body) => ({ url: '/projects', method: 'POST', body }),
			invalidatesTags: ['PROJECTS'],
		}),
		UpdateProject: builder.mutation<
			{ data: Project },
			{ id: string; body: UpdateProjectBody }
		>({
			query: ({ id, body }) => ({
				url: `/projects/${id}`,
				method: 'PATCH',
				body,
			}),
			invalidatesTags: ['PROJECTS'],
		}),
		DeleteProject: builder.mutation<{ data: { deleted: true } }, string>({
			query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
			invalidatesTags: ['PROJECTS'],
		}),
	}),
});

export const {
	useGetProjectsQuery,
	useGetProjectQuery,
	useCreateProjectMutation,
	useUpdateProjectMutation,
	useDeleteProjectMutation,
	useGetCollectionsByProjectIdQuery,
	useGetProjectByTeamIdQuery,
} = projectsApi;
