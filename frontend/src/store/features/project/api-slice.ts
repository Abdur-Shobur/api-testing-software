import { apiSlice } from '../api/apiSlice';
import type { Project, ProjectVisibility } from './type';

export type UpdateProjectBody = Partial<
	Pick<Project, 'name' | 'description' | 'visibility'>
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
		CreateProject: builder.mutation<
			{ data: Project },
			{ name: string; description?: string; visibility?: ProjectVisibility }
		>({
			query: (body) => ({ url: '/projects', method: 'POST', body }),
			invalidatesTags: ['PROJECTS'],
		}),
		UpdateProject: builder.mutation<
			{ data: Project },
			{ id: string; body: UpdateProjectBody }
		>({
			query: ({ id, body }) => ({ url: `/projects/${id}`, method: 'PATCH', body }),
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
} = projectsApi;
