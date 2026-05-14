'use client';

import { DetailPanel, RunAllPanel } from '@/components/view';
import { useProjectContext } from '@/store/features/project/project-context';
import { useRunCollectionMutation } from '@/store/features/test-case/test-case-api-slice';
import { Zap } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

function RunAllWrapper({ collectionId }: { collectionId: string }) {
	const router = useRouter();
	const { projectId } = useProjectContext();

	const [runCollection, { data, isLoading }] = useRunCollectionMutation();
	const hasRun = useRef(false);

	useEffect(() => {
		if (!hasRun.current) {
			hasRun.current = true;
			if (projectId) {
				runCollection({ colId: collectionId, projectId });
			}
		}
	}, [collectionId, runCollection]);

	return (
		<RunAllPanel
			result={data?.data!}
			onClose={() => router.back()}
			isRunning={isLoading}
		/>
	);
}

export default function ViewCollectionPage() {
	const params = useParams();
	const segments = params.collectionid as string[];
	const teamId = params.teamId as string;
	const collectionId = segments?.[0];
	const testId = segments?.[1];

	return (
		<>
			{!testId ? (
				<div className="flex-1 flex flex-col min-w-0 items-center justify-center text-zinc-600 gap-3">
					<Zap className="w-8 h-8 opacity-30" />
					<span className="text-sm">Select an API to view details</span>
				</div>
			) : testId === 'run-all' ? (
				<RunAllWrapper collectionId={collectionId} />
			) : (
				<DetailPanel collectionId={collectionId} testId={testId} />
			)}
		</>
	);
}
