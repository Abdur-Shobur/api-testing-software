'use client';

import { Btn } from '@/components/ui/main-btn';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRunTestCaseMutation } from './api-slice';

export function TestCaseRun({
	colId,
	testId,
}: {
	colId: string;
	testId: string;
}) {
	const [mutation, { isLoading }] = useRunTestCaseMutation();
	const [clicked, setClicked] = useState(false);

	const handleClick = async () => {
		if (clicked || isLoading) return;

		try {
			const response = await mutation({ colId, testId }).unwrap();

			console.log(response);
		} catch (err) {
			toast.error('Failed to Run');
		} finally {
			setClicked(false);
		}
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
		<Btn onClick={handleClick} size="sm" variant="primary">
			<Play className="w-3 h-3" />
			Run test
		</Btn>
	);
}
