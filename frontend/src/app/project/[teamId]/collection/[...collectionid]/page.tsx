import { StaticDetailPanel } from '@/components/view/static-detail-panel';
import { StaticRunAllPanel } from '@/components/view/static-run-all-panel';
import { Zap } from 'lucide-react';

export default async function ViewCollectionPage({ params }: { params: any }) {
	const hasParams = await params;
	if (!hasParams.collectionid[1]) {
		return (
			<div className="flex-1 flex flex-col min-w-0">
				<div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
					<Zap className="w-8 h-8 opacity-30" />
					<span className="text-sm">Select a api to view details</span>
				</div>
			</div>
		);
	}
	if (hasParams.collectionid[1] === 'run-all') {
		return (
			<>
				<StaticRunAllPanel />;
			</>
		);
	} else {
		return <StaticDetailPanel />;
	}
}
