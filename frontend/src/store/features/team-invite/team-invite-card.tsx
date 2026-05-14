'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Mail, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
	useCancelInviteMutation,
	useDeleteInviteMutation,
	useResendInviteMutation,
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

function getProjectName(invite: TeamInvite): string | null {
	if (
		invite.projectId &&
		typeof invite.projectId === 'object' &&
		invite.projectId.name
	)
		return invite.projectId.name;
	return null;
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export function TeamInviteCard({ invite }: { invite: TeamInvite }) {
	const [cancelInvite, { isLoading: isCancelling }] =
		useCancelInviteMutation();
	const [resendInvite, { isLoading: isResending }] =
		useResendInviteMutation();
	const [deleteInvite, { isLoading: isDeleting }] =
		useDeleteInviteMutation();

	const isPending = invite.status === 'pending';
	const projectName = getProjectName(invite);
	const busy = isCancelling || isResending || isDeleting;

	const handleCancel = async () => {
		try {
			await cancelInvite(invite._id).unwrap();
			toast.success('Invite cancelled');
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to cancel invite');
		}
	};

	const handleResend = async () => {
		try {
			await resendInvite(invite._id).unwrap();
			toast.success('Invite resent');
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to resend invite');
		}
	};

	const handleDelete = async () => {
		try {
			await deleteInvite(invite._id).unwrap();
			toast.success('Invite deleted');
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to delete invite');
		}
	};

	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardContent className="p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
							<Mail className="w-4 h-4 text-zinc-400" />
						</div>

						<div className="min-w-0 space-y-1">
							<div className="flex items-center gap-2 flex-wrap">
								<span className="text-sm font-medium text-zinc-200 truncate">
									{invite.email}
								</span>
								<Badge className={statusStyle[invite.status]}>
									{invite.status}
								</Badge>
								<Badge className={roleStyle[invite.role]}>
									{invite.role}
								</Badge>
								{projectName && (
									<span className="text-xs text-zinc-500">
										{projectName}
									</span>
								)}
							</div>

							<div className="flex items-center gap-3 text-xs text-zinc-600">
								<span>Sent {formatDate(invite.createdAt)}</span>
								{isPending && (
									<span>
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

					<div className="flex items-center gap-1.5 shrink-0">
						{isPending && (
							<>
								<Button
									size="icon-sm"
									variant="ghost"
									disabled={busy}
									onClick={handleResend}
									title="Resend invite"
									className="text-zinc-500 hover:text-zinc-200"
								>
									<RefreshCw
										className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`}
									/>
								</Button>
								<Button
									size="icon-sm"
									variant="ghost"
									disabled={busy}
									onClick={handleCancel}
									title="Cancel invite"
									className="text-zinc-500 hover:text-amber-300"
								>
									<X className="w-3.5 h-3.5" />
								</Button>
							</>
						)}
						{invite.status !== 'pending' && (
							<Button
								size="icon-sm"
								variant="ghost"
								disabled={busy}
								onClick={handleDelete}
								title="Delete invite"
								className="text-zinc-500 hover:text-rose-400"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
