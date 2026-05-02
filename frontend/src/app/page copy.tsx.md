'use client';

import { cn } from '@/lib/utils';
import {
	CheckCircle2,
	Flame,
	Pencil,
	Play,
	Plus,
	Trash2,
	XCircle,
} from 'lucide-react';

// ─── Static Data ─────────────────────────────────────────

const collection = {
	name: 'ABC',
	tests: [
		{
			id: '1',
			name: 'Get collections',
			method: 'GET',
			url: 'http://localhost:4000/collections',
			status: 'pass',
		},
		{
			id: '2',
			name: 'Create collection',
			method: 'POST',
			url: 'http://localhost:4000/collections',
			status: 'fail',
		},
	],
};

export default function Page() {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-3">
			<div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
				{/* TOP BAR */}
				<div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
					<div className="flex items-center gap-2.5">
						<div className="flex gap-1.5">
							<span className="w-3 h-3 bg-zinc-700 rounded-full" />
							<span className="w-3 h-3 bg-zinc-700 rounded-full" />
							<span className="w-3 h-3 bg-zinc-700 rounded-full" />
						</div>
						<div className="w-px h-4 bg-zinc-800" />
						<div className="flex items-center gap-1.5 text-zinc-400">
							<Flame className="w-3.5 h-3.5 text-orange-400" />
							<span className="text-[12px]">API Testing</span>
						</div>
					</div>
					<div className="text-xs text-zinc-500">
						● Connected to localhost:4000
					</div>
				</div>

				<div className="flex flex-1">
					{/* SIDEBAR */}
					<aside className="w-56 border-r border-zinc-800 bg-zinc-900/50">
						<div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800">
							<span className="text-sm font-semibold">API Test</span>
							<Plus className="w-4 h-4 text-zinc-400" />
						</div>

						<div className="p-2 space-y-1">
							<div className="bg-zinc-800 px-3 py-2 rounded flex justify-between text-sm">
								ABC
								<Trash2 className="w-4 h-4 text-zinc-500" />
							</div>
							<div className="px-3 py-2 text-zinc-400">Auth</div>
						</div>
					</aside>

					{/* TEST LIST */}
					<div className="w-72 border-r border-zinc-800">
						<div className="flex justify-between px-4 py-3 border-b border-zinc-800">
							<span className="text-sm font-semibold">Tests</span>
							<div className="flex gap-2">
								<Plus className="w-4 h-4 text-zinc-400" />
								<Play className="w-4 h-4 text-zinc-400" />
							</div>
						</div>

						<div className="p-2 space-y-2">
							{collection.tests.map((t) => (
								<div key={t.id} className="bg-zinc-800 p-3 rounded space-y-1">
									<div className="flex justify-between text-xs">
										<span className="text-sky-400">{t.method}</span>
										<span
											className={cn(
												t.status === 'pass'
													? 'text-emerald-400'
													: 'text-rose-400',
											)}
										>
											{t.status.toUpperCase()}
										</span>
									</div>
									<div className="text-sm">{t.name}</div>
									<div className="text-xs text-zinc-500 truncate">{t.url}</div>
								</div>
							))}
						</div>
					</div>

					{/* DETAIL PANEL */}
					<div className="flex-1 flex flex-col">
						{/* HEADER */}
						<div className="flex justify-between items-center px-5 py-3 border-b border-zinc-800">
							<div className="flex gap-2 items-center">
								<span className="text-xs bg-sky-400/10 text-sky-400 px-2 py-1 rounded">
									GET
								</span>
								<span className="text-sm font-semibold">Get collections</span>
							</div>
							<div className="flex gap-2">
								<button className="bg-zinc-800 px-3 py-1 text-xs rounded">
									<Pencil className="w-3 h-3 inline" /> Edit
								</button>
								<button className="bg-orange-500 text-black px-3 py-1 text-xs rounded">
									<Play className="w-3 h-3 inline" /> Run
								</button>
							</div>
						</div>

						<div className="p-5 space-y-6">
							{/* REQUEST */}
							<div>
								<p className="text-xs text-zinc-500 mb-2">REQUEST</p>
								<div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
									GET http://localhost:4000/collections
								</div>
							</div>

							{/* EXPECTED */}
							<div>
								<p className="text-xs text-zinc-500 mb-2">EXPECTED RESPONSE</p>
								<div className="bg-zinc-900 border border-zinc-800 p-3 rounded text-sm">
									Status: 200 | Body contains {}
								</div>
							</div>

							{/* RESULT */}
							<div>
								<p className="text-xs text-zinc-500 mb-2">LAST RUN RESULT</p>

								<div className="bg-zinc-900 border border-zinc-800 rounded">
									<div className="flex gap-4 p-3 text-xs border-b border-zinc-800">
										<span className="text-emerald-400 flex gap-1 items-center">
											<CheckCircle2 className="w-3 h-3" />
											PASS
										</span>
										<span>8ms</span>
										<span className="text-emerald-400">HTTP 200</span>
									</div>

									<pre className="p-3 text-xs text-green-400 bg-black">
										{`{
  "data": [],
  "total": 3
}`}
									</pre>
								</div>
							</div>

							{/* ASSERTIONS */}
							<div>
								<p className="text-xs text-zinc-500 mb-2">ASSERTIONS</p>

								<div className="space-y-2">
									<div className="bg-emerald-400/10 border border-emerald-400/20 p-2 rounded text-xs flex gap-2">
										<CheckCircle2 className="w-4 h-4 text-emerald-400" />
										Status matches 200
									</div>

									<div className="bg-rose-400/10 border border-rose-400/20 p-2 rounded text-xs flex gap-2">
										<XCircle className="w-4 h-4 text-rose-400" />
										Body validation failed
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
