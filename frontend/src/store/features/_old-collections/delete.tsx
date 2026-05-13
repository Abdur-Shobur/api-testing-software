'use client';

import { alertConfirm } from '@/lib/confirm';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteCollectionMutation } from './api-slice';
import { Collection } from './type';

export function CollectionDelete({ data }: { data: Collection }) {
	const [mutation, { isLoading }] = useDeleteCollectionMutation();
	const [clicked, setClicked] = useState(false);

	const handleClick = async () => {
		if (clicked || isLoading) return;

		setClicked(true);

		alertConfirm({
			onOk: async () => {
				try {
					const res = await mutation(data.id).unwrap();

					if (res.success) {
						toast.success(res.message);
					} else {
						toast.error('Failed to delete');
					}
				} catch (err) {
					toast.error('Failed to delete');
				} finally {
					setClicked(false);
				}
			},
			onCancel: () => {
				setClicked(false);
			},
		});
	};
	// <Button onClick={handleClick} variant="outline" size="icon">
	// 	{isLoading ? (
	// 		<LoaderCircle className="size-4 animate-spin text-destructive" />
	// 	) : (
	// 		<X className="size-4 text-destructive" />
	// 	)}
	// 	<span className="sr-only">Delete</span>
	// </Button>

	return (
		<span
			onClick={(e) => {
				e.stopPropagation();
				handleClick();
			}}
			className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:text-rose-400 transition-all"
		>
			<Trash2 className="w-3 h-3" />
		</span>
	);
}
