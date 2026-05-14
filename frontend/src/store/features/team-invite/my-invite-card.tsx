'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, Mail, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import {
	useAcceptInviteMutation,
	useDeclineInviteMutation,
	type TeamInvite,
} from '../team/api-slice';

const statusStyle: Record<string, string> = {
	pending: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
	accepted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
	expired: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
	cancelled: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
};

const roleStyle: Record<string, string> = {
	admin: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
	editor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
	viewer: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
};

function getTeamName(invite: TeamInvite): string {
	if (typeof invite.teamId === 'object' && invite.teamId?.name)
		return invite.teamId.name;
	return 'Unknown Team';
}

function getInviterName(invite: TeamInvite): string {
	if (typeof invite.invitedBy === 'object' && invite.invitedBy?.name)
		return invite.invitedBy.name;
	return 'Someone';
}

function getInviterEmail(invite: TeamInvite): string {
	if (typeof invite.invitedBy === 'object' && invite.invitedBy?.email)
		return invite.invitedBy.email;
	return '';
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function isExpiringSoon(dateStr: string): boolean {
	const diff = new Date(dateStr).getTime() - Date.now();
	return diff > 0 && diff < 2 * 24 * 60 * 60 * 1000;
}

export function MyInviteCard({ invite }: { invite: TeamInvite }) {
	const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation();
	const [declineInvite, { isLoading: isDeclining }] =
		useDeclineInviteMutation();
	const isPending = invite.status === 'pending';

	const handleAccept = async () => {
		try {
			await acceptInvite(invite._id).unwrap();
			toast.success(`Joined ${getTeamName(invite)}`);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to accept invite');
		}
	};

	const handleDecline = async () => {
		try {
			await declineInvite(invite._id).unwrap();
			toast.success('Invite declined');
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to decline invite');
		}
	};

	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-4 min-w-0">
						<div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
							<Users className="w-5 h-5 text-zinc-300" />
						</div>

						<div className="min-w-0 space-y-1.5">
							<div className="flex items-center gap-2 flex-wrap">
								<h3 className="font-semibold text-sm text-zinc-100">
									{getTeamName(invite)}
								</h3>
								<Badge className={statusStyle[invite.status]}>
									{invite.status}
								</Badge>
								<Badge className={roleStyle[invite.role]}>
									{invite.role}
								</Badge>
							</div>

							<div className="flex items-center gap-1.5 text-xs text-zinc-500">
								<Mail className="w-3 h-3" />
								Invited by {getInviterName(invite)}
								{getInviterEmail(invite) && (
									<span className="text-zinc-600">
										({getInviterEmail(invite)})
									</span>
								)}
							</div>

							<div className="flex items-center gap-3 text-xs text-zinc-600">
								<span>Sent {formatDate(invite.createdAt)}</span>
								{isPending && (
									<span
										className={
											isExpiringSoon(invite.expiresAt)
												? 'text-amber-400'
												: ''
										}
									>
										<Clock className="w-3 h-3 inline mr-0.5" />
										Expires {formatDate(invite.expiresAt)}
									</span>
								)}
								{invite.status === 'accepted' && invite.acceptedAt && (
									<span className="text-emerald-400">
										Accepted {formatDate(invite.acceptedAt)}
									</span>
								)}
							</div>
						</div>
					</div>

					{isPending && (
						<div className="flex items-center gap-2 shrink-0">
							<Button
								size="sm"
								variant="outline"
								disabled={isDeclining || isAccepting}
								onClick={handleDecline}
								className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-300"
							>
								<X className="w-3.5 h-3.5 mr-1" />
								{isDeclining ? 'Declining...' : 'Decline'}
							</Button>
							<Button
								size="sm"
								disabled={isAccepting || isDeclining}
								onClick={handleAccept}
								className="bg-orange-500 hover:bg-orange-600"
							>
								<Check className="w-3.5 h-3.5 mr-1" />
								{isAccepting ? 'Accepting...' : 'Accept'}
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
