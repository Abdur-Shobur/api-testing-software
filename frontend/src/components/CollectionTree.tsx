'use client';

import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Collection } from '@/store/features/collection/collection-type';
import { ChevronRight, Layers } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ChildrenMap = Record<string, Collection[]>;

export function CollectionTree({
	collections,
	selectedId,
	onSelect,
	projectId,
}: {
	collections: Collection[];
	selectedId: string;
	onSelect: (id: string) => void;
	projectId?: string | null;
}) {
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [children, setChildren] = useState<ChildrenMap>({});

	const loadChildren = async (collectionId: string) => {
		if (children[collectionId]) return;
		try {
			const { data } = await apiClient.get<{ data: Collection[] }>(
				`/collections/${collectionId}/children`,
				{
					params:
						projectId === undefined
							? undefined
							: { projectId: projectId ?? 'null' },
				},
			);
			setChildren((current) => ({
				...current,
				[collectionId]: data.data,
			}));
		} catch {
			toast.error('Failed to load child collections');
		}
	};

	const toggle = async (collectionId: string) => {
		const next = !expanded[collectionId];
		setExpanded((current) => ({ ...current, [collectionId]: next }));
		if (next) await loadChildren(collectionId);
	};

	const renderNode = (collection: Collection, level: number) => {
		const nodeChildren = children[collection.id] ?? collection.children ?? [];
		const isOpen = expanded[collection.id];

		return (
			<div key={collection.id}>
				<div
					className={cn(
						'w-full flex items-center justify-between group pr-2 py-2 rounded-lg text-left transition-all duration-150',
						selectedId === collection.id
							? 'bg-zinc-800 text-zinc-100'
							: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
					)}
					style={{ paddingLeft: `${8 + level * 16}px` }}
				>
					<div className="flex items-center gap-1 min-w-0">
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								void toggle(collection.id);
							}}
							className="p-0.5 rounded hover:bg-zinc-700"
							title="Expand"
						>
							<ChevronRight
								className={cn(
									'w-3 h-3 transition-transform',
									isOpen && 'rotate-90',
								)}
							/>
						</button>
						<button
							type="button"
							onClick={() => onSelect(collection.id)}
							className="flex items-center gap-2 min-w-0 text-left"
						>
							<Layers className="w-3.5 h-3.5 shrink-0 opacity-60" />
							<span className="text-[13px] font-medium truncate">
								{collection.name}
							</span>
						</button>
					</div>
					{/* <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100">
						<CreateModal parentId={collection.id} projectId={projectId} />
						<EditModal data={collection} />
						<CollectionDelete data={collection} />
					</div> */}
				</div>
				{isOpen && nodeChildren.map((child) => renderNode(child, level + 1))}
			</div>
		);
	};

	return (
		<div className="space-y-0.5">
			{collections.map((col) => renderNode(col, 0))}
		</div>
	);
}
