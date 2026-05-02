import { iTestCase } from '../test-case/type';

export interface Collection {
	testCases: iTestCase[];
	id: string;
	name: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
}
