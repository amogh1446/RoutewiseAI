import { Router } from 'express';
import { checkDbConnection } from '../db/index.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const dbStatus = await checkDbConnection();
  
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus ? 'connected' : 'disconnected'
    }
  });
});
