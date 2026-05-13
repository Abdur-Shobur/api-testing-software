'use client';

import { useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import { Settings, Trash2 } from 'lucide-react';
import { ProjectDangerSettings } from './project-danger-settings';
import { ProjectGeneralSettings } from './project-general-settings';

const tabs = [
	{
		id: 'general',
		label: 'General',
		icon: Settings,
	},

	{
		id: 'danger',
		label: 'Danger Zone',
		icon: Trash2,
	},
];

export function ProjectPage() {
	const [activeTab, setActiveTab] = useState('general');

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-xl font-bold">Project Settings</h1>

					<p className="text-zinc-500 text-sm mt-1">
						Manage your project preferences and configurations
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
					{/* Sidebar Tabs */}
					<Card className="bg-zinc-900 border-zinc-800 h-fit">
						<CardContent className="p-3">
							<div className="space-y-1">
								{tabs.map((tab) => {
									const Icon = tab.icon;

									return (
										<button
											key={tab.id}
											onClick={() => setActiveTab(tab.id)}
											className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
												activeTab === tab.id
													? 'bg-orange-500 text-white'
													: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
											}`}
										>
											<Icon className="w-4 h-4" />
											{tab.label}
										</button>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Content */}
					<div className="space-y-6 w-full">
						{/* General */}
						{activeTab === 'general' && <ProjectGeneralSettings />}

						{/* Danger Zone */}
						{activeTab === 'danger' && <ProjectDangerSettings />}
					</div>
				</div>
			</div>
		</div>
	);
}
