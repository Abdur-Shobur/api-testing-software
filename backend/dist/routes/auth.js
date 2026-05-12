"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
const saltRounds = 12;
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
function publicUser(user) {
    return {
        id: String(user._id),
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId ? String(user.teamId) : undefined,
        createdAt: user.createdAt,
    };
}
exports.authRouter.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password) {
        res.status(400).json({ error: 'name, email, and password are required' });
        return;
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User_1.User.findOne({ email: normalizedEmail });
    if (existing) {
        res.status(409).json({ error: 'Email is already registered' });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(String(password), saltRounds);
    const user = await User_1.User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'owner',
    });
    const team = await Team_1.Team.create({
        name: `${name.trim()}'s Team`,
        slug: `${slugify(name)}-${String(user._id).slice(-6)}`,
        ownerId: user._id,
        members: [{ userId: user._id, role: 'owner' }],
    });
    user.teamId = team._id;
    await user.save();
    const token = (0, auth_1.signAuthToken)({
        userId: String(user._id),
        email: user.email,
        teamId: String(team._id),
        role: user.role,
    });
    res.status(201).json({ data: { token, user: publicUser(user) } });
}));
exports.authRouter.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    const user = await User_1.User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcryptjs_1.default.compare(String(password), user.passwordHash))) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
    }
    if (!user.teamId) {
        res.status(403).json({ error: 'User is not assigned to a team' });
        return;
    }
    const token = (0, auth_1.signAuthToken)({
        userId: String(user._id),
        email: user.email,
        teamId: String(user.teamId),
        role: user.role,
    });
    res.json({ data: { token, user: publicUser(user) } });
}));
exports.authRouter.get('/me', auth_1.requireAuth, asyncHandler(async (req, res) => {
    const user = await User_1.User.findById(req.user.userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json({ data: publicUser(user) });
}));
//# sourceMappingURL=auth.js.map