"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSessionTeam = resolveSessionTeam;
const mongoose_1 = require("mongoose");
const Team_1 = require("../models/Team");
const TeamMembers_1 = require("../models/TeamMembers");
async function resolveSessionTeam(userId) {
    const uid = new mongoose_1.Types.ObjectId(userId);
    const owned = await Team_1.Team.findOne({ ownerId: uid }).sort({ createdAt: 1 }).lean();
    if (owned) {
        const m = await TeamMembers_1.TeamMember.findOne({ userId: uid, teamId: owned._id }).lean();
        return {
            teamId: String(owned._id),
            teamRole: m?.role ?? 'owner',
        };
    }
    const m = await TeamMembers_1.TeamMember.findOne({ userId: uid }).sort({ joinedAt: 1 }).lean();
    if (!m?.teamId)
        return null;
    return { teamId: String(m.teamId), teamRole: m.role };
}
//# sourceMappingURL=sessionTeam.js.map