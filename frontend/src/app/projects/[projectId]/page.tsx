'use client';

import { EnvVarsPanel } from '@/components/EnvVarsPanel';
import { ProjectDocumentation } from '@/components/ProjectDocumentation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Btn } from '@/components/ui/main-btn';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	useGetProjectQuery,
	useUpdateProjectMutation,
} from '@/store/features/projects/api-slice';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type Tab = 'settings' | 'env' | 'docs';

export default function ProjectDetailPage() {
	const params = useParams<{ projectId: string }>();
	const projectId = params.projectId;
	const { data, isLoading } = useGetProjectQuery(projectId);
	const project = data?.data;
	const [update, { isLoading: isSaving }] = useUpdateProjectMutation();

	const [tab, setTab] = useState<Tab>('settings');

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'apiKey'>(
		'none',
	);
	const [bearerToken, setBearerToken] = useState('');
	const [basicUsername, setBasicUsername] = useState('');
	const [basicPassword, setBasicPassword] = useState('');
	const [apiKeyKey, setApiKeyKey] = useState('');
	const [apiKeyValue, setApiKeyValue] = useState('');
	const [apiKeyIn, setApiKeyIn] = useState<'header' | 'query'>('header');

	useEffect(() => {
		if (!project) return;
		setName(project.name ?? '');
		setDescription(project.description ?? '');
		setBaseUrl(project.baseUrl ?? '');
		const type = project.auth?.type ?? 'none';
		setAuthType(type);
		setBearerToken(project.auth?.bearerToken ?? '');
		setBasicUsername(project.auth?.username ?? '');
		setBasicPassword(project.auth?.password ?? '');
		setApiKeyKey(project.auth?.apiKeyKey ?? '');
		setApiKeyValue(project.auth?.apiKeyValue ?? '');
		setApiKeyIn(project.auth?.apiKeyIn ?? 'header');
	}, [project]);

	const authPayload = useMemo(() => {
		if (authType === 'bearer') return { type: 'bearer', bearerToken };
		if (authType === 'basic')
			return { type: 'basic', username: basicUsername, password: basicPassword };
		if (authType === 'apiKey')
			return {
				type: 'apiKey',
				apiKeyKey,
				apiKeyValue,
				apiKeyIn,
			};
		return { type: 'none' };
	}, [
		authType,
		bearerToken,
		basicUsername,
		basicPassword,
		apiKeyKey,
		apiKeyValue,
		apiKeyIn,
	]);

	const onSave = async () => {
		if (!name.trim()) return;
		try {
			await update({
				id: projectId,
				body: {
					name: name.trim(),
					description,
					baseUrl,
					auth: authPayload,
				} as any,
			}).unwrap();
			toast.success('Project updated');
		} catch {
			toast.error('Failed to update project');
		}
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold">
							{isLoading ? 'Loading…' : project?.name ?? 'Project'}
						</h1>
						<div className="text-xs text-zinc-500">
							<Link href="/projects" className="hover:text-zinc-300">
								Projects
							</Link>
							<span className="mx-2">/</span>
							<Link href="/" className="hover:text-zinc-300">
								Runner
							</Link>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setTab('settings')}
							className={
								tab === 'settings'
									? 'text-xs text-zinc-100'
									: 'text-xs text-zinc-500 hover:text-zinc-300'
							}
						>
							Settings
						</button>
						<button
							type="button"
							onClick={() => setTab('env')}
							className={
								tab === 'env'
									? 'text-xs text-zinc-100'
									: 'text-xs text-zinc-500 hover:text-zinc-300'
							}
						>
							Env vars
						</button>
						<button
							type="button"
							onClick={() => setTab('docs')}
							className={
								tab === 'docs'
									? 'text-xs text-zinc-100'
									: 'text-xs text-zinc-500 hover:text-zinc-300'
							}
						>
							Docs
						</button>
					</div>
				</div>

				{tab === 'settings' && (
					<Card>
						<CardHeader>
							<CardTitle>Project settings</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="text-xs text-zinc-400">Name</div>
								<Input value={name} onChange={(e) => setName(e.target.value)} />
							</div>

							<div className="space-y-2">
								<div className="text-xs text-zinc-400">Description</div>
								<Textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<div className="text-xs text-zinc-400">Base API route</div>
								<Input
									placeholder="https://api.example.com"
									value={baseUrl}
									onChange={(e) => setBaseUrl(e.target.value)}
								/>
								<div className="text-[11px] text-zinc-500">
									Used to prefix test-case URLs that start with <code>/</code>.
								</div>
							</div>

							<div className="space-y-2">
								<div className="text-xs text-zinc-400">Authorization</div>
								<Select value={authType} onValueChange={(v) => setAuthType(v as any)}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										<SelectItem value="bearer">Bearer token</SelectItem>
										<SelectItem value="basic">Basic</SelectItem>
										<SelectItem value="apiKey">API key</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{authType === 'bearer' && (
								<div className="space-y-2">
									<div className="text-xs text-zinc-400">Bearer token</div>
									<Input
										value={bearerToken}
										onChange={(e) => setBearerToken(e.target.value)}
										placeholder="eyJhbGciOi..."
									/>
								</div>
							)}

							{authType === 'basic' && (
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<div className="text-xs text-zinc-400">Username</div>
										<Input
											value={basicUsername}
											onChange={(e) => setBasicUsername(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<div className="text-xs text-zinc-400">Password</div>
										<Input
											type="password"
											value={basicPassword}
											onChange={(e) => setBasicPassword(e.target.value)}
										/>
									</div>
								</div>
							)}

							{authType === 'apiKey' && (
								<div className="space-y-3">
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<div className="text-xs text-zinc-400">Key</div>
											<Input
												value={apiKeyKey}
												onChange={(e) => setApiKeyKey(e.target.value)}
												placeholder="x-api-key"
											/>
										</div>
										<div className="space-y-2">
											<div className="text-xs text-zinc-400">Value</div>
											<Input
												value={apiKeyValue}
												onChange={(e) => setApiKeyValue(e.target.value)}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<div className="text-xs text-zinc-400">Send in</div>
										<Select
											value={apiKeyIn}
											onValueChange={(v) => setApiKeyIn(v as any)}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="header">Header</SelectItem>
												<SelectItem value="query">Query param</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							)}

							<div className="pt-2">
								<Btn
									variant="primary"
									onClick={() => void onSave()}
								>
									{isSaving ? 'Saving…' : 'Save'}
								</Btn>
							</div>
						</CardContent>
					</Card>
				)}

				{tab === 'env' && (
					<Card>
						<CardHeader>
							<CardTitle>Environment variables</CardTitle>
						</CardHeader>
						<CardContent>
							<EnvVarsPanel projectId={projectId} />
						</CardContent>
					</Card>
				)}

				{tab === 'docs' && (
					<Card>
						<CardHeader>
							<CardTitle>Project documentation</CardTitle>
						</CardHeader>
						<CardContent>
							<ProjectDocumentation projectId={projectId} />
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

