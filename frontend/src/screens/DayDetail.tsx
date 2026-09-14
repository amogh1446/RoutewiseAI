// =============================================================
// RouteWise — Day Detail Screen
// =============================================================
// Full timeline view for a single itinerary day.
// Colour-coded stop types: departure, drive, attraction, food, break, arrival.
// =============================================================

import Nav from '../components/Nav';
import Warning from '../components/Warning';
import type { FormData } from './PlannerForm';

type StopType = 'drive' | 'attraction' | 'food' | 'break' | 'arrival' | 'departure';

// Stop type removed

// Hardcoded data removed.
const typeConfig: Record<StopType, { color: string; bg: string; border: string; icon: string; label: string }> = {
  departure: { color: '#2D5A3D', bg: '#EBF4EE', border: '#C8E6D0', icon: '↑', label: 'Departure' },
  drive: { color: '#3D3830', bg: '#F7F4EF', border: '#DDD7CC', icon: '⟶', label: 'Driving' },
  attraction: { color: '#2B5F8A', bg: '#EEF4FB', border: '#C0D8EF', icon: '★', label: 'Attraction' },
  food: { color: '#C17B2E', bg: '#FDF3E3', border: '#F0D5A8', icon: '✦', label: 'Food & Drink' },
  break: { color: '#6B6358', bg: '#F7F4EF', border: '#EDE8DF', icon: '◯', label: 'Break / Rest' },
  arrival: { color: '#2D5A3D', bg: '#EBF4EE', border: '#C8E6D0', icon: '✓', label: 'Arrival' },
};

export default function DayDetail({
  day,
  totalDays,
  formData: _formData,
  itineraryData,
  onBack,
  onHome,
  onPlanNew,
  onNext,
  onPrev,
}: {
  day: number;
  totalDays: number;
  formData: FormData | null;
  itineraryData?: import('../services/api').ItineraryResponse | null;
  onBack: () => void;
  onHome: () => void;
  onPlanNew: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const data = itineraryData?.days.find(d => d.day === day);
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Day data not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EF' }}>
      <Nav
        onLogoClick={onHome}
        navLinks={[
          { label: 'Home', onClick: onHome },
          { label: 'Plan New Trip', onClick: onPlanNew },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6B6358', cursor: 'pointer' }}
            >
              ← All Days
            </button>
            <button
              onClick={onPrev}
              disabled={day <= 1}
              style={{ background: 'none', border: '1px solid #DDD7CC', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: day <= 1 ? '#C0BAB3' : '#3D3830', cursor: day <= 1 ? 'not-allowed' : 'pointer' }}
            >
              ← Prev Day
            </button>
            <button
              onClick={onNext}
              disabled={day >= totalDays}
              style={{ background: '#2D5A3D', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: day >= totalDays ? '#C8E6D0' : '#F7F4EF', cursor: day >= totalDays ? 'not-allowed' : 'pointer' }}
            >
              Next Day →
            </button>
          </div>
        }
      />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* Day header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
          <div style={{ background: '#2D5A3D', borderRadius: 14, padding: '12px 16px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#C8E6D0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DAY</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 700, color: '#F7F4EF', lineHeight: 1 }}>{day}</div>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1A1714', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              {data.from} → {data.to.split(' (')[0]}
            </h1>
            <div style={{ display: 'flex', gap: 20 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#6B6358' }}>{data.km} km</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#6B6358' }}>~{data.driveTime} driving</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {data.warnings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {data.warnings.map((w, i) => (
              <Warning key={i} severity={w.severity} title={w.title} description={w.description} />
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          {(['departure', 'drive', 'attraction', 'food', 'break', 'arrival'] as StopType[]).map(t => {
            const c = typeConfig[t];
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: c.color, fontWeight: 700 }}>{c.icon}</div>
                <span style={{ fontSize: 12, color: '#6B6358', fontWeight: 500 }}>{c.label}</span>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {data.stops.map((stop, idx) => {
            const c = typeConfig[stop.type];
            const isLast = idx === data.stops.length - 1;
            return (
              <div key={idx} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: isLast ? 0 : 20 }}>
                {!isLast && (
                  <div style={{ position: 'absolute', left: 19, top: 40, width: 2, height: 'calc(100% - 20px)', background: '#EDE8DF', zIndex: 0 }} />
                )}

                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: c.bg,
                    border: `2px solid ${c.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: c.color,
                    fontWeight: 700,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {c.icon}
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    marginTop: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: c.color, fontWeight: 500, marginBottom: 3, letterSpacing: '0.04em' }}>
                        {stop.time}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1714', margin: 0, letterSpacing: '-0.01em' }}>{stop.name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {stop.duration && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: c.color, background: '#FFFFFF', border: `1px solid ${c.border}`, borderRadius: 100, padding: '2px 9px', whiteSpace: 'nowrap' }}>
                          {stop.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#3D3830', margin: '0', lineHeight: 1.55 }}>{stop.detail}</p>
                  {stop.detour && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#6B6358', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>Detour:</span> {stop.detour}
                    </div>
                  )}
                  {stop.warning && (
                    <div style={{ marginTop: 10 }}>
                      <Warning severity={stop.warning.severity} title={stop.warning.text} compact />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          <button
            onClick={onPrev}
            disabled={day <= 1}
            style={{ flex: 1, padding: '13px', border: '1px solid #DDD7CC', borderRadius: 10, background: 'none', fontSize: 14, fontWeight: 600, color: day <= 1 ? '#C0BAB3' : '#3D3830', cursor: day <= 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Day {day - 1}
          </button>
          <button
            onClick={onBack}
            style={{ padding: '13px 20px', border: '1px solid #DDD7CC', borderRadius: 10, background: 'none', fontSize: 14, fontWeight: 600, color: '#6B6358', cursor: 'pointer' }}
          >
            All Days
          </button>
          <button
            onClick={onNext}
            disabled={day >= totalDays}
            style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 10, background: day >= totalDays ? '#EDE8DF' : '#2D5A3D', fontSize: 14, fontWeight: 600, color: day >= totalDays ? '#6B6358' : '#F7F4EF', cursor: day >= totalDays ? 'not-allowed' : 'pointer' }}
          >
            Day {day + 1} →
          </button>
        </div>
      </div>
    </div>
  );
}
