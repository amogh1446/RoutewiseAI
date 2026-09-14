// =============================================================
// RouteWise — Frontend API Service Layer
// =============================================================
// Clean interfaces for backend endpoints.
// When an endpoint is not yet implemented, return structured
// empty/pending states rather than fake data.
// =============================================================

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';

// ── Types ──────────────────────────────────────────────────

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface State {
  id: number;
  name: string;
  code: string;
  has_boundary: boolean;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
}

export interface DbHealthStatus {
  database: string;
  postgis: string;
  states_loaded: number;
  timestamp: string;
}

// ── API calls ──────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function fetchHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>('/health');
}

export async function fetchDbHealth(): Promise<DbHealthStatus> {
  return apiFetch<DbHealthStatus>('/health/db');
}

export async function fetchStates(): Promise<State[]> {
  return apiFetch<State[]>('/states');
}

export async function fetchState(code: string): Promise<State> {
  return apiFetch<State>(`/states/${code}`);
}

// ── Geocoding stub ─────────────────────────────────────────
// Connects to the backend geocoding endpoint when implemented.
// For MVP, falls back to the mock suggestions in LocationSearch.

export interface GeocodeResult {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
}

export async function geocodeQuery(query: string): Promise<GeocodeResult[]> {
  return apiFetch<GeocodeResult[]>(`/geocode?q=${encodeURIComponent(query)}`);
}

// ── Routing ────────────────────────────────────────────────

export interface RouteResponse {
  distanceKm: number;
  durationMinutes: number;
  geometry: any; // GeoJSON LineString
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

export async function fetchRoute(startLat: number, startLng: number, endLat: number, endLng: number, vehicle: string = 'car', waypoints: {lat: number, lng: number}[] = []): Promise<RouteResponse> {
  let url = `/route?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}&vehicle=${vehicle}`;
  if (waypoints.length > 0) {
    const wpStr = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
    url += `&waypoints=${encodeURIComponent(wpStr)}`;
  }
  return apiFetch<RouteResponse>(url);
}

// ── POI Discovery ──────────────────────────────────────────

export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

export async function fetchPOIs(startLat: number, startLng: number, endLat: number, endLng: number, interests: string[]): Promise<POI[]> {
  const interestsQuery = interests.length > 0 ? interests.join(',') : 'attraction';
  return apiFetch<POI[]>(`/pois?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}&interests=${encodeURIComponent(interestsQuery)}`);
}

// ── Itinerary Generation ───────────────────────────────────

export interface Stop {
  type: 'drive' | 'attraction' | 'food' | 'break' | 'arrival' | 'departure';
  time: string;
  name: string;
  detail: string;
  duration?: string;
  detour?: string;
  warning?: { severity: 'info' | 'advisory' | 'important'; text: string };
}

export interface TripWarning {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  source: 'verified' | 'advisory';
  requiresVerification: boolean;
}

export interface ItineraryDay {
  day: number;
  dateStr?: string;
  dayOfWeek?: string;
  from: string;
  to: string;
  km: number;
  driveTime: string;
  stops: Stop[];
  warnings: TripWarning[];
  highlights: string[];
}

export interface Feasibility {
  feasible: boolean;
  severity: 'none' | 'warning' | 'critical';
  reasons: string[];
  recommendedDays?: number;
}

export interface ItineraryResponse {
  feasibility: Feasibility;
  days: ItineraryDay[];
  warnings: TripWarning[];
}

export async function generateItinerary(
  route: RouteResponse,
  pois: POI[],
  params: any
): Promise<ItineraryResponse> {
  const payload = {
    route: {
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      start: route.start,
      end: route.end,
      geometry: route.geometry
    },
    pois,
    params
  };

  const res = await fetch(`${API_BASE}/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message || 'Failed to generate itinerary');
  }
  return body.data;
}
