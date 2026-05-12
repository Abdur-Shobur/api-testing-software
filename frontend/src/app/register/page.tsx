'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

export default function RegisterPage() {
	const { register } = useAuth();
	const router = useRouter();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setLoading(true);
		try {
			await register(name, email, password);
			toast.success('Account created');
			router.replace('/');
		} catch {
			toast.error('Could not create account');
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Create account</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label>Name</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Email</Label>
							<Input value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Password</Label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<Button className="w-full" disabled={loading}>
							{loading ? 'Creating...' : 'Create account'}
						</Button>
					</form>
					<p className="text-xs text-zinc-500 mt-4">
						Already registered?{' '}
						<Link className="text-orange-400" href="/login">
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
