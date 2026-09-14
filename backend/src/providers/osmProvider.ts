// =============================================================
// RouteWise — OpenStreetMap (OSM) Provider
// =============================================================
//
// Implements Geocoding via Nominatim, Routing via OSRM, 
// and Places via Overpass API.
// Completely free and requires no API keys for development.
// =============================================================

import type { 
  GeoProvider, 
  GeocodeRequest, GeocodeResult, 
  RouteRequest, RouteResult,
  PlacesRequest, PlaceResult,
  CorridorRequest
} from './interfaces.js';
import type { POICategory } from '../utils/types.js';

export class OSMProvider implements GeoProvider {
  readonly providerName = 'OSM_Public';

  private get userAgent(): string {
    return process.env.GEO_USER_AGENT || 'RouteWise-MVP/1.0 (dev@localhost)';
  }

  // ── Geocoding (Nominatim) ───────────────────────────────
  
  async geocode(req: GeocodeRequest): Promise<GeocodeResult[]> {
    if (!req.query) return [];

    // Filter to India using countrycodes=in
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', req.query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '5');
    url.searchParams.append('countrycodes', 'in');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': this.userAgent }
    });

    if (!res.ok) {
      throw new Error(`Nominatim API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as any[];

    return data.map((item) => ({
      place_id: `osm-${item.osm_type}-${item.osm_id}`,
      name: item.name || item.display_name.split(',')[0],
      formatted_address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  }

  // ── Routing (OSRM) ──────────────────────────────────────
  
  async getRoute(req: RouteRequest): Promise<RouteResult> {
    // OSRM expects coordinates as lon,lat
    const coords = [req.origin, ...(req.waypoints || []), req.destination];
    const coordString = coords.map(c => `${c.lng},${c.lat}`).join(';');
    
    // For MVP, we map both car and motorcycle to 'driving' profile on public OSRM
    const profile = 'driving';
    
    const baseUrl = process.env.GEO_OSRM_URL || 'https://router.project-osrm.org';
    const url = `${baseUrl}/route/v1/${profile}/${coordString}?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      headers: { 'User-Agent': this.userAgent }
    });

    if (!res.ok) {
      throw new Error(`OSRM API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as any;
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM routing failed: ${data.code || 'No routes found'}`);
    }

    const route = data.routes[0];

    // Build standard GeoJSON LineString
    const geojson = {
      type: 'LineString',
      coordinates: route.geometry.coordinates // OSRM geojson geometry is already an array of [lon,lat]
    };

    return {
      distance_km: parseFloat((route.distance / 1000).toFixed(2)),
      duration_minutes: Math.ceil(route.duration / 60),
      polyline_geojson: JSON.stringify(geojson),
      waypoints: [req.origin, req.destination], // MVP simplifies to just endpoints
    };
  }

  // ── Places (Overpass API) ───────────────────────────────

  async searchNearby(req: PlacesRequest): Promise<PlaceResult[]> {
    const { lat, lng } = req.location;
    const radius = Math.min(req.radius_meters, 50000); // Cap at 50km
    
    // Map RouteWise category to OSM tags
    let overpassFilter = '';
    switch (req.category) {
      case 'fuel':
        overpassFilter = '["amenity"="fuel"]';
        break;
      case 'food':
        overpassFilter = '["amenity"~"restaurant|cafe|fast_food"]';
        break;
      case 'lodging':
        overpassFilter = '["tourism"~"hotel|hostel|guest_house"]';
        break;
      case 'attraction':
        overpassFilter = '["tourism"~"attraction|museum|viewpoint"]';
        break;
      case 'viewpoint':
        overpassFilter = '["tourism"="viewpoint"]';
        break;
      default:
        overpassFilter = '["amenity"]'; // fallback
    }

    // Overpass QL query: look for nodes around lat,lng
    // Format: [out:json]; node(around:radius,lat,lon)[filter]; out center;
    const query = `[out:json][timeout:10];
      node(around:${radius},${lat},${lng})${overpassFilter};
      out center 15;`; // limit to 15 results for MVP performance

    const url = 'https://overpass-api.de/api/interpreter';
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'User-Agent': this.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!res.ok) {
      throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as any;
    const elements = data.elements || [];

    return elements
      .filter((el: any) => el.tags && el.tags.name) // only return places with a name
      .map((el: any) => ({
        place_id: `osm-node-${el.id}`,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        category: req.category,
        address: el.tags['addr:street'] || el.tags['addr:city'] || null
      }));
  }

  private mapCategoriesToOverpass(categories: string[]): string[] {
    const filters: string[] = [];
    for (const cat of categories) {
      switch (cat.toLowerCase()) {
        case 'nature': filters.push('["leisure"="nature_reserve"]'); break;
        case 'waterfalls': filters.push('["waterway"="waterfall"]'); break;
        case 'viewpoints': filters.push('["tourism"="viewpoint"]'); break;
        case 'temples': filters.push('["amenity"="place_of_worship"]["religion"="hindu"]'); break;
        case 'forts': filters.push('["historic"="fort"]'); break;
        case 'beaches': filters.push('["natural"="beach"]'); break;
        case 'wildlife': filters.push('["tourism"="zoo"]'); break;
        case 'culture':
        case 'history':
        case 'culture/history': filters.push('["historic"]'); break;
        case 'food': filters.push('["amenity"~"restaurant|cafe|fast_food"]'); break;
        case 'photography': filters.push('["tourism"~"viewpoint|artwork"]'); break;
        case 'attraction': filters.push('["tourism"~"attraction|museum"]'); break;
        default: filters.push('["tourism"="attraction"]'); break;
      }
    }
    return [...new Set(filters)]; // Deduplicate
  }

  async searchCorridor(req: CorridorRequest): Promise<PlaceResult[]> {
    const radius = Math.min(req.radius_meters, 20000); // Cap at 20km
    
    // Sample coordinates from route_geometry (limit to ~25 points to avoid huge Overpass query)
    const coords = req.route_geometry.coordinates;
    if (!coords || coords.length === 0) return [];
    
    const sampleRate = Math.max(1, Math.floor(coords.length / 25));
    const sampled = coords.filter((_: any, i: number) => i % sampleRate === 0);
    // Overpass expects lat,lon
    const aroundStr = sampled.map((c: any) => `${c[1]},${c[0]}`).join(',');
    
    const filters = this.mapCategoriesToOverpass(req.categories);
    if (filters.length === 0) filters.push('["tourism"="attraction"]');

    // Build union of nodes
    const statements = filters.map(f => `node(around:${radius},${aroundStr})${f};`).join('\n        ');
    
    const query = `[out:json][timeout:25];
      (
        ${statements}
      );
      out center 50;`; // Limit to 50 results

    const url = 'https://overpass-api.de/api/interpreter';
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'User-Agent': this.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!res.ok) {
      throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as any;
    const elements = data.elements || [];

    return elements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => ({
        place_id: `osm-node-${el.id}`,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        category: (req.categories[0] || 'attraction') as any, // Simple fallback for MVP
        address: el.tags['addr:street'] || el.tags['addr:city'] || null
      }));
  }
}
