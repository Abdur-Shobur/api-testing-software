'use client';

import {
	useGetMyTeamQuery,
	useInviteTeamMemberMutation,
	useRemoveTeamMemberMutation,
} from '@/store/features/team/api-slice';
import { Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const roleClass = {
	owner: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
	admin: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
	member: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
};

export function TeamPage() {
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<'admin' | 'member'>('member');
	const { data, isLoading, isError } = useGetMyTeamQuery();
	const [inviteMember, { isLoading: isInviting }] =
		useInviteTeamMemberMutation();
	const [removeMember, { isLoading: isRemoving }] =
		useRemoveTeamMemberMutation();
	const team = data?.data ?? null;

	const invite = async (event: FormEvent) => {
		event.preventDefault();
		if (!email.trim()) {
			toast.error('Email is required');
			return;
		}
		try {
			await inviteMember({ email, role }).unwrap();
			setEmail('');
			toast.success('Member added');
		} catch (error: any) {
			toast.error(error?.data?.error ?? 'Failed to invite member');
		}
	};

	const remove = async (userId: string) => {
		try {
			await removeMember(userId).unwrap();
			toast.success('Member removed');
		} catch {
			toast.error('Failed to remove member');
		}
	};

	return (
		<main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<Card className="max-w-4xl mx-auto">
				<CardHeader>
					<CardTitle>
						{team?.name ?? (isLoading ? 'Loading team...' : 'Team')}
					</CardTitle>
					<p className="text-xs text-zinc-500">
						Slug: {team?.slug ?? (isError ? 'unavailable' : 'loading...')}
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<form onSubmit={invite} className="flex gap-2">
						<Input
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="member@example.com"
						/>
						<select
							value={role}
							onChange={(event) =>
								setRole(event.target.value as 'admin' | 'member')
							}
							className="rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs"
						>
							<option value="member">member</option>
							<option value="admin">admin</option>
						</select>
						<Button disabled={isInviting}>
							{isInviting ? 'Sending...' : 'Send Invite'}
						</Button>
					</form>

					<div className="rounded-lg border border-zinc-800 overflow-hidden">
						{team?.members.map((member) => (
							<div
								key={member.userId._id ?? member.userId.id}
								className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-3 border-b border-zinc-800 last:border-b-0"
							>
								<div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
									{member.userId.name.slice(0, 1).toUpperCase()}
								</div>
								<div>
									<div className="text-sm">{member.userId.name}</div>
									<div className="text-xs text-zinc-500">
										{member.userId.email}
									</div>
								</div>
								<Badge className={roleClass[member.role]}>{member.role}</Badge>
								<Button
									type="button"
									size="icon-sm"
									variant="destructive"
									disabled={member.role === 'owner' || isRemoving}
									onClick={() =>
										void remove(member.userId._id ?? member.userId.id)
									}
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
