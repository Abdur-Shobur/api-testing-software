'use client';

import { useGetProjectsQuery } from '@/store/features/project/api-slice';
import {
	useGetMyTeamQuery,
	useSendInviteMutation,
	useRemoveTeamMemberMutation,
} from '@/store/features/team/api-slice';
import type { TeamMemberRole, TeamMemberRow } from '@/type';
import { Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const roleClass: Record<TeamMemberRole, string> = {
	owner: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
	admin: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
	editor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
	viewer: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20',
};

function memberProjectLabel(member: TeamMemberRow): string | null {
	const p = member.projectId;
	if (p == null) return null;
	if (typeof p === 'object' && 'name' in p) return p.name;
	return null;
}

export function TeamPage() {
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
	const [projectId, setProjectId] = useState('');
	const { data, isLoading, isError } = useGetMyTeamQuery();
	const { data: projectsData } = useGetProjectsQuery();
	const [sendInvite, { isLoading: isInviting }] = useSendInviteMutation();
	const [removeMember, { isLoading: isRemoving }] =
		useRemoveTeamMemberMutation();
	const team = data?.data ?? null;
	const teamId = team?._id ?? team?.id ?? '';
	const projects = projectsData?.data ?? [];

	useEffect(() => {
		if (projects.length > 0 && !projectId) {
			setProjectId(projects[0]._id ?? projects[0].id ?? '');
		}
	}, [projects, projectId]);

	const invite = async (event: FormEvent) => {
		event.preventDefault();
		if (!email.trim()) {
			toast.error('Email is required');
			return;
		}
		if (!projectId) {
			toast.error('Select a project for this invitation');
			return;
		}
		if (!teamId) {
			toast.error('Team not loaded');
			return;
		}
		try {
			await sendInvite({ teamId, email, role, projectId }).unwrap();
			setEmail('');
			toast.success('Invite sent');
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to send invite');
		}
	};

	const remove = async (userId: string) => {
		if (!teamId) return;
		try {
			await removeMember({ teamId, userId }).unwrap();
			toast.success('Member removed');
		} catch {
			toast.error('Failed to remove member');
		}
	};

	const members = team?.members ?? [];

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
					<form onSubmit={invite} className="flex flex-wrap gap-2 items-center">
						<Input
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="member@example.com"
							className="min-w-[200px] flex-1"
						/>
						<select
							value={projectId}
							onChange={(event) => setProjectId(event.target.value)}
							disabled={projects.length === 0}
							className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs min-w-[160px]"
						>
							{projects.length === 0 ? (
								<option value="">No projects yet</option>
							) : (
								projects.map((p) => (
									<option key={p._id ?? p.id} value={p._id ?? p.id ?? ''}>
										{p.name}
									</option>
								))
							)}
						</select>
						<select
							value={role}
							onChange={(event) =>
								setRole(event.target.value as 'admin' | 'editor' | 'viewer')
							}
							className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
						>
							<option value="viewer">viewer</option>
							<option value="editor">editor</option>
							<option value="admin">admin</option>
						</select>
						<Button disabled={isInviting || !projectId}>
							{isInviting ? 'Sending...' : 'Send Invite'}
						</Button>
					</form>

					<div className="rounded-lg border border-zinc-800 overflow-hidden">
						{members.map((member) => (
							<div
								key={member._id ?? member.userId._id ?? member.userId.id}
								className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-zinc-800 last:border-b-0"
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
								<div className="text-xs text-zinc-500 min-w-[100px]">
									{memberProjectLabel(member) ?? '—'}
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
