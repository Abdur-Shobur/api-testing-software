"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = signAuthToken;
exports.requireAuth = requireAuth;
exports.requireTeamRole = requireTeamRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    return secret;
}
function signAuthToken(payload) {
    return jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d'),
    });
}
const teamRoleRank = {
    viewer: 1,
    editor: 2,
    admin: 3,
    owner: 4,
};
/** Accept legacy JWT payloads that used User.role "member" as team viewer. */
function normalizeTeamRole(raw) {
    if (raw === 'member')
        return 'viewer';
    if (raw === 'viewer' || raw === 'editor' || raw === 'admin' || raw === 'owner') {
        return raw;
    }
    return undefined;
}
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        const token = header.slice('Bearer '.length);
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        const teamRole = payload.teamRole ?? normalizeTeamRole(payload.role);
        if (!payload.userId ||
            !payload.email ||
            !payload.teamId ||
            !teamRole ||
            !mongoose_1.Types.ObjectId.isValid(payload.userId) ||
            !mongoose_1.Types.ObjectId.isValid(payload.teamId)) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = {
            userId: payload.userId,
            email: payload.email,
            teamId: payload.teamId,
            teamRole,
        };
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
function requireTeamRole(minRole) {
    return (req, res, next) => {
        const userRole = req.user?.teamRole;
        if (!userRole || teamRoleRank[userRole] < teamRoleRank[minRole]) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map