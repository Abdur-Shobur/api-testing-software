import { DocsEditor } from '@/components/DocsEditor';
import { TestHistory } from '@/components/TestHistory';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Collection } from '@/store/features/collection/collection-type';
import { TestCaseEditModal } from '@/store/features/test-case/test-case-edit-modal';
import {
	AssertionResult,
	iTestCase,
	iTestCaseError,
	TestCaseResult,
} from '@/store/features/test-case/type';
import { DetailTab } from '@/type';
import { Clock, Pencil, Play, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Chip } from '../ui/chip';
import { Btn } from '../ui/main-btn';
import { MethodBadge } from '../ui/method-badge';
import { SectionLabel } from '../ui/section-label';
import { Skeleton } from '../ui/skeleton';
import { StatusBadge } from '../ui/status-badge';

function AssertionAccordionItem({
	a,
	index,
}: {
	a: AssertionResult;
	index: number;
}) {
	const pass = a.status === 'pass';
	const skip = a.status === 'skip';
	return (
		<AccordionItem
			value={`assertion-${index}`}
			className="bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden"
		>
			<AccordionTrigger className="flex items-center gap-3 px-3 py-2.5 hover:no-underline hover:bg-zinc-800/50 transition-colors">
				<div
					className={cn(
						'mt-0.5 w-2 h-2 rounded-full shrink-0',
						skip ? 'bg-zinc-500' : pass ? 'bg-emerald-400' : 'bg-rose-400',
					)}
				/>
				<div className="flex-1 min-w-0 text-left">
					<div className="text-[11px] font-semibold text-zinc-200 capitalize truncate">
						{a.message}
					</div>
					<div className="text-[10px] text-zinc-500 truncate">{a.field}</div>
				</div>
				<span className="text-[10px] font-medium uppercase text-zinc-500 shrink-0">
					{a.status}
				</span>
			</AccordionTrigger>
			<AccordionContent className="px-3 pb-3">
				<div className="mt-1 grid grid-cols-2 gap-2">
					<div className="rounded-md border max-h-40 overflow-y-auto border-zinc-800 bg-zinc-950/40 p-2">
						<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-1">
							Expected
						</div>
						<pre className="font-mono text-[10px] text-emerald-300 whitespace-pre-wrap break-all">
							<code>{JSON.stringify(a.expected, null, 2)}</code>
						</pre>
					</div>
					<div className="rounded-md border max-h-40 overflow-y-auto border-zinc-800 bg-zinc-950/40 p-2">
						<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-1">
							Actual
						</div>
						<pre
							className={cn(
								'font-mono text-[10px] whitespace-pre-wrap break-all',
								skip
									? 'text-zinc-400'
									: pass
										? 'text-zinc-300'
										: 'text-rose-300',
							)}
						>
							<code>{JSON.stringify(a.actual, null, 2)}</code>
						</pre>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

export function DetailPanel({
	test,
	collection,
	mutation,
	response,
}: {
	test: iTestCase | null;
	collection: Collection | null;
	mutation: any;
	response: any;
}) {
	const [tab, setTab] = useState<DetailTab>('body');
	const [panelTab, setPanelTab] = useState<'test' | 'docs'>('test');
	const { isLoading, data, error, isError } = response;
	const result: TestCaseResult = data?.data;
	const getError = error as {
		data: {
			data: iTestCaseError;
		};
		status: number;
	};
	const hasError = getError?.data?.data;

	const handleClick = async (colId: string, testId: string) => {
		if (isLoading) return;

		try {
			const response = await mutation({ colId, testId }).unwrap();
		} catch (err) {
			toast.error('Failed to Run');
		}
	};

	if (!test && panelTab !== 'docs') {
		return (
			<div className="flex-1 flex flex-col min-w-0">
				<div className="flex border-b border-zinc-800">
					<button
						onClick={() => setPanelTab('test')}
						className="px-4 py-2 text-xs text-zinc-100 border-b-2 border-orange-400"
					>
						Test
					</button>
					<button
						onClick={() => setPanelTab('docs')}
						className="px-4 py-2 text-xs text-zinc-500 border-b-2 border-transparent"
					>
						Docs
					</button>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
					<Zap className="w-8 h-8 opacity-30" />
					<span className="text-sm">Select a test to view details</span>
				</div>
			</div>
		);
	}

	if (panelTab === 'docs' && collection?.id) {
		return (
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<div className="flex border-b border-zinc-800">
					<button
						onClick={() => setPanelTab('test')}
						className="px-4 py-2 text-xs text-zinc-500 border-b-2 border-transparent"
					>
						Test
					</button>
					<button
						onClick={() => setPanelTab('docs')}
						className="px-4 py-2 text-xs text-zinc-100 border-b-2 border-orange-400"
					>
						Docs
					</button>
				</div>
				<DocsEditor collectionId={collection.id} />
			</div>
		);
	}

	if (!test) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
				<Zap className="w-8 h-8 opacity-30" />
				<span className="text-sm">Select a test to view details</span>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
			<div className="flex border-b border-zinc-800">
				<button
					onClick={() => setPanelTab('test')}
					className="px-4 py-2 text-xs text-zinc-100 border-b-2 border-orange-400"
				>
					Test
				</button>
				<button
					onClick={() => setPanelTab('docs')}
					className="px-4 py-2 text-xs text-zinc-500 border-b-2 border-transparent"
				>
					Docs
				</button>
			</div>
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
				<div className="flex items-center gap-2.5">
					<MethodBadge method={test.request.method} />
					<span className="text-[14px] font-semibold text-zinc-100">
						{test.name}
					</span>
				</div>
				<div className="flex gap-1.5">
					{collection?.id && (
						<TestCaseEditModal data={test} colId={collection?.id}>
							<Btn size="sm">
								<Pencil className="w-3 h-3" />
								Edit
							</Btn>
						</TestCaseEditModal>
					)}

					{collection?.id && test.id && (
						<Btn
							onClick={() => handleClick(collection?.id, test.id)}
							size="sm"
							variant="primary"
						>
							<Play className="w-3 h-3" />
							Run test
						</Btn>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
				{/* Request */}
				<section>
					<SectionLabel>Request</SectionLabel>
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3">
						<MethodBadge method={test.request.method} />
						<span className="font-mono text-[12px] text-zinc-400 truncate">
							{test.request.url}
						</span>
					</div>
				</section>

				{/* Expected */}
				<section>
					<SectionLabel>Expected response</SectionLabel>
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
						<Chip>Status {test.expectedResponse.status}</Chip>
						{test.expectedResponse.body.mode !== 'none' && (
							<>
								<span className="text-zinc-600 text-[11px]">
									body {test.expectedResponse.body.mode}
								</span>
								{/* <pre></pre> */}
								<Chip mono>{test.expectedResponse.body.content}</Chip>
							</>
						)}
					</div>
				</section>

				{/* Result */}
				<section>
					<SectionLabel>Last run result</SectionLabel>
					{isLoading ? (
						<div className="flex w-full max-w-xs flex-col gap-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					) : (
						<>
							{/* Tabs (always visible, including History) */}
							<div className="flex border-b border-zinc-800">
								{(
									['body', 'headers', 'assertions', 'history'] as DetailTab[]
								).map((t) => (
									<button
										key={t}
										onClick={() => setTab(t)}
										className={cn(
											'px-4 py-2 text-[12px] font-medium capitalize transition-colors duration-150 border-b-2 -mb-px',
											tab === t
												? 'text-zinc-100 border-orange-400'
												: 'text-zinc-500 border-transparent hover:text-zinc-300',
										)}
									>
										{t}
									</button>
								))}
							</div>

							{/* Tab content */}
							<div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg rounded-t-none">
								{tab === 'history' && <TestHistory testId={test.id} />}

								{tab !== 'history' && !result && !isError && (
									<div className="flex items-center justify-center text-zinc-600 text-[13px] gap-2 py-6">
										<Play className="w-4 h-4" />
										Run test to see {tab}
									</div>
								)}

								{tab === 'body' && result && (
									<pre className="font-mono text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
										<code>{JSON.stringify(result.actual?.body)}</code>
									</pre>
								)}

								{tab === 'headers' && result && (
									<div className="space-y-1.5">
										{Object.entries(result.actual?.headers ?? {}).length ===
										0 ? (
											<div className="text-xs text-zinc-500">No headers.</div>
										) : (
											Object.entries(result.actual?.headers ?? {}).map(
												([k, v]) => (
													<div
														key={k}
														className="flex gap-3 font-mono text-[11px]"
													>
														<span className="text-zinc-500 shrink-0">{k}:</span>
														<span className="text-zinc-300 break-all">
															{String(v)}
														</span>
													</div>
												),
											)
										)}
									</div>
								)}

								{tab === 'assertions' && result && (
									<div className="space-y-2">
										{result.assertions.length === 0 ? (
											<div className="text-xs text-zinc-500">
												No assertions.
											</div>
										) : (
											<Accordion type="multiple" className="space-y-2">
												{result.assertions.map((a, i) => (
													<AssertionAccordionItem key={i} a={a} index={i} />
												))}
											</Accordion>
										)}
									</div>
								)}
							</div>

							{!result && !isError && (
								<div className="mt-3 text-[11px] text-zinc-500">
									Not yet run — press{' '}
									<span className="text-zinc-300">Run test</span> to execute.
								</div>
							)}
							{isError && (
								<div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
									{/* Result meta */}
									<div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
										<StatusBadge status={'fail'} />
										<div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
											<Clock className="w-3 h-3" />
											<span className="text-zinc-300 font-medium">
												{hasError?.durationMs}ms
											</span>
										</div>
										<div className="w-px h-3 bg-zinc-700" />
										<span
											className={
												'text-[12px] font-mono font-semibold text-rose-400'
											}
										>
											HTTP {getError?.status}
										</span>

										<div className="w-px h-3 bg-zinc-700" />
										<span className="text-[12px] text-zinc-500">
											{hasError?.error}
										</span>
									</div>

									<div className="p-4">
										<pre className="font-mono text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
											<code>{JSON.stringify(error)}</code>
										</pre>
									</div>
								</div>
							)}
							{result && (
								<div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
									<div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
										<StatusBadge status={result.status} />
										<div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
											<Clock className="w-3 h-3" />
											<span className="text-zinc-300 font-medium">
												{result.durationMs}ms
											</span>
										</div>
										<div className="w-px h-3 bg-zinc-700" />
										{result.actual?.status && (
											<span
												className={cn(
													'text-[12px] font-mono font-semibold',
													result.actual?.status < 300
														? 'text-emerald-400'
														: result.actual?.status < 400
															? 'text-amber-400'
															: 'text-rose-400',
												)}
											>
												HTTP {result.actual?.status}
											</span>
										)}
										<div className="w-px h-3 bg-zinc-700" />
										<span className="text-[12px] text-zinc-500">
											{result.assertions.length} assertion
											{result.assertions.length !== 1 ? 's' : ''}
										</span>
									</div>
								</div>
							)}
						</>
					)}
				</section>
			</div>
		</div>
	);
}
