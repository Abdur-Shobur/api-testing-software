"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestrictedProjectIdForMember = getRestrictedProjectIdForMember;
exports.collectionProjectMatches = collectionProjectMatches;
const mongoose_1 = require("mongoose");
const TeamMembers_1 = require("../models/TeamMembers");
async function getRestrictedProjectIdForMember(userId, teamId, teamRole) {
    if (!teamRole || teamRole === 'owner' || teamRole === 'admin')
        return undefined;
    const m = await TeamMembers_1.TeamMember.findOne({
        userId: new mongoose_1.Types.ObjectId(userId),
        teamId: new mongoose_1.Types.ObjectId(teamId),
    }).lean();
    if (m?.projectId)
        return String(m.projectId);
    return undefined;
}
function collectionProjectMatches(restrictedProjectId, collectionProjectId) {
    if (!restrictedProjectId)
        return true;
    const cp = collectionProjectId ? String(collectionProjectId) : null;
    return cp === restrictedProjectId;
}
//# sourceMappingURL=memberProjectScope.js.map