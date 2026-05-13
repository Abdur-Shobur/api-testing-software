import { Team } from '../models/Team';
import type { UserRole } from '../models/User';

export async function getRestrictedProjectIdForMember(
	userId: string,
	teamId: string,
	role: UserRole | undefined
): Promise<string | undefined> {
	if (!role || role === 'owner' || role === 'admin') return undefined;
	const team = await Team.findById(teamId).lean<{
		members: { userId: unknown; projectId?: unknown }[];
	}>();
	if (!team) return undefined;
	const member = team.members.find((m) => String(m.userId) === userId);
	if (member?.projectId) return String(member.projectId);
	return undefined;
}

export function collectionProjectMatches(
	restrictedProjectId: string | undefined,
	collectionProjectId: string | null | undefined
): boolean {
	if (!restrictedProjectId) return true;
	const cp = collectionProjectId ? String(collectionProjectId) : null;
	return cp === restrictedProjectId;
}
