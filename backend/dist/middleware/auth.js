"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = signAuthToken;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
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
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        const token = header.slice('Bearer '.length);
        const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
        if (!payload.userId ||
            !payload.email ||
            !payload.teamId ||
            !mongoose_1.Types.ObjectId.isValid(payload.userId) ||
            !mongoose_1.Types.ObjectId.isValid(payload.teamId)) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
const roleRank = {
    member: 1,
    admin: 2,
    owner: 3,
};
function requireRole(role) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || roleRank[userRole] < roleRank[role]) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map