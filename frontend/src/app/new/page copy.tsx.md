'use client';

import { DetailPanel } from '@/components/sections/detail-panel';
import { Sidebar } from '@/components/sections/sidebar';
import { TestsPanel } from '@/components/sections/test-panel';
import { TopBar } from '@/components/sections/top-bar';
import { Collection, TestCase } from '@/type';
import { useState } from 'react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COLLECTIONS: Collection[] = [
	{
		id: 'col-1',
		name: 'Test',
		tests: [],
	},
	{
		id: 'col-2',
		name: 'ABC',
		tests: [
			{
				id: 'tc-1',
				name: 'Get collections',
				method: 'GET',
				url: 'http://localhost:4000/collections',
				expectedStatus: 200,
				bodyMode: 'contains',
				bodyContent: '{}',
				lastResult: {
					status: 'pass',
					durationMs: 8,
					httpStatus: 200,
					responseBody: JSON.stringify(
						{
							data: [
								{
									id: '65d7db4d',
									name: 'test',
									testCases: [],
									createdAt: '2026-05-02T01:30:49.721Z',
								},
								{
									id: '0546a9ec',
									name: 'NEw',
									testCases: [],
									createdAt: '2026-05-02T01:31:10.854Z',
								},
								{
									id: '4777adaa',
									name: 'ABC',
									testCases: [
										{ id: '36366336', name: 'Get collections' },
										{ id: 'd9ee71c6', name: 'Create collection' },
									],
									createdAt: '2026-05-02T01:31:21.607Z',
								},
							],
							total: 3,
						},
						null,
						2,
					),
					assertions: [
						{
							name: 'status',
							description: 'Status 200 matches expected 200',
							passed: true,
						},
						{
							name: 'body',
							description: 'Response body contains {}',
							passed: true,
						},
					],
				},
			},
			{
				id: 'tc-2',
				name: 'Create collection',
				method: 'POST',
				url: 'http://localhost:4000/collections',
				expectedStatus: 201,
				bodyMode: 'contains',
				bodyContent: '{ "id": "" }',
				lastResult: {
					status: 'fail',
					durationMs: 14,
					httpStatus: 400,
					responseBody: JSON.stringify({ error: 'name is required' }, null, 2),
					assertions: [
						{
							name: 'status',
							description: 'Status 400 does not match expected 201',
							passed: false,
						},
					],
				},
			},
			{
				id: 'tc-3',
				name: 'Delete collection',
				method: 'DELETE',
				url: 'http://localhost:4000/collections/:id',
				expectedStatus: 204,
				bodyMode: 'none',
				bodyContent: '',
			},
		],
	},
	{
		id: 'col-3',
		name: 'Auth',
		tests: [
			{
				id: 'tc-4',
				name: 'Login',
				method: 'POST',
				url: 'http://localhost:4000/auth/login',
				expectedStatus: 200,
				bodyMode: 'contains',
				bodyContent: '{ "token": "" }',
			},
		],
	},
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
	const [collections, setCollections] =
		useState<Collection[]>(MOCK_COLLECTIONS);
	const [selectedColId, setSelectedColId] = useState(MOCK_COLLECTIONS[1].id);
	const [selectedTestId, setSelectedTestId] = useState(
		MOCK_COLLECTIONS[1].tests[0].id,
	);

	const selectedCollection =
		collections.find((c) => c.id === selectedColId) ?? null;
	const selectedTest =
		selectedCollection?.tests.find((t) => t.id === selectedTestId) ?? null;

	const handleDeleteCollection = (id: string) => {
		setCollections((prev) => prev.filter((c) => c.id !== id));
		if (selectedColId === id) setSelectedColId(collections[0]?.id ?? '');
	};

	const handleCreateCollection = () => {
		const name = `Collection ${collections.length + 1}`;
		const newCol: Collection = { id: `col-${Date.now()}`, name, tests: [] };
		setCollections((prev) => [...prev, newCol]);
		setSelectedColId(newCol.id);
	};

	const handleDeleteTest = (id: string) => {
		setCollections((prev) =>
			prev.map((c) =>
				c.id === selectedColId
					? { ...c, tests: c.tests.filter((t) => t.id !== id) }
					: c,
			),
		);
		if (selectedTestId === id) setSelectedTestId('');
	};

	const handleCreateTest = () => {
		const newTest: TestCase = {
			id: `tc-${Date.now()}`,
			name: 'New test',
			method: 'GET',
			url: 'http://localhost:4000/',
			expectedStatus: 200,
			bodyMode: 'none',
			bodyContent: '',
		};
		setCollections((prev) =>
			prev.map((c) =>
				c.id === selectedColId ? { ...c, tests: [...c.tests, newTest] } : c,
			),
		);
		setSelectedTestId(newTest.id);
	};

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 font-sans">
			<div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
				{/* Top bar */}
				<TopBar />

				{/* Main panels */}
				<div className="flex flex-1 min-h-0">
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
					<TestsPanel
						collection={selectedCollection}
						selectedTestId={selectedTestId}
						onSelect={setSelectedTestId}
						onDelete={handleDeleteTest}
						onCreate={handleCreateTest}
						onRunAll={() => {}}
						onRun={() => {}}
					/>
					<DetailPanel test={selectedTest} />
				</div>
			</div>
		</div>
	);
}
