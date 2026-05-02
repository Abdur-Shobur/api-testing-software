import { cn } from '@/lib/utils';
import { Collection } from '@/store/features/collections/type';
import { TestCaseCreateModal } from '@/store/features/test-case/create-modal';
import { MoreHorizontal, Pencil, Play, Terminal, Trash2 } from 'lucide-react';
import { IconBtn } from '../ui/icon-button';
import { Btn } from '../ui/main-btn';
import { MethodBadge } from '../ui/method-badge';

export function TestsPanel({
	collection,
	selectedTestId,
	onSelect,
	onDelete,
	onCreate,
	onRunAll,
	onRun,
}: {
	collection: Collection | null;
	selectedTestId: string;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onCreate: () => void;
	onRunAll: () => void;
	onRun: (id: string) => void;
}) {
	console.log(collection);
	if (!collection) {
		return (
			<div className="flex-1 flex items-center justify-center text-zinc-600 text-sm border-r border-zinc-800">
				Select a collection
			</div>
		);
	}

	return (
		<div className="flex flex-col border-r border-zinc-800 w-72 shrink-0">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
				<div>
					<p className="text-[13px] font-semibold line-clamp-1 text-zinc-100">
						{collection.name}
					</p>
					<p className="text-[10px] line-clamp-1 text-zinc-100">
						{collection.description}
					</p>
				</div>
				<div className="flex gap-1.5">
					<TestCaseCreateModal colId={collection.id} />

					<Btn size="sm" variant="primary" onClick={onRunAll}>
						<Play className="w-3 h-3" />
						Run all
					</Btn>
				</div>
			</div>

			{/* Test list */}
			<div className="flex-1 overflow-y-auto p-2 space-y-1">
				{collection?.testCases?.length === 0 && (
					<div className="flex flex-col items-center justify-center h-32 text-zinc-600 text-[13px] gap-2">
						<Terminal className="w-5 h-5" />
						No tests yet
					</div>
				)}
				{collection?.testCases?.map((test) => (
					<div
						key={test.id}
						onClick={() => onSelect(test.id)}
						className={cn(
							'group rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 border',
							selectedTestId === test.id
								? 'bg-zinc-800 border-zinc-700'
								: 'bg-transparent border-transparent hover:bg-zinc-800/50 hover:border-zinc-800',
						)}
					>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<MethodBadge method={test.request.method} />
								<span className="text-[13px] font-medium text-zinc-200 truncate">
									{test.name}
								</span>
							</div>
							{/* {test.lastResult && (
								<StatusBadge status={test.lastResult.status} />
							)} */}
						</div>
						<div className="text-[11px] text-zinc-600 mt-1.5 truncate font-mono">
							{test.request.url}
						</div>

						{/* Actions */}
						<div
							className={cn(
								'flex gap-1 mt-2 pt-2 border-t border-zinc-700/50 transition-all duration-150',
								selectedTestId === test.id
									? 'opacity-100'
									: 'opacity-0 group-hover:opacity-100',
							)}
						>
							<IconBtn title="Run">
								<Play className="w-3.5 h-3.5" />
							</IconBtn>
							<IconBtn title="Edit">
								<Pencil className="w-3.5 h-3.5" />
							</IconBtn>
							<IconBtn title="More">
								<MoreHorizontal className="w-3.5 h-3.5" />
							</IconBtn>
							<div className="flex-1" />
							<IconBtn variant="danger" title="Delete">
								<Trash2 className="w-3.5 h-3.5" />
							</IconBtn>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
