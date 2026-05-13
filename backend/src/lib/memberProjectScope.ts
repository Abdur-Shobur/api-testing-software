import { Types } from 'mongoose';
import { TeamMember } from '../models/TeamMembers';
import type { TeamRole } from '../models/TeamMembers';

export async function getRestrictedProjectIdForMember(
	userId: string,
	teamId: string,
	teamRole: TeamRole | undefined,
): Promise<string | undefined> {
	if (!teamRole || teamRole === 'owner' || teamRole === 'admin') return undefined;
	const m = await TeamMember.findOne({
		userId: new Types.ObjectId(userId),
		teamId: new Types.ObjectId(teamId),
	}).lean<{ projectId?: Types.ObjectId | null }>();
	if (m?.projectId) return String(m.projectId);
	return undefined;
}

export function collectionProjectMatches(
	restrictedProjectId: string | undefined,
	collectionProjectId: string | null | undefined,
): boolean {
	if (!restrictedProjectId) return true;
	const cp = collectionProjectId ? String(collectionProjectId) : null;
	return cp === restrictedProjectId;
}
