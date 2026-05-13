'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, Clock, X, XCircle } from 'lucide-react';
import { useState } from 'react';

const result = {
	collectionName: 'Auth API Tests',
	totalTests: 3,
	passed: 2,
	failed: 1,
	errored: 0,
	durationMs: 482,
	results: [
		{
			testCaseId: '1',
			testCaseName: 'Login Success',
			status: 'pass',
			durationMs: 120,
			request: {
				method: 'POST',
				url: '/api/auth/login',
			},
			actual: {
				status: 200,
			},
			assertions: [
				{
					status: 'pass',
					message: 'Status should be 200',
					field: 'status',
					expected: 200,
					actual: 200,
				},
			],
		},
		{
			testCaseId: '2',
			testCaseName: 'Register User',
			status: 'fail',
			durationMs: 210,
			request: {
				method: 'POST',
				url: '/api/auth/register',
			},
			actual: {
				status: 400,
			},
			error: 'Validation failed',
			assertions: [
				{
					status: 'fail',
					message: 'Status should be 201',
					field: 'status',
					expected: 201,
					actual: 400,
				},
			],
		},
		{
			testCaseId: '3',
			testCaseName: 'Get Profile',
			status: 'pass',
			durationMs: 152,
			request: {
				method: 'GET',
				url: '/api/users/me',
			},
			actual: {
				status: 200,
			},
			assertions: [
				{
					status: 'pass',
					message: 'Response contains user',
					field: 'body.user',
					expected: true,
					actual: true,
				},
			],
		},
	],
};

function MethodBadge({ method }: { method: string }) {
	return (
		<div className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300">
			{method}
		</div>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
			{children}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	return (
		<div
			className={cn(
				'px-2 py-1 rounded-md text-[10px] font-bold uppercase',
				status === 'pass'
					? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
					: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
			)}
		>
			{status}
		</div>
	);
}

function AssertionRow({ a }: { a: any }) {
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
				<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
			) : (
				<XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
			)}

			<div className="flex-1 min-w-0">
				<div className="text-[11px] font-semibold text-zinc-200">
					{a.message}
				</div>

				<div className="text-[10px] text-zinc-500 mt-0.5">{a.field}</div>

				{!pass && (
					<div className="mt-2 space-y-1 text-[10px] font-mono">
						<div className="flex gap-2">
							<span className="text-zinc-500">expected</span>

							<span className="text-emerald-400">
								{JSON.stringify(a.expected)}
							</span>
						</div>

						<div className="flex gap-2">
							<span className="text-zinc-500">actual</span>

							<span className="text-rose-400">{JSON.stringify(a.actual)}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export function StaticRunAllPanel() {
	const [open, setOpen] = useState<Record<string, boolean>>({
		'1': true,
	});

	const toggle = (id: string) => {
		setOpen((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const allPassed = result.failed === 0 && result.errored === 0;

	return (
		<div className="w-full flex-1 flex flex-col border-l border-zinc-800 overflow-hidden bg-zinc-950">
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
				<div>
					<div className="text-[14px] font-semibold text-zinc-100">
						Run Results
					</div>

					<div className="text-[12px] text-zinc-500">
						{result.collectionName}
					</div>
				</div>

				<button className="text-zinc-500 hover:text-zinc-200">
					<X className="w-4 h-4" />
				</button>
			</div>

			{/* Summary */}
			<div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800">
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

				<div className="flex items-center gap-1 ml-auto text-[11px] text-zinc-500">
					<Clock className="w-3 h-3" />
					{result.durationMs}
					ms
				</div>
			</div>

			{/* Banner */}
			{allPassed && (
				<div className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg border border-emerald-400/20 bg-emerald-400/5">
					<CheckCircle2 className="w-4 h-4 text-emerald-400" />

					<span className="text-[12px] text-emerald-400 font-medium">
						All tests passed
					</span>
				</div>
			)}

			{/* Results */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				<SectionLabel>Tests</SectionLabel>

				<div className="mt-3 space-y-2">
					{result.results.map((r) => {
						const isOpen = open[r.testCaseId];

						return (
							<div
								key={r.testCaseId}
								className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
							>
								{/* Trigger */}
								<button
									onClick={() => toggle(r.testCaseId)}
									className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
								>
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<StatusBadge status={r.status} />

										<span className="text-[12px] font-semibold text-zinc-100 truncate">
											{r.testCaseName}
										</span>
									</div>

									<div className="flex items-center gap-3 mr-2">
										<span
											className={cn(
												'text-[10px] px-1.5 py-0.5 rounded-full',
												r.assertions.every((a) => a.status === 'pass')
													? 'bg-emerald-400/10 text-emerald-400'
													: 'bg-rose-400/10 text-rose-400',
											)}
										>
											{r.assertions.filter((a) => a.status === 'pass').length}/
											{r.assertions.length}
										</span>

										<div className="flex items-center gap-1 text-[11px] text-zinc-500">
											<Clock className="w-3 h-3" />
											{r.durationMs}
											ms
										</div>
									</div>

									<ChevronDown
										className={cn(
											'w-4 h-4 text-zinc-500 transition-transform',
											isOpen && 'rotate-180',
										)}
									/>
								</button>

								{/* Content */}
								{isOpen && (
									<div className="border-t border-zinc-800">
										<div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800/60">
											<MethodBadge method={r.request.method} />

											<span className="font-mono text-[10px] text-zinc-500 truncate flex-1">
												{r.request.url}
											</span>

											<span
												className={cn(
													'text-[11px] font-mono font-semibold',
													r.actual.status < 300
														? 'text-emerald-400'
														: 'text-rose-400',
												)}
											>
												{r.actual.status}
											</span>
										</div>

										{r.error && (
											<div className="px-4 py-2 bg-rose-400/5 border-b border-rose-400/20 text-[11px] text-rose-400 font-mono">
												{r.error}
											</div>
										)}

										<div className="p-3 space-y-2">
											{r.assertions.map((a, i) => (
												<AssertionRow key={i} a={a} />
											))}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
