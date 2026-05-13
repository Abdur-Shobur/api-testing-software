import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { getRestrictedProjectIdForMember } from '../lib/memberProjectScope';
import { slugify } from '../lib/slugify';
import { Collection } from '../models/Collection';
import { Documentation } from '../models/Documentation';
import { Project } from '../models/Project';
import { ProjectSettings } from '../models/ProjectSetting';
import { TestCase } from '../models/TestCase';

export const projectsRouter = Router();

async function uniqueProjectSlug(
	teamId: Types.ObjectId,
	baseName: string
): Promise<string> {
	let slug = slugify(baseName) || 'project';
	let n = 0;
	while (await Project.exists({ teamId, slug })) {
		n += 1;
		slug = `${slugify(baseName) || 'project'}-${n}`;
	}
	return slug;
}

function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}

projectsRouter.get(
	'/',
	asyncHandler(async (req, res) => {
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.teamRole
		);
		const filter: Record<string, unknown> = { teamId: req.user!.teamId };
		if (restricted) filter._id = new Types.ObjectId(restricted);
		const projects = await Project.find(filter)
			.sort({
				createdAt: 1,
			})
			.populate('settings');
		res.json({ data: projects, total: projects.length });
	})
);

projectsRouter.post(
	'/',
	asyncHandler(async (req, res) => {
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.teamRole
		);
		if (restricted) {
			res
				.status(403)
				.json({ error: 'Cannot create projects for this account' });
			return;
		}
		const { name, description = '', visibility = 'private' } = req.body ?? {};
		if (!name?.trim()) {
			res.status(400).json({ error: 'name is required' });
			return;
		}
		const teamOid = new Types.ObjectId(req.user!.teamId);
		const slug = await uniqueProjectSlug(teamOid, String(name));
		const settings = await ProjectSettings.create({
			baseUrl: '',
			auth: {},
		});
		const project = await Project.create({
			name: String(name).trim(),
			slug,
			description: String(description ?? ''),
			teamId: teamOid,
			createdBy: new Types.ObjectId(req.user!.userId),
			visibility:
				visibility === 'team' || visibility === 'public'
					? visibility
					: 'private',
			settings: settings._id,
		});
		const populated =
			(await Project.findById(project._id).populate('settings')) ?? project;
		res.status(201).json({ data: populated });
	})
);

projectsRouter.get(
	'/:projectId',
	asyncHandler(async (req, res) => {
		if (!Types.ObjectId.isValid(req.params.projectId)) {
			res.status(400).json({ error: 'invalid projectId' });
			return;
		}
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.teamRole
		);
		const project = await Project.findOne({
			_id: req.params.projectId,
			teamId: req.user!.teamId,
		}).populate('settings');
		if (!project) {
			res.status(404).json({ error: 'Project not found' });
			return;
		}
		if (restricted && String(project._id) !== restricted) {
			res.status(404).json({ error: 'Project not found' });
			return;
		}
		res.json({ data: project });
	})
);

projectsRouter.patch(
	'/:projectId',
	asyncHandler(async (req, res) => {
		if (!Types.ObjectId.isValid(req.params.projectId)) {
			res.status(400).json({ error: 'invalid projectId' });
			return;
		}
		const { name, description, visibility, baseUrl, auth } = req.body ?? {};

		const update: Record<string, unknown> = {};
		if (name !== undefined) {
			if (!String(name).trim()) {
				res.status(400).json({ error: 'name cannot be empty' });
				return;
			}
			update.name = String(name).trim();
			update.slug = slugify(String(name).trim());
		}
		if (description !== undefined)
			update.description = String(description ?? '');
		if (visibility !== undefined) {
			if (!['private', 'team', 'public'].includes(String(visibility))) {
				res.status(400).json({ error: 'invalid visibility' });
				return;
			}
			update.visibility = visibility;
		}

		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.teamRole
		);
		const project = await Project.findOneAndUpdate(
			{
				_id: req.params.projectId,
				teamId: req.user!.teamId,
				...(restricted ? { _id: new Types.ObjectId(restricted) } : {}),
			},
			update,
			{ new: true }
		);
		if (!project) {
			res.status(404).json({ error: 'Project not found' });
			return;
		}

		if (baseUrl !== undefined || auth !== undefined) {
			let settingsId = project.settings as Types.ObjectId | undefined;
			if (!settingsId) {
				const created = await ProjectSettings.create({
					baseUrl: '',
					auth: {},
				});
				settingsId = created._id as Types.ObjectId;
				project.settings = settingsId;
				await project.save();
			}
			const settingsUpdate: Record<string, unknown> = {};
			if (baseUrl !== undefined) settingsUpdate.baseUrl = String(baseUrl ?? '');
			if (auth !== undefined) settingsUpdate.auth = auth;
			if (Object.keys(settingsUpdate).length > 0) {
				await ProjectSettings.findByIdAndUpdate(settingsId, settingsUpdate, {
					new: true,
				});
			}
		}

		const fresh = await Project.findById(project._id).populate('settings');
		res.json({ data: fresh ?? project });
	})
);

