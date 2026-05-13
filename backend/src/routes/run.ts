import { Router, Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import {
	collectionProjectMatches,
	getRestrictedProjectIdForMember,
} from '../lib/memberProjectScope';
import { getCollectionById } from '../store';
import { runTestCase } from '../runner';
import { CollectionRunResult, RunCollectionDto, RunTestCaseDto, TestCaseResult } from '../types';
import { EnvironmentVariable } from '../models/EnvironmentVariable';
import { TestRun } from '../models/TestRun';
import { CollectionRun } from '../models/CollectionRun';

export const runRouter = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

async function getRunnerEnv(
	teamId: string,
	restrictedProjectId?: string,
): Promise<Record<string, string>> {
	const filter: Record<string, unknown> = { teamId };
	if (restrictedProjectId) {
		filter.$or = [
			{ projectId: null },
			{ projectId: new Types.ObjectId(restrictedProjectId) },
		];
	}
	const vars = await EnvironmentVariable.find(filter);
	return vars.reduce<Record<string, string>>((acc, envVar) => {
		acc[envVar.key] = envVar.value;
		return acc;
	}, {});
}

async function saveTestRun(
  result: TestCaseResult,
  collectionId: string,
  userId: string,
): Promise<void> {
  await TestRun.create({
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

runRouter.post(
  '/:collectionId/:testId',
  asyncHandler(async (req, res) => {
    const col = await getCollectionById(req.params.collectionId, req.user!.teamId);
    if (!col) { res.status(404).json({ error: 'Collection not found' }); return; }
    const restricted = await getRestrictedProjectIdForMember(
      req.user!.userId,
      req.user!.teamId,
      req.user!.teamRole,
    );
    if (!collectionProjectMatches(restricted, col.projectId)) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    const tc = col.testCases.find((t) => t.id === req.params.testId);
    if (!tc) { res.status(404).json({ error: 'Test case not found' }); return; }

    // Allow caller to override parts of the request (ad-hoc run)
    const dto = (req.body ?? {}) as RunTestCaseDto;
    const merged = dto.request
      ? { ...tc, request: { ...tc.request, ...dto.request } }
      : tc;

    const env = await getRunnerEnv(req.user!.teamId, restricted);
    const result = await runTestCase(merged, env);
    await saveTestRun(result, col.id, req.user!.userId);
    const httpStatus = result.status === 'pass' ? 200 : result.status === 'error' ? 502 : 200;
    res.status(httpStatus).json({ data: result });
  })
);

// ─── Run all tests in a collection ──────────────────────────────────────────
// POST /run/:collectionId

runRouter.post(
  '/:collectionId',
  asyncHandler(async (req, res) => {
    const col = await getCollectionById(req.params.collectionId, req.user!.teamId);
    if (!col) { res.status(404).json({ error: 'Collection not found' }); return; }
    const restricted = await getRestrictedProjectIdForMember(
      req.user!.userId,
      req.user!.teamId,
      req.user!.teamRole,
    );
    if (!collectionProjectMatches(restricted, col.projectId)) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    if (col.testCases.length === 0) {
      res.status(400).json({ error: 'Collection has no test cases' });
      return;
    }

    const startTime = Date.now();
    const dto = (req.body ?? {}) as RunCollectionDto;
    const mode = dto.mode ?? 'parallel';
    const env = await getRunnerEnv(req.user!.teamId, restricted);
    const results: TestCaseResult[] = [];

    if (mode === 'sequential') {
      for (const tc of col.testCases) {
        const result = await runTestCase(tc, env);
        await saveTestRun(result, col.id, req.user!.userId);
        results.push(result);
        if (dto.stopOnFail && result.status !== 'pass') break;
      }
    } else {
      const parallelResults = await Promise.all(col.testCases.map((tc) => runTestCase(tc, env)));
      await Promise.all(
        parallelResults.map((result) => saveTestRun(result, col.id, req.user!.userId)),
      );
      results.push(...parallelResults);
    }
    const totalDuration = Date.now() - startTime;

    const summary: CollectionRunResult = {
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

    await CollectionRun.create({
      collectionId: col.id,
      teamId: req.user!.teamId,
      runBy: req.user!.userId,
      summary,
      runAt: new Date(summary.runAt),
    });

    res.json({ data: summary });
  })
);
