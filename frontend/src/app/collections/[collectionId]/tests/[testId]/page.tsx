'use client';

import { Sidebar } from '@/components/sections/sidebar';
import { TestsPanel } from '@/components/sections/test-panel';
import { TopBar } from '@/components/sections/top-bar';
import { useEffect, useState } from 'react';

import { DetailPanel } from '@/components/sections/detail-panel';
import { RunAllPanel } from '@/components/sections/run-all-panel';
import {
	useGetCollectionQuery,
	useGetCollectionsQuery,
} from '@/store/features/collection/collection-api-slice';
import { Collection } from '@/store/features/collection/collection-type';
import {
	useRunCollectionMutation,
	useRunTestCaseMutation,
} from '@/store/features/test-case/test-case-api-slice';
import { iTestCase } from '@/store/features/test-case/type';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CollectionTestRunnerPage() {
	type ViewMode = 'idle' | 'single' | 'all';
	const params = useParams<{ collectionId: string; testId: string }>();
	const router = useRouter();

	const [viewMode, setViewMode] = useState<ViewMode>('single');
	const selectedColId = params.collectionId;
	const selectedTestId = params.testId;

	const { data: selectedCollectionResponse } = useGetCollectionQuery(
		selectedColId,
		{
			skip: !selectedColId,
		},
	);
	const selectedCollection = (selectedCollectionResponse?.data ??
		null) as Collection | null;

	// infer project from collection (so sidebar stays scoped correctly)
	const [projectId, setProjectId] = useState<string | null>(null);
	useEffect(() => {
		const pid = selectedCollectionResponse?.data?.projectId;
		if (pid !== undefined) setProjectId(pid ?? null);
	}, [selectedCollectionResponse?.data?.projectId]);

	const { data, isLoading } = useGetCollectionsQuery({ projectId });
	const collections: Collection[] = data?.data ?? [];

	const selectedTest: iTestCase | null =
		selectedCollection?.testCases.find((t) => t.id === selectedTestId) ?? null;

	// ─── Run Test Case ──────────────────────────────────────────────────────────
	const [mutation, response] = useRunTestCaseMutation();
	const handleTestCaseRun = async (colId: string, testId: string) => {
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

	const onSelectCollection = (collectionId: string) => {
		router.push(`/collections/${collectionId}`);
	};
	const onSelectTest = (testId: string) => {
		setViewMode('single');
		router.push(`/collections/${selectedColId}/tests/${testId}`);
	};

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
