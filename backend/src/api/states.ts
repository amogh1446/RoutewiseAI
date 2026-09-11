// =============================================================
// RouteWise — States API Routes
// =============================================================
//
// GET /api/v1/states        — List all Indian states/UTs
// GET /api/v1/states/:code  — Get a single state by code
// =============================================================

import { Router } from 'express';
import { findAllStates, findStateByCode } from '../repositories/stateRepository.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const statesRouter = Router();

/**
 * GET /api/v1/states
 * Returns all 36 Indian states and union territories.
 */
statesRouter.get('/', async (_req, res, next) => {
  try {
    const states = await findAllStates();
    res.json(
      successResponse(states, { count: states.length })
    );
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/states/:code
 * Returns a single state by its two-letter code (case-insensitive).
 * Returns 400 for invalid code format, 404 if not found.
 */
statesRouter.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    // Lightweight validation: code must be 2–3 uppercase letters
    if (!code || !/^[A-Za-z]{2,3}$/.test(code)) {
      res.status(400).json(
        errorResponse(
          'Invalid state code. Must be 2–3 letters (e.g., KA, MH, GA).',
          'INVALID_STATE_CODE'
        )
      );
      return;
    }

    const state = await findStateByCode(code);

    if (!state) {
      res.status(404).json(
        errorResponse(
          `No state found with code: ${code.toUpperCase()}`,
          'STATE_NOT_FOUND'
        )
      );
      return;
    }

    res.json(successResponse(state));
  } catch (err) {
    next(err);
  }
});
