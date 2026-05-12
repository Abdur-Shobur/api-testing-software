"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Team_1 = require("../models/Team");
const User_1 = require("../models/User");
const store_1 = require("../store");
exports.teamsRouter = (0, express_1.Router)();
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
exports.teamsRouter.post('/', asyncHandler(async (req, res) => {
    const { name } = req.body ?? {};
    if (!name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const team = await Team_1.Team.create({
        name: name.trim(),
        slug: `${slugify(name)}-${req.user.userId.slice(-6)}`,
        ownerId: req.user.userId,
        members: [{ userId: req.user.userId, role: 'owner' }],
    });
    await User_1.User.findByIdAndUpdate(req.user.userId, {
        teamId: team._id,
        role: 'owner',
    });
    res.status(201).json({ data: team });
}));
exports.teamsRouter.get('/my', asyncHandler(async (req, res) => {
    const team = await Team_1.Team.findById(req.user.teamId).populate('members.userId', 'name email role createdAt');
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    res.json({ data: team });
}));
exports.teamsRouter.get('/my/collections', (0, auth_1.requireRole)('member'), asyncHandler(async (req, res) => {
    const team = await Team_1.Team.exists({
        _id: req.user.teamId,
        'members.userId': req.user.userId,
    });
    if (!team) {
        res.status(404).json({ error: 'Team not found for current user' });
        return;
    }
    const collections = await (0, store_1.getAllCollections)(req.user.teamId);
    res.json({ data: collections, total: collections.length });
}));
exports.teamsRouter.post('/invite', (0, auth_1.requireRole)('admin'), asyncHandler(async (req, res) => {
    const { email, role = 'member' } = req.body ?? {};
    if (!email?.trim() || !['admin', 'member'].includes(role)) {
        res.status(400).json({ error: 'valid email and role are required' });
        return;
    }
    const user = await User_1.User.findOne({
        email: String(email).toLowerCase().trim(),
    });
    if (!user) {
        res
            .status(404)
            .json({ error: 'User must register before being invited' });
        return;
    }
    const team = await Team_1.Team.findById(req.user.teamId);
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    const existing = team.members.find((member) => member.userId.equals(user._id));
    if (existing)
        existing.role = role;
    else
        team.members.push({ userId: user._id, role });
    user.teamId = team._id;
    user.role = role;
    await Promise.all([team.save(), user.save()]);
    res.status(201).json({ data: team });
}));
exports.teamsRouter.patch('/members/:userId', (0, auth_1.requireRole)('admin'), asyncHandler(async (req, res) => {
    const { role } = req.body ?? {};
    if (!['admin', 'member'].includes(role)) {
        res.status(400).json({ error: 'role must be admin or member' });
        return;
    }
    const team = await Team_1.Team.findById(req.user.teamId);
    const member = team?.members.find((item) => String(item.userId) === req.params.userId);
    if (!team || !member) {
        res.status(404).json({ error: 'Member not found' });
        return;
    }
    if (member.role === 'owner') {
        res.status(400).json({ error: 'Owner role cannot be changed here' });
        return;
    }
    member.role = role;
    await Promise.all([
        team.save(),
        User_1.User.findByIdAndUpdate(req.params.userId, { role }),
    ]);
    res.json({ data: team });
}));
exports.teamsRouter.delete('/members/:userId', (0, auth_1.requireRole)('admin'), asyncHandler(async (req, res) => {
    const team = await Team_1.Team.findById(req.user.teamId);
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    const before = team.members.length;
    team.members = team.members.filter((member) => String(member.userId) !== req.params.userId || member.role === 'owner');
    if (team.members.length === before) {
        res
            .status(404)
            .json({ error: 'Member not found or cannot remove owner' });
        return;
    }
    await Promise.all([
        team.save(),
        User_1.User.findByIdAndUpdate(req.params.userId, { $unset: { teamId: 1 } }),
    ]);
    res.json({ data: team });
}));
//# sourceMappingURL=teams.js.map