'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { IconBtn } from '@/components/ui/icon-button';
import { iState } from '@/type';
import { Create } from './create';

export function CreateModal() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<IconBtn title="New collection">
					<Plus className="w-3.5 h-3.5" />
				</IconBtn>
			</DialogTrigger>

			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>Create Collection</DialogTitle>
					<DialogDescription>Create a new Collection.</DialogDescription>
				</DialogHeader>

				<FORM setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}

const FORM = ({ setOpen }: { setOpen: iState<boolean> }) => {
	return <Create setOpen={setOpen} />;
};
