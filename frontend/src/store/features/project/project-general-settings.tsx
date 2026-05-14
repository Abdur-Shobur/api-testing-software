'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGetProjectQuery, useUpdateProjectMutation } from './api-slice';
import { getProjectSettings } from './type';

export function ProjectGeneralSettings({ projectId }: { projectId: string }) {
	const { data } = useGetProjectQuery(projectId, { skip: !projectId });
	const [updateProject, { isLoading }] = useUpdateProjectMutation();

	const project = data?.data;
	const settings = getProjectSettings(project);

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const [authorization, setAuthorization] = useState('');

	useEffect(() => {
		if (project) {
			setName(project.name ?? '');
			setDescription(project.description ?? '');
			setBaseUrl(settings?.baseUrl ?? project.baseUrl ?? '');
			setAuthorization(settings?.authorization?.trim() ?? '');
		}
	}, [project, settings]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error('Project name is required');
			return;
		}
		try {
			await updateProject({
				id: projectId,
				body: { name, description, baseUrl, authorization },
			}).unwrap();
			toast.success('Project updated');
		} catch (error: unknown) {
			const err = error as { data?: { error?: string } };
			toast.error(err?.data?.error ?? 'Failed to update project');
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
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card className="bg-zinc-900 border-zinc-800">
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="space-y-2">
						<Label>Project Name</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-zinc-950 border-zinc-800"
						/>
					</div>

					<div className="space-y-2">
						<Label>Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="bg-zinc-950 border-zinc-800 min-h-[100px]"
						/>
					</div>

					<div className="space-y-2">
						<Label>Base URL</Label>
						<Input
							value={baseUrl}
							onChange={(e) => setBaseUrl(e.target.value)}
							placeholder="https://api.example.com"
							className="bg-zinc-950 border-zinc-800 font-mono text-sm"
						/>
						<p className="text-xs text-zinc-600">
							Used as prefix for all API requests in this project
						</p>
					</div>
					<div className="space-y-2">
						<Label>Authorization</Label>
						<Input
							value={authorization}
							onChange={(e) => setAuthorization(e.target.value)}
							placeholder="Bearer <token>"
							className="bg-zinc-950 border-zinc-800 font-mono text-sm"
						/>
						<p className="text-xs text-zinc-600">
							Used as token for all api req
						</p>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						className="bg-orange-500 hover:bg-orange-600"
					>
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</CardContent>
			</Card>
		</form>
	);
}
