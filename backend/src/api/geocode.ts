import { Router } from 'express';
import { OSMProvider } from '../providers/osmProvider.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const geocodeRouter = Router();
const geoProvider = new OSMProvider();

geocodeRouter.get('/', async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      res.status(400).json(
        errorResponse(
          'Search query must be at least 2 characters long.',
          'INVALID_QUERY'
        )
      );
      return;
    }

    const results = await geoProvider.geocode({ query: query.trim() });
    
    res.json(
      successResponse(results, { count: results.length })
    );
  } catch (err) {
    next(err);
  }
});
