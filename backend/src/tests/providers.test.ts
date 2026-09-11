// =============================================================
// RouteWise — Geographic Providers Tests
// =============================================================

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { OSMProvider } from '../providers/osmProvider.js';

describe('OSM Provider (Mocked)', () => {
  const provider = new OSMProvider();
  let originalFetch: typeof globalThis.fetch;

  before(() => {
    // Save original fetch
    originalFetch = globalThis.fetch;
  });

  after(() => {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  });

  it('geocodes a location successfully', async () => {
    // Mock fetch for Nominatim
    globalThis.fetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();
      assert.ok(urlStr.includes('nominatim.openstreetmap.org'));
      assert.ok(urlStr.includes('q=Bangalore'));
      
      return {
        ok: true,
        json: async () => [
          {
            osm_type: 'node',
            osm_id: '12345',
            name: 'Bengaluru',
            display_name: 'Bengaluru, Karnataka, India',
            lat: '12.9716',
            lon: '77.5946'
          }
        ]
      } as Response;
    };

    const results = await provider.geocode({ query: 'Bangalore' });
    
    assert.equal(results.length, 1);
    assert.equal(results[0].name, 'Bengaluru');
    assert.equal(results[0].lat, 12.9716);
    assert.equal(results[0].lng, 77.5946);
    assert.equal(results[0].place_id, 'osm-node-12345');
  });

  it('gets a route successfully', async () => {
    // Mock fetch for OSRM
    globalThis.fetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();
      assert.ok(urlStr.includes('router.project-osrm.org'));
      assert.ok(urlStr.includes('77.5946,12.9716;73.8567,18.5204'));
      
      return {
        ok: true,
        json: async () => ({
          code: 'Ok',
          routes: [
            {
              distance: 850000, // 850 km
              duration: 36000, // 10 hours
              geometry: {
                type: 'LineString',
                coordinates: [[77.5946, 12.9716], [73.8567, 18.5204]]
              }
            }
          ]
        })
      } as Response;
    };

    const result = await provider.getRoute({
      origin: { lat: 12.9716, lng: 77.5946 },
      destination: { lat: 18.5204, lng: 73.8567 },
      vehicle_type: 'car'
    });

    assert.equal(result.distance_km, 850);
    assert.equal(result.duration_minutes, 600);
    assert.ok(result.polyline_geojson.includes('LineString'));
  });

  it('searches nearby places successfully', async () => {
    // Mock fetch for Overpass
    globalThis.fetch = async (url: string | URL | Request, init?: RequestInit) => {
      assert.equal(url.toString(), 'https://overpass-api.de/api/interpreter');
      assert.equal(init?.method, 'POST');
      assert.ok(decodeURIComponent(init?.body?.toString() || '').includes('["amenity"="fuel"]'));
      
      return {
        ok: true,
        json: async () => ({
          elements: [
            {
              type: 'node',
              id: 9876,
              lat: 12.9720,
              lon: 77.5950,
              tags: {
                name: 'Shell Petrol Bunk',
                amenity: 'fuel',
                'addr:street': 'MG Road'
              }
            }
          ]
        })
      } as Response;
    };

    const results = await provider.searchNearby({
      location: { lat: 12.9716, lng: 77.5946 },
      radius_meters: 5000,
      category: 'fuel'
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].place_id, 'osm-node-9876');
    assert.equal(results[0].name, 'Shell Petrol Bunk');
    assert.equal(results[0].category, 'fuel');
    assert.equal(results[0].address, 'MG Road');
  });

  it('handles API errors gracefully', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    } as Response);

    await assert.rejects(
      () => provider.geocode({ query: 'Test' }),
      /Nominatim API error: 500 Internal Server Error/
    );
  });
});
