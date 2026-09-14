import { Router, Request, Response } from 'express';
import { OSMProvider } from '../providers/osmProvider.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { RouteRequest } from '../providers/interfaces.js';
import type { VehicleType } from '../utils/types.js';

export const routeRouter = Router();
const geoProvider = new OSMProvider();

routeRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startLat, startLng, endLat, endLng, vehicle } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      res.status(400).json(errorResponse('Missing origin or destination coordinates', 'INVALID_QUERY'));
      return;
    }

    const sLat = parseFloat(startLat as string);
    const sLng = parseFloat(startLng as string);
    const eLat = parseFloat(endLat as string);
    const eLng = parseFloat(endLng as string);

    if (
      Number.isNaN(sLat) || Number.isNaN(sLng) || Number.isNaN(eLat) || Number.isNaN(eLng) ||
      !Number.isFinite(sLat) || !Number.isFinite(sLng) || !Number.isFinite(eLat) || !Number.isFinite(eLng)
    ) {
      res.status(400).json(errorResponse('Coordinates must be finite numbers', 'INVALID_QUERY'));
      return;
    }

    if (sLat < -90 || sLat > 90 || eLat < -90 || eLat > 90) {
      res.status(400).json(errorResponse('Latitude must be between -90 and 90', 'INVALID_QUERY'));
      return;
    }

    if (sLng < -180 || sLng > 180 || eLng < -180 || eLng > 180) {
      res.status(400).json(errorResponse('Longitude must be between -180 and 180', 'INVALID_QUERY'));
      return;
    }

    const routeReq: RouteRequest = {
      origin: { lat: sLat, lng: sLng },
      destination: { lat: eLat, lng: eLng },
      vehicle_type: (vehicle as VehicleType) || 'car'
    };

    const routeResult = await geoProvider.getRoute(routeReq);

    res.json(successResponse({
      distanceKm: routeResult.distance_km,
      durationMinutes: routeResult.duration_minutes,
      geometry: JSON.parse(routeResult.polyline_geojson),
      start: routeReq.origin,
      end: routeReq.destination,
    }));
  } catch (error) {
    console.error('Route API error:', error);
    res.status(500).json(errorResponse('Failed to retrieve route from provider', 'PROVIDER_ERROR'));
  }
});
