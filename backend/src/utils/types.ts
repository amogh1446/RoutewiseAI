// =============================================================
// RouteWise — Shared TypeScript Types
// =============================================================

// -------------------------------------------------------
// 🟦 Foundational Reference Data
// -------------------------------------------------------

export interface State {
  id: number;
  name: string;
  code: string;
  boundary: string | null;       // PostGIS geometry as GeoJSON string (or null if not yet loaded)
  constraints: Record<string, unknown> | null;  // Reserved for future per-state rules
  created_at: Date;
}

// -------------------------------------------------------
// 🟨 Externally Sourced POI Data
// -------------------------------------------------------

export type POICategory = 'fuel' | 'food' | 'attraction' | 'lodging' | 'viewpoint';

export interface POI {
  id: string;
  name: string;
  source_id: string | null;
  source_provider: string | null;
  location: string;              // PostGIS geometry as GeoJSON string
  category: POICategory;
  state_code: string | null;
  opening_hours: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  verified_at: Date;
  created_at: Date;
}

export interface POITag {
  poi_id: string;
  tag: string;
}

// Input type for inserting a new POI
export interface InsertPOI {
  name: string;
  source_id?: string;
  source_provider?: string;
  latitude: number;
  longitude: number;
  category: POICategory;
  state_code?: string;
  opening_hours?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// -------------------------------------------------------
// 🟧 Externally Generated Route Data
// -------------------------------------------------------

export interface Route {
  id: string;
  origin_point: string;          // PostGIS geometry
  destination_point: string;     // PostGIS geometry
  origin_name: string | null;
  destination_name: string | null;
  polyline: string | null;       // PostGIS geometry
  distance_km: number | null;
  duration_minutes: number | null;
  vehicle_type: VehicleType;
  waypoints: RouteWaypoint[] | null;
  source_provider: string;
  source_metadata: Record<string, unknown> | null;
  fetched_at: Date;
  expires_at: Date | null;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
}

// Input type for inserting a cached route
export interface InsertRoute {
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  origin_name?: string;
  destination_name?: string;
  polyline_geojson?: string;     // GeoJSON LineString
  distance_km?: number;
  duration_minutes?: number;
  vehicle_type: VehicleType;
  waypoints?: RouteWaypoint[];
  source_provider: string;
  source_metadata?: Record<string, unknown>;
  expires_at?: Date;
}

// -------------------------------------------------------
// 🟩 User-Created Trip Data
// -------------------------------------------------------

export type TripType = 'one_day' | 'multi_day' | 'point_to_point' | 'round_trip' | 'explore_from_base';
export type VehicleType = 'car' | 'motorcycle';
export type TripStatus = 'draft' | 'planned' | 'completed';
export type StopType = 'origin' | 'fuel' | 'food' | 'attraction' | 'rest' | 'overnight' | 'destination';

export interface Trip {
  id: string;
  user_id: string | null;
  trip_type: TripType;
  vehicle_type: VehicleType;
  start_date: Date;
  end_date: Date;
  origin_name: string;
  origin_point: string;          // PostGIS geometry
  destination_name: string | null;
  destination_point: string | null;
  route_id: string | null;
  status: TripStatus;
  llm_narrative: Record<string, unknown> | null;
  created_at: Date;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: Date;
  total_driving_km: number | null;
  total_driving_minutes: number | null;
  day_summary: string | null;
  created_at: Date;
}

export interface TripStop {
  id: string;
  trip_day_id: string;
  poi_id: string | null;
  stop_order: number;
  stop_type: StopType;
  arrival_time: string | null;   // TIME as HH:MM:SS string
  departure_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: Date;
}

// Input type for creating a new trip
export interface CreateTrip {
  trip_type: TripType;
  vehicle_type: VehicleType;
  start_date: Date;
  end_date: Date;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name?: string;
  destination_lat?: number;
  destination_lng?: number;
  route_id?: string;
}

// Input type for adding a trip day
export interface CreateTripDay {
  trip_id: string;
  day_number: number;
  date: Date;
  total_driving_km?: number;
  total_driving_minutes?: number;
  day_summary?: string;
}

// Input type for adding a trip stop
export interface CreateTripStop {
  trip_day_id: string;
  poi_id?: string;
  stop_order: number;
  stop_type: StopType;
  arrival_time?: string;
  departure_time?: string;
  duration_minutes?: number;
  notes?: string;
}

// -------------------------------------------------------
// Utility Types
// -------------------------------------------------------

// Consistent return type for DB operations
export type DbResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Coordinate pair
export interface Coordinates {
  lat: number;
  lng: number;
}
