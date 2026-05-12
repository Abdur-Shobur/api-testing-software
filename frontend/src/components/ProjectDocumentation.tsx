'use client';

import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChevronRight, Layers } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MethodBadge } from './ui/method-badge';
import { Chip } from './ui/chip';

type ApiTestCase = {
	id: string;
	name: string;
	request: { method: any; url: string };
};

type Doc = {
	title: string;
	content: string;
};

export type ProjectDocNode = {
	id: string;
	_id: string;
	name: string;
	description?: string;
	parentId: string | null;
	documentation: Doc | null;
	testCases: ApiTestCase[];
	children: ProjectDocNode[];
};

export function ProjectDocumentation({ projectId }: { projectId: string }) {
	const [tree, setTree] = useState<ProjectDocNode[]>([]);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const [selectedId, setSelectedId] = useState<string>('');

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		apiClient
			.get<{ data: { projectId: string; tree: ProjectDocNode[] } }>(
				`/projects/${projectId}/documentation`,
			)
			.then(({ data }) => {
				if (!mounted) return;
				setTree(data.data.tree ?? []);
				const first = data.data.tree?.[0];
				if (first) setSelectedId(first._id ?? first.id);
			})
			.catch(() => toast.error('Failed to load project documentation'))
			.finally(() => mounted && setLoading(false));
		return () => {
			mounted = false;
		};
	}, [projectId]);

	const selected = useMemo(() => {
		const walk = (nodes: ProjectDocNode[]): ProjectDocNode | null => {
			for (const n of nodes) {
				if (n._id === selectedId || n.id === selectedId) return n;
				const hit = walk(n.children ?? []);
				if (hit) return hit;
			}
			return null;
		};
		return selectedId ? walk(tree) : null;
	}, [tree, selectedId]);

	const toggle = (id: string) =>
		setExpanded((cur) => ({ ...cur, [id]: !cur[id] }));

	const renderNode = (node: ProjectDocNode, level: number) => {
		const id = node._id ?? node.id;
		const hasChildren = (node.children ?? []).length > 0;
		const isOpen = expanded[id] ?? level === 0;
		const isSelected = selectedId === id;

		return (
			<div key={id}>
				<div
					className={cn(
						'w-full flex items-center justify-between group pr-2 py-2 rounded-lg text-left transition-all duration-150',
						isSelected
							? 'bg-zinc-800 text-zinc-100'
							: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
					)}
					style={{ paddingLeft: `${8 + level * 16}px` }}
				>
					<div className="flex items-center gap-1 min-w-0">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								if (hasChildren) toggle(id);
							}}
							className="p-0.5 rounded hover:bg-zinc-700"
							title="Expand"
						>
							<ChevronRight
								className={cn(
									'w-3 h-3 transition-transform',
									hasChildren ? (isOpen ? 'rotate-90' : '') : 'opacity-30',
								)}
							/>
						</button>
						<button
							type="button"
							onClick={() => setSelectedId(id)}
							className="flex items-center gap-2 min-w-0 text-left"
						>
							<Layers className="w-3.5 h-3.5 shrink-0 opacity-60" />
							<span className="text-[13px] font-medium truncate">{node.name}</span>
						</button>
					</div>
					<div className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100">
						{node.testCases?.length ?? 0} APIs
					</div>
				</div>
				{hasChildren && isOpen && node.children.map((c) => renderNode(c, level + 1))}
			</div>
		);
	};

	if (loading) {
		return <div className="text-sm text-zinc-400">Loading documentation…</div>;
	}

	return (
		<div className="grid grid-cols-[260px_1fr] gap-4 min-h-[520px]">
			<div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-2 overflow-y-auto">
				<div className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
					Collections
				</div>
				<div className="space-y-0.5">{tree.map((n) => renderNode(n, 0))}</div>
			</div>

			<div className="border border-zinc-800 rounded-xl bg-zinc-900/50 overflow-hidden">
				<div className="px-4 py-3 border-b border-zinc-800">
					<div className="text-sm font-semibold text-zinc-100">
						{selected?.name ?? 'Select a collection'}
					</div>
					<div className="text-xs text-zinc-500 truncate">
						{selected?.description || '—'}
					</div>
				</div>

				<div className="p-4 space-y-5 overflow-y-auto max-h-[520px]">
					<section>
						<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
							Documentation
						</div>
						{selected?.documentation ? (
							<div className="space-y-2">
								<div className="text-sm font-medium text-zinc-200">
									{selected.documentation.title}
								</div>
								<pre className="whitespace-pre-wrap wrap-break-word text-xs text-zinc-300 bg-zinc-950/40 border border-zinc-800 rounded-lg p-3">
									{selected.documentation.content}
								</pre>
							</div>
						) : (
							<div className="text-xs text-zinc-500">
								No documentation saved for this collection yet.
							</div>
						)}
					</section>

					<section>
						<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
							All APIs
						</div>
						{(selected?.testCases ?? []).length === 0 ? (
							<div className="text-xs text-zinc-500">No APIs in this collection.</div>
						) : (
							<div className="space-y-2">
								{(selected?.testCases ?? []).map((tc) => (
									<div
										key={tc.id}
										className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2"
									>
										<div className="min-w-0 flex items-center gap-2">
											<MethodBadge method={tc.request.method} />
											<div className="min-w-0">
												<div className="text-xs text-zinc-200 truncate">{tc.name}</div>
												<div className="text-[11px] text-zinc-500 font-mono truncate">
													{tc.request.url}
												</div>
											</div>
										</div>
										<Chip className="shrink-0" mono>
											{tc.id.slice(-6)}
										</Chip>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
	);
}

