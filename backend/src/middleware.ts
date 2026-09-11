// =============================================================
// RouteWise — Express Middleware
// =============================================================

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { errorResponse } from './utils/response.js';

/**
 * Simple development request logger.
 * Logs method, URL, status code, and response time.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

/**
 * 404 handler — catches unmatched routes.
 * Must be registered after all route handlers.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    errorResponse(`Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND')
  );
}

/**
 * Centralized error handler.
 * Must be registered last (after all routes and the 404 handler).
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.stack || err.message);

  const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json(
    errorResponse(message, 'INTERNAL_ERROR')
  );
};
