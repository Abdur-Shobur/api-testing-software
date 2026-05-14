'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { Plus } from 'lucide-react';
import { useSendInviteMutation } from '../team/api-slice';

export function TeamMemberCreateModal({ teamId }: { teamId: string }) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
	const [sendInvite, { isLoading }] = useSendInviteMutation();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			toast.error('Email is required');
			return;
		}
		try {
			await sendInvite({ teamId, email, role }).unwrap();
			toast.success('Invitation sent');
			setEmail('');
			setRole('viewer');
			setOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to send invitation');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-orange-500 hover:bg-orange-600">
					<Plus className="w-4 h-4 mr-2" />
					Invite Member
				</Button>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>Invite Team Member</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Email</Label>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="member@example.com"
							className="bg-zinc-950 border-zinc-800"
						/>
					</div>

					<div className="space-y-2">
						<Label>Role</Label>
						<select
							value={role}
							onChange={(e) =>
								setRole(e.target.value as 'admin' | 'editor' | 'viewer')
							}
							className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
						>
							<option value="viewer">Viewer</option>
							<option value="editor">Editor</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
						>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={isLoading}
							className="bg-orange-500 hover:bg-orange-600"
						>
							{isLoading ? 'Sending...' : 'Send Invite'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
