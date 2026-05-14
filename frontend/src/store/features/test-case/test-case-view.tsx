'use client';

import { MethodBadge } from '@/components/ui/method-badge';
import { ROUTES } from '@/lib/route';
import { cn } from '@/lib/utils';
import { Loader2, Pencil, Play, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useGetTestCasesQuery } from './test-case-api-slice';
import { TestCaseCreateModal } from './test-case-create-modal';
import { TestCaseDelete } from './test-case-delete';
import { TestCaseEditModal } from './test-case-edit-modal';
import { iTestCase } from './type';

export function TestCaseView() {
	const pathname = usePathname();
	const params = useParams();
	const collectionId = (params?.collectionid as string[])?.[0] ?? '';
	const teamId = (params?.teamId as string) ?? '';
	const { data, isLoading } = useGetTestCasesQuery(collectionId, {
		skip: !collectionId,
	});
	const collection = data?.data;
	const testCases: iTestCase[] = data?.data ?? [];

	const pathParts = pathname.split('/');
	const collectionIdx = pathParts.indexOf('collection');
	const selectedTestId =
		collectionIdx >= 0 ? pathParts[collectionIdx + 2] : null;

	return (
		<div className="flex flex-col border-r border-zinc-800 w-72 shrink-0 bg-zinc-950">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 gap-1">
				<div className="min-w-0">
					<p className="text-[13px] font-semibold line-clamp-1 text-zinc-100">
						{isLoading ? 'Loading...' : (collection?.name ?? 'Collection')}
					</p>
					{collection?.description && (
						<p className="text-[10px] line-clamp-1 text-zinc-500">
							{collection.description}
						</p>
					)}
				</div>

				<TestCaseCreateModal />

				<Link
					href={ROUTES.collection.rulAll(teamId, collectionId)}
					className="h-8 px-3 rounded-lg bg-zinc-100 text-zinc-900 text-[12px] font-medium flex items-center gap-1 hover:opacity-90 shrink-0"
				>
					<Play className="w-3 h-3" />
					Run
				</Link>
			</div>

			{/* Test list */}
			<div className="flex-1 overflow-y-auto p-2 space-y-1">
				{isLoading && (
					<div className="flex flex-col items-center justify-center h-32 text-zinc-600 text-[13px] gap-2">
						<Loader2 className="w-5 h-5 animate-spin" />
					</div>
				)}

				{!isLoading && testCases.length === 0 && (
					<div className="flex flex-col items-center justify-center h-32 text-zinc-600 text-[13px] gap-2">
						<Terminal className="w-5 h-5" />
						No tests yet
					</div>
				)}

				{testCases.map((test) => {
					const testId = test._id ?? test.id;
					const isSelected = selectedTestId === testId;

					return (
						<div
							key={testId}
							className={cn(
								'group rounded-lg px-3 py-2.5 transition-all duration-150 border',
								isSelected
									? 'bg-zinc-800 border-zinc-700'
									: 'bg-transparent border-transparent hover:bg-zinc-800/50 hover:border-zinc-800',
							)}
						>
							<Link href={ROUTES.collection.api(teamId, collectionId, testId)}>
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
									isSelected
										? 'opacity-100'
										: 'opacity-0 group-hover:opacity-100',
								)}
							>
								<TestCaseEditModal data={test} colId={collectionId}>
									<button
										className="h-7 w-7 rounded-md flex items-center justify-center transition-colors hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
										title="Edit"
									>
										<Pencil className="w-3.5 h-3.5" />
									</button>
								</TestCaseEditModal>

								<div className="flex-1" />
								<TestCaseDelete colId={collectionId} testId={testId} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
