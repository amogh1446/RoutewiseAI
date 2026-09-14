// =============================================================
// RouteWise — Express Application Setup
// =============================================================
//
// Creates and configures the Express app separately from server
// startup, enabling testability (import app without listening).
// =============================================================

import express from 'express';
import cors from 'cors';
import { healthRouter } from './api/health.js';
import { statesRouter } from './api/states.js';
import { geocodeRouter } from './api/geocode.js';
import { routeRouter } from './api/route.js';
import { poisRouter } from './api/pois.js';
import { requestLogger, notFoundHandler, globalErrorHandler } from './middleware.js';

const app = express();

// ── Core Middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// ── API v1 Routes ───────────────────────────────────────
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/states', statesRouter);
app.use('/api/v1/geocode', geocodeRouter);
app.use('/api/v1/route', routeRouter);
app.use('/api/v1/pois', poisRouter);

// ── Error Handling ──────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };
