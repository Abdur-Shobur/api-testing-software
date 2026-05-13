import { ROUTES } from '@/lib/route';
import { Home } from 'lucide-react';
import Link from 'next/link';

export const TopBar = () => {
	return (
		<div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
			<div className="flex items-center gap-2.5">
				<div className="flex gap-1.5">
					<span className="w-3 h-3 rounded-full bg-zinc-700" />
					<span className="w-3 h-3 rounded-full bg-zinc-700" />
					<span className="w-3 h-3 rounded-full bg-zinc-700" />
				</div>
				<div className="w-px h-4 bg-zinc-800" />
				<Link
					href={ROUTES.home}
					className="flex items-center gap-1.5 text-zinc-400"
				>
					<Home className="w-3.5 h-3.5 text-orange-400" />
					<span className="text-[12px] font-medium tracking-wide">
						API Testing
					</span>
				</Link>
			</div>
			<div className="flex items-center gap-2 text-[11px] text-zinc-600">
				<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
				Connected to localhost:4000
			</div>
		</div>
	);
};
