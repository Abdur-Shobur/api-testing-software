import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { requireAuth } from './middleware/auth';
import { authRouter } from './routes/auth';
import { collectionsRouter } from './routes/collections';
import { docsRouter } from './routes/docs';
import { envVarsRouter } from './routes/envVars';
import { projectsRouter } from './routes/projects';
import { runRouter } from './routes/run';
import { teamsRouter } from './routes/teams';
import { testCasesRouter } from './routes/testCases';

export const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
	next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/collections/:collectionId/docs', requireAuth, docsRouter);
app.use('/collections', requireAuth, collectionsRouter);
app.use('/run', requireAuth, runRouter);
app.use('/teams', requireAuth, teamsRouter);
app.use('/env-vars', requireAuth, envVarsRouter);
app.use('/projects', requireAuth, projectsRouter);
app.use('/test-cases', requireAuth, testCasesRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('[ERROR]', err.message);
	res.status(500).json({ error: err.message ?? 'Internal server error' });
});
