'use client';

import { DetailPanel } from '@/components/sections/detail-panel';
import { Sidebar } from '@/components/sections/sidebar';
import { TestsPanel } from '@/components/sections/test-panel';
import { TopBar } from '@/components/sections/top-bar';
import { useEffect, useState } from 'react';

import { useGetCollectionsQuery } from '@/store/features/collections/api-slice';
import { Collection } from '@/store/features/collections/type';
import { iTestCase } from '@/store/features/test-case/type';

export default function Home() {
	// ─── API ────────────────────────────────────────────────────────────────
	const { data, isLoading } = useGetCollectionsQuery();
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

	// ───   data ─────────────────────────────────────────────────────
	const selectedCollection: Collection | null =
		collections.find((c) => c.id === selectedColId) ?? null;

	const selectedTest: iTestCase | null =
		selectedCollection?.testCases.find((t) => t.id === selectedTestId) ?? null;

	// ─── Handlers (UI only for now) ─────────────────────────────────────────
	const handleCreateCollection = () => {
		console.warn('Hook up createCollection mutation');
	};

	const handleDeleteCollection = (id: string) => {
		console.warn('Hook up deleteCollection mutation', id);
	};

	const handleCreateTest = () => {
		console.warn('Hook up createTestCase mutation');
	};

	const handleDeleteTest = (id: string) => {
		console.warn('Hook up deleteTestCase mutation', id);
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
							onDelete={handleDeleteCollection}
							onCreate={handleCreateCollection}
						/>
					)}

					<TestsPanel
						collection={selectedCollection}
						selectedTestId={selectedTestId}
						onSelect={setSelectedTestId}
						onDelete={handleDeleteTest}
						onCreate={handleCreateTest}
						onRunAll={() => {}}
						onRun={() => {}}
					/>

					<DetailPanel test={selectedTest} collection={selectedCollection} />
				</div>
			</div>
		</div>
	);
}
