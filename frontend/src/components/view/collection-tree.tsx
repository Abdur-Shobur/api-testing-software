'use client';

import { ROUTES } from '@/lib/route';
import { cn } from '@/lib/utils';
import { useGetCollectionChildrenQuery } from '@/store/features/collection/collection-api-slice';
import { CollectionCreateModal } from '@/store/features/collection/collection-create-modal';
import { CollectionDelete } from '@/store/features/collection/collection-delete';
import { CollectionEditModal } from '@/store/features/collection/collection-edit-modal';
import { Collection } from '@/store/features/collection/collection-type';
import { useGetCollectionsByProjectIdQuery } from '@/store/features/project/api-slice';
import { useProjectContext } from '@/store/features/project/project-context';
import { ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

function TreeNode({
	collection,
	level,
	teamId,
	projectId,
	selectedCollectionId,
}: {
	collection: Collection;
	level: number;
	teamId: string;
	projectId: string | null;
	selectedCollectionId: string | null;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const colId = collection._id ?? collection.id;
	const isSelected = selectedCollectionId === colId;

	const { data: childrenData } = useGetCollectionChildrenQuery(
		{ id: colId, projectId },
		{ skip: !isOpen }
	);
	const children = childrenData?.data ?? [];
	const hasChildren = children.length > 0 || !childrenData;

	return (
		<div>
			<div
				className={cn(
					'w-full group flex items-center gap-2 px-2 rounded-lg cursor-pointer transition-all',
					isSelected
						? 'bg-zinc-800 text-white'
						: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
				)}
				style={{ paddingLeft: `${8 + level * 16}px` }}
			>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setIsOpen((prev) => !prev);
					}}
					className="p-0.5 rounded hover:bg-zinc-700"
				>
					<ChevronRight
						className={cn(
							'w-3 h-3 transition-transform',
							isOpen && 'rotate-90',
							childrenData && children.length === 0 && 'opacity-30'
						)}
					/>
				</button>

				<Link
					href={ROUTES.collection.main(teamId, colId)}
					className="flex items-center gap-2 w-full py-2 hover:underline"
				>
					<Layers className="w-4 h-4 shrink-0 opacity-60" />
					<span className="text-sm truncate">{collection.name}</span>
				</Link>

				<div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100">
					<CollectionCreateModal parentId={colId} projectId={projectId} />
					<CollectionEditModal data={collection} />
					<CollectionDelete data={collection} />
				</div>
			</div>

			{isOpen &&
				children.map((child) => (
					<TreeNode
						key={child._id ?? child.id}
						collection={child}
						level={level + 1}
						teamId={teamId}
						projectId={projectId}
						selectedCollectionId={selectedCollectionId}
					/>
				))}
		</div>
	);
}

export function CollectionTree() {
	const params = useParams();
	const pathname = usePathname();
	const teamId = params.teamId as string;
	const { projectId } = useProjectContext();

	const { data, isLoading } = useGetCollectionsByProjectIdQuery(
		projectId ?? '',
		{ skip: !projectId }
	);
	const collections = data?.data ?? [];

	const pathParts = pathname.split('/');
	const collectionIdx = pathParts.indexOf('collection');
	const selectedCollectionId =
		collectionIdx >= 0 ? pathParts[collectionIdx + 1] : null;

	if (!projectId) {
		return (
			<div className="px-3 py-6 text-center text-xs text-zinc-600">
				Select a project to view collections
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-1.5 px-2">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-8 rounded-lg bg-zinc-800/50 animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (collections.length === 0) {
		return (
			<div className="px-3 py-6 text-center text-xs text-zinc-600">
				No collections yet
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{collections.map((item) => (
				<TreeNode
					key={item._id ?? item.id}
					collection={item}
					level={0}
					teamId={teamId}
					projectId={projectId}
					selectedCollectionId={selectedCollectionId}
				/>
			))}
		</div>
	);
}
