import { cn } from '@/lib/utils';

export function IconBtn({
	children,
	onClick,
	variant = 'default',
	title,
}: {
	children: React.ReactNode;
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
	variant?: 'default' | 'danger';
	title?: string;
}) {
	return (
		<button
			title={title}
			onClick={onClick}
			className={cn(
				'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150',
				'ring-1 ring-transparent',
				variant === 'default'
					? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60 hover:ring-zinc-600'
					: 'text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 hover:ring-rose-400/20',
			)}
		>
			{children}
		</button>
	);
}
