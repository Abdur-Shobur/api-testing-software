'use client';

import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/route';
import { ArrowLeft, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useGetMyInvitesQuery } from '../team/api-slice';
import { MyInviteCard } from './my-invite-card';

export default function MyInvitesPage() {
	const { data, isLoading } = useGetMyInvitesQuery();
	const invites = data?.data ?? [];
	const pendingCount = invites.filter((i) => i.status === 'pending').length;

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-3xl mx-auto space-y-6">
				<div className="flex items-center gap-3">
					<Link
						href={ROUTES.team.main}
						className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
					</Link>

					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold">My Invitations</h1>
						{pendingCount > 0 && (
							<Badge className="bg-orange-500/15 text-orange-300 border-orange-500/20">
								{pendingCount} pending
							</Badge>
						)}
					</div>
				</div>

				<p className="text-sm text-zinc-500">
					Team invitations you have received. Accept to join a team.
				</p>

				{isLoading ? (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="h-24 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
							/>
						))}
					</div>
				) : invites.length === 0 ? (
					<div className="text-center py-16">
						<div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
							<Inbox className="w-6 h-6 text-zinc-500" />
						</div>
						<p className="text-zinc-500">No invitations yet</p>
						<p className="text-xs text-zinc-600 mt-1">
							When someone invites you to a team, it will appear here
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{invites.map((invite) => (
							<MyInviteCard key={invite._id} invite={invite} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
