'use client';

import { useTestQuery } from './test-api-slice';

export const TestQuery = () => {
	const { data } = useTestQuery(undefined);
	return <div>TestQuery</div>;
};
