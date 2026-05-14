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

import { iState } from '@/type';
import { Create } from './collection-create';

export function CollectionCreateModal({
	parentId,
	projectId,
}: {
	parentId?: string | null;
	projectId?: string | null;
} = {}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<span className="transition-all">
					<Plus className="w-3.5 h-3.5" />
				</span>
			</DialogTrigger>

			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle>Create Collection</DialogTitle>
					<DialogDescription>
						{parentId
							? 'Create a nested collection.'
							: 'Create a new Collection.'}
					</DialogDescription>
				</DialogHeader>

				<FORM setOpen={setOpen} parentId={parentId} projectId={projectId} />
			</DialogContent>
		</Dialog>
	);
}

const FORM = ({
	setOpen,
	parentId,
	projectId,
}: {
	setOpen: iState<boolean>;
	parentId?: string | null;
	projectId?: string | null;
}) => {
	return <Create setOpen={setOpen} parentId={parentId} projectId={projectId} />;
};
