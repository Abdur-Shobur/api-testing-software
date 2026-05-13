'use client';

import { cn } from '@/lib/utils';
import { Clock, Pencil, Play, Zap } from 'lucide-react';
import { useState } from 'react';

const test = {
	id: '1',
	name: 'Login Success',
	request: {
		method: 'POST',
		url: '/api/auth/login',
	},
	expectedResponse: {
		status: 200,
		body: {
			mode: 'json',
			content: '{"success": true}',
		},
	},
};

const result = {
	status: 'pass',
	durationMs: 124,
	actual: {
		status: 200,
		body: {
			success: true,
			token: 'jwt-token',
		},
		headers: {
			'content-type': 'application/json',
			server: 'nginx',
		},
	},
	assertions: [
		{
			status: 'pass',
			message: 'Status should be 200',
			field: 'status',
			expected: 200,
			actual: 200,
		},
		{
			status: 'pass',
			message: 'Response contains token',
			field: 'body.token',
			expected: true,
			actual: true,
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

function Chip({ children }: { children: React.ReactNode }) {
	return (
		<div className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300">
			{children}
		</div>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">
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

export function StaticDetailPanel() {
	const [tab, setTab] = useState<'body' | 'headers' | 'assertions'>('body');

	const [panelTab, setPanelTab] = useState<'test' | 'docs'>('test');

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
			{/* Top Tabs */}
			<div className="flex border-b border-zinc-800">
				<button
					onClick={() => setPanelTab('test')}
					className={cn(
						'px-4 py-2 text-xs border-b-2',
						panelTab === 'test'
							? 'text-zinc-100 border-orange-400'
							: 'text-zinc-500 border-transparent',
					)}
				>
					Test
				</button>

				<button
					onClick={() => setPanelTab('docs')}
					className={cn(
						'px-4 py-2 text-xs border-b-2',
						panelTab === 'docs'
							? 'text-zinc-100 border-orange-400'
							: 'text-zinc-500 border-transparent',
					)}
				>
					Docs
				</button>
			</div>

			{panelTab === 'docs' ? (
				<div className="flex-1 flex items-center justify-center text-zinc-600">
					<Zap className="w-5 h-5 mr-2" />
					Documentation editor
				</div>
			) : (
				<>
					{/* Header */}
					<div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
						<div className="flex items-center gap-2.5">
							<MethodBadge method={test.request.method} />

							<span className="text-[14px] font-semibold text-zinc-100">
								{test.name}
							</span>
						</div>

						<div className="flex gap-2">
							<button className="h-8 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 text-[12px] flex items-center gap-1">
								<Pencil className="w-3 h-3" />
								Edit
							</button>

							<button className="h-8 px-3 rounded-lg bg-zinc-100 text-zinc-900 text-[12px] flex items-center gap-1">
								<Play className="w-3 h-3" />
								Run test
							</button>
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
							<SectionLabel>Expected</SectionLabel>

							<div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
								<Chip>Status 200</Chip>

								<Chip>json</Chip>

								<Chip>{test.expectedResponse.body.content}</Chip>
							</div>
						</section>

						{/* Result */}
						<section>
							<SectionLabel>Last run result</SectionLabel>

							{/* Tabs */}
							<div className="flex border-b border-zinc-800">
								{['body', 'headers', 'assertions'].map((t) => (
									<button
										key={t}
										onClick={() => setTab(t as any)}
										className={cn(
											'px-4 py-2 text-[12px] capitalize border-b-2',
											tab === t
												? 'text-zinc-100 border-orange-400'
												: 'text-zinc-500 border-transparent',
										)}
									>
										{t}
									</button>
								))}
							</div>

							<div className="p-4 bg-zinc-900 border border-zinc-800 rounded-b-lg">
								{tab === 'body' && (
									<pre className="font-mono text-[11px] text-zinc-300 whitespace-pre-wrap break-all">
										<code>{JSON.stringify(result.actual.body, null, 2)}</code>
									</pre>
								)}

								{tab === 'headers' && (
									<div className="space-y-2">
										{Object.entries(result.actual.headers).map(([k, v]) => (
											<div key={k} className="flex gap-2 text-[11px] font-mono">
												<span className="text-zinc-500">{k}:</span>

												<span className="text-zinc-300 break-all">
													{String(v)}
												</span>
											</div>
										))}
									</div>
								)}

								{tab === 'assertions' && (
									<div className="space-y-2">
										{result.assertions.map((a, i) => (
											<div
												key={i}
												className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<div className="w-2 h-2 rounded-full bg-emerald-400" />

														<span className="text-[12px] text-zinc-200 font-medium">
															{a.message}
														</span>
													</div>

													<span className="text-[10px] uppercase text-emerald-400">
														{a.status}
													</span>
												</div>

												<div className="grid grid-cols-2 gap-2 mt-3">
													<div className="rounded-md border border-zinc-800 p-2 bg-zinc-900">
														<div className="text-[10px] uppercase text-zinc-500 mb-1">
															Expected
														</div>

														<pre className="text-[10px] text-emerald-300 font-mono">
															{JSON.stringify(a.expected, null, 2)}
														</pre>
													</div>

													<div className="rounded-md border border-zinc-800 p-2 bg-zinc-900">
														<div className="text-[10px] uppercase text-zinc-500 mb-1">
															Actual
														</div>

														<pre className="text-[10px] text-zinc-300 font-mono">
															{JSON.stringify(a.actual, null, 2)}
														</pre>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Footer Result */}
							<div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
								<div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
									<StatusBadge status={result.status} />

									<div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
										<Clock className="w-3 h-3" />

										<span className="text-zinc-300 font-medium">
											{result.durationMs}
											ms
										</span>
									</div>

									<div className="w-px h-3 bg-zinc-700" />

									<span className="text-[12px] font-mono font-semibold text-emerald-400">
										HTTP {result.actual.status}
									</span>

									<div className="w-px h-3 bg-zinc-700" />

									<span className="text-[12px] text-zinc-500">
										{result.assertions.length} assertions
									</span>
								</div>
							</div>
						</section>
					</div>
				</>
			)}
		</div>
	);
}
