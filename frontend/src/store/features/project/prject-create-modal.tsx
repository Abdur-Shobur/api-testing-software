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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useCreateProjectMutation } from './api-slice';

export function ProjectCreateModal() {
	const { teamId } = useParams();
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [createProject, { isLoading }] = useCreateProjectMutation();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error('Project name is required');
			return;
		}
		try {
			await createProject({
				name,
				description,
				visibility: 'private',
				teamId: String(teamId),
			}).unwrap();
			toast.success('Project created');
			setName('');
			setDescription('');
			setOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to create project');
		}
	};
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Plus className="w-4 h-4 mr-2" />
					Create Project
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>Create Project</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Project Name</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-zinc-950 border-zinc-800"
						/>
					</div>

					<div className="space-y-2">
						<Label>Description</Label>
						<Textarea
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
							{isLoading ? 'Creating...' : 'Create Project'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
