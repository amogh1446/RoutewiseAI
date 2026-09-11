# RouteWise Geographic Providers

This directory contains the Geographic Provider Foundation. 
It defines provider-agnostic interfaces for:
1. **Geocoding** (`geocode`)
2. **Routing** (`getRoute`)
3. **Places/POI Lookup** (`searchNearby`)

## MVP Implementation: OSM Provider (`osmProvider.ts`)
For the MVP, we use completely free, public OpenStreetMap APIs:
- **Nominatim** for Geocoding.
- **OSRM** for Routing.
- **Overpass API** for Places.

### Environment Variables
To comply with OSM terms of service and allow custom routing engines, set these in your `.env`:

```env
# Required by OSM Nominatim and Overpass to identify your app
GEO_USER_AGENT="RouteWise-MVP/1.0 (contact@example.com)"

# Optional: Set a custom OSRM server (defaults to public demo server)
GEO_OSRM_URL="http://localhost:5000"
```

## Adding New Providers
To add a new provider (e.g., Google Maps, Mapbox):
1. Create `googleProvider.ts`.
2. Implement the `GeoProvider` interface.
3. Update `index.ts` to export the new instance as `geoProvider`.
