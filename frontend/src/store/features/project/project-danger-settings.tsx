'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/route';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteProjectMutation, useGetProjectQuery } from './api-slice';

export function ProjectDangerSettings({ projectId }: { projectId: string }) {
	const router = useRouter();
	const { data } = useGetProjectQuery(projectId, { skip: !projectId });
	const [deleteProject, { isLoading }] = useDeleteProjectMutation();
	const [confirmText, setConfirmText] = useState('');

	const project = data?.data;
	const projectName = project?.name ?? '';
	const canDelete = confirmText === projectName;

	const handleDelete = async () => {
		if (!canDelete) return;
		try {
			await deleteProject(projectId).unwrap();
			toast.success('Project deleted');
			router.push(ROUTES.team.main);
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to delete project');
		}
	};

	if (!project) {
		return (
			<Card className="bg-zinc-900 border-zinc-800">
				<CardContent className="p-6">
					<div className="h-40 flex items-center justify-center text-zinc-600 text-sm">
						Select a project to view settings
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-zinc-900 border-rose-900/50">
			<CardHeader>
				<CardTitle className="text-rose-400">Danger Zone</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="rounded-lg border border-rose-900/50 p-4 space-y-4">
					<div>
						<h3 className="text-sm font-semibold text-zinc-200">
							Delete this project
						</h3>
						<p className="text-xs text-zinc-500 mt-1">
							Once you delete a project, all its collections, test cases, and
							data will be permanently removed. This action cannot be undone.
						</p>
					</div>

					<div className="space-y-2">
						<Label className="text-xs text-zinc-400">
							Type{' '}
							<span className="font-semibold text-zinc-200">{projectName}</span>{' '}
							to confirm
						</Label>
						<Input
							value={confirmText}
							onChange={(e) => setConfirmText(e.target.value)}
							placeholder={projectName}
							className="bg-zinc-950 border-zinc-800"
						/>
					</div>

					<Button
						type="button"
						disabled={!canDelete || isLoading}
						onClick={handleDelete}
						className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40"
					>
						{isLoading ? 'Deleting...' : 'Delete Project'}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
