'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/route';

import { ArrowLeft, Mail, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { TeamInvitesSection } from '../team-invite/team-invites-section';
import { TeamMemberCard } from '../team-member/team-member-card';
import { TeamMemberCreateModal } from '../team-member/team-member-create-modal';
import { useGetMyInvitesQuery, useGetTeamByIdQuery } from './api-slice';

const roleClass: Record<string, string> = {
	owner: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
	admin: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
	editor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
	viewer: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
};

type Tab = 'members' | 'invites';

export default function TeamPageView() {
	const params = useParams();
	const teamId = params.id as string;
	const { data, isLoading } = useGetTeamByIdQuery(teamId, { skip: !teamId });
	const { data: invitesData } = useGetMyInvitesQuery();

	const [activeTab, setActiveTab] = useState<Tab>('members');

	const team = data?.data;
	const members = team?.members ?? [];
	const myRole = 'admin';
	const canManage = 'owner';

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link
							href={ROUTES.team.main}
							className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
						>
							<ArrowLeft className="w-4 h-4" />
						</Link>

						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-2xl font-bold">
									{isLoading ? 'Loading...' : (team?.name ?? 'Team Not Found')}
								</h1>
								{myRole && (
									<Badge className={roleClass[myRole]}>{myRole}</Badge>
								)}
							</div>

							<p className="text-sm text-zinc-500 mt-1">
								{team?.description || 'Manage your team members'}
							</p>
						</div>
					</div>

					{canManage && <TeamMemberCreateModal teamId={teamId} />}
				</div>

				{/* Tabs */}
				{canManage && (
					<div className="flex items-center gap-1 border-b border-zinc-800 pb-0">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setActiveTab('members')}
							className={`rounded-b-none border-b-2 ${
								activeTab === 'members'
									? 'border-orange-500 text-zinc-100'
									: 'border-transparent text-zinc-500 hover:text-zinc-300'
							}`}
						>
							<Users className="w-4 h-4 mr-1.5" />
							Members
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setActiveTab('invites')}
							className={`rounded-b-none border-b-2 ${
								activeTab === 'invites'
									? 'border-orange-500 text-zinc-100'
									: 'border-transparent text-zinc-500 hover:text-zinc-300'
							}`}
						>
							<Mail className="w-4 h-4 mr-1.5" />
							Invitations
						</Button>
					</div>
				)}

				{/* Members tab */}
				{activeTab === 'members' && (
					<>
						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
										<Users className="w-5 h-5 text-zinc-300" />
									</div>
									<div>
										<h2 className="font-semibold text-lg">Team Members</h2>
										<p className="text-sm text-zinc-500">
											{members.length}{' '}
											{members.length === 1 ? 'Member' : 'Members'}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{isLoading ? (
							<div className="grid gap-4">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="h-20 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
									/>
								))}
							</div>
						) : members.length === 0 ? (
							<div className="text-center py-12 text-zinc-500">
								<p>No members found</p>
							</div>
						) : (
							<div className="grid gap-4">
								{members.map((member) => (
									<TeamMemberCard
										key={member._id}
										member={member}
										teamId={teamId}
									/>
								))}
							</div>
						)}
					</>
				)}

				{/* Invites tab (admin only) */}
				{activeTab === 'invites' && canManage && (
					<TeamInvitesSection teamId={teamId} />
				)}
			</div>
		</div>
	);
}
