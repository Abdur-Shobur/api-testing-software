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

/** Populated `ProjectSettings` document from the API. */
export interface ProjectSettingsDoc {
	id?: string;
	_id?: string;
	baseUrl?: string;
	auth?: ProjectAuthSettings | Record<string, unknown>;
	createdAt?: string;
	updatedAt?: string;
}

export type ProjectVisibility = 'private' | 'team' | 'public';

export interface Project {
	id: string;
	_id?: string;
	name: string;
	slug?: string;
	description?: string;
	/** Legacy: may be flat on older responses; prefer `settings`. */
	baseUrl?: string;
	auth?: ProjectAuthSettings;
	teamId?: string;
	visibility?: ProjectVisibility;
	settings?: ProjectSettingsDoc | string | null;
	createdBy?: string;
	createdAt: string;
	updatedAt: string;
}

export function getProjectSettings(
	project: Project | null | undefined,
): ProjectSettingsDoc | null {
	const s = project?.settings;
	if (!s || typeof s !== 'object') return null;
	if ('baseUrl' in s || 'auth' in s) return s as ProjectSettingsDoc;
	return null;
}
