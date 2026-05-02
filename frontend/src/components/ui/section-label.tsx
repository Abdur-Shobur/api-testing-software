export function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase mb-2">
			{children}
		</div>
	);
}
