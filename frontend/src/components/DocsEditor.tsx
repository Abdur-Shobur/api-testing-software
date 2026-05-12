'use client';

import { apiClient } from '@/lib/api';
import { Documentation } from '@/type';
import { marked } from 'marked';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';

export function DocsEditor({ collectionId }: { collectionId: string }) {
	const [content, setContent] = useState('');
	const [title, setTitle] = useState('Documentation');
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(true);

	useEffect(() => {
		let mounted = true;
		apiClient
			.get<{ data: Documentation | null }>(`/collections/${collectionId}/docs`)
			.then(({ data }) => {
				if (!mounted) return;
				setTitle(data.data?.title ?? 'Documentation');
				setContent(data.data?.content ?? '');
				setSaved(true);
			})
			.catch(() => toast.error('Failed to load documentation'));
		return () => {
			mounted = false;
		};
	}, [collectionId]);

	useEffect(() => {
		setSaved(false);
		const timeout = window.setTimeout(() => {
			setSaving(true);
			apiClient
				.post(`/collections/${collectionId}/docs`, { title, content })
				.then(() => setSaved(true))
				.catch(() => toast.error('Failed to save documentation'))
				.finally(() => setSaving(false));
		}, 1000);

		return () => window.clearTimeout(timeout);
	}, [collectionId, title, content]);

	const html = useMemo(() => ({ __html: marked.parse(content) as string }), [content]);

	return (
		<div className="flex flex-col h-full min-h-0">
			<div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
				<input
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					className="bg-transparent text-sm font-semibold text-zinc-100 outline-none"
				/>
				<span className="text-xs text-zinc-500">
					{saving ? 'Saving...' : saved ? 'Saved' : 'Unsaved'}
				</span>
			</div>
			<div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
				<div className="border-r border-zinc-800 p-4 min-h-0">
					<Textarea
						value={content}
						onChange={(event) => setContent(event.target.value)}
						className="h-full min-h-[400px] font-mono text-xs"
						placeholder="# Collection docs"
					/>
				</div>
				<div
					className="p-5 overflow-y-auto prose prose-invert max-w-none prose-headings:text-zinc-100 prose-code:text-orange-300 prose-pre:bg-zinc-950 prose-blockquote:border-orange-400"
					dangerouslySetInnerHTML={html}
				/>
			</div>
		</div>
	);
}
