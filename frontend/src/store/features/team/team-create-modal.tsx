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
import { useCreateTeamMutation } from './api-slice';

export function TeamCreateModal() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [createTeam, { isLoading }] = useCreateTeamMutation();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error('Team name is required');
			return;
		}
		try {
			await createTeam({ name, description }).unwrap();
			toast.success('Team created');
			setName('');
			setDescription('');
			setOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to create team');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-orange-500 hover:bg-orange-600 text-white">
					<Plus className="w-4 h-4 mr-2" />
					Create Team
				</Button>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>Create Team</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Team Name</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Frontend Team"
							className="bg-zinc-950 border-zinc-800"
						/>
					</div>

					<div className="space-y-2">
						<Label>Description</Label>
						<Input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Team description"
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
							{isLoading ? 'Creating...' : 'Create Team'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
