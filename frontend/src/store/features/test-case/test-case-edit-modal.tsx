'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

import { iState } from '@/type';
import { Edit } from './test-case-edit';
import { iTestCase } from './type';

export function TestCaseEditModal({
	data,
	children,
	colId,
}: {
	data: iTestCase;
	children?: React.ReactNode;
	colId: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="" asChild>
				{children}
			</DialogTrigger>

			<DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Collection</DialogTitle>
					<DialogDescription>Edit this Collection.</DialogDescription>
				</DialogHeader>

				{open && <FORM setOpen={setOpen} data={data} colId={colId} />}
			</DialogContent>
		</Dialog>
	);
}

const FORM = ({
	setOpen,
	data,
	colId,
}: {
	setOpen: iState<boolean>;
	data: iTestCase;
	colId: string;
}) => {
	return <Edit setOpen={setOpen} data={data} colId={colId} />;
};
