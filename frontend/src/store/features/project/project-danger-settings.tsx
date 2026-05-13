import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function ProjectDangerSettings() {
	return (
		<Card className="bg-zinc-900 border-zinc-800">
			<CardHeader>
				<CardTitle>General Settings</CardTitle>
			</CardHeader>

			<CardContent className="space-y-5">
				<div className="space-y-2">
					<Label>Project Name</Label>

					<Input
						defaultValue="Frontend Dashboard"
						className="bg-zinc-950 border-zinc-800"
					/>
				</div>

				<div className="space-y-2">
					<Label>Description</Label>

					<Textarea
						defaultValue="Modern admin dashboard project."
						className="bg-zinc-950 border-zinc-800 min-h-[120px]"
					/>
				</div>

				<Button className="bg-orange-500 hover:bg-orange-600">
					Save Changes
				</Button>
			</CardContent>
		</Card>
	);
}
