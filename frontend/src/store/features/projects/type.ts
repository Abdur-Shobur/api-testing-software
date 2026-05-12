export type ProjectAuthType = 'none' | 'bearer' | 'basic' | 'apiKey';

export interface ProjectAuthSettings {
	type: ProjectAuthType;
	bearerToken?: string;
	username?: string;
	password?: string;
	apiKeyKey?: string;
	apiKeyValue?: string;
	apiKeyIn?: 'header' | 'query';
}

export interface Project {
	id: string;
	_id?: string;
	name: string;
	description?: string;
	baseUrl?: string;
	auth?: ProjectAuthSettings;
	teamId?: string;
	createdAt: string;
	updatedAt: string;
}

