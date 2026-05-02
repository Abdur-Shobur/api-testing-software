import { Method } from '@/type';

export const METHOD_STYLES: Record<Method, string> = {
	GET: 'text-sky-400 bg-sky-400/10 ring-sky-400/20',
	POST: 'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20',
	PUT: 'text-amber-400 bg-amber-400/10 ring-amber-400/20',
	DELETE: 'text-rose-400 bg-rose-400/10 ring-rose-400/20',
	PATCH: 'text-violet-400 bg-violet-400/10 ring-violet-400/20',
};
