'use client';

import { Card, CardContent } from '@/components/ui/card';

import { Users } from 'lucide-react';
import { TeamMemberCard } from '../team-member/team-member-card';
import { TeamMemberCreateModal } from '../team-member/team-member-create-modal';

type Member = {
	id: string;
	name: string;
	email: string;
	role: string;
};

const initialMembers: Member[] = [
	{
		id: '1',
		name: 'John Doe',
		email: 'john@example.com',
		role: 'Frontend Developer',
	},
	{
		id: '2',
		name: 'Sarah Smith',
		email: 'sarah@example.com',
		role: 'Backend Developer',
	},
	{
		id: '3',
		name: 'Alex Johnson',
		email: 'alex@example.com',
		role: 'DevOps Engineer',
	},
];

export default function TeamPageView() {
	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Frontend Team</h1>

						<p className="text-sm text-zinc-500 mt-1">
							Manage your team members
						</p>
					</div>

					{/* Create Member */}
					<TeamMemberCreateModal />
				</div>

				{/* Stats */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
								<Users className="w-5 h-5 text-zinc-300" />
							</div>

							<div>
								<h2 className="font-semibold text-lg">Team Members</h2>

								<p className="text-sm text-zinc-500">00 Total Members</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Members List */}
				<div className="grid gap-4">
					{initialMembers.map((member) => (
						<TeamMemberCard key={member.id} {...member} />
					))}
				</div>
			</div>
		</div>
	);
}
