'use client';

import { getToken } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const publicRoutes = ['/login', '/register'];

export function AuthGuard({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [ready, setReady] = useState(false);
	const isPublic = publicRoutes.includes(pathname);

	useEffect(() => {
		const token = getToken();
		if (!token && !isPublic) {
			router.replace('/login');
			return;
		}
		if (token && isPublic) {
			router.replace('/');
			return;
		}
		setReady(true);
	}, [isPublic, router]);

	if (!ready && !isPublic) {
		return (
			<div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">
				Loading...
			</div>
		);
	}

	return <>{children}</>;
}
