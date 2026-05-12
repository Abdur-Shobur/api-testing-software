"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./middleware/auth");
const auth_2 = require("./routes/auth");
const collections_1 = require("./routes/collections");
const docs_1 = require("./routes/docs");
const envVars_1 = require("./routes/envVars");
const projects_1 = require("./routes/projects");
const run_1 = require("./routes/run");
const teams_1 = require("./routes/teams");
const testCases_1 = require("./routes/testCases");
exports.app = (0, express_1.default)();
// ─── Middleware ───────────────────────────────────────────────────────────────
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json({ limit: '5mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
// ─── Request logger ───────────────────────────────────────────────────────────
exports.app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// ─── Health check ─────────────────────────────────────────────────────────────
exports.app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── Routes ───────────────────────────────────────────────────────────────────
exports.app.use('/auth', auth_2.authRouter);
exports.app.use('/collections/:collectionId/docs', auth_1.requireAuth, docs_1.docsRouter);
exports.app.use('/collections', auth_1.requireAuth, collections_1.collectionsRouter);
exports.app.use('/run', auth_1.requireAuth, run_1.runRouter);
exports.app.use('/teams', auth_1.requireAuth, teams_1.teamsRouter);
exports.app.use('/env-vars', auth_1.requireAuth, envVars_1.envVarsRouter);
exports.app.use('/projects', auth_1.requireAuth, projects_1.projectsRouter);
exports.app.use('/test-cases', auth_1.requireAuth, testCases_1.testCasesRouter);
// ─── 404 ─────────────────────────────────────────────────────────────────────
exports.app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// ─── Global error handler ─────────────────────────────────────────────────────
exports.app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
});
//# sourceMappingURL=app.js.map