import { KeyValuePair } from '@/type';
import React from 'react';

interface Props {
	pairs: KeyValuePair[];
	onChange: (pairs: KeyValuePair[]) => void;
	placeholder?: { key?: string; value?: string };
}

const s: Record<string, React.CSSProperties> = {
	wrap: { display: 'flex', flexDirection: 'column', gap: 6 },
	row: {
		display: 'grid',
		gridTemplateColumns: '20px 1fr 1fr 24px',
		gap: 6,
		alignItems: 'center',
	},
	check: {
		accentColor: 'var(--accent)',
		width: 14,
		height: 14,
		cursor: 'pointer',
	},
	input: {
		background: 'var(--bg)',
		border: '1px solid var(--border)',
		borderRadius: 4,
		padding: '5px 8px',
		color: 'var(--text)',
		fontSize: 12,
		width: '100%',
		transition: 'border-color 0.15s',
	},
	del: {
		background: 'none',
		color: 'var(--text3)',
		fontSize: 16,
		lineHeight: 1,
		padding: '2px 4px',
		borderRadius: 3,
		transition: 'color 0.15s',
	},
	add: {
		background: 'none',
		border: '1px dashed var(--border2)',
		borderRadius: 4,
		color: 'var(--text3)',
		fontSize: 11,
		padding: '5px 10px',
		cursor: 'pointer',
		width: '100%',
		textAlign: 'left' as const,
		transition: 'all 0.15s',
	},
};

export default function KeyValueEditor({
	pairs,
	onChange,
	placeholder,
}: Props) {
	const update = (
		i: number,
		field: keyof KeyValuePair,
		val: string | boolean,
	) => {
		const next = pairs.map((p, idx) =>
			idx === i ? { ...p, [field]: val } : p,
		);
		onChange(next);
	};
	const remove = (i: number) => onChange(pairs.filter((_, idx) => idx !== i));
	const add = () => onChange([...pairs, { key: '', value: '', enabled: true }]);

	return (
		<div style={s.wrap}>
			{pairs.map((p, i) => (
				<div key={i} style={s.row}>
					<input
						type="checkbox"
						checked={p.enabled}
						onChange={(e) => update(i, 'enabled', e.target.checked)}
						style={s.check}
					/>
					<input
						style={{ ...s.input, opacity: p.enabled ? 1 : 0.4 }}
						value={p.key}
						onChange={(e) => update(i, 'key', e.target.value)}
						placeholder={placeholder?.key ?? 'Key'}
					/>
					<input
						style={{ ...s.input, opacity: p.enabled ? 1 : 0.4 }}
						value={p.value}
						onChange={(e) => update(i, 'value', e.target.value)}
						placeholder={placeholder?.value ?? 'Value'}
					/>
					<button
						type="button"
						style={s.del}
						onClick={() => remove(i)}
						title="Remove"
					>
						×
					</button>
				</div>
			))}
			<button type="button" style={s.add} onClick={add}>
				+ Add row
			</button>
		</div>
	);
}
