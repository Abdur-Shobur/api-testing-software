'use client';

// ─── Static Data ─────────────────────────────────────────

const collection = {
	name: 'ABC',
	tests: [
		{
			id: '1',
			name: 'Get collections',
			method: 'GET',
			url: 'http://localhost:4000/collections',
			status: 'pass',
		},
		{
			id: '2',
			name: 'Create collection',
			method: 'POST',
			url: 'http://localhost:4000/collections',
			status: 'fail',
		},
	],
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
