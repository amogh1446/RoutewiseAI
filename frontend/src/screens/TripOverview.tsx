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
import InteractiveMap from '../components/InteractiveMap';
import type { FormData } from './PlannerForm';

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
  onHome,
  onPlanNew,
  onDayClick,
  onAdjust,
  onChecklist,
}: {
  formData: FormData | null;
  onHome: () => void;
  onPlanNew: () => void;
  onDayClick: (day: number) => void;
  onAdjust: () => void;
  onChecklist: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'warnings'>('itinerary');

  const from = formData?.start?.name ?? 'Bengaluru';
  const to = formData?.destination?.name ?? 'Ooty';
  const days = formData?.days ? Number(formData.days) : 5;
  const vehicle = formData?.vehicle === 'motorcycle' ? '🏍️ Motorcycle' : '🚗 Car';

  const totalKm = tripDays.slice(0, days).reduce((sum, d) => sum + d.km, 0);

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
            <InteractiveMap isLoading={false} />
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 100 }}>
              <div style={{ background: '#F7F4EF', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#6B6358', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                Map · OpenStreetMap
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #DDD7CC', marginBottom: 24 }}>
            {(['itinerary', 'warnings'] as const).map(t => (
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
                {t}
                {t === 'warnings' && (
                  <span style={{ marginLeft: 6, background: '#FDF3E3', color: '#C17B2E', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                    3
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'itinerary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tripDays.slice(0, days).map(d => (
                <DayCard key={d.day} day={d} onClick={() => onDayClick(d.day)} />
              ))}
            </div>
          )}

          {activeTab === 'warnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Warning
                severity="important"
                title="Day 4: Long driving day (5h 10m)"
                description="Nagarhole to Ooty covers 180 km with significant mountain driving from Gudalur onwards. Consider an early start (before 8 AM) to avoid afternoon traffic at the Ooty ghat."
              />
              <Warning
                severity="advisory"
                title="Day 2: Talacauvery access may be restricted"
                description="Talacauvery temple area sometimes has vehicle restrictions during peak pilgrimage seasons. Check local conditions before visiting."
              />
              <Warning
                severity="advisory"
                title="Day 5: Return journey is 295 km"
                description="The longest single-day drive of the trip. Factor in time if returning via Bandipur — speed limits are strictly enforced through the national park."
              />
              <Warning
                severity="info"
                title="Nagarhole Safari: Advance booking may be required"
                description="Nagarhole National Park safari slots may need advance booking through the forest department portal. Verify current requirements before your trip. Self-drive is not permitted inside the park."
              />
              <Warning
                severity="info"
                title="Fuel: Plan ahead between Nagarhole and Ooty"
                description="There are limited fuel stations on the Nagarhole–Gudalur stretch. Fill up at Nagarhole before departure."
              />
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
              {tripDays.slice(0, days).map((d, i) => (
                <div
                  key={d.day}
                  style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i < Math.min(days, tripDays.length) - 1 ? 16 : 0 }}
                >
                  {i < Math.min(days, tripDays.length) - 1 && (
                    <div style={{ position: 'absolute', left: 9, top: 22, width: 2, height: 'calc(100% - 8px)', background: '#EDE8DF' }} />
                  )}
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#2D5A3D' : i === Math.min(days, tripDays.length) - 1 ? '#C17B2E' : '#EDE8DF', border: '2px solid', borderColor: i === 0 ? '#2D5A3D' : i === Math.min(days, tripDays.length) - 1 ? '#C17B2E' : '#DDD7CC', flexShrink: 0, zIndex: 1 }} />
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6358', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Day {d.day}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1714', marginTop: 1 }}>{d.from} → {d.to.split(' (')[0]}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6B6358', marginTop: 2 }}>{d.km} km · {d.driveTime}</div>
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

function DayCard({ day, onClick }: { day: (typeof tripDays)[0]; onClick: () => void }) {
  const warnBadge = day.warnings[0] as 'advisory' | 'important' | 'info' | undefined;
  const badgeColor = warnBadge === 'important' ? '#C44B3A' : warnBadge === 'advisory' ? '#C17B2E' : '#2B5F8A';

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
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1714', margin: 0, letterSpacing: '-0.01em' }}>
            {day.from} → {day.to.split(' (')[0]}
          </h3>
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
          {day.highlights.map(h => (
            <span key={h} style={{ fontSize: 12, color: '#6B6358', background: '#F7F4EF', border: '1px solid #EDE8DF', borderRadius: 100, padding: '3px 9px' }}>
              {h}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
