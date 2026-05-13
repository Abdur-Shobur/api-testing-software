'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/route';

import { MoreVertical, User, Users } from 'lucide-react';
import Link from 'next/link';
import { TeamDelete } from './team-delete';
import { TeamEditModal } from './team-edit-modal';

const teams = [
	{
		id: '1',
		name: 'Frontend Team',
		description: 'Handles UI development and components',
		members: 6,
	},
	{
		id: '2',
		name: 'Backend Team',
		description: 'API and database management',
		members: 4,
	},
	{
		id: '3',
		name: 'DevOps Team',
		description: 'Deployment and infrastructure',
		members: 3,
	},
];

export function TeamCard(team: {
	id: string;
	name: string;
	description: string;
	members: number;
}) {
	return (
		<Card
			key={team.id}
			className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
		>
			<CardHeader className="flex flex-row items-start justify-between space-y-0">
				<Link
					href={`${ROUTES.project.projectId('TeamId')}`}
					className="flex items-center gap-3"
				>
					<div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
						<Users className="w-5 h-5 text-zinc-300" />
					</div>

					<div>
						<CardTitle className="text-base">{team.name}</CardTitle>

						<p className="text-sm text-zinc-500 mt-1">{team.description}</p>
					</div>
				</Link>

				{/* Actions */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							className="text-zinc-400 hover:text-white hover:bg-zinc-800"
						>
							<MoreVertical className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
						<TeamEditModal />
						<TeamDelete />
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-sm text-zinc-400">
						<User className="w-4 h-4" />
						{team.members} Members
					</div>

					<div className="flex items-center gap-2">
						<Link href={ROUTES.project.projectId('teamId')}>
							<Button
								variant="secondary"
								size="sm"
								className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
							>
								View Projects
							</Button>
						</Link>
						<Link href={ROUTES.team.id('teamId')}>
							<Button
								variant="outline"
								size="sm"
								className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
							>
								View Team Members
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
