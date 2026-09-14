// =============================================================
// RouteWise — Frontend API Service Layer
// =============================================================
// Clean interfaces for backend endpoints.
// When an endpoint is not yet implemented, return structured
// empty/pending states rather than fake data.
// =============================================================

const API_BASE = 'http://localhost:3000/api/v1';

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
  // When the backend geocoding endpoint is wired, use:
  // return apiFetch<GeocodeResult[]>(`/geo/geocode?q=${encodeURIComponent(query)}`);
  // For now, return empty — the LocationSearch component has its own fallback mock.
  void query;
  return [];
}
