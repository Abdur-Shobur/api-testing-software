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

import { Btn } from '@/components/ui/main-btn';
import { iState } from '@/type';
import { TestCaseCreate } from './create';

export function TestCaseCreateModal({ colId }: { colId: string }) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Btn size="sm">
					<Plus className="w-3 h-3" />
					New
				</Btn>
			</DialogTrigger>

			<DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>New Test Case</DialogTitle>
					<DialogDescription>Create a new test case.</DialogDescription>
				</DialogHeader>

				<FORM colId={colId} setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}

const FORM = ({
	colId,
	setOpen,
}: {
	colId: string;
	setOpen: iState<boolean>;
}) => {
	return <TestCaseCreate colId={colId} onClose={() => setOpen(false)} />;
};
