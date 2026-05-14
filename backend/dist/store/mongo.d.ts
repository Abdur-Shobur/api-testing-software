import { Types } from 'mongoose';
import { Collection, CollectionTreeNode, CreateCollectionDto, CreateTestCaseDto, TestCase, UpdateCollectionDto, UpdateTestCaseDto } from '../types';
export declare function getAllCollections(teamId: string, projectId?: string | null): Promise<Collection[]>;
export declare function getAssignedCollections(teamId: string, userId: string): Promise<Collection[]>;
export declare function getCollectionById(id: string): Promise<Collection | undefined>;
export declare function createCollection(dto: CreateCollectionDto & {
    parentId?: string | null;
    assignedUserIds?: string[];
    projectId?: Types.ObjectId | null;
}, teamId: string, createdByUserId: string): Promise<Collection | undefined>;
export declare function updateCollection(id: string, teamId: string, dto: UpdateCollectionDto & {
    parentId?: string | null;
    assignedUserIds?: string[];
    projectId?: string | null;
}): Promise<Collection | undefined>;
export declare function deleteCollection(id: string, teamId: string): Promise<boolean>;
export declare function getCollectionChildren(id: string, projectId?: string | null): Promise<Collection[]>;
export declare function getCollectionTree(id: string, teamId: string, maxDepth?: number): Promise<CollectionTreeNode | undefined>;
export declare function createTestCase(collectionId: string, dto: CreateTestCaseDto): Promise<TestCase | undefined>;
export declare function getTestCaseById(collectionId: string, testId: string): Promise<TestCase | undefined>;
export declare function updateTestCase(collectionId: string, testId: string, dto: UpdateTestCaseDto): Promise<TestCase | undefined>;
export declare function deleteTestCase(collectionId: string, testId: string): Promise<boolean>;
//# sourceMappingURL=mongo.d.ts.map