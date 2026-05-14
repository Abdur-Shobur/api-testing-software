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
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteTeamMutation } from './api-slice';

export function TeamDelete({
	teamId,
	teamName,
}: {
	teamId: string;
	teamName: string;
}) {
	const [open, setOpen] = useState(false);
	const [deleteTeam, { isLoading }] = useDeleteTeamMutation();

	const handleDelete = async () => {
		try {
			await deleteTeam(teamId).unwrap();
			toast.success('Team deleted');
			setOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to delete team');
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem
					onSelect={(e) => e.preventDefault()}
					className="cursor-pointer text-rose-400 focus:bg-zinc-800 focus:text-rose-300"
				>
					<Trash2 className="w-4 h-4 mr-2" />
					Delete
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>Delete Team</DialogTitle>
				</DialogHeader>

				<div className="space-y-5 mt-2">
					<p className="text-sm text-zinc-400">
						Are you sure you want to delete{' '}
						<span className="font-semibold text-zinc-200">{teamName}</span>?
						This will remove all members and cannot be undone.
					</p>

					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
						>
							Cancel
						</Button>

						<Button
							disabled={isLoading}
							onClick={handleDelete}
							className="bg-rose-500 hover:bg-rose-600"
						>
							{isLoading ? 'Deleting...' : 'Delete Team'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
