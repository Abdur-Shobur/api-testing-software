'use client';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { useGetTestHistoryQuery } from '@/store/features/test-case/test-case-api-slice';
import { AssertionResult, TestRun } from '@/store/features/test-case/type';
import { Clock } from 'lucide-react';

function AssertionRow({ a }: { a: AssertionResult }) {
	const pass = a.status === 'pass';
	return (
		<div
			className={cn(
				'flex items-start gap-3 px-3 py-2 rounded-lg border',
				pass
					? 'border-emerald-400/20 bg-emerald-400/5'
					: 'border-rose-400/20 bg-rose-400/5',
			)}
		>
			<div
				className={cn(
					'mt-0.5 w-2 h-2 rounded-full shrink-0',
					pass ? 'bg-emerald-400' : 'bg-rose-400',
				)}
			/>
			<div className="flex-1 min-w-0">
				<div className="text-[11px] font-semibold text-zinc-200 capitalize">
					{a.message}
				</div>
				<div className="text-[10px] text-zinc-500 mt-0.5">{a.field}</div>
				<div className="mt-2 grid grid-cols-2 gap-2">
					<div className="rounded-md border max-h-40 overflow-y-auto  border-zinc-800 bg-zinc-950/40 p-2">
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
								pass ? 'text-zinc-300' : 'text-rose-300',
							)}
						>
							<code>{JSON.stringify(a.actual, null, 2)}</code>
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}

export function TestHistory({ testId }: { testId: string }) {
	const { data, isLoading } = useGetTestHistoryQuery(testId, { skip: !testId });
	const runs = data?.data ?? [];

	if (isLoading) {
		return <div className="text-xs text-zinc-500">Loading history...</div>;
	}

	if (runs.length === 0) {
		return <div className="text-xs text-zinc-500">No runs recorded yet.</div>;
	}

	return (
		<Accordion type="single" collapsible className="space-y-2">
			{runs.map((run: TestRun) => (
				<AccordionItem
					key={run.id ?? run._id}
					value={String(run.id ?? run._id)}
					className="bg-zinc-950/50 border border-zinc-800 rounded-lg overflow-hidden"
				>
					<AccordionTrigger className="flex items-center gap-3 px-3 py-2.5 hover:no-underline hover:bg-zinc-800/50 transition-colors">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							<StatusBadge status={run.status} />
							<span className="text-xs text-zinc-500 truncate">
								{new Date(run.runAt).toLocaleString()}
							</span>
						</div>
						<div className="flex items-center gap-1 text-xs text-zinc-500 shrink-0">
							<Clock className="w-3 h-3" />
							{run.durationMs}ms
						</div>
					</AccordionTrigger>

					<AccordionContent className="px-3 pb-3">
						{/* Assertions */}
						<div className="mt-2">
							<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
								Assertions
							</div>
							{(run.assertions ?? []).length === 0 ? (
								<div className="text-xs text-zinc-500">
									No assertions stored.
								</div>
							) : (
								<div className="space-y-2">
									{(run.assertions ?? []).map((a, i) => (
										<AssertionRow key={i} a={a} />
									))}
								</div>
							)}
						</div>

						{/* Actual */}
						{/* <div className="mt-4">
							<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
								Actual
							</div>
							<pre className="font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all bg-zinc-900 border border-zinc-800 rounded-lg p-3">
								<code>{JSON.stringify(run.actual, null, 2)}</code>
							</pre>
						</div> */}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
