import { TestCaseView } from '@/store/features/test-case/test-case-view';

const projects = {
	name: 'ABC',
	tests: [
		{
			id: '1',
			name: 'Project 1',
			method: 'GET',
			url: 'http://localhost:4000/collections',
			status: 'pass',
		},
		{
			id: '2',
			name: 'Project 2',
			method: 'POST',
			url: 'http://localhost:4000/collections',
			status: 'fail',
		},
	],
};
const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<TestCaseView />
			{/* DETAIL PANEL */}
			{children}
		</>
	);
};

export default Layout;
