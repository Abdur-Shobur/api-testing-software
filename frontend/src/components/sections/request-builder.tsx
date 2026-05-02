'use client';

import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const METHODS: Method[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function RequestBuilder() {
	const [method, setMethod] = useState<Method>('GET');
	const [url, setUrl] = useState('http://localhost:4000/collections');
	const [tab, setTab] = useState<'params' | 'headers' | 'body'>('params');

	const [headers, setHeaders] = useState([{ key: '', value: '' }]);
	const [params, setParams] = useState([{ key: '', value: '' }]);
	const [body, setBody] = useState('{}');

	return (
		<div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
			{/* TOP BAR */}
			<div className="flex items-center gap-2 p-3 border-b border-zinc-800">
				{/* METHOD */}
				<select
					value={method}
					onChange={(e) => setMethod(e.target.value as Method)}
					className="bg-zinc-800 text-zinc-200 text-xs px-2 py-1.5 rounded-md outline-none ring-1 ring-zinc-700"
				>
					{METHODS.map((m) => (
						<option key={m}>{m}</option>
					))}
				</select>

				{/* URL */}
				<input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					className="flex-1 bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-md outline-none ring-1 ring-zinc-700 font-mono"
				/>

				<button className="bg-orange-500 text-black text-xs px-3 py-1.5 rounded-md font-medium hover:bg-orange-400 transition">
					Send
				</button>
			</div>

			{/* TABS */}
			<div className="flex border-b border-zinc-800 text-xs">
				{['params', 'headers', 'body'].map((t) => (
					<button
						key={t}
						onClick={() => setTab(t as any)}
						className={cn(
							'px-4 py-2 capitalize border-b-2',
							tab === t
								? 'border-orange-400 text-white'
								: 'border-transparent text-zinc-500 hover:text-zinc-300',
						)}
					>
						{t}
					</button>
				))}
			</div>

			{/* CONTENT */}
			<div className="p-3 text-xs">
				{/* PARAMS */}
				{tab === 'params' && (
					<KeyValueEditor data={params} setData={setParams} />
				)}

				{/* HEADERS */}
				{tab === 'headers' && (
					<KeyValueEditor data={headers} setData={setHeaders} />
				)}

				{/* BODY */}
				{tab === 'body' && (
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						className="w-full h-40 bg-black text-green-400 font-mono text-xs p-3 rounded-md outline-none ring-1 ring-zinc-800"
					/>
				)}
			</div>
		</div>
	);
}

// ─── Key Value Editor ─────────────────────────────────────

function KeyValueEditor({
	data,
	setData,
}: {
	data: { key: string; value: string }[];
	setData: (d: any) => void;
}) {
	const update = (index: number, field: 'key' | 'value', value: string) => {
		const copy = [...data];
		copy[index][field] = value;
		setData(copy);
	};

	const add = () => setData([...data, { key: '', value: '' }]);

	const remove = (index: number) => {
		const copy = data.filter((_, i) => i !== index);
		setData(copy);
	};

	return (
		<div className="space-y-2">
			{data.map((row, i) => (
				<div key={i} className="flex gap-2 items-center">
					<input
						placeholder="Key"
						value={row.key}
						onChange={(e) => update(i, 'key', e.target.value)}
						className="flex-1 bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md outline-none ring-1 ring-zinc-700"
					/>
					<input
						placeholder="Value"
						value={row.value}
						onChange={(e) => update(i, 'value', e.target.value)}
						className="flex-1 bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md outline-none ring-1 ring-zinc-700"
					/>

					<button
						onClick={() => remove(i)}
						className="text-zinc-500 hover:text-rose-400"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			))}

			<button
				onClick={add}
				className="flex items-center gap-1 text-zinc-500 hover:text-white mt-2"
			>
				<Plus className="w-4 h-4" />
				Add
			</button>
		</div>
	);
}
