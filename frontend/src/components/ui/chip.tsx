import { cn } from '@/lib/utils';

export function Chip({
	children,
	mono,
	className,
}: {
	children: React.ReactNode;
	mono?: boolean;
	className?: string;
}) {
	return (
		<span
			className={cn(
				'px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-[12px] ring-1 ring-zinc-700',
				mono && 'font-mono',
				className,
			)}
		>
			{children}
		</span>
	);
}
