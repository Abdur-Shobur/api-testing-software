'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function TeamSwitcher({
	teams,
}: {
	teams: {
		name: string;
		logo: React.ElementType;
		plan: string;
	}[];
}) {
	const [activeTeam, setActiveTeam] = React.useState(teams[0]);

	if (!activeTeam) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-full">
				<Button
					size="lg"
					className="bg-accent  data-[state=open]:bg-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-medium">{activeTeam.name}</span>
					</div>
					<ChevronsUpDown className="ml-auto" />
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
				{teams.map((team, index) => (
					<DropdownMenuItem
						key={team.name}
						onClick={() => setActiveTeam(team)}
						className="gap-2 p-2"
					>
						<div className="flex size-6 items-center justify-center rounded-md border">
							<team.logo className="size-3.5 shrink-0" />
						</div>
						{team.name}
						<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2 p-2">
					<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
						<Plus className="size-4" />
					</div>
					<div className="font-medium text-muted-foreground">Add team</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
