// =============================================================
// RouteWise — Geographic Provider Interfaces
// =============================================================
//
// Provider-agnostic interfaces for Geocoding, Routing, and POI discovery.
// =============================================================

import type { Coordinates, VehicleType, POICategory } from '../utils/types.js';

// ── Geocoding ──────────────────────────────────────────────

export interface GeocodeRequest {
  query: string;
}

export interface GeocodeResult {
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  place_id: string; // Provider-specific unique ID
}

export interface GeocodingProvider {
  geocode(req: GeocodeRequest): Promise<GeocodeResult[]>;
}

// ── Routing ────────────────────────────────────────────────

export interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  vehicle_type: VehicleType;
  waypoints?: Coordinates[];
}

export interface RouteResult {
  distance_km: number;
  duration_minutes: number;
  polyline_geojson: string; // Valid GeoJSON LineString as string
  waypoints: Coordinates[];
}

export interface RoutingProvider {
  getRoute(req: RouteRequest): Promise<RouteResult>;
}

// ── Constraints ────────────────────────────────────────────

export interface TripWarning {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  source: 'verified' | 'advisory';
  requiresVerification: boolean;
}

export interface ConstraintCheckRequest {
  date: Date;
  lat: number;
  lng: number;
  vehicle_type: VehicleType;
}

export interface ConstraintProvider {
  evaluate(req: ConstraintCheckRequest): TripWarning[];
}

// ── Places / POI ───────────────────────────────────────────

export interface PlacesRequest {
  location: Coordinates;
  radius_meters: number;
  category: POICategory;
}

export interface PlaceResult {
  place_id: string; // Provider-specific unique ID
  name: string;
  lat: number;
  lng: number;
  category: POICategory;
  address: string | null;
}

export interface CorridorRequest {
  route_geometry: { coordinates: [number, number][] }; // GeoJSON LineString
  radius_meters: number;
  categories: POICategory[] | string[];
}

export interface PlacesProvider {
  searchNearby(req: PlacesRequest): Promise<PlaceResult[]>;
  searchCorridor(req: CorridorRequest): Promise<PlaceResult[]>;
}

// ── Combined Provider ──────────────────────────────────────

export interface GeoProvider extends GeocodingProvider, RoutingProvider, PlacesProvider {
  readonly providerName: string;
}
