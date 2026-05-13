export const ROUTES = {
	team: {
		main: '/team',
		id: (id: string) => `/team/${id}`,
	},
	collection: {
		main: (teamId: string, collectionId: string) =>
			`/project/${teamId}/collection/${collectionId}`,
		api: (teamId: string, collectionId: string, apiId: string) =>
			`/project/${teamId}/collection/${collectionId}/${apiId}`,
		rulAll: (teamId: string, collectionId: string) =>
			`/project/${teamId}/collection/${collectionId}/run-all`,
	},
	project: {
		main: '/project',
		projectId: (teamId: string) => `/project/${teamId}`,
	},
	home: '/',
};
