import { Router, Request, Response, NextFunction } from 'express';
import { getCollectionById } from '../store';
import { runTestCase } from '../runner';
import { CollectionRunResult, RunTestCaseDto } from '../types';

export const runRouter = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// ─── Run a single test case ──────────────────────────────────────────────────
// POST /run/:collectionId/:testId

runRouter.post(
  '/:collectionId/:testId',
  asyncHandler(async (req, res) => {
    const col = await getCollectionById(req.params.collectionId);
    if (!col) { res.status(404).json({ error: 'Collection not found' }); return; }

    const tc = col.testCases.find((t) => t.id === req.params.testId);
    if (!tc) { res.status(404).json({ error: 'Test case not found' }); return; }

    // Allow caller to override parts of the request (ad-hoc run)
    const dto = (req.body ?? {}) as RunTestCaseDto;
    const merged = dto.request
      ? { ...tc, request: { ...tc.request, ...dto.request } }
      : tc;

    const result = await runTestCase(merged);
    const httpStatus = result.status === 'pass' ? 200 : result.status === 'error' ? 502 : 200;
    res.status(httpStatus).json({ data: result });
  })
);

// ─── Run all tests in a collection ──────────────────────────────────────────
// POST /run/:collectionId

runRouter.post(
  '/:collectionId',
  asyncHandler(async (req, res) => {
    const col = await getCollectionById(req.params.collectionId);
    if (!col) { res.status(404).json({ error: 'Collection not found' }); return; }

    if (col.testCases.length === 0) {
      res.status(400).json({ error: 'Collection has no test cases' });
      return;
    }

    const startTime = Date.now();
    const results = await Promise.all(col.testCases.map((tc) => runTestCase(tc)));
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

    res.json({ data: summary });
  })
);
