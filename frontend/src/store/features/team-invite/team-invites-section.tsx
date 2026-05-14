'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { useGetTeamInvitesQuery } from '../team/api-slice';
import { TeamInviteCard } from './team-invite-card';

type StatusFilter = '' | 'pending' | 'accepted' | 'expired' | 'cancelled';

const filters: { label: string; value: StatusFilter }[] = [
	{ label: 'All', value: '' },
	{ label: 'Pending', value: 'pending' },
	{ label: 'Accepted', value: 'accepted' },
	{ label: 'Expired', value: 'expired' },
	{ label: 'Cancelled', value: 'cancelled' },
];

export function TeamInvitesSection({ teamId }: { teamId: string }) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
	const { data, isLoading } = useGetTeamInvitesQuery({
		teamId,
		status: statusFilter || undefined,
	});
	const invites = data?.data ?? [];
	const pendingCount = invites.filter((i) => i.status === 'pending').length;

	return (
		<div className="space-y-4">
			<Card className="bg-zinc-900 border-zinc-800">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
								<Send className="w-5 h-5 text-zinc-300" />
							</div>
							<div>
								<h2 className="font-semibold text-lg">Sent Invitations</h2>
								<p className="text-sm text-zinc-500">
									{invites.length}{' '}
									{invites.length === 1 ? 'invitation' : 'invitations'}
									{statusFilter === '' && pendingCount > 0 && (
										<span className="text-amber-400 ml-1">
											({pendingCount} pending)
										</span>
									)}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center gap-1.5">
				{filters.map((f) => (
					<Button
						key={f.value}
						size="sm"
						variant={statusFilter === f.value ? 'default' : 'ghost'}
						onClick={() => setStatusFilter(f.value)}
						className={
							statusFilter === f.value
								? 'bg-zinc-700 text-zinc-100'
								: 'text-zinc-500 hover:text-zinc-200'
						}
					>
						{f.label}
						{f.value === 'pending' && pendingCount > 0 && (
							<Badge className="ml-1.5 bg-amber-500/15 text-amber-300 border-amber-500/20 text-[10px] px-1.5 py-0">
								{pendingCount}
							</Badge>
						)}
					</Button>
				))}
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="h-16 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
						/>
					))}
				</div>
			) : invites.length === 0 ? (
				<div className="text-center py-10">
					<div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3">
						<Mail className="w-5 h-5 text-zinc-500" />
					</div>
					<p className="text-sm text-zinc-500">
						{statusFilter
							? `No ${statusFilter} invitations`
							: 'No invitations sent yet'}
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{invites.map((invite) => (
						<TeamInviteCard key={invite._id} invite={invite} />
					))}
				</div>
			)}
		</div>
	);
}
