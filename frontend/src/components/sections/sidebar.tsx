import { CollectionTree } from '@/components/CollectionTree';
import { EnvVarsPanel } from '@/components/EnvVarsPanel';
import { useAuth } from '@/hooks/useAuth';
import { CreateModal } from '@/store/features/collections/create-modal';
import { Collection } from '@/store/features/collections/type';
import { useGetProjectsQuery } from '@/store/features/projects/api-slice';
import { useGetMyTeamCollectionsQuery } from '@/store/features/team/api-slice';
import { Flame, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
export function Sidebar({
	collections,
	selectedId,
	onSelect,
	projectId,
	onProjectChange,
}: {
	collections: Collection[];
	selectedId: string;
	onSelect: (id: string) => void;
	projectId?: string | null;
	onProjectChange?: (projectId: string | null) => void;
}) {
	const { user, logout } = useAuth();
	const router = useRouter();
	const { data } = useGetMyTeamCollectionsQuery();
	const { data: projectsData } = useGetProjectsQuery();
	const projects = projectsData?.data ?? [];
	return (
		<aside className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 w-56 shrink-0">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
				<div className="flex items-center gap-2">
					<div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
						<Flame className="w-3.5 h-3.5 text-orange-400" />
					</div>
					<span className="text-[13px] font-semibold text-zinc-100 tracking-tight">
						API Test
					</span>
				</div>
				<CreateModal projectId={projectId ?? null} />
			</div>

			{user && (
				<div className="px-3 py-3 border-b border-zinc-800 flex items-center gap-2">
					<div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs font-semibold">
						{user.name.slice(0, 1).toUpperCase()}
					</div>
					<button
						type="button"
						onClick={() => router.push('/team')}
						className="min-w-0 flex-1 text-left"
					>
						<div className="text-[12px] text-zinc-100 truncate">
							{user.name}
						</div>
						<div className="text-[10px] text-zinc-500 truncate">
							{user.role}
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
			)}

			{/* Project selector */}
			<div className="px-3 py-3 border-b border-zinc-800">
				<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
					Project
				</div>
				<Select
					value={projectId ?? 'null'}
					onValueChange={(v) => onProjectChange?.(v === 'null' ? null : v)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select project" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="null">Unassigned</SelectItem>
						{projects.map((p) => (
							<SelectItem key={p.id ?? p._id} value={p.id ?? p._id}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<button
					type="button"
					onClick={() => router.push('/projects')}
					className="mt-2 w-full text-[12px] text-zinc-400 hover:text-zinc-200 text-left"
				>
					Manage projects
				</button>
			</div>

			{/* Label */}
			<div className="px-4 pt-4 pb-1.5">
				<span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
					Collections
				</span>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
				<CollectionTree
					collections={collections}
					selectedId={selectedId}
					onSelect={onSelect}
					projectId={projectId}
				/>
			</div>
			<EnvVarsPanel projectId={projectId} />
		</aside>
	);
}
