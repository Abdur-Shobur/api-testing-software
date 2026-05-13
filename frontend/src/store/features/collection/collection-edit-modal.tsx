'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Pen } from 'lucide-react';
import { useState } from 'react';

import { iState } from '@/type';
import { Edit } from './collection-edit';
import { Collection } from './collection-type';

export function CollectionEditModal({ data }: { data: Collection }) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="" asChild>
				<span className="opacity-0 group-hover:opacity-100 transition-all">
					<Pen className="w-3  h-3 " />
				</span>
			</DialogTrigger>

			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>Edit Collection</DialogTitle>
					<DialogDescription>Edit this Collection.</DialogDescription>
				</DialogHeader>

				{open && <FORM setOpen={setOpen} data={data} />}
			</DialogContent>
		</Dialog>
	);
}

const FORM = ({
	setOpen,
	data,
}: {
	setOpen: iState<boolean>;
	data: Collection;
}) => {
	return <Edit setOpen={setOpen} data={data} />;
};
