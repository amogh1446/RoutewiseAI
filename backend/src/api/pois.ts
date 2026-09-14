import { Router, Request, Response } from 'express';
import { OSMProvider } from '../providers/osmProvider.js';
import { upsertPois } from '../repositories/poiRepository.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { RouteRequest, CorridorRequest } from '../providers/interfaces.js';
import type { VehicleType } from '../utils/types.js';

export const poisRouter = Router();
const geoProvider = new OSMProvider();

poisRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startLat, startLng, endLat, endLng, vehicle, interests, radius } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      res.status(400).json(errorResponse('Missing corridor origin or destination coordinates', 'INVALID_QUERY'));
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

    // Default interests mapping
    const requestedInterests = interests 
      ? (interests as string).split(',').map(i => i.trim()).filter(Boolean)
      : ['attraction'];

    // Configurable corridor width, default to 5km (5000m)
    const corridorRadius = radius ? parseInt(radius as string, 10) : 5000;

    // 1. Resolve Route geometry to use as corridor
    const routeReq: RouteRequest = {
      origin: { lat: sLat, lng: sLng },
      destination: { lat: eLat, lng: eLng },
      vehicle_type: (vehicle as VehicleType) || 'car'
    };

    let routeResult;
    try {
      routeResult = await geoProvider.getRoute(routeReq);
    } catch (routeErr) {
      console.error('POI route prep error:', routeErr);
      res.status(500).json(errorResponse('Failed to resolve route corridor for POI discovery', 'CORRIDOR_RESOLUTION_ERROR'));
      return;
    }

    const geometry = JSON.parse(routeResult.polyline_geojson);

    // 2. Discover POIs
    const corridorReq: CorridorRequest = {
      route_geometry: geometry,
      radius_meters: corridorRadius,
      categories: requestedInterests
    };

    const discovered = await geoProvider.searchCorridor(corridorReq);

    // 3. Save to repository to preserve discovery trace and metadata
    const savedPois = await upsertPois(discovered, geoProvider.providerName);

    res.json(successResponse(savedPois, { count: savedPois.length }));
  } catch (error: any) {
    console.error('POI API error:', error);
    res.status(500).json(errorResponse(error.message || 'Failed to discover POIs', 'POI_DISCOVERY_ERROR'));
  }
});