projectsRouter.delete(
	'/:projectId',
	asyncHandler(async (req, res) => {
		if (!Types.ObjectId.isValid(req.params.projectId)) {
			res.status(400).json({ error: 'invalid projectId' });
			return;
		}
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.teamRole
		);
		const result = await Project.deleteOne({
			_id: req.params.projectId,
			teamId: req.user!.teamId,
			...(restricted ? { _id: new Types.ObjectId(restricted) } : {}),
		});
		if (result.deletedCount !== 1) {
			res.status(404).json({ error: 'Project not found' });
			return;
		}
		res.json({ data: { deleted: true } });
	})
);

projectsRouter.get(
	'/:projectId/documentation',
	asyncHandler(async (req, res) => {
		if (!Types.ObjectId.isValid(req.params.projectId)) {
			res.status(400).json({ error: 'invalid projectId' });
			return;
		}
		const restricted = await getRestrictedProjectIdForMember(
			req.user!.userId,
			req.user!.teamId,
			req.user!.teamRole
		);
		if (restricted && req.params.projectId !== restricted) {
			res.status(404).json({ error: 'Project not found' });
			return;
		}
		const project = await Project.exists({
			_id: req.params.projectId,
			teamId: req.user!.teamId,
		});
		if (!project) {
			res.status(404).json({ error: 'Project not found' });
			return;
		}

		const projectId = new Types.ObjectId(req.params.projectId);
		const teamId = new Types.ObjectId(req.user!.teamId);

		const collections = await Collection.find({
			teamId,
			projectId,
			deletedAt: null,
		}).sort({
			createdAt: 1,
		});
		const collectionIds = collections.map((c) => c._id);

		const [docs, tests] = await Promise.all([
			Documentation.find({ collectionId: { $in: collectionIds } }),
			TestCase.find({ collectionId: { $in: collectionIds } }).sort({
				createdAt: 1,
			}),
		]);

		const docsByCollectionId = new Map<string, any>();
		for (const d of docs) docsByCollectionId.set(String(d.collectionId), d);

		const testsByCollectionId = new Map<string, any[]>();
		for (const t of tests) {
			const key = String(t.collectionId);
			const arr = testsByCollectionId.get(key) ?? [];
			arr.push(t);
			testsByCollectionId.set(key, arr);
		}

		type Node = {
			id: string;
			_id: string;
			name: string;
			description: string;
			parentId: string | null;
			projectId: string;
			teamId: string;
			createdAt: string;
			updatedAt: string;
			documentation: any | null;
			testCases: any[];
			children: Node[];
		};

		const nodes = new Map<string, Node>();
		for (const c of collections) {
			const obj: any = c.toObject({ virtuals: true });
			const id = obj.id ?? String(obj._id);
			const _id = String(obj._id);
			const parentId = obj.parentId ? String(obj.parentId) : null;
			const doc = docsByCollectionId.get(_id) ?? null;
			const testCases = (testsByCollectionId.get(_id) ?? []).map((tc) => {
				const tco: any = tc.toObject({ virtuals: true });
				return {
					...tco,
					id: tco.id ?? String(tco._id),
					_id: String(tco._id),
					collectionId: String(tco.collectionId),
					createdAt: tco.createdAt.toISOString(),
					updatedAt: tco.updatedAt.toISOString(),
				};
			});

			nodes.set(_id, {
				...obj,
				id,
				_id,
				parentId,
				teamId: String(obj.teamId),
				projectId: String(obj.projectId),
				description: obj.description ?? '',
				createdAt: obj.createdAt.toISOString(),
				updatedAt: obj.updatedAt.toISOString(),
				documentation: doc
					? {
							...doc.toObject({ virtuals: true }),
							id: doc.id ?? String(doc._id),
							_id: String(doc._id),
							collectionId: String(doc.collectionId),
							createdAt: doc.createdAt.toISOString(),
							updatedAt: doc.updatedAt.toISOString(),
					  }
					: null,
				testCases,
				children: [],
			});
		}

		const roots: Node[] = [];
		for (const node of nodes.values()) {
			if (!node.parentId) {
				roots.push(node);
				continue;
			}
			const parent = nodes.get(node.parentId);
			if (parent) parent.children.push(node);
			else roots.push(node); // fallback
		}

		res.json({ data: { projectId: req.params.projectId, tree: roots } });
	})
);
