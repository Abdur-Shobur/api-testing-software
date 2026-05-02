import { cn } from '@/lib/utils';
import { CreateModal } from '@/store/features/collections/create-modal';
import { CollectionDelete } from '@/store/features/collections/delete';
import { EditModal } from '@/store/features/collections/edit-modal';
import { Collection } from '@/store/features/collections/type';
import { ChevronRight, Flame, Layers } from 'lucide-react';
export function Sidebar({
	collections,
	selectedId,
	onSelect,
	onDelete,
	onCreate,
}: {
	collections: Collection[];
	selectedId: string;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onCreate: () => void;
}) {
	return (
		<aside className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 w-56 shrink-0">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
				<div className="flex items-center gap-2">
					<div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
						<Flame className="w-3.5 h-3.5 text-orange-400" />
					</div>
					<span className="text-[13px] font-semibold text-zinc-100 tracking-tight">
						API Test
					</span>
				</div>
				<CreateModal />
			</div>

			{/* Label */}
			<div className="px-4 pt-4 pb-1.5">
				<span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
					Collections
				</span>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
				{collections.map((col) => (
					<button
						key={col.id}
						onClick={() => onSelect(col.id)}
						className={cn(
							'w-full flex items-center justify-between group px-3 py-2 rounded-lg text-left transition-all duration-150',
							selectedId === col.id
								? 'bg-zinc-800 text-zinc-100'
								: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
						)}
					>
						<div className="flex items-center gap-2 min-w-0">
							<Layers className="w-3.5 h-3.5 shrink-0 opacity-60" />
							<div className="min-w-0">
								<div className="text-[13px] font-medium truncate">
									{col.name}
								</div>
								<div className="text-[11px] text-zinc-600 mt-0.5">
									{col.testCases.length} test
									{col.testCases.length !== 1 ? 's' : ''}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-1 shrink-0">
							{selectedId === col.id && (
								<ChevronRight className="w-3 h-3 opacity-40" />
							)}
							<EditModal data={col} />
							<CollectionDelete data={col} />
						</div>
					</button>
				))}
			</div>
		</aside>
	);
}
