// =============================================================
// RouteWise — Health & DB Health API Routes
// =============================================================
//
// GET /api/v1/health     — Basic application health check
// GET /api/v1/health/db  — Database + PostGIS health check
// =============================================================

import { Router } from 'express';
import { checkDbConnection, checkPostGIS, checkStatesLoaded } from '../db/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * Basic health check — always returns 200 if the server is running.
 */
healthRouter.get('/', (_req, res) => {
  res.json(
    successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    })
  );
});

/**
 * GET /api/v1/health/db
 * Database health check — verifies PostgreSQL connectivity,
 * PostGIS availability, and loaded state data.
 */
healthRouter.get('/db', async (_req, res) => {
  const dbConnected = await checkDbConnection();

  if (!dbConnected) {
    res.status(503).json(
      errorResponse('Database is not connected', 'DB_UNAVAILABLE')
    );
    return;
  }

  const postgisVersion = await checkPostGIS();
  const statesLoaded = await checkStatesLoaded();

  res.json(
    successResponse({
      database: 'connected',
      postgis: postgisVersion ?? 'not available',
      states_loaded: statesLoaded,
      timestamp: new Date().toISOString(),
    })
  );
});
