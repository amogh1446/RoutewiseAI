// =============================================================
// RouteWise — Trip Overview Screen
// =============================================================
// The primary results screen. Shows route summary, an
// interactive map placeholder (Leaflet-ready), day-by-day
// itinerary, warnings, and sidebar panels.
//
// NOTE: The map uses a Leaflet-compatible div container.
// In the MVP, this renders a styled placeholder with route
// markers. A real Leaflet map can be dropped in without
// changing the surrounding layout.
// =============================================================

import { useState } from 'react';
import Nav from '../components/Nav';
import Warning from '../components/Warning';
import InteractiveMap, { MarkerData } from '../components/InteractiveMap';
import type { FormData } from './PlannerForm';
import type { RouteResponse } from '../services/api';

// ── Sample trip data ─────────────────────────────────────────
// This is demonstration data for the MVP UI.
// In production this will be replaced by the backend itinerary
// API response. No real coordinates or distances are invented —
// the values shown are representative of a known Indian route.

const tripDays = [
  {
    day: 1,
    from: 'Bengaluru',
    to: 'Mysuru',
    km: 145,
    driveTime: '3h 20m',
    highlights: ['Brindavan Gardens', 'Mysore Palace', 'Devaraja Market'],
    warnings: [] as string[],
  },
  {
    day: 2,
    from: 'Mysuru',
    to: 'Coorg (Madikeri)',
    km: 118,
    driveTime: '3h 05m',
    highlights: ['Abbey Falls', "Raja's Seat", 'Talacauvery'],
    warnings: ['advisory'],
  },
  {
    day: 3,
    from: 'Coorg',
    to: 'Nagarhole',
    km: 80,
    driveTime: '2h 00m',
    highlights: ['Nagarhole National Park', 'Kabini backwaters'],
    warnings: ['info'],
  },
  {
    day: 4,
    from: 'Nagarhole',
    to: 'Ooty',
    km: 180,
    driveTime: '5h 10m',
    highlights: ['Botanical Garden', 'Emerald Lake'],
    warnings: ['important'],
  },
  {
    day: 5,
    from: 'Ooty',
    to: 'Bengaluru',
    km: 295,
    driveTime: '6h 30m',
    highlights: ['Bandipur National Park', 'Kabini River'],
    warnings: ['advisory'],
  },
];

