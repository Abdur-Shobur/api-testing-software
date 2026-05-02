import fs from 'fs-extra';
import path from 'path';
import { Collection } from '../types';

const DATA_DIR = path.resolve(process.env.DATA_DIR ?? './data');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensureStore(): Promise<void> {
	await fs.ensureDir(DATA_DIR);
	const exists = await fs.pathExists(COLLECTIONS_FILE);
	if (!exists) {
		await fs.writeJson(COLLECTIONS_FILE, [], { spaces: 2 });
	}
}

async function readAll(): Promise<Collection[]> {
	await ensureStore();
	return fs.readJson(COLLECTIONS_FILE) as Promise<Collection[]>;
}

async function writeAll(collections: Collection[]): Promise<void> {
	await ensureStore();
	await fs.writeJson(COLLECTIONS_FILE, collections, { spaces: 2 });
}

// ─── Collection CRUD ─────────────────────────────────────────────────────────

export async function getAllCollections(): Promise<Collection[]> {
	return readAll();
}

export async function getCollectionById(
	id: string,
): Promise<Collection | undefined> {
	const all = await readAll();
	return all.find((c) => c.id === id);
}

export async function saveCollection(
	collection: Collection,
): Promise<Collection> {
	const all = await readAll();
	const idx = all.findIndex((c) => c.id === collection.id);
	if (idx === -1) {
		all.push(collection);
	} else {
		all[idx] = collection;
	}
	await writeAll(all);
	return collection;
}

export async function deleteCollection(id: string): Promise<boolean> {
	const all = await readAll();
	const next = all.filter((c) => c.id !== id);
	if (next.length === all.length) return false;
	await writeAll(next);
	return true;
}
