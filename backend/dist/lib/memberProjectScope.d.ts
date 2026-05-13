import type { TeamRole } from '../models/TeamMembers';
export declare function getRestrictedProjectIdForMember(userId: string, teamId: string, teamRole: TeamRole | undefined): Promise<string | undefined>;
export declare function collectionProjectMatches(restrictedProjectId: string | undefined, collectionProjectId: string | null | undefined): boolean;
//# sourceMappingURL=memberProjectScope.d.ts.map