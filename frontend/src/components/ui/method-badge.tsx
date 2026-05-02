import { METHOD_STYLES } from '@/lib/method-style';
import { cn } from '@/lib/utils';
import { Method } from '@/type';

export function MethodBadge({ method }: { method: Method }) {
	return (
		<span
			className={cn(
				'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider ring-1 font-mono',
				METHOD_STYLES[method],
			)}
		>
			{method}
		</span>
	);
}
