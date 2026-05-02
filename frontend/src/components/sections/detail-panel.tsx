import { cn } from '@/lib/utils';
import { Collection } from '@/store/features/collections/type';
import { useRunTestCaseMutation } from '@/store/features/test-case/api-slice';
import { iTestCase, TestCaseResult } from '@/store/features/test-case/type';
import { DetailTab } from '@/type';
import { CheckCircle2, Clock, Pencil, Play, XCircle, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Chip } from '../ui/chip';
import { Btn } from '../ui/main-btn';
import { MethodBadge } from '../ui/method-badge';
import { SectionLabel } from '../ui/section-label';
import { StatusBadge } from '../ui/status-badge';

export function DetailPanel({
	test,
	collection,
}: {
	test: iTestCase | null;
	collection: Collection | null;
}) {
	const [tab, setTab] = useState<DetailTab>('body');
	const [mutation, { isLoading }] = useRunTestCaseMutation();
	const [result, setTestResult] = useState<TestCaseResult>();

	const handleClick = async (colId: string, testId: string) => {
		if (isLoading) return;

		try {
			const response = await mutation({ colId, testId }).unwrap();
			setTestResult(response.data);

			console.log(response);
		} catch (err) {
			toast.error('Failed to Run');
		}
	};

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
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
				<div className="flex items-center gap-2.5">
					<MethodBadge method={test.request.method} />
					<span className="text-[14px] font-semibold text-zinc-100">
						{test.name}
					</span>
				</div>
				<div className="flex gap-1.5">
					<Btn size="sm">
						<Pencil className="w-3 h-3" />
						Edit
					</Btn>

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
					{!result ? (
						<div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-6 flex items-center justify-center text-zinc-600 text-[13px] gap-2">
							<Play className="w-4 h-4" />
							Not yet run — press Run test to execute
						</div>
					) : (
						<div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
							{/* Result meta */}
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

							{/* Tabs */}
							<div className="flex border-b border-zinc-800">
								{(['body', 'headers', 'assertions'] as DetailTab[]).map((t) => (
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
										{t === 'assertions' && (
											<span
												className={cn(
													'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]',
													result.assertions.every((a) => a.status === 'pass')
														? 'bg-emerald-400/10 text-emerald-400'
														: 'bg-rose-400/10 text-rose-400',
												)}
											>
												{
													result.assertions.filter((a) => a.status === 'pass')
														.length
												}
												/{result.assertions.length}
											</span>
										)}
									</button>
								))}
							</div>

							{/* Tab content */}
							<div className="p-4">
								{tab === 'body' && (
									<pre className="font-mono text-[11px] text-zinc-400 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
										<code>{JSON.stringify(result.actual?.body)}</code>
									</pre>
								)}
								{tab === 'headers' && (
									<div className="space-y-1.5">
										{[
											['Content-Type', 'application/json; charset=utf-8'],
											['X-Response-Time', `${result.durationMs}ms`],
											['Cache-Control', 'no-cache'],
										].map(([k, v]) => (
											<div key={k} className="flex gap-3 font-mono text-[11px]">
												<span className="text-zinc-500 shrink-0">{k}:</span>
												<span className="text-zinc-300">{v}</span>
											</div>
										))}
									</div>
								)}
								{tab === 'assertions' && (
									<div className="space-y-2">
										{result.assertions.map((a, i) => (
											<div
												key={i}
												className={cn(
													'flex items-start gap-3 px-3 py-2.5 rounded-lg border',
													a.status === 'pass'
														? 'border-emerald-400/20 bg-emerald-400/5'
														: 'border-rose-400/20 bg-rose-400/5',
												)}
											>
												{a.status === 'pass' ? (
													<CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
												) : (
													<XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
												)}
												<div>
													<div className="text-[12px] font-semibold text-zinc-200 capitalize">
														{a.message}
													</div>
													<div className="text-[11px] text-zinc-500 mt-0.5">
														{a.field}
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
