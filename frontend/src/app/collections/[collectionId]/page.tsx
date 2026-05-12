'use client';

import { Sidebar } from '@/components/sections/sidebar';
import { TestsPanel } from '@/components/sections/test-panel';
import { TopBar } from '@/components/sections/top-bar';
import { useEffect, useMemo, useState } from 'react';

import { DetailPanel } from '@/components/sections/detail-panel';
import { RunAllPanel } from '@/components/sections/run-all-panel';
import {
	useGetCollectionQuery,
	useGetCollectionsQuery,
} from '@/store/features/collections/api-slice';
import { Collection } from '@/store/features/collections/type';
import { useGetProjectsQuery } from '@/store/features/projects/api-slice';
import {
	useRunCollectionMutation,
	useRunTestCaseMutation,
} from '@/store/features/test-case/api-slice';
import { iTestCase } from '@/store/features/test-case/type';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CollectionRunnerPage() {
	type ViewMode = 'idle' | 'single' | 'all';
	const params = useParams<{ collectionId: string }>();
	const router = useRouter();

	const [viewMode, setViewMode] = useState<ViewMode>('idle');
	const { data: projectsData } = useGetProjectsQuery();
	const projects = projectsData?.data ?? [];

	// selected collection (from URL)
	const selectedColId = params.collectionId;
	const { data: selectedCollectionResponse } = useGetCollectionQuery(selectedColId, {
		skip: !selectedColId,
	});

	// infer project from collection (so sidebar stays scoped correctly)
	const [projectId, setProjectId] = useState<string | null>(null);
	useEffect(() => {
		const pid = selectedCollectionResponse?.data?.projectId;
		if (pid !== undefined) setProjectId(pid ?? null);
	}, [selectedCollectionResponse?.data?.projectId]);

	// list collections for sidebar
	const { data, isLoading } = useGetCollectionsQuery({ projectId });
	const collections: Collection[] = data?.data ?? [];

	// default test: first test in collection
	const [selectedTestId, setSelectedTestId] = useState<string>('');
	useEffect(() => {
		const col = selectedCollectionResponse?.data;
		if (!col) return;
		if (!selectedTestId && col.testCases?.length > 0) {
			setSelectedTestId(col.testCases[0].id);
		}
	}, [selectedCollectionResponse?.data, selectedTestId]);

	// ─── Run Test Case ──────────────────────────────────────────────────────────
	const [mutation, response] = useRunTestCaseMutation();
	const handleTestCaseRun = async (colId: string, testId: string) => {
		setSelectedTestId(testId);
		if (response.isLoading) return;
		setViewMode('single');
		try {
			await mutation({ colId, testId }).unwrap();
		} catch {
			toast.error('Failed to Run');
		}
	};

	// ─── Run All ────────────────────────────────────────────────────────────────
	const [runMutation, { isLoading: isRunning }] = useRunCollectionMutation();
	const [colRunResult, setColRunResult] = useState<any>(null);
	const handleRunAll = async () => {
		if (!selectedColId || isRunning) return;
		setViewMode('all');
		try {
			const res = await runMutation(selectedColId).unwrap();
			setColRunResult(res.data);
		} catch {
			toast.error('Failed to run collection');
		}
	};

	useEffect(() => {
		response.reset();
		setColRunResult(null);
	}, [selectedTestId, selectedColId]);

	const selectedCollection = (selectedCollectionResponse?.data ?? null) as Collection | null;
	const selectedTest: iTestCase | null =
		selectedCollection?.testCases.find((t) => t.id === selectedTestId) ?? null;

	const onSelectTest = (testId: string) => {
		setSelectedTestId(testId);
		setViewMode('single');
		router.push(`/collections/${selectedColId}/tests/${testId}`);
	};

	const onSelectCollection = (collectionId: string) => {
		setSelectedTestId('');
		router.push(`/collections/${collectionId}`);
	};

	// pick first project once (only used if collection has no projectId and none selected)
	useEffect(() => {
		if (projectId === null && projects.length > 0) {
			// keep null (unassigned) by default; no auto-switch
		}
	}, [projects, projectId]);

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 font-sans">
			<div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
				<TopBar />

				<div className="flex flex-1 min-h-0">
					{isLoading ? (
						<div className="p-4">Loading collections...</div>
					) : (
						<Sidebar
							collections={collections}
							selectedId={selectedColId}
							onSelect={onSelectCollection}
							projectId={projectId}
							onProjectChange={(next) => {
								setProjectId(next);
								router.push('/');
							}}
						/>
					)}

					<TestsPanel
						collection={selectedCollection}
						selectedTestId={selectedTestId}
						onSelect={onSelectTest}
						onRunAll={handleRunAll}
						onRun={handleTestCaseRun}
					/>

					{viewMode !== 'all' && (
						<DetailPanel
							test={selectedTest}
							collection={selectedCollection}
							mutation={mutation}
							response={response}
						/>
					)}

					{viewMode === 'all' && (
						<RunAllPanel
							isRunning={isRunning}
							result={colRunResult}
							onClose={() => {
								setColRunResult(null);
								setViewMode('idle');
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

