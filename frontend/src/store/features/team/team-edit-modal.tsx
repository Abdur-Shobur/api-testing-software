'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Team } from '@/type';
import { Pencil } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useUpdateTeamMutation } from './api-slice';

export function TeamEditModal({ team }: { team: Team }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(team.name);
	const [description, setDescription] = useState(team.description ?? '');
	const [updateTeam, { isLoading }] = useUpdateTeamMutation();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error('Team name is required');
			return;
		}
		try {
			await updateTeam({
				teamId: team._id ?? team.id,
				name,
				description,
			}).unwrap();
			toast.success('Team updated');
			setOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to update team');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Pencil className="w-4 h-4 mr-2" />
					Edit
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>Edit Team</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Team Name</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-zinc-950 border-zinc-800"
						/>
					</div>

					<div className="space-y-2">
						<Label>Description</Label>
						<Input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="bg-zinc-950 border-zinc-800"
						/>
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
							{isLoading ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
