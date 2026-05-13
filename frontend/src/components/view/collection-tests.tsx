'use client';

import { ROUTES } from '@/lib/route';
import { cn } from '@/lib/utils';
import {
	TestCaseCreateModal,
	TestCaseDelete,
	TestCaseEditModal,
} from '@/store/features/test-case';
import { Pencil, Play, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const collection = {
	id: '1',
	name: 'Auth API Tests',
	description: 'Authentication endpoints',
	testCases: [
		{
			id: '1',
			name: 'Login Success',
			request: {
				method: 'POST',
				url: '/api/auth/login',
			},
		},
		{
			id: '2',
			name: 'Register User',
			request: {
				method: 'POST',
				url: '/api/auth/register',
			},
		},
		{
			id: '3',
			name: 'Get Profile',
			request: {
				method: 'GET',
				url: '/api/users/me',
			},
		},
	],
};

function MethodBadge({ method }: { method: string }) {
	return (
		<div className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
			{method}
		</div>
	);
}

function IconBtn({ children, title, variant, onClick }: any) {
	return (
		<button
			onClick={onClick}
			title={title}
			className={cn(
				'h-7 w-7 rounded-md flex items-center justify-center transition-colors',
				variant === 'danger'
					? 'hover:bg-red-500/10 text-red-400'
					: 'hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200',
			)}
		>
			{children}
		</button>
	);
}

export function CollectionTests() {
	const [selectedTestId, setSelectedTestId] = useState('1');
	const router = useRouter();

	return (
		<div className="flex flex-col border-r border-zinc-800 w-72 shrink-0 h-screen bg-zinc-950">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 gap-1">
				<div>
					<p className="text-[13px] font-semibold line-clamp-1 text-zinc-100">
						{collection.name}
					</p>

					<p className="text-[10px] line-clamp-1 text-zinc-500">
						{collection.description}
					</p>
				</div>

				<TestCaseCreateModal colId={'colid'} />

				<Link
					href={ROUTES.collection.rulAll('runAllTeamId', 'RunAllCollectionID')}
					className="h-8 px-3 rounded-lg bg-zinc-100 text-zinc-900 text-[12px] font-medium flex items-center gap-1 hover:opacity-90"
				>
					<Play className="w-3 h-3" />
					Run
				</Link>
			</div>

			{/* Test list */}
			<div className="flex-1 overflow-y-auto p-2 space-y-1">
				{collection.testCases.length === 0 && (
					<div className="flex flex-col items-center justify-center h-32 text-zinc-600 text-[13px] gap-2">
						<Terminal className="w-5 h-5" />
						No tests yet
					</div>
				)}

				{collection.testCases.map((test) => (
					<div
						key={test.id}
						className={cn(
							'group rounded-lg px-3 py-2.5   transition-all duration-150 border',
							selectedTestId === test.id
								? 'bg-zinc-800 border-zinc-700'
								: 'bg-transparent border-transparent hover:bg-zinc-800/50 hover:border-zinc-800',
						)}
					>
						<Link
							href={ROUTES.collection.api('teamId', 'collectionId', 'apiID')}
						>
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<MethodBadge method={test.request.method} />

									<span className="text-[13px] font-medium text-zinc-200 truncate">
										{test.name}
									</span>
								</div>
							</div>

							<div className="text-[11px] text-zinc-600 mt-1.5 truncate font-mono">
								{test.request.url}
							</div>
						</Link>

						{/* Actions */}
						<div
							className={cn(
								'flex gap-1 mt-2 pt-2 border-t border-zinc-700/50 transition-all duration-150',
								selectedTestId === test.id
									? 'opacity-100'
									: 'opacity-0 group-hover:opacity-100',
							)}
						>
							<IconBtn
								title="Run"
								onClick={() => {
									router.push(
										ROUTES.collection.api('teamId', 'collectionId', 'apiID'),
									);
								}}
							>
								<Play className="w-3.5 h-3.5" />
							</IconBtn>

							<TestCaseEditModal data={test} colId={collection.id}>
								<IconBtn title="Edit">
									<Pencil className="w-3.5 h-3.5" />
								</IconBtn>
							</TestCaseEditModal>

							<div className="flex-1" />
							<TestCaseDelete colId="sdf" testId="df" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
