'use client';

import { apiClient } from '@/lib/api';
import { EnvVar } from '@/type';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function EnvVarsPanel({ projectId }: { projectId?: string | null } = {}) {
	const [open, setOpen] = useState(false);
	const [vars, setVars] = useState<EnvVar[]>([]);
	const [keyName, setKeyName] = useState('');
	const [value, setValue] = useState('');

	const load = async () => {
		const { data } = await apiClient.get<{ data: EnvVar[] }>('/env-vars', {
			params:
				projectId === undefined ? undefined : { projectId: projectId ?? 'null' },
		});
		setVars(data.data);
	};

	useEffect(() => {
		void load().catch(() => toast.error('Failed to load environment variables'));
	}, []);

	const save = async () => {
		if (!keyName.trim()) return;
		await apiClient.post('/env-vars', { key: keyName.trim(), value, projectId });
		setKeyName('');
		setValue('');
		await load();
		toast.success('Environment variable saved');
	};

	const remove = async (key: string) => {
		await apiClient.delete(`/env-vars/${encodeURIComponent(key)}`, {
			params:
				projectId === undefined ? undefined : { projectId: projectId ?? 'null' },
		});
		await load();
		toast.success('Environment variable deleted');
	};

	return (
		<div className="border-t border-zinc-800 p-3">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="w-full flex items-center justify-between text-xs text-zinc-400"
			>
				<span>Environment ({vars.length})</span>
				<ChevronDown className={open ? 'w-3 h-3 rotate-180' : 'w-3 h-3'} />
			</button>
			{open && (
				<div className="mt-3 space-y-2">
					{vars.map((envVar) => (
						<div key={envVar.id ?? envVar.key} className="flex gap-1">
							<Input value={envVar.key} readOnly className="h-7 text-xs" />
							<Input value={envVar.value} readOnly className="h-7 text-xs" />
							<Button
								type="button"
								size="icon-xs"
								variant="destructive"
								onClick={() => void remove(envVar.key)}
							>
								<Trash2 className="w-3 h-3" />
							</Button>
						</div>
					))}
					<div className="grid grid-cols-[1fr_1fr_auto] gap-1">
						<Input
							placeholder="KEY"
							value={keyName}
							onChange={(e) => setKeyName(e.target.value)}
							className="h-7 text-xs"
						/>
						<Input
							placeholder="value"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="h-7 text-xs"
						/>
						<Button type="button" size="icon-xs" onClick={() => void save()}>
							<Plus className="w-3 h-3" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
