import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  type: 'start' | 'stop' | 'destination';
  label: string;
}

export interface InteractiveMapProps {
  geojsonStr?: string; // Valid GeoJSON LineString as string
  markers?: MarkerData[];
  isLoading?: boolean;
}

const indiaCenter: [number, number] = [22.5937, 78.9629];
const indiaZoom = 5;

// Custom divIcons for markers matching Figma styling
const createCustomIcon = (type: MarkerData['type']) => {
  const bgColor = type === 'start' ? '#2D5A3D' : type === 'destination' ? '#C17B2E' : '#3D7A52';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

function BoundsFitter({ geojsonStr, markers }: { geojsonStr?: string, markers?: MarkerData[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (geojsonStr) {
      try {
        const geojson = JSON.parse(geojsonStr);
        const geojsonLayer = L.geoJSON(geojson);
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error("Invalid GeoJSON passed to map", e);
      }
    } else if (markers && markers.length > 0) {
      const latlngs = markers.map(m => [m.lat, m.lng] as [number, number]);
      const bounds = L.latLngBounds(latlngs);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      map.setView(indiaCenter, indiaZoom);
    }
  }, [map, geojsonStr, markers]);
  
  return null;
}

export default function InteractiveMap({ geojsonStr, markers = [], isLoading }: InteractiveMapProps) {
  let geojsonObj = null;
  if (geojsonStr) {
    try {
      geojsonObj = JSON.parse(geojsonStr);
    } catch(e) {}
  }
  
  // Extract coordinates for Polyline if it's a LineString
  let polylineCoords: [number, number][] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (geojsonObj && geojsonObj.type === 'LineString' && Array.isArray((geojsonObj as any).coordinates)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    polylineCoords = (geojsonObj as any).coordinates.map((c: any[]) => [c[1], c[0]]); // GeoJSON is [lng, lat], Leaflet is [lat, lng]
  }

  const hasData = polylineCoords.length > 0 || markers.length > 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#e5e5e5' }}>
      <MapContainer 
        center={indiaCenter} 
        zoom={indiaZoom} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&amp;copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {polylineCoords.length > 0 && (
          <Polyline positions={polylineCoords} color="#2D5A3D" weight={4} opacity={0.8} dashArray="8, 6" />
        )}

        {markers.map(m => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={createCustomIcon(m.type)}>
            <Popup>
              <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1714' }}>
                {m.label}
              </div>
            </Popup>
          </Marker>
        ))}

        <BoundsFitter geojsonStr={geojsonStr} markers={markers} />
      </MapContainer>

      {/* Loading / Empty State Overlay */}
      {(!hasData || isLoading) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(247, 244, 239, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            padding: '16px 24px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #DDD7CC'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px', display: 'block', color: '#2D5A3D' }}>
              <path d="M12 21C16 17 20 13 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13 8 17 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: 14, fontWeight: 600, color: '#1A1714' }}>
              {isLoading ? 'Calculating route...' : 'Awaiting route data'}
            </div>
            <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: 12, color: '#6B6358', marginTop: 4 }}>
              Interactive map will appear here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