export default function TripOverview({
  formData,
  routeData,
  pois = [],
  itineraryData,
  onHome,
  onPlanNew,
  onDayClick,
  onAdjust,
  onChecklist,
}: {
  formData: FormData | null;
  routeData?: RouteResponse | null;
  pois?: import('../services/api').POI[];
  itineraryData?: import('../services/api').ItineraryResponse | null;
  onHome: () => void;
  onPlanNew: () => void;
  onDayClick: (day: number) => void;
  onAdjust: () => void;
  onChecklist: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'warnings' | 'places'>('itinerary');

  const from = formData?.start?.name ?? 'Bengaluru';
  const to = formData?.destination?.name ?? 'Ooty';
  const days = formData?.days ? Number(formData.days) : 5;
  const vehicle = formData?.vehicle === 'motorcycle' ? '🏍️ Motorcycle' : '🚗 Car';

  const totalKm = routeData ? routeData.distanceKm : 0;
  const totalDuration = routeData ? `${Math.floor(routeData.durationMinutes / 60)}h ${routeData.durationMinutes % 60}m` : '0h 0m';

  const mapMarkers: MarkerData[] = routeData ? [
    { id: 'start', type: 'start', label: from, lat: routeData.start.lat, lng: routeData.start.lng },
    { id: 'end', type: 'destination', label: to, lat: routeData.end.lat, lng: routeData.end.lng },
    ...pois.map(p => ({
      id: p.id,
      type: 'stop' as const,
      label: p.name,
      lat: p.lat,
      lng: p.lng
    }))
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EF' }}>
      <Nav
        onLogoClick={onHome}
        navLinks={[
          { label: 'Home', onClick: onHome },
          { label: 'Plan New Trip', onClick: onPlanNew },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onAdjust}
              style={{ background: 'none', border: '1px solid #DDD7CC', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#3D3830', cursor: 'pointer' }}
            >
              Adjust Trip
            </button>
            <button
              onClick={onChecklist}
              style={{ background: '#2D5A3D', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#F7F4EF', cursor: 'pointer' }}
            >
              Pre-Trip Checklist
            </button>
          </div>
        }
      />

      {/* Trip summary bar */}
      <div style={{ background: '#2D5A3D', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#C8E6D0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
              Your Route
            </div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 26, fontWeight: 700, color: '#F7F4EF', margin: 0, letterSpacing: '-0.01em' }}>
              {from} → {to}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'Total Distance', value: `~${totalKm} km` },
              { label: 'Drive Time', value: totalDuration },
              { label: 'Days', value: `${days} days` },
              { label: 'Vehicle', value: vehicle },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#C8E6D0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 500, color: '#F7F4EF' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
        {/* Left: Map + itinerary */}
        <div>
          {/* Map container — Leaflet-ready */}
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #DDD7CC',
              marginBottom: 28,
              position: 'relative',
              background: '#C8D8C8',
              height: 340,
            }}
          >
            <InteractiveMap 
              isLoading={false} 
              geojsonStr={routeData ? JSON.stringify(routeData.geometry) : undefined}
              markers={mapMarkers}
            />
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 100 }}>
              <div style={{ background: '#F7F4EF', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#6B6358', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                Map · OpenStreetMap
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #DDD7CC', marginBottom: 24 }}>
            {(['itinerary', 'places', 'warnings'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === t ? '#2D5A3D' : 'transparent'}`,
                  background: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: activeTab === t ? '#2D5A3D' : '#6B6358',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}
              >
                {t === 'places' ? 'Discovered Places' : t}
                {t === 'warnings' && (itineraryData?.warnings.length || 0) > 0 && (
                  <span style={{ marginLeft: 6, background: '#FDF3E3', color: '#C17B2E', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {itineraryData?.warnings.length}
                  </span>
                )}
                {t === 'places' && pois.length > 0 && (
                  <span style={{ marginLeft: 6, background: '#EBF4EE', color: '#2D5A3D', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    {pois.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'itinerary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itineraryData?.feasibility.severity === 'critical' ? (
                <Warning severity="important" title="Trip Unfeasible" description={itineraryData.feasibility.reasons[0]} />
              ) : (
                (itineraryData?.days || tripDays.slice(0, days)).map(d => (
                  <DayCard key={d.day} day={d as any} onClick={() => onDayClick(d.day)} />
                ))
              )}
            </div>
          )}

          {activeTab === 'places' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pois.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', background: '#FFFFFF', borderRadius: 12, border: '1px solid #DDD7CC' }}>
                  <p style={{ color: '#6B6358', fontSize: 14 }}>No places discovered along this route for your selected interests.</p>
                </div>
              ) : (
                pois.map((poi, idx) => (
                  <div key={poi.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#FFFFFF', padding: '16px', borderRadius: 12, border: '1px solid #DDD7CC' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EBF4EE', color: '#2D5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1A1714' }}>{poi.name}</h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#6B6358', textTransform: 'capitalize' }}>{poi.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'warnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {itineraryData?.warnings.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', background: '#FFFFFF', borderRadius: 12, border: '1px solid #DDD7CC' }}>
                  <p style={{ color: '#6B6358', fontSize: 14 }}>No warnings or advisories for this trip.</p>
                </div>
              ) : (
                (itineraryData?.warnings || []).map((w, i) => (
                  <Warning
                    key={i}
                    severity={w.severity}
                    title={w.title}
                    description={w.description}
                    requiresVerification={w.requiresVerification}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Route summary */}
          <div style={{ background: '#FFFFFF', border: '1px solid #DDD7CC', borderRadius: 16, padding: '20px' }}>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 600, color: '#1A1714', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
              Route Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(itineraryData?.days || tripDays.slice(0, days)).map((d, i) => (
                <div
                  key={d.day}
                  style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i < Math.min(days, (itineraryData?.days || tripDays).length) - 1 ? 16 : 0 }}
                >
                  {i < Math.min(days, (itineraryData?.days || tripDays).length) - 1 && (
                    <div style={{ position: 'absolute', left: 9, top: 22, width: 2, height: 'calc(100% - 8px)', background: '#EDE8DF' }} />
                  )}
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#2D5A3D' : i === Math.min(days, (itineraryData?.days || tripDays).length) - 1 ? '#C17B2E' : '#EDE8DF', border: '2px solid', borderColor: i === 0 ? '#2D5A3D' : i === Math.min(days, (itineraryData?.days || tripDays).length) - 1 ? '#C17B2E' : '#DDD7CC', flexShrink: 0, zIndex: 1 }} />
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6358', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Day {d.day}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1714', margin: '2px 0' }}>{d.from} → {d.to.split(' (')[0]}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B6358' }}>{d.km} km · {d.driveTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip details */}
          <div style={{ background: '#EBF4EE', border: '1px solid #C8E6D0', borderRadius: 16, padding: '20px' }}>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 600, color: '#2D5A3D', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              Trip Details
            </h3>
            {[
              { label: 'Trip type', value: formData?.tripType === 'round-trip' ? 'Round trip' : formData?.tripType === 'base' ? 'Explore from base' : 'One-way' },
              { label: 'Travel group', value: formData?.group || '—' },
              { label: 'Pace', value: formData?.pace === 'relaxed' ? 'Relaxed' : formData?.pace === 'fast' ? 'Fast-paced' : 'Balanced' },
              { label: 'Interests', value: formData?.interests.length ? formData.interests.slice(0, 3).join(', ') : '—' },
              { label: 'Toll preference', value: formData?.toll === 'prefer' ? 'Prefer tolls' : formData?.toll === 'avoid' ? 'Avoid tolls' : 'Balanced' },
              { label: 'Budget', value: formData?.budget === 'budget' ? 'Budget' : formData?.budget === 'premium' ? 'Premium' : 'Moderate' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #C8E6D0' }}>
                <span style={{ fontSize: 13, color: '#3D7A52', fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2D5A3D' }}>{r.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onChecklist}
            style={{
              background: '#2D5A3D',
              color: '#F7F4EF',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            View Pre-Trip Checklist →
          </button>

          <button
            onClick={onPlanNew}
            style={{
              background: 'none',
              color: '#6B6358',
              border: '1px solid #DDD7CC',
              borderRadius: 12,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Plan New Trip
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function DayCard({ day, onClick }: { day: import('../services/api').ItineraryDay | any; onClick: () => void }) {
  const warnBadge = day.warnings?.[0]?.severity as 'warning' | 'critical' | 'info' | undefined;
  const badgeColor = warnBadge === 'critical' ? '#C44B3A' : warnBadge === 'warning' ? '#C17B2E' : '#2B5F8A';

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        background: '#FFFFFF',
        border: '1px solid #DDD7CC',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        padding: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D5A3D'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,23,20,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD7CC'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ background: '#EBF4EE', borderRight: '1px solid #C8E6D0', padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 80 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500, color: '#3D7A52', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Day</span>
        <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 700, color: '#2D5A3D', lineHeight: 1 }}>{day.day}</span>
      </div>
      <div style={{ flex: 1, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1714', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
              {day.from} → {day.to.split(' (')[0]}
            </h3>
            {day.dateStr && (
              <div style={{ fontSize: 12, color: '#6B6358' }}>
                {day.dayOfWeek ? `${day.dayOfWeek}, ` : ''}{day.dateStr}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {warnBadge && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: badgeColor }} />
            )}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="#6B6358" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B6358' }}>{day.km} km</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B6358' }}>~{day.driveTime} drive</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {day.highlights?.map((h: string) => (
            <span key={h} style={{ fontSize: 12, color: '#6B6358', background: '#F7F4EF', border: '1px solid #EDE8DF', borderRadius: 100, padding: '3px 9px' }}>
              {h}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
