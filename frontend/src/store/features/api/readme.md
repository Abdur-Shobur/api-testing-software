```ts
import { apiSlice } from '../../api/apiSlice';

const api = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// get all
		getAdminBlogCategory: builder.query<any, { query: string }>({
			query: ({ query }): string => `?${query}`,
			providesTags: () => {
				return ['Users'];
			},
		}),

		getAdminBlogActiveCategory: builder.query<any, any>({
			query: (): string => `/active`,
		}),

		// get single id
		getAdminBlogCategoryById: builder.query<any, { id: string }>({
			query: ({ id }) => `/${id}`,
			providesTags: (_result, _error, id) => {
				return [{ type: 'Users', id: id.id }];
			},
		}),

		// store   reply
		storeAdminBlogCategory: builder.mutation<
			any,
			{ attachment: any[]; id: string; _any: any }
		>({
			query: (payload) => {
				const body = new FormData();
				Object.entries(payload).forEach(([key, value]) => {
					body.append(key, value);
				});
				return {
					url: `/store`,
					method: 'POST',
					body,
					formData: true,
				};
			},

			invalidatesTags: () => {
				return ['Users'];
			},
		}),

		// delete
		deleteAdminBlogCategory: builder.mutation<any, any>({
			query: ({ id }: any) => ({
				url: `/delete/${id.id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Users'],
		}),
	}),
});

export const {} = api;
```
