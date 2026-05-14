'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TeamMemberRole, TeamMemberRow } from '@/type';

import { MoreVertical, User } from 'lucide-react';
import { TeamMemberDelete } from './team-member-delete';
import { TeamMemberEditModal } from './team-member-edit-modal';

const roleClass: Record<TeamMemberRole, string> = {
	owner: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
	admin: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
	editor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
	viewer: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
};

function getProjectLabel(member: TeamMemberRow): string | null {
	const p = member.projectId;
	if (p == null) return null;
	if (typeof p === 'object' && 'name' in p) return p.name;
	return null;
}

export function TeamMemberCard({
	member,
	teamId,
	canManage,
}: {
	member: TeamMemberRow;
	teamId: string;
	canManage: boolean;
}) {
	const userId = member?.userId?._id ?? member?.userId?.id;
	const projectLabel = getProjectLabel(member);

	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardHeader className="flex flex-row items-start justify-between space-y-0">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
						<User className="w-5 h-5 text-zinc-300" />
					</div>

					<div>
						<CardTitle className="text-base">{member?.userId?.name}</CardTitle>

						<p className="text-sm text-zinc-500 mt-1">
							{member?.userId?.email}
						</p>

						<div className="flex items-center gap-2 mt-1.5">
							<Badge className={roleClass[member.role]}>{member.role}</Badge>
							{projectLabel && (
								<span className="text-xs text-zinc-500">{projectLabel}</span>
							)}
						</div>
					</div>
				</div>

				{canManage && member.role !== 'owner' && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="ghost" className="hover:bg-zinc-800">
								<MoreVertical className="w-4 h-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
							<TeamMemberEditModal member={member} teamId={teamId} />
							<TeamMemberDelete
								teamId={teamId}
								userId={userId}
								memberName={member?.userId?.name}
							/>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</CardHeader>
		</Card>
	);
}
