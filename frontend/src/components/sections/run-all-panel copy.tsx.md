import { cn } from '@/lib/utils';
import {
	AssertionResult,
	CollectionRunResult,
	TestCaseResult,
} from '@/store/features/test-case/type';
import { CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import { MethodBadge } from '../ui/method-badge';
import { SectionLabel } from '../ui/section-label';
import { StatusBadge } from '../ui/status-badge';

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
			{pass ? (
				<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
			) : (
				<XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
			)}
			<div className="flex-1 min-w-0">
				<div className="text-[11px] font-semibold text-zinc-200 capitalize">
					{a.message}
				</div>
				<div className="text-[10px] text-zinc-500 mt-0.5">{a.field}</div>
				{/* Show expected vs actual only on failure */}
				{!pass && (
					<div className="mt-1.5 flex flex-col gap-1">
						<div className="flex gap-2 font-mono text-[10px]">
							<span className="text-zinc-500 shrink-0">expected</span>
							<span className="text-emerald-400 truncate">
								{JSON.stringify(a.expected)}
							</span>
						</div>
						<div className="flex gap-2 font-mono text-[10px]">
							<span className="text-zinc-500 shrink-0">actual</span>
							<span className="text-rose-400 truncate">
								{JSON.stringify(a.actual)}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function TestResultCard({ r }: { r: TestCaseResult }) {
	return (
		<div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
			{/* Test header */}
			<div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
				<StatusBadge status={r.status} />
				<span className="text-[12px] font-semibold text-zinc-100 truncate flex-1">
					{r.testCaseName}
				</span>
				<div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0">
					<Clock className="w-3 h-3" />
					{r.durationMs}ms
				</div>
			</div>

			{/* Request row */}
			<div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/60 bg-zinc-900/50">
				<MethodBadge method={r.request.method} />
				<span className="font-mono text-[10px] text-zinc-500 truncate">
					{r.request.url}
				</span>
				{r.actual?.status && (
					<span
						className={cn(
							'ml-auto shrink-0 text-[11px] font-mono font-semibold',
							r.actual.status < 300
								? 'text-emerald-400'
								: r.actual.status < 400
									? 'text-amber-400'
									: 'text-rose-400',
						)}
					>
						{r.actual.status}
					</span>
				)}
			</div>

			{/* Error banner */}
			{r.error && (
				<div className="px-4 py-2.5 bg-rose-400/5 border-b border-rose-400/20">
					<span className="text-[11px] text-rose-400 font-mono">{r.error}</span>
				</div>
			)}

			{/* Assertions */}
			{r.assertions?.length > 0 && (
				<div className="p-3 space-y-2">
					{r.assertions.map((a, i) => (
						<AssertionRow key={i} a={a} />
					))}
				</div>
			)}
		</div>
	);
}

export function RunAllPanel({
	result,
	onClose,
}: {
	result: CollectionRunResult;
	onClose: () => void;
}) {
	const allPassed = result.failed === 0 && result.errored === 0;

	return (
		<div className="w-full  shrink-0 flex flex-col border-l border-zinc-800 overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
				<div className="flex flex-col gap-0.5">
					<span className="text-[14px] font-semibold text-zinc-100">
						Run Results
					</span>
					<span className="text-[12px] text-zinc-500">
						{result.collectionName}
					</span>
				</div>
				<button
					onClick={onClose}
					className="text-zinc-500 hover:text-zinc-200 transition-colors"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			{/* Summary */}
			<div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800 shrink-0">
				<span className="text-[12px] text-zinc-400">
					Total{' '}
					<span className="text-zinc-100 font-semibold">
						{result.totalTests}
					</span>
				</span>
				<div className="w-px h-3 bg-zinc-700" />
				<span className="text-[12px] text-emerald-400 font-medium">
					✓ {result.passed}
				</span>
				<div className="w-px h-3 bg-zinc-700" />
				<span className="text-[12px] text-rose-400 font-medium">
					✗ {result.failed}
				</span>
				{result.errored > 0 && (
					<>
						<div className="w-px h-3 bg-zinc-700" />
						<span className="text-[12px] text-amber-400 font-medium">
							⚠ {result.errored}
						</span>
					</>
				)}
				<div className="flex items-center gap-1 ml-auto text-[11px] text-zinc-500">
					<Clock className="w-3 h-3" />
					{result.durationMs}ms
				</div>
			</div>

			{/* All passed banner */}
			{allPassed && (
				<div className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5">
					<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
					<span className="text-[12px] text-emerald-400 font-medium">
						All {result.totalTests} tests passed
					</span>
				</div>
			)}

			{/* Results */}
			<div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
				<SectionLabel>Tests</SectionLabel>
				{result.results.map((r) => (
					<TestResultCard key={r.testCaseId} r={r} />
				))}
			</div>
		</div>
	);
}
