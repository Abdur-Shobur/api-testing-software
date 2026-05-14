'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';

interface ProjectContextValue {
	projectId: string | null;
	setProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextValue>({
	projectId: null,
	setProjectId: () => {},
});

const STORAGE_KEY = 'projectId';

export function ProjectProvider({ children }: { children: ReactNode }) {
	const [projectId, setProjectIdState] = useState<string | null>(null);

	// Load from localStorage on mount
	useEffect(() => {
		const savedProjectId = localStorage.getItem(STORAGE_KEY);

		if (savedProjectId) {
			setProjectIdState(savedProjectId);
		}
	}, []);

	// Custom setter that also updates localStorage
	const setProjectId = (id: string | null) => {
		setProjectIdState(id);

		if (id) {
			localStorage.setItem(STORAGE_KEY, id);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	};

	return (
		<ProjectContext.Provider value={{ projectId, setProjectId }}>
			{children}
		</ProjectContext.Provider>
	);
}

export function useProjectContext() {
	return useContext(ProjectContext);
}
