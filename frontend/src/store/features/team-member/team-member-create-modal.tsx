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
import { useState } from 'react';

import { Plus } from 'lucide-react';

export function TeamMemberCreateModal() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-orange-500 hover:bg-orange-600">
					<Plus className="w-4 h-4 mr-2" />
					Add Member
				</Button>
			</DialogTrigger>

			<DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>Create Team Member</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label>Name</Label>

						<Input className="bg-zinc-950 border-zinc-800" />
					</div>

					<div className="space-y-2">
						<Label>Email</Label>

						<Input className="bg-zinc-950 border-zinc-800" />
					</div>

					<div className="space-y-2">
						<Label>Role</Label>

						<Input className="bg-zinc-950 border-zinc-800" />
					</div>

					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
						>
							Cancel
						</Button>

						<Button className="bg-orange-500 hover:bg-orange-600">
							Create Member
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
