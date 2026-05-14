'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/route';
import { Mail, Users } from 'lucide-react';
import Link from 'next/link';
import { useGetAllTeamsQuery, useGetMyInvitesQuery } from './api-slice';
import { TeamCard } from './team-card';
import { TeamCreateModal } from './team-create-modal';

export default function TeamPage() {
	const { data, isLoading } = useGetAllTeamsQuery();
	const { data: invitesData, isLoading: invitesLoading } =
		useGetMyInvitesQuery();
	const teams = data?.data ?? [];
	const pendingInvites =
		invitesData?.data?.filter((i) => i.status === 'pending').length ?? 0;

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-10">
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Teams</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Manage your teams and members
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Link href={ROUTES.team.invites}>
							<Button
								variant="outline"
								className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800 relative"
							>
								<Mail className="w-4 h-4 mr-2" />
								My Invitations
								{pendingInvites > 0 && (
									<Badge className="ml-2 bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] px-1.5 py-0">
										{pendingInvites}
									</Badge>
								)}
							</Button>
						</Link>
						<TeamCreateModal />
					</div>
				</div>

				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="h-44 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
							/>
						))}
					</div>
				) : teams.length === 0 ? (
					<div className="text-center py-16 text-zinc-500">
						<p className="text-lg">No teams yet</p>
						<p className="text-sm mt-1">
							Create your first team to get started
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{teams.map((team) => (
							<TeamCard key={team._id ?? team.id} team={team} />
						))}
					</div>
				)}
			</div>
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Invited Teams</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Manage your teams and members
						</p>
					</div>
				</div>

				{invitesLoading ? (
					<div className="grid gap-4 md:grid-cols-2">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="h-44 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
							/>
						))}
					</div>
				) : invitesData?.data.length === 0 ? (
					<div className="text-center py-16 text-zinc-500">
						<p className="text-lg">No teams yet</p>
						<p className="text-sm mt-1">
							Create your first team to get started
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{invitesData?.data?.map((invite) => (
							<Card
								key={invite._id}
								className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
							>
								<CardHeader className="flex flex-row items-start justify-between space-y-0">
									<Link
										href={ROUTES.project.projectId(invite.teamId._id)}
										className="flex items-center gap-3"
									>
										<div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
											<Users className="w-5 h-5 text-zinc-300" />
										</div>

										<div>
											<CardTitle className="text-base">
												{invite.teamId.name}
											</CardTitle>

											<p className="text-sm text-zinc-500 mt-1">
												{invite.teamId.description || 'No description'}
											</p>
										</div>
									</Link>
								</CardHeader>

								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Link href={ROUTES.project.projectId(invite.teamId._id)}>
												<Button
													variant="secondary"
													size="sm"
													className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
												>
													View Projects
												</Button>
											</Link>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
