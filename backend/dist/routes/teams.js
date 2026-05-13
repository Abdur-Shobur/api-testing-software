"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsRouter = void 0;
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const auth_1 = require("../middleware/auth");
const Project_1 = require("../models/Project");
const Team_1 = require("../models/Team");
const TeamMembers_1 = require("../models/TeamMembers");
const User_1 = require("../models/User");
const store_1 = require("../store");
const slugify_1 = require("../lib/slugify");
exports.teamsRouter = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
exports.teamsRouter.post('/', asyncHandler(async (req, res) => {
    const { name } = req.body ?? {};
    if (!name?.trim()) {
        res.status(400).json({ error: 'name is required' });
        return;
    }
    const team = await Team_1.Team.create({
        name: name.trim(),
        slug: `${(0, slugify_1.slugify)(name)}-${req.user.userId.slice(-6)}`,
        ownerId: new mongoose_1.Types.ObjectId(req.user.userId),
    });
    await TeamMembers_1.TeamMember.create({
        teamId: team._id,
        userId: new mongoose_1.Types.ObjectId(req.user.userId),
        role: 'owner',
        projectId: null,
    });
    res.status(201).json({ data: team });
}));
exports.teamsRouter.get('/shared-projects', asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const memberships = await TeamMembers_1.TeamMember.find({
        userId: new mongoose_1.Types.ObjectId(userId),
        projectId: { $ne: null },
        role: { $in: ['editor', 'viewer'] },
    }).populate('projectId', 'name slug teamId');
    const projects = memberships
        .map((m) => m.projectId)
        .filter((p) => p != null && typeof p === 'object');
    res.json({
        data: projects,
        total: projects.length,
    });
}));
exports.teamsRouter.get('/my', asyncHandler(async (req, res) => {
    const team = await Team_1.Team.findById(req.user.teamId).lean();
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    const members = await TeamMembers_1.TeamMember.find({ teamId: team._id })
        .populate('userId', 'name email status createdAt')
        .populate('projectId', 'name slug')
        .sort({ joinedAt: 1 })
        .lean();
    res.json({
        data: {
            ...team,
            members,
        },
    });
}));
exports.teamsRouter.get('/my/collections', (0, auth_1.requireTeamRole)('viewer'), asyncHandler(async (req, res) => {
    const team = await Team_1.Team.exists({
        _id: req.user.teamId,
    });
    if (!team) {
        res.status(404).json({ error: 'Team not found for current user' });
        return;
    }
    const member = await TeamMembers_1.TeamMember.exists({
        teamId: req.user.teamId,
        userId: req.user.userId,
    });
    if (!member) {
        res.status(403).json({ error: 'Not a member of this team' });
        return;
    }
    const collections = await (0, store_1.getAllCollections)(req.user.teamId);
    res.json({ data: collections, total: collections.length });
}));
exports.teamsRouter.post('/invite', (0, auth_1.requireTeamRole)('admin'), asyncHandler(async (req, res) => {
    const { email, role = 'viewer', projectId } = req.body ?? {};
    const allowed = ['admin', 'editor', 'viewer'];
    if (!email?.trim() || !allowed.includes(role)) {
        res.status(400).json({ error: 'valid email and role are required' });
        return;
    }
    if (!projectId || !mongoose_1.Types.ObjectId.isValid(String(projectId))) {
        res.status(400).json({ error: 'valid projectId is required' });
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
    const teamOid = new mongoose_1.Types.ObjectId(req.user.teamId);
    const project = await Project_1.Project.findOne({
        _id: new mongoose_1.Types.ObjectId(String(projectId)),
        teamId: teamOid,
    });
    if (!project) {
        res.status(404).json({ error: 'Project not found for this team' });
        return;
    }
    const projectOid = project._id;
    const userOid = user._id;
    await TeamMembers_1.TeamMember.findOneAndUpdate({ teamId: teamOid, userId: userOid }, {
        teamId: teamOid,
        userId: userOid,
        role: role,
        projectId: role === 'admin' || role === 'owner' ? null : projectOid,
        invitedBy: new mongoose_1.Types.ObjectId(req.user.userId),
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const populated = await TeamMembers_1.TeamMember.find({ teamId: teamOid })
        .populate('userId', 'name email status createdAt')
        .populate('projectId', 'name slug')
        .sort({ joinedAt: 1 })
        .lean();
    res.status(201).json({ data: populated });
}));
exports.teamsRouter.patch('/members/:userId', (0, auth_1.requireTeamRole)('admin'), asyncHandler(async (req, res) => {
    const { role } = req.body ?? {};
    const allowed = ['admin', 'editor', 'viewer'];
    if (!allowed.includes(role)) {
        res.status(400).json({ error: 'role must be admin, editor, or viewer' });
        return;
    }
    const teamOid = new mongoose_1.Types.ObjectId(req.user.teamId);
    const member = await TeamMembers_1.TeamMember.findOne({
        teamId: teamOid,
        userId: new mongoose_1.Types.ObjectId(req.params.userId),
    });
    if (!member) {
        res.status(404).json({ error: 'Member not found' });
        return;
    }
    if (member.role === 'owner') {
        res.status(400).json({ error: 'Owner role cannot be changed here' });
        return;
    }
    member.role = role;
    if (role === 'admin') {
        member.projectId = null;
    }
    await member.save();
    const team = await Team_1.Team.findById(teamOid).lean();
    const members = await TeamMembers_1.TeamMember.find({ teamId: teamOid })
        .populate('userId', 'name email status createdAt')
        .populate('projectId', 'name slug')
        .sort({ joinedAt: 1 })
        .lean();
    res.json({ data: { ...team, members } });
}));
exports.teamsRouter.delete('/members/:userId', (0, auth_1.requireTeamRole)('admin'), asyncHandler(async (req, res) => {
    const teamOid = new mongoose_1.Types.ObjectId(req.user.teamId);
    const member = await TeamMembers_1.TeamMember.findOne({
        teamId: teamOid,
        userId: new mongoose_1.Types.ObjectId(req.params.userId),
    });
    if (!member) {
        res.status(404).json({ error: 'Member not found' });
        return;
    }
    if (member.role === 'owner') {
        res.status(400).json({ error: 'Cannot remove team owner' });
        return;
    }
    await member.deleteOne();
    const team = await Team_1.Team.findById(teamOid).lean();
    const members = await TeamMembers_1.TeamMember.find({ teamId: teamOid })
        .populate('userId', 'name email status createdAt')
        .populate('projectId', 'name slug')
        .sort({ joinedAt: 1 })
        .lean();
    res.json({ data: { ...team, members } });
}));
//# sourceMappingURL=teams.js.map