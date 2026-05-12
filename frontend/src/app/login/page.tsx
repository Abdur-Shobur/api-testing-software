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

export default function LoginPage() {
	const { login } = useAuth();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setLoading(true);
		try {
			await login(email, password);
			toast.success('Logged in');
			router.replace('/');
		} catch {
			toast.error('Invalid email or password');
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Login</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
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
							{loading ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
					<p className="text-xs text-zinc-500 mt-4">
						No account?{' '}
						<Link className="text-orange-400" href="/register">
							Create one
						</Link>
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
