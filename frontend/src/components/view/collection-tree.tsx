'use client';

import { ROUTES } from '@/lib/route';
import { cn } from '@/lib/utils';
import { CollectionCreateModal } from '@/store/features/collection/collection-create-modal';
import { CollectionDelete } from '@/store/features/collection/collection-delete';
import { CollectionEditModal } from '@/store/features/collection/collection-edit-modal';
import { ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const collections = [
	{
		id: '1',
		name: 'Frontend',
		children: [
			{
				id: '2',
				name: 'Components',
				children: [
					{
						id: '3',
						name: 'Buttons',
					},
				],
			},
			{
				id: '4',
				name: 'Layouts',
			},
		],
	},
	{
		id: '5',
		name: 'Backend',
		children: [
			{
				id: '6',
				name: 'API',
			},
		],
	},
];

export function CollectionTree() {
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});

	const [selectedId, setSelectedId] = useState('1');

	const toggle = (id: string) => {
		setExpanded((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const renderNode = (collection: any, level = 0) => {
		const children = collection.children || [];

		const hasChildren = children.length > 0;

		const isOpen = expanded[collection.id];

		return (
			<div key={collection.id}>
				<div
					className={cn(
						'w-full group flex items-center gap-2  px-2 rounded-lg cursor-pointer transition-all',
						selectedId === collection.id
							? 'bg-zinc-800 text-white'
							: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
					)}
					style={{
						paddingLeft: `${8 + level * 16}px`,
					}}
					onClick={() => setSelectedId(collection.id)}
				>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();

							if (hasChildren) {
								toggle(collection.id);
							}
						}}
						className="p-0.5 rounded hover:bg-zinc-700"
					>
						<ChevronRight
							className={cn(
								'w-3 h-3 transition-transform',
								isOpen && 'rotate-90',
								!hasChildren && 'opacity-30',
							)}
						/>
					</button>

					<Link
						href={ROUTES.collection.main('TeamId', 'collectionID')}
						className="flex items-center gap-2 w-full py-2 hover:underline"
					>
						<Layers className="w-4 h-4 shrink-0 opacity-60" />

						<span className="text-sm truncate">{collection.name}</span>
					</Link>

					<div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
						<CollectionCreateModal parentId={collection.id} projectId={null} />
						<CollectionEditModal data={collection} />
						<CollectionDelete data={collection} />
					</div>
				</div>

				{isOpen &&
					hasChildren &&
					children.map((child: any) => renderNode(child, level + 1))}
			</div>
		);
	};

	return (
		<div className="space-y-1">
			{collections.map((item) => renderNode(item))}
		</div>
	);
}
