'use client';

import { Check, ChevronsUpDown, Layers } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/route';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useGetProjectByTeamIdQuery } from './api-slice';
import { ProjectCreateModal } from './prject-create-modal';
import { useProjectContext } from './project-context';

export function ProjectSwitcher() {
	const router = useRouter();
	const params = useParams();
	const { data: projectsData } = useGetProjectByTeamIdQuery(
		String(params.teamId),
		{
			skip: !params.teamId,
		},
	);
	const projects = projectsData?.data ?? [];
	const { projectId, setProjectId } = useProjectContext();

	const activeProject = projects.find((p) => (p._id ?? p.id) === projectId);

	useEffect(() => {
		if (!projectId && projects.length > 0) {
			setProjectId(projects[0]._id ?? projects[0].id);
		}
	}, [projects, projectId, setProjectId]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-full">
				<Button
					size="lg"
					className="bg-accent data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground w-full"
				>
					<Layers className="w-4 h-4 shrink-0 opacity-60" />
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">
							{activeProject?.name ?? 'Select project'}
						</span>
					</div>
					<ChevronsUpDown className="ml-auto w-4 h-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
				align="start"
				sideOffset={4}
			>
				<DropdownMenuLabel className="text-xs text-muted-foreground">
					Projects
				</DropdownMenuLabel>
				{projects.map((project) => {
					const id = project._id ?? project.id;
					const isActive = id === projectId;
					return (
						<DropdownMenuItem
							key={id}
							onClick={() => {
								setProjectId(id);
								if (project.teamId) {
									router.push(ROUTES.project.projectId(project.teamId));
								}
							}}
							className={cn('gap-2 p-2', isActive && 'bg-zinc-800')}
						>
							<div className="flex size-6 items-center justify-center rounded-md border">
								<Layers className="size-3.5 shrink-0 opacity-60" />
							</div>
							<span className="flex-1 truncate">{project.name}</span>
							{isActive && <Check className="w-4 h-4 text-orange-400" />}
						</DropdownMenuItem>
					);
				})}
				<DropdownMenuSeparator />
				<ProjectCreateModal />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
