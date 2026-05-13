'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MoreVertical, User } from 'lucide-react';
import { TeamMemberDelete } from './team-member-delete';
import { TeamMemberEditModal } from './team-member-edit-modal';

export function TeamMemberCard(team: {
	id: string;
	name: string;
	email: string;
	role: string;
}) {
	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardHeader className="flex flex-row items-start justify-between space-y-0">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
						<User className="w-5 h-5 text-zinc-300" />
					</div>

					<div>
						<CardTitle className="text-base">Test </CardTitle>

						<p className="text-sm text-zinc-500 mt-1">Mail</p>

						<p className="text-xs text-orange-400 mt-1">role</p>
					</div>
				</div>

				{/* Actions */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost" className="hover:bg-zinc-800">
							<MoreVertical className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
						{/* Edit */}
						<TeamMemberEditModal />
						{/* Delete */}
						<TeamMemberDelete />
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>
		</Card>
	);
}
