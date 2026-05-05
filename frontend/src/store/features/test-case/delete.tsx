'use client';

import { IconBtn } from '@/components/ui/icon-button';
import { alertConfirm } from '@/lib/confirm';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteTestCaseMutation } from './api-slice';

export function TestCaseDelete({
	colId,
	testId,
}: {
	colId: string;
	testId: string;
}) {
	const [mutation, { isLoading }] = useDeleteTestCaseMutation();
	const [clicked, setClicked] = useState(false);

	const handleClick = async () => {
		if (clicked || isLoading) return;

		setClicked(true);

		alertConfirm({
			onOk: async () => {
				try {
					const res = await mutation({ colId, testId }).unwrap();

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
		<IconBtn
			onClick={(e) => {
				if (e) {
					e.stopPropagation();
					handleClick();
				}
			}}
			variant="danger"
			title="Delete"
		>
			<Trash2 className="w-3.5 h-3.5" />
		</IconBtn>
	);
}
