"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRouter = void 0;
const express_1 = require("express");
const store_1 = require("../store");
const runner_1 = require("../runner");
const EnvironmentVariable_1 = require("../models/EnvironmentVariable");
const TestRun_1 = require("../models/TestRun");
const CollectionRun_1 = require("../models/CollectionRun");
exports.runRouter = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
async function getRunnerEnv(teamId) {
    const vars = await EnvironmentVariable_1.EnvironmentVariable.find({ teamId });
    return vars.reduce((acc, envVar) => {
        acc[envVar.key] = envVar.value;
        return acc;
    }, {});
}
async function saveTestRun(result, collectionId, userId) {
    await TestRun_1.TestRun.create({
        testCaseId: result.testCaseId,
        collectionId,
        status: result.status,
        durationMs: result.durationMs,
        assertions: result.assertions,
        actual: result.actual,
        runBy: userId,
        runAt: new Date(),
    });
}
// ─── Run a single test case ──────────────────────────────────────────────────
// POST /run/:collectionId/:testId
exports.runRouter.post('/:collectionId/:testId', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId, req.user.teamId);
    if (!col) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    const tc = col.testCases.find((t) => t.id === req.params.testId);
    if (!tc) {
        res.status(404).json({ error: 'Test case not found' });
        return;
    }
    // Allow caller to override parts of the request (ad-hoc run)
    const dto = (req.body ?? {});
    const merged = dto.request
        ? { ...tc, request: { ...tc.request, ...dto.request } }
        : tc;
    const env = await getRunnerEnv(req.user.teamId);
    const result = await (0, runner_1.runTestCase)(merged, env);
    await saveTestRun(result, col.id, req.user.userId);
    const httpStatus = result.status === 'pass' ? 200 : result.status === 'error' ? 502 : 200;
    res.status(httpStatus).json({ data: result });
}));
// ─── Run all tests in a collection ──────────────────────────────────────────
// POST /run/:collectionId
exports.runRouter.post('/:collectionId', asyncHandler(async (req, res) => {
    const col = await (0, store_1.getCollectionById)(req.params.collectionId, req.user.teamId);
    if (!col) {
        res.status(404).json({ error: 'Collection not found' });
        return;
    }
    if (col.testCases.length === 0) {
        res.status(400).json({ error: 'Collection has no test cases' });
        return;
    }
    const startTime = Date.now();
    const dto = (req.body ?? {});
    const mode = dto.mode ?? 'parallel';
    const env = await getRunnerEnv(req.user.teamId);
    const results = [];
    if (mode === 'sequential') {
        for (const tc of col.testCases) {
            const result = await (0, runner_1.runTestCase)(tc, env);
            await saveTestRun(result, col.id, req.user.userId);
            results.push(result);
            if (dto.stopOnFail && result.status !== 'pass')
                break;
        }
    }
    else {
        const parallelResults = await Promise.all(col.testCases.map((tc) => (0, runner_1.runTestCase)(tc, env)));
        await Promise.all(parallelResults.map((result) => saveTestRun(result, col.id, req.user.userId)));
        results.push(...parallelResults);
    }
    const totalDuration = Date.now() - startTime;
    const summary = {
        collectionId: col.id,
        collectionName: col.name,
        runAt: new Date().toISOString(),
        totalTests: results.length,
        passed: results.filter((r) => r.status === 'pass').length,
        failed: results.filter((r) => r.status === 'fail').length,
        errored: results.filter((r) => r.status === 'error').length,
        durationMs: totalDuration,
        results,
    };
    await CollectionRun_1.CollectionRun.create({
        collectionId: col.id,
        teamId: req.user.teamId,
        runBy: req.user.userId,
        summary,
        runAt: new Date(summary.runAt),
    });
    res.json({ data: summary });
}));
//# sourceMappingURL=run.js.map