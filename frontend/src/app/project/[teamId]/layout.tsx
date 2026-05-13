'use client';
import { CollectionTree, TeamSwitcher, TopBar } from '@/components/view';
import { Flame, LogOut } from 'lucide-react';

export default function ViewProjectLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 font-sans">
				<div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
					{/* Top bar */}
					<TopBar />
					{/* Main panels */}
					<div className="flex flex-1">
						<aside className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 w-56 shrink-0">
							{/* Header */}
							<div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
								<TeamSwitcher
									teams={[
										{ name: 'Project 1', logo: Flame, plan: 'Free' },
										{ name: 'Project 2', logo: Flame, plan: 'Free' },
									]}
								/>
								{/* <CreateModal projectId={projectId ?? null} /> */}
							</div>

							{/* Label */}
							<div className="px-4 pt-2 pb-1.5">
								<span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
									Collections
								</span>
							</div>

							{/* List */}
							<div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
								<CollectionTree />
							</div>
							{/* <EnvVarsPanel projectId={projectId} /> */}

							<div className="px-3 py-3 border-b border-zinc-800 flex items-center gap-2">
								<div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs font-semibold">
									name
								</div>
								<button type="button" className="min-w-0 flex-1 text-left">
									<div className="text-[12px] text-zinc-100 truncate">Name</div>
									<div className="text-[10px] text-zinc-500 truncate">Role</div>
								</button>
								<button
									type="button"
									className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500"
									title="Logout"
								>
									<LogOut className="w-3.5 h-3.5" />
								</button>
							</div>
						</aside>

						{children}
					</div>
				</div>
			</div>
		</>
	);
}
