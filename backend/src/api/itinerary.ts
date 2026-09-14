import { Router, Request, Response } from 'express';
import { generateItinerary, RouteInput, POIInput, TripParams } from '../services/itineraryEngine.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { OSMProvider } from '../providers/osmProvider.js';

export const itineraryRouter = Router();
const osmProvider = new OSMProvider();

itineraryRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { route, pois, params } = req.body;

    if (!route || !pois || !params) {
      res.status(400).json(errorResponse('Missing route, pois, or params', 'INVALID_REQUEST'));
      return;
    }

    if (!route.start || !route.end || route.distanceKm === undefined || route.durationMinutes === undefined) {
      res.status(400).json(errorResponse('Invalid route payload', 'INVALID_REQUEST'));
      return;
    }

    if (!params.days || params.days < 1) {
      res.status(400).json(errorResponse('Trip days must be at least 1', 'INVALID_REQUEST'));
      return;
    }

    const routeInput: RouteInput = {
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      start: { lat: route.start.lat, lng: route.start.lng },
      end: { lat: route.end.lat, lng: route.end.lng },
      geometry: route.geometry,
    };

    const poisInput: POIInput[] = (pois as any[]).map(p => ({
      id: p.id || p.place_id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      category: p.category
    }));

    const tripParams: TripParams = {
      days: params.days,
      startDate: params.startDate,
      vehicle: params.vehicle || 'car',
      pace: params.pace || 'balanced',
      interests: params.interests || [],
      mustVisits: params.mustVisits || [],
      startName: params.startName || 'Start',
      endName: params.endName || 'Destination',
    };

    const itinerary = await generateItinerary(routeInput, poisInput, tripParams, async (s, e) => {
      const res = await osmProvider.getRoute({ origin: s, destination: e, vehicle_type: (params.vehicle as any) || 'car' });
      return { distance_meters: res.distance_km * 1000, duration_seconds: res.duration_minutes * 60 };
    });
    
    res.json(successResponse(itinerary));
  } catch (error: any) {
    console.error('Itinerary generation error:', error);
    res.status(500).json(errorResponse(error.message || 'Failed to generate itinerary', 'ITINERARY_GENERATION_ERROR'));
  }
});
