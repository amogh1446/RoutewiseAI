// =============================================================
// RouteWise — Server Entry Point
// =============================================================

import './env.js';
import { app } from './app.js';
import { verifyDatabase } from './db/index.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function start(): Promise<void> {
  // Verify database connectivity on startup (non-blocking)
  await verifyDatabase();

  app.listen(PORT, () => {
    console.log(`[Server] RouteWise backend running on http://localhost:${PORT}`);
    console.log(`[Server] API base: http://localhost:${PORT}/api/v1`);
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
