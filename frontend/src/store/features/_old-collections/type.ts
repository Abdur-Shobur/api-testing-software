import { iTestCase } from '../test-case/type';

export interface Collection {
	testCases: iTestCase[];
	id: string;
	_id?: string;
	name: string;
	description: string;
	parentId?: string | null;
	teamId?: string;
	projectId?: string | null;
	children?: Collection[];
	createdAt: Date;
	updatedAt: Date;
}
