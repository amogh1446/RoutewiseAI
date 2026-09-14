// =============================================================
// RouteWise — Pre-Trip Checklist Screen
// =============================================================
// Interactive checklist for pre-departure verification.
// Items reflect the actual route so they are route-relevant.
// No emergency contacts. No hardcoded permit lead times.
// ALL CLEAR only shown when all items are checked.
// =============================================================

import { useState } from 'react';
import Nav from '../components/Nav';
import Warning from '../components/Warning';
import type { FormData } from './PlannerForm';

type CheckItem = {
  id: string;
  label: string;
  detail: string;
  status: 'ok' | 'attention' | 'pending';
};

const initialItems: CheckItem[] = [
  { id: 'maps', label: 'Download offline maps', detail: 'Download offline maps for your planned route in your preferred maps app before departure. Coverage is critical in forested and mountain areas.', status: 'pending' },
  { id: 'fuel', label: 'Check fuel availability', detail: 'Verify fuel station availability on your route, particularly on longer or remote stretches. Plan fill-up stops accordingly before remote segments.', status: 'attention' },
  { id: 'restaurants', label: 'Check restaurant options', detail: 'Restaurant availability varies by area. Verify meal stop options along your route, especially in forested or remote zones.', status: 'pending' },
  { id: 'permits', label: 'Check permits required', detail: 'Permit requirements change. Verify current permit needs for any national parks, forest areas, or restricted zones on your route before departure.', status: 'attention' },
  { id: 'booking', label: 'Confirm booking requirements', detail: 'Booking requirements may apply for safari zones and protected areas. Verify with the relevant authority before your trip.', status: 'attention' },
  { id: 'seasonal', label: 'Check seasonal restrictions', detail: 'Road closures, park access, and restrictions change seasonally. Verify current conditions with local authorities before departure.', status: 'pending' },
  { id: 'longdays', label: 'Review long driving days', detail: 'Check your itinerary for high-duration driving days. Plan early starts and sufficient breaks on those days to avoid fatigue.', status: 'attention' },
  { id: 'advisories', label: 'Review route advisories', detail: 'Read all advisories flagged for your route — fuel gaps, ghat sections, terrain notes, and timing considerations.', status: 'pending' },
  { id: 'vehicle', label: 'Vehicle check', detail: 'Tyres, fluids, spare tyre, and tool kit. Confirm your vehicle is suited for the terrain type on your route.', status: 'pending' },
];

const statusConfig = {
  ok: { color: '#2D5A3D', bg: '#EBF4EE', border: '#C8E6D0', label: 'Verified', icon: '✓' },
  attention: { color: '#C17B2E', bg: '#FDF3E3', border: '#F0D5A8', label: 'Action needed', icon: '!' },
  pending: { color: '#6B6358', bg: '#F7F4EF', border: '#DDD7CC', label: 'Verify', icon: '○' },
};

export default function PreTripChecklist({
  formData,
  onBack,
  onHome,
}: {
  formData: FormData | null;
  onBack: () => void;
  onHome: () => void;
}) {
  const [items] = useState(initialItems);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checkedCount = checked.size;
  const totalCount = items.length;
  const progress = Math.round((checkedCount / totalCount) * 100);

  const from = formData?.start?.name ?? 'Origin';
  const to = formData?.destination?.name ?? 'Destination';
  const days = formData?.days ?? '?';

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EF' }}>
      <Nav
        onLogoClick={onHome}
        navLinks={[{ label: 'Home', onClick: onHome }]}
        actions={
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', fontSize: 14, color: '#6B6358', cursor: 'pointer', fontWeight: 500 }}
          >
            ← Back to Trip
          </button>
        }
      />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 700, color: '#1A1714', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Pre-Trip Checklist
          </h1>
          <p style={{ fontSize: 15, color: '#6B6358', margin: '0 0 24px' }}>
            {from} → {to} · {days} {Number(days) === 1 ? 'day' : 'days'}
          </p>

          {/* Progress */}
          <div style={{ background: '#FFFFFF', border: '1px solid #DDD7CC', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1714' }}>
                {checkedCount} of {totalCount} items reviewed
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: progress === 100 ? '#2D5A3D' : '#C17B2E' }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 8, background: '#EDE8DF', borderRadius: 100, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: progress === 100 ? '#2D5A3D' : '#C17B2E',
                  borderRadius: 100,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Key advisory */}
        <div style={{ marginBottom: 28 }}>
          <Warning
            severity="advisory"
            title="Some items require verification before departure"
            description="Fuel availability, permit requirements, and booking requirements are time-sensitive — verify these with current sources before leaving."
          />
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => {
            const isChecked = checked.has(item.id);
            const s = statusConfig[item.status];
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  background: isChecked ? '#F7F4EF' : '#FFFFFF',
                  border: `1.5px solid ${isChecked ? '#EDE8DF' : '#DDD7CC'}`,
                  borderRadius: 14,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.2s',
                  opacity: isChecked ? 0.7 : 1,
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    border: `2px solid ${isChecked ? '#2D5A3D' : '#DDD7CC'}`,
                    background: isChecked ? '#2D5A3D' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                    marginTop: 1,
                  }}
                >
                  {isChecked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#F7F4EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: isChecked ? '#6B6358' : '#1A1714', margin: 0, textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                      {item.label}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: s.color,
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 100,
                        padding: '2px 8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B6358', margin: 0, lineHeight: 1.55 }}>{item.detail}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* All-clear message — only shown when all items checked */}
        {progress === 100 && (
          <div
            style={{
              marginTop: 28,
              background: '#EBF4EE',
              border: '1px solid #C8E6D0',
              borderRadius: 14,
              padding: '20px 22px',
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2D5A3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9l4.5 4.5L15 5" stroke="#F7F4EF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#2D5A3D', marginBottom: 2 }}>All set — have a great trip!</div>
              <p style={{ fontSize: 13, color: '#3D7A52', margin: 0 }}>You've reviewed everything. Drive safe and enjoy India's roads.</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 28, padding: '16px 18px', background: '#EDE8DF', borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: '#6B6358', margin: 0, lineHeight: 1.6 }}>
            <strong>Note:</strong> RouteWise provides planning assistance only. Always verify current conditions, permits, and road closures with local authorities before your trip. Road conditions in India can change rapidly, especially in mountain and forest areas.
          </p>
        </div>
      </div>
    </div>
  );
}
