'use client';

import { Sidebar } from '@/components/sections/sidebar';
import { TestsPanel } from '@/components/sections/test-panel';
import { TopBar } from '@/components/sections/top-bar';
import { useEffect, useState } from 'react';

import { DetailPanel } from '@/components/sections/detail-panel';
import { RunAllPanel } from '@/components/sections/run-all-panel';
import { useGetCollectionsQuery } from '@/store/features/collections/api-slice';
import { Collection } from '@/store/features/collections/type';
import {
	useRunCollectionMutation,
	useRunTestCaseMutation,
} from '@/store/features/test-case/api-slice';
import { iTestCase } from '@/store/features/test-case/type';
import { toast } from 'sonner';

export default function Home() {
	type ViewMode = 'idle' | 'single' | 'all';

	const [viewMode, setViewMode] = useState<ViewMode>('idle');
	// ─── API ────────────────────────────────────────────────────────────────
	const { data, isLoading } = useGetCollectionsQuery();
	const [runMutation, { isLoading: isRunning }] = useRunCollectionMutation();
	const collections: Collection[] = data?.data ?? [];

	// ─── State ──────────────────────────────────────────────────────────────
	const [selectedColId, setSelectedColId] = useState<string>('');
	const [selectedTestId, setSelectedTestId] = useState<string>('');

	// ─── Sync selection when data loads ─────────────────────────────────────
	useEffect(() => {
		if (collections?.length > 0 && !selectedColId) {
			const firstCol = collections[0];
			setSelectedColId(firstCol.id);

			if (firstCol.testCases?.length > 0) {
				setSelectedTestId(firstCol.testCases[0].id);
			}
		}
	}, [collections, selectedColId]);

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

	// add state
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
		// setViewMode('idle');
		setColRunResult(null);
	}, [selectedTestId, selectedColId]);

	// ───   data ─────────────────────────────────────────────────────
	const selectedCollection: Collection | null =
		collections.find((c) => c.id === selectedColId) ?? null;

	const selectedTest: iTestCase | null =
		selectedCollection?.testCases.find((t) => t.id === selectedTestId) ?? null;

	const handleSelectId = (id: string) => {
		setSelectedTestId(id);
		setViewMode('single');
	};
	// ─── UI ─────────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 font-sans">
			<div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
				{/* Top bar */}
				<TopBar />

				{/* Main panels */}
				<div className="flex flex-1 min-h-0">
					{isLoading ? (
						<div className="p-4">Loading collections...</div>
					) : (
						<Sidebar
							collections={collections}
							selectedId={selectedColId}
							onSelect={(id) => {
								setSelectedColId(id);
								setSelectedTestId('');
							}}
						/>
					)}

					<TestsPanel
						collection={selectedCollection}
						selectedTestId={selectedTestId}
						onSelect={handleSelectId}
						onRunAll={handleRunAll}
						onRun={handleTestCaseRun}
					/>

					{viewMode === 'single' && (
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
