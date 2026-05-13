"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVarsRouter = void 0;
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const memberProjectScope_1 = require("../lib/memberProjectScope");
const EnvironmentVariable_1 = require("../models/EnvironmentVariable");
exports.envVarsRouter = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
exports.envVarsRouter.get('/', asyncHandler(async (req, res) => {
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const projectIdRaw = req.query.projectId;
    const projectId = projectIdRaw === undefined
        ? undefined
        : projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
            ? null
            : String(projectIdRaw);
    const filter = { teamId: req.user.teamId };
    if (restricted) {
        filter.$or = [
            { projectId: null },
            { projectId: new mongoose_1.Types.ObjectId(restricted) },
        ];
    }
    else if (projectId !== undefined) {
        filter.projectId = projectId ? new mongoose_1.Types.ObjectId(projectId) : null;
    }
    const vars = await EnvironmentVariable_1.EnvironmentVariable.find(filter).sort({
        key: 1,
    });
    res.json({ data: vars, total: vars.length });
}));
exports.envVarsRouter.post('/', asyncHandler(async (req, res) => {
    const { key, value = '', projectId } = req.body ?? {};
    if (!key?.trim()) {
        res.status(400).json({ error: 'key is required' });
        return;
    }
    if (projectId && !mongoose_1.Types.ObjectId.isValid(String(projectId))) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    let bodyPid;
    if (projectId === undefined)
        bodyPid = undefined;
    else if (!projectId)
        bodyPid = null;
    else
        bodyPid = String(projectId);
    if (restricted && bodyPid && bodyPid !== restricted) {
        res.status(403).json({ error: 'Cannot set env vars for this project' });
        return;
    }
    const effectivePid = restricted
        ? bodyPid === undefined
            ? restricted
            : bodyPid
        : bodyPid === undefined
            ? null
            : bodyPid;
    const envVar = await EnvironmentVariable_1.EnvironmentVariable.findOneAndUpdate({
        teamId: req.user.teamId,
        projectId: effectivePid ? new mongoose_1.Types.ObjectId(effectivePid) : null,
        key: key.trim(),
    }, {
        value,
        projectId: effectivePid ? new mongoose_1.Types.ObjectId(effectivePid) : null,
    }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ data: envVar });
}));
exports.envVarsRouter.delete('/:key', asyncHandler(async (req, res) => {
    const restricted = await (0, memberProjectScope_1.getRestrictedProjectIdForMember)(req.user.userId, req.user.teamId, req.user.teamRole);
    const projectIdRaw = req.query.projectId;
    const projectId = projectIdRaw === undefined
        ? undefined
        : projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
            ? null
            : String(projectIdRaw);
    if (projectId && !mongoose_1.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ error: 'invalid projectId' });
        return;
    }
    let deleteProjectId;
    if (restricted) {
        if (projectId !== undefined &&
            projectId !== null &&
            String(projectId) !== restricted) {
            res.status(403).json({ error: 'Cannot delete env vars for this project' });
            return;
        }
        deleteProjectId =
            projectId === undefined
                ? new mongoose_1.Types.ObjectId(restricted)
                : projectId === null
                    ? null
                    : new mongoose_1.Types.ObjectId(String(projectId));
    }
    else {
        deleteProjectId =
            projectId === undefined
                ? undefined
                : projectId === null
                    ? null
                    : new mongoose_1.Types.ObjectId(String(projectId));
    }
    await EnvironmentVariable_1.EnvironmentVariable.deleteOne({
        teamId: req.user.teamId,
        ...(deleteProjectId !== undefined
            ? { projectId: deleteProjectId }
            : {}),
        key: req.params.key,
    });
    res.json({ data: { deleted: true } });
}));
//# sourceMappingURL=envVars.js.map