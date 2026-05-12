"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVarsRouter = void 0;
const express_1 = require("express");
const EnvironmentVariable_1 = require("../models/EnvironmentVariable");
const mongoose_1 = require("mongoose");
exports.envVarsRouter = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
exports.envVarsRouter.get('/', asyncHandler(async (req, res) => {
    const projectIdRaw = req.query.projectId;
    const projectId = projectIdRaw === undefined
        ? undefined
        : projectIdRaw === null || projectIdRaw === '' || projectIdRaw === 'null'
            ? null
            : String(projectIdRaw);
    const filter = { teamId: req.user.teamId };
    if (projectId !== undefined) {
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
    const envVar = await EnvironmentVariable_1.EnvironmentVariable.findOneAndUpdate({
        teamId: req.user.teamId,
        projectId: projectId ? new mongoose_1.Types.ObjectId(String(projectId)) : null,
        key: key.trim(),
    }, { value, projectId: projectId ? new mongoose_1.Types.ObjectId(String(projectId)) : null }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ data: envVar });
}));
exports.envVarsRouter.delete('/:key', asyncHandler(async (req, res) => {
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
    await EnvironmentVariable_1.EnvironmentVariable.deleteOne({
        teamId: req.user.teamId,
        ...(projectId !== undefined
            ? { projectId: projectId ? new mongoose_1.Types.ObjectId(projectId) : null }
            : {}),
        key: req.params.key,
    });
    res.json({ data: { deleted: true } });
}));
//# sourceMappingURL=envVars.js.map