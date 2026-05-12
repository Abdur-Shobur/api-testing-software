'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Btn } from '@/components/ui/main-btn';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	useCreateProjectMutation,
	useDeleteProjectMutation,
	useGetProjectsQuery,
} from '@/store/features/projects/api-slice';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProjectsPage() {
	const { data, isLoading } = useGetProjectsQuery();
	const projects = data?.data ?? [];
	const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
	const [deleteProject] = useDeleteProjectMutation();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const onCreate = async () => {
		if (!name.trim()) return;
		try {
			await createProject({ name: name.trim(), description }).unwrap();
			setName('');
			setDescription('');
			toast.success('Project created');
		} catch {
			toast.error('Failed to create project');
		}
	};

	const onDelete = async (id: string) => {
		if (!confirm('Delete this project?')) return;
		try {
			await deleteProject(id).unwrap();
			toast.success('Project deleted');
		} catch {
			toast.error('Failed to delete project');
		}
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold">Projects</h1>
					<Link
						href="/"
						className="text-xs text-zinc-400 hover:text-zinc-200"
					>
						Back to runner
					</Link>
				</div>

				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle>Create project</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Input
							placeholder="Project name"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<Textarea
							placeholder="Description (optional)"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
						<Btn
							variant="primary"
							onClick={() => void onCreate()}
							disabled={isCreating}
						>
							{isCreating ? 'Creating...' : 'Create'}
						</Btn>
					</CardContent>
				</Card>

				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle>All projects</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="text-sm text-zinc-400">Loading...</div>
						) : projects.length === 0 ? (
							<div className="text-sm text-zinc-400">No projects yet.</div>
						) : (
							<div className="space-y-2">
								{projects.map((p) => (
									<div
										key={p.id ?? p._id}
										className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2"
									>
										<div className="min-w-0">
											<div className="text-sm font-medium truncate">
												{p.name}
											</div>
											<div className="text-xs text-zinc-500 truncate">
												{p.description || '—'}
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<Link
												href={`/projects/${p.id ?? p._id}`}
												className="text-xs text-orange-300 hover:text-orange-200"
											>
												Open
											</Link>
											<button
												type="button"
												onClick={() => void onDelete(String(p.id ?? p._id))}
												className="text-xs text-rose-400 hover:text-rose-300"
											>
												Delete
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

