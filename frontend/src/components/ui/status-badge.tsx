import { STATUS_CONFIG } from '@/lib/status';
import { cn } from '@/lib/utils';
import { Status } from '@/type';

export function StatusBadge({ status }: { status: Status }) {
	const cfg = STATUS_CONFIG[status];
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1',
				cfg.bg,
			)}
		>
			{status === 'pass' && (
				<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
			)}
			{status === 'fail' && (
				<span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
			)}
			{status === 'pending' && (
				<span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
			)}
			{cfg.label}
		</span>
	);
}
