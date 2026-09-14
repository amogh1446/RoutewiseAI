// =============================================================
// RouteWise — API Integration Tests
// =============================================================
//
// Uses Node.js built-in test runner (node:test) — no extra deps.
// Tests the actual HTTP API against the real database.
// =============================================================

import { describe, it, after, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import '../env.js';
import { app } from '../app.js';
import { pool } from '../db/index.js';
import type { Server } from 'http';

let server: Server;
let baseUrl: string;

// Start the server on a random available port before tests
const startServer = (): Promise<void> =>
  new Promise((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });

// Helpers
async function get(path: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}${path}`);
  const body = await res.json() as Record<string, unknown>;
  return { status: res.status, body };
}

async function post(path: string, payload: any): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await res.json() as Record<string, unknown>;
  return { status: res.status, body };
}

// ── Tests ─────────────────────────────────────────────────

describe('RouteWise API', async () => {
  await startServer();

  after(async () => {
    server.close();
    await pool.end();
  });

  // ── Health ────────────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('returns 200 with success: true', async () => {
      const { status, body } = await get('/api/v1/health');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.status, 'ok');
      assert.ok(data.timestamp);
    });
  });

  describe('GET /api/v1/health/db', () => {
    it('returns 200 with database status when DB is available', async () => {
      const { status, body } = await get('/api/v1/health/db');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.database, 'connected');
      assert.ok(data.postgis);
      assert.equal(data.states_loaded, 36);
    });
  });

  // ── States ────────────────────────────────────────────

  describe('GET /api/v1/states', () => {
    it('returns all 36 states with success envelope', async () => {
      const { status, body } = await get('/api/v1/states');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Array<Record<string, unknown>>;
      assert.equal(data.length, 36);
      const meta = body.meta as Record<string, unknown>;
      assert.equal(meta.count, 36);
    });

    it('returns states sorted alphabetically by name', async () => {
      const { body } = await get('/api/v1/states');
      const data = body.data as Array<Record<string, unknown>>;
      const names = data.map((s) => s.name as string);
      const sorted = [...names].sort();
      assert.deepEqual(names, sorted);
    });

    it('includes has_boundary flag for MVP states', async () => {
      const { body } = await get('/api/v1/states');
      const data = body.data as Array<Record<string, unknown>>;
      const mvpCodes = ['KA', 'GA', 'MH', 'RJ', 'KL'];
      const mvpStates = data.filter((s) => mvpCodes.includes(s.code as string));
      assert.equal(mvpStates.length, 5);
      for (const s of mvpStates) {
        assert.equal(s.has_boundary, true, `${s.name} should have has_boundary=true`);
      }
    });
  });

  describe('GET /api/v1/states/:code', () => {
    it('returns Karnataka by code KA', async () => {
      const { status, body } = await get('/api/v1/states/KA');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.name, 'Karnataka');
      assert.equal(data.code, 'KA');
      assert.equal(data.has_boundary, true);
    });

    it('is case-insensitive (lowercase ka → Karnataka)', async () => {
      const { status, body } = await get('/api/v1/states/ka');
      assert.equal(status, 200);
      const data = body.data as Record<string, unknown>;
      assert.equal(data.name, 'Karnataka');
    });

    it('returns 404 for non-existent state code', async () => {
      const { status, body } = await get('/api/v1/states/ZZ');
      assert.equal(status, 404);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'STATE_NOT_FOUND');
    });

    it('returns 400 for invalid code format (numbers)', async () => {
      const { status, body } = await get('/api/v1/states/123');
      assert.equal(status, 400);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'INVALID_STATE_CODE');
    });

    it('returns 400 for code that is too long', async () => {
      const { status, body } = await get('/api/v1/states/ABCD');
      assert.equal(status, 400);
      assert.equal(body.success, false);
    });
  });

  // ── Geocoding ─────────────────────────────────────────

  describe('GET /api/v1/geocode', () => {
    it('returns 400 for missing query', async () => {
      const { status, body } = await get('/api/v1/geocode');
      assert.equal(status, 400);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'INVALID_QUERY');
    });

    it('returns 400 for too short query', async () => {
      const { status, body } = await get('/api/v1/geocode?q=a');
      assert.equal(status, 400);
      assert.equal(body.success, false);
    });

    it('returns results for valid query with mocked fetch', async () => {
      const originalFetch = global.fetch;
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          if (url.toString().includes('nominatim.openstreetmap.org')) {
            return {
              ok: true,
              json: async () => ([
                {
                  place_id: 123456,
                  osm_type: 'node',
                  osm_id: 78910,
                  name: 'Bengaluru',
                  display_name: 'Bengaluru, Karnataka, India',
                  lat: '12.9715987',
                  lon: '77.5945627'
                }
              ])
            } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/geocode?q=Bengaluru');
        assert.equal(status, 200);
        assert.equal(body.success, true);
        const data = body.data as Array<Record<string, unknown>>;
        assert.equal(data.length, 1);
        assert.equal(data[0].place_id, 'osm-node-78910');
        assert.equal(data[0].name, 'Bengaluru');
        assert.equal(data[0].lat, 12.9715987);
        assert.equal(data[0].lng, 77.5945627);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('returns 500 when provider/upstream fails', async () => {
      const originalFetch = global.fetch;
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          if (url.toString().includes('nominatim.openstreetmap.org')) {
            return {
              ok: false,
              status: 503,
              statusText: 'Service Unavailable'
            } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/geocode?q=Bengaluru');
        assert.equal(status, 500);
        assert.equal(body.success, false);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  // ── Routing ───────────────────────────────────────────

  describe('GET /api/v1/route', () => {
    it('returns 400 for missing coordinates', async () => {
      const { status, body } = await get('/api/v1/route?startLat=12.9');
      assert.equal(status, 400);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'INVALID_QUERY');
    });

    it('returns 400 for invalid coordinate ranges', async () => {
      const { status, body } = await get('/api/v1/route?startLat=100&startLng=77.5&endLat=13&endLng=77.6');
      assert.equal(status, 400);
      assert.equal(body.success, false);
    });

    it('returns results for valid route with mocked fetch', async () => {
      const originalFetch = global.fetch;
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          if (url.toString().includes('router.project-osrm.org')) {
            return {
              ok: true,
              json: async () => ({
                code: 'Ok',
                routes: [
                  {
                    distance: 145000,
                    duration: 12000,
                    geometry: {
                      type: 'LineString',
                      coordinates: [[77.5, 12.9], [76.6, 12.3]]
                    }
                  }
                ]
              })
            } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/route?startLat=12.9&startLng=77.5&endLat=12.3&endLng=76.6');
        assert.equal(status, 200);
        assert.equal(body.success, true);
        const data = body.data as Record<string, unknown>;
        assert.equal(data.distanceKm, 145);
        assert.equal(data.durationMinutes, 200);
        assert.ok(data.geometry);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('returns results for valid route with waypoints', async () => {
      const originalFetch = global.fetch;
      let requestedUrl = '';
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          if (url.toString().includes('router.project-osrm.org')) {
            requestedUrl = url.toString();
            return {
              ok: true,
              json: async () => ({
                code: 'Ok',
                routes: [
                  {
                    distance: 155000,
                    duration: 13000,
                    geometry: {
                      type: 'LineString',
                      coordinates: [[77.5, 12.9], [77.0, 12.5], [76.6, 12.3]]
                    }
                  }
                ]
              })
            } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/route?startLat=12.9&startLng=77.5&endLat=12.3&endLng=76.6&waypoints=12.5,77.0|12.6,77.1');
        assert.equal(status, 200);
        assert.ok(requestedUrl.includes('77.5,12.9;77,12.5;77.1,12.6;76.6,12.3'));
        assert.equal(body.success, true);
        const data = body.data as Record<string, unknown>;
        assert.equal(data.distanceKm, 155);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('returns 500 when OSRM fails', async () => {
      const originalFetch = global.fetch;
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          if (url.toString().includes('router.project-osrm.org')) {
            return {
              ok: false,
              status: 503,
              statusText: 'Service Unavailable'
            } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/route?startLat=12.9&startLng=77.5&endLat=12.3&endLng=76.6');
        assert.equal(status, 500);
        assert.equal(body.success, false);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  // ── POI Discovery ─────────────────────────────────────

  describe('GET /api/v1/pois', () => {
    it('returns 400 for missing coordinates', async () => {
      const { status, body } = await get('/api/v1/pois?startLat=12.9');
      assert.equal(status, 400);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'INVALID_QUERY');
    });

    it('returns results for valid route corridor with mocked fetch', async () => {
      const originalFetch = global.fetch;
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          const urlStr = url.toString();
          // Mock OSRM Route
          if (urlStr.includes('router.project-osrm.org')) {
            return {
              ok: true,
              json: async () => ({
                code: 'Ok',
                routes: [
                  {
                    distance: 145000,
                    duration: 12000,
                    geometry: { type: 'LineString', coordinates: [[77.5, 12.9], [76.6, 12.3]] }
                  }
                ]
              })
            } as Response;
          }
          // Mock Overpass
          if (urlStr.includes('overpass-api.de')) {
            return {
              ok: true,
              json: async () => ({
                elements: [
                  {
                    id: 12345,
                    lat: 12.5,
                    lon: 77.0,
                    tags: { name: 'Mock Waterfall', waterway: 'waterfall' }
                  }
                ]
              })
            } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/pois?startLat=12.9&startLng=77.5&endLat=12.3&endLng=76.6&interests=waterfalls');
        assert.equal(status, 200);
        assert.equal(body.success, true);
        const data = body.data as any[];
        // Returns the mock waterfall
        assert.equal(data.length, 1);
        assert.equal(data[0].name, 'Mock Waterfall');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('returns empty list gracefully when Overpass fails', async () => {
      const originalFetch = global.fetch;
      try {
        global.fetch = async (url: string | URL | globalThis.Request, init?: RequestInit) => {
          const urlStr = url.toString();
          if (urlStr.includes('router.project-osrm.org')) {
            return {
              ok: true,
              json: async () => ({
                code: 'Ok',
                routes: [{ distance: 100, duration: 100, geometry: { type: 'LineString', coordinates: [[77.5, 12.9], [76.6, 12.3]] } }]
              })
            } as Response;
          }
          if (urlStr.includes('overpass-api.de')) {
            return { ok: false, status: 500, statusText: 'Internal Server Error' } as Response;
          }
          return originalFetch(url, init);
        };

        const { status, body } = await get('/api/v1/pois?startLat=12.9&startLng=77.5&endLat=12.3&endLng=76.6');
        assert.equal(status, 200);
        assert.equal(body.success, true);
        assert.deepEqual(body.data, []);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  // ── Itinerary Generation ──────────────────────────────

  describe('POST /api/v1/itinerary', () => {
    let originalFetch: any;

    before(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('returns 400 for missing body', async () => {
      const { status, body } = await post('/api/v1/itinerary', {});
      assert.equal(status, 400);
    });

    it('generates a valid itinerary and orders POIs by route, ignoring lat/lng', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 5000, duration: 600, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      const payload = {
        route: { distanceKm: 250, durationMinutes: 240, start: { lat: 0, lng: 0 }, end: { lat: 0.1, lng: 0 }, geometry: { coordinates: [[0,0], [0.1,0], [0.1,0.1], [0,0.1]] } },
        pois: [
          { id: '1', name: 'POI End', lat: 0.1, lng: 0.01, category: 'waterfalls' },
          { id: '2', name: 'POI Start', lat: 0, lng: 0.09, category: 'waterfalls' }
        ],
        params: { days: 2, startDate: '2026-09-17', vehicle: 'car', pace: 'balanced', startName: 'A', endName: 'B' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      assert.equal(status, 200);
      assert.equal(body.success, true);
      const data = body.data as any;
      assert.equal(data.feasibility.feasible, true);
      assert.equal(data.days.length, 2);
      
      assert.ok(data.days[0].stops.find((s: any) => s.name === 'POI Start'));
      assert.ok(data.days[1].stops.find((s: any) => s.name === 'POI End'));
    });

    it('enforces overall trip feasibility for huge must-visits', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 50000, duration: 6000, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      // 50,000 km in 1 day is unfeasible.
      // Must-visit logic should respect this.
      const payload = {
        route: { distanceKm: 50000, durationMinutes: 6000, start: { lat: 0, lng: 0 }, end: { lat: 1, lng: 0 }, geometry: { coordinates: [[0,0], [0,1]] } },
        pois: [],
        params: { days: 1, vehicle: 'car', pace: 'balanced', mustVisits: [{ id: '1', name: 'Huge Detour POI', lat: 0.5, lng: 100 }] }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      // Because route distance is 50,000 km on a 1-day trip, it should be marked unfeasible.
      assert.equal(data.feasibility.feasible, false);
      assert.ok(data.warnings.find((w: any) => w.title === 'Unfeasible Trip'));
    });

    it('injects car fatigue guidance (approx 3.5 hrs)', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 1000, duration: 120, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      const payload = {
        route: { distanceKm: 400, durationMinutes: 420, start: { lat: 0, lng: 0 }, end: { lat: 0.1, lng: 0 }, geometry: { coordinates: [[0,0], [0,0.1]] } },
        pois: [
          { id: '1', name: 'POI 1', lat: 0.05, lng: 0, category: 'waterfalls' },
          { id: '2', name: 'POI 2', lat: 0.06, lng: 0, category: 'waterfalls' },
          { id: '3', name: 'POI 3', lat: 0.07, lng: 0, category: 'waterfalls' },
          { id: '4', name: 'POI 4', lat: 0.08, lng: 0, category: 'waterfalls' }
        ],
        params: { days: 1, vehicle: 'car', pace: 'balanced' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      const breaks = data.days[0].stops.filter((s: any) => s.type === 'break');
      assert.ok(breaks.length >= 1);
    });

    it('injects motorcycle fatigue guidance (approx 2 hrs)', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 1000, duration: 120, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      const payload = {
        route: { distanceKm: 400, durationMinutes: 420, start: { lat: 0, lng: 0 }, end: { lat: 0.1, lng: 0 }, geometry: { coordinates: [[0,0], [0,0.1]] } },
        pois: [
          { id: '1', name: 'POI 1', lat: 0.05, lng: 0, category: 'waterfalls' },
          { id: '2', name: 'POI 2', lat: 0.06, lng: 0, category: 'waterfalls' },
          { id: '3', name: 'POI 3', lat: 0.07, lng: 0, category: 'waterfalls' },
          { id: '4', name: 'POI 4', lat: 0.08, lng: 0, category: 'waterfalls' }
        ],
        params: { days: 1, vehicle: 'motorcycle', pace: 'balanced' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      const breaks = data.days[0].stops.filter((s: any) => s.type === 'break');
      assert.ok(breaks.length >= 2);
    });

    it('dynamically limits attractions on heavy driving days', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 1000, duration: 120, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      const payload = {
        route: { distanceKm: 400, durationMinutes: 420, start: { lat: 0, lng: 0 }, end: { lat: 0.1, lng: 0 }, geometry: { coordinates: [[0,0], [0,0.1]] } },
        pois: [
          { id: '1', name: 'P1', lat: 0.01, lng: 0, category: 'attraction' },
          { id: '2', name: 'P2', lat: 0.02, lng: 0, category: 'attraction' },
          { id: '3', name: 'P3', lat: 0.03, lng: 0, category: 'attraction' },
          { id: '4', name: 'P4', lat: 0.04, lng: 0, category: 'attraction' }
        ],
        params: { days: 1, vehicle: 'car', pace: 'balanced' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      const attractions = data.days[0].stops.filter((s: any) => s.type === 'attraction' || s.type === 'food');
      assert.ok(attractions.length <= 3);
    });

    it('adds warning if no suitable POIs found', async () => {
      const payload = {
        route: { distanceKm: 10, durationMinutes: 10, start: { lat: 0, lng: 0 }, end: { lat: 0.1, lng: 0 }, geometry: { coordinates: [[0,0], [0,0.1]] } },
        pois: [],
        params: { days: 1, vehicle: 'car', pace: 'balanced' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      assert.ok(data.warnings.find((w: any) => w.title === 'No suitable POIs'));
    });

    it('returns unfeasible status for insufficient days', async () => {
      const payload = {
        route: { distanceKm: 1500, durationMinutes: 1800, start: { lat: 12.9, lng: 77.5 }, end: { lat: 12.3, lng: 76.6 } },
        pois: [],
        params: { days: 1, vehicle: 'car', pace: 'balanced' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      assert.equal(body.data.feasibility.feasible, false);
      assert.equal(body.data.feasibility.severity, 'critical');
    });

    it('calculates accurate dates across days', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 5000, duration: 600, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      const payload = {
        route: { distanceKm: 250, durationMinutes: 240, start: { lat: 0, lng: 0 }, end: { lat: 0.1, lng: 0 }, geometry: { coordinates: [[0,0], [0.1,0], [0.1,0.1], [0,0.1]] } },
        pois: [],
        params: { days: 2, startDate: '2026-10-30', vehicle: 'car', pace: 'balanced', startName: 'A', endName: 'B' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      assert.equal(data.days[0].dateStr.includes('30'), true);
      assert.equal(data.days[0].dayOfWeek, 'Friday');
      assert.equal(data.days[1].dateStr.includes('31'), true);
      assert.equal(data.days[1].dayOfWeek, 'Saturday');
    });

    it('evaluates polygon constraints and applies warnings', async () => {
      global.fetch = async (url: any, init?: any) => {
        if (url.toString().includes('router.project-osrm.org')) {
           return { ok: true, json: async () => ({ routes: [{ distance: 5000, duration: 600, geometry: '' }] }) } as Response;
        }
        return originalFetch(url, init);
      };

      const payload = {
        route: { distanceKm: 50, durationMinutes: 60, start: { lat: 11.6, lng: 76.2 }, end: { lat: 11.9, lng: 76.8 }, geometry: { coordinates: [[76.2, 11.6], [76.62, 11.66], [76.8, 11.9]] } },
        pois: [
          // Inside Bandipur bounding box (11.66, 76.62)
          { id: '1', name: 'Bandipur POI', lat: 11.66, lng: 76.62, category: 'park' }
        ],
        params: { days: 1, startDate: '2026-10-30', vehicle: 'car', pace: 'balanced', startName: 'A', endName: 'B' }
      };
      
      const { status, body } = await post('/api/v1/itinerary', payload);
      const data = body.data as any;
      // Should have Bandipur Night Traffic Ban warning
      assert.ok(data.days[0].warnings.find((w: any) => w.title.includes('Bandipur')));
    });

  });

  // ── 404 Handling ──────────────────────────────────────

  describe('404 Handling', () => {
    it('returns 404 with consistent error format for unknown routes', async () => {
      const { status, body } = await get('/api/v1/nonexistent');
      assert.equal(status, 404);
      assert.equal(body.success, false);
      const error = body.error as Record<string, unknown>;
      assert.equal(error.code, 'NOT_FOUND');
      assert.ok((error.message as string).includes('nonexistent'));
    });
  });
});
