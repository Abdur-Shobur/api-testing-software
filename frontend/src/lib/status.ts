import { CheckCircle2, Circle, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
	pass: {
		label: 'Pass',
		icon: CheckCircle2,
		color: 'text-emerald-400',
		bg: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20',
	},
	fail: {
		label: 'Fail',
		icon: XCircle,
		color: 'text-rose-400',
		bg: 'bg-rose-400/10 text-rose-400 ring-rose-400/20',
	},
	pending: {
		label: 'Pending',
		icon: Circle,
		color: 'text-zinc-500',
		bg: 'bg-zinc-800 text-zinc-500 ring-zinc-700',
	},
	error: {
		label: 'Error',
		icon: XCircle,
		color: 'text-rose-400',
		bg: 'bg-rose-400/10 text-rose-400 ring-rose-400/20',
	},
};
