import { cn } from '@/lib/utils';

export function Btn({
	children,
	onClick,
	variant = 'default',
	size = 'md',
}: {
	children: React.ReactNode;
	onClick?: () => void;
	variant?: 'default' | 'primary';
	size?: 'sm' | 'md';
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-1.5 font-medium rounded-md transition-all duration-150 active:scale-95',
				size === 'sm' ? 'text-xs px-2.5 h-7' : 'text-xs px-3 h-8',
				variant === 'default'
					? 'bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700 hover:bg-zinc-700 hover:text-zinc-100 hover:ring-zinc-600'
					: 'bg-zinc-100 text-zinc-900 hover:bg-white',
			)}
		>
			{children}
		</button>
	);
}
