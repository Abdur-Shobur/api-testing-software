import { Types } from 'mongoose';
import { Team } from '../models/Team';
import { TeamMember, type TeamRole } from '../models/TeamMembers';

export async function resolveSessionTeam(
	userId: string,
): Promise<{ teamId: string; teamRole: TeamRole } | null> {
	const uid = new Types.ObjectId(userId);
	const owned = await Team.findOne({ ownerId: uid }).sort({ createdAt: 1 }).lean();
	if (owned) {
		const m = await TeamMember.findOne({ userId: uid, teamId: owned._id }).lean();
		return {
			teamId: String(owned._id),
			teamRole: (m?.role as TeamRole | undefined) ?? 'owner',
		};
	}
	const m = await TeamMember.findOne({ userId: uid }).sort({ joinedAt: 1 }).lean();
	if (!m?.teamId) return null;
	return { teamId: String(m.teamId), teamRole: m.role as TeamRole };
}
