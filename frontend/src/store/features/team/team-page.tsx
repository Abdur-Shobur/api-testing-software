'use client';

import { TeamCard } from './team-card';
import { TeamCreateModal } from './team-create-modal';

const teams = [
	{
		id: '1',
		name: 'Frontend Team',
		description: 'Handles UI development and components',
		members: 6,
	},
	{
		id: '2',
		name: 'Backend Team',
		description: 'API and database management',
		members: 4,
	},
	{
		id: '3',
		name: 'DevOps Team',
		description: 'Deployment and infrastructure',
		members: 3,
	},
];

export default function TeamPage() {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Teams</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Manage your teams and members
						</p>
					</div>

					{/* Create Team Modal */}
					<TeamCreateModal />
				</div>

				{/* Team Cards */}
				<div className="grid gap-4 md:grid-cols-2">
					{teams.map((team) => (
						<TeamCard key={team.id} {...team} />
					))}
				</div>
			</div>
		</div>
	);
}
