'use client';

import { CollectionTree, TopBar } from '@/components/view';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/route';
import { CollectionCreateModal } from '@/store/features/collection/collection-create-modal';
import { useProjectContext, ProjectProvider } from '@/store/features/project/project-context';
import { ProjectSwitcher } from '@/store/features/project/project-switcher';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SidebarFooter() {
	const { user, logout } = useAuth();
	const router = useRouter();

	if (!user) return null;

	return (
		<div className="px-3 py-3 border-t border-zinc-800 flex items-center gap-2 mt-auto">
			<div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs font-semibold">
				{user.name.slice(0, 1).toUpperCase()}
			</div>
			<button
				type="button"
				onClick={() => router.push(ROUTES.team.main)}
				className="min-w-0 flex-1 text-left"
			>
				<div className="text-[12px] text-zinc-100 truncate">{user.name}</div>
				<div className="text-[10px] text-zinc-500 truncate">
					{user.teamRole ?? user.role}
				</div>
			</button>
			<button
				type="button"
				onClick={() => {
					logout();
					router.replace('/login');
				}}
				className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500"
				title="Logout"
			>
				<LogOut className="w-3.5 h-3.5" />
			</button>
		</div>
	);
}

function CollectionHeader() {
	const { projectId } = useProjectContext();

	return (
		<div className="group flex items-center justify-between px-4 pt-2 pb-1.5">
			<span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
				Collections
			</span>
			{projectId && (
				<CollectionCreateModal parentId={null} projectId={projectId} />
			)}
		</div>
	);
}

function LayoutInner({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 font-sans">
			<div className="h-[calc(100vh-24px)] flex flex-col rounded-xl border border-zinc-800 overflow-hidden">
				<TopBar />
				<div className="flex flex-1 overflow-hidden">
					<aside className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 w-56 shrink-0">
						<div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
							<ProjectSwitcher />
						</div>

						<CollectionHeader />

						<div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
							<CollectionTree />
						</div>

						<SidebarFooter />
					</aside>

					{children}
				</div>
			</div>
		</div>
	);
}

export default function ViewProjectLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProjectProvider>
			<LayoutInner>{children}</LayoutInner>
		</ProjectProvider>
	);
}
