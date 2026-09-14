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

type Stop = {
  type: StopType;
  time: string;
  name: string;
  detail: string;
  duration?: string;
  detour?: string;
  warning?: { severity: 'info' | 'advisory' | 'important'; text: string };
};

const dayData: Record<
  number,
  {
    from: string;
    to: string;
    km: number;
    driveTime: string;
    stops: Stop[];
    warnings: { severity: 'info' | 'advisory' | 'important'; title: string; description: string }[];
  }
> = {
  1: {
    from: 'Bengaluru',
    to: 'Mysuru',
    km: 145,
    driveTime: '3h 20m',
    stops: [
      { type: 'departure', time: '7:00 AM', name: 'Depart Bengaluru', detail: 'Start early to beat city traffic. Take Mysore Road / NH 275.' },
      { type: 'drive', time: '7:00 – 10:20 AM', name: 'Drive: Bengaluru → Mysuru', detail: '145 km via NH 275. Mostly 4-lane highway. Toll at Nidaghatta.' },
      { type: 'attraction', time: '10:30 AM', name: 'Brindavan Gardens', detail: 'Terraced garden at the KRS Dam backwaters. Best visited in the morning. Musical fountain in evenings. Visit duration may vary.', duration: '~1h', detour: '1.2 km from highway' },
      { type: 'food', time: '12:00 PM', name: 'Lunch in Mysuru', detail: 'Numerous options near Devaraja Market and KR Circle.', duration: '~45m' },
      { type: 'attraction', time: '1:00 PM', name: 'Mysore Palace', detail: "One of India's most visited palaces. Audio guide available. Busy on weekends. Allow 1.5–2 hrs.", duration: '~2h' },
      { type: 'break', time: '3:15 PM', name: 'Devaraja Market', detail: 'Walk through the covered market — spices, flowers, incense.', duration: '30m' },
      { type: 'arrival', time: '4:00 PM', name: 'Check in, Mysuru', detail: 'Rest of the day in Mysuru. The city is very walkable in the evening.' },
    ],
    warnings: [],
  },
  2: {
    from: 'Mysuru',
    to: 'Coorg (Madikeri)',
    km: 118,
    driveTime: '3h 05m',
    stops: [
      { type: 'departure', time: '8:00 AM', name: 'Depart Mysuru', detail: 'Take the Hunsur – Madikeri route via SH 33. Well-maintained with beautiful ghats from Kushalnagar.' },
      { type: 'attraction', time: '9:30 AM', name: 'Dubare Elephant Camp', detail: 'Elephant bathing and interaction experience on the banks of the Kaveri. Book in advance.', duration: '1h 30m' },
      { type: 'food', time: '11:30 AM', name: 'Breakfast / Brunch — Kushalnagar', detail: 'Stop at one of the Tibetan-influenced cafes in Kushalnagar. Unique food culture.', duration: '40m' },
      { type: 'drive', time: '12:10 PM', name: 'Drive: Kushalnagar → Madikeri', detail: '30 km of winding ghat road through coffee estates. Scenic but take it slow.' },
      { type: 'attraction', time: '1:15 PM', name: "Raja's Seat", detail: 'Sunset viewpoint with gardens in the heart of Madikeri. Misty views on clear days.', duration: '30m' },
      { type: 'food', time: '2:00 PM', name: 'Lunch — Madikeri', detail: 'Hotel East End and Coorg Cuisine are reliable options for pork curry and local rice plates.', duration: '1h' },
      { type: 'attraction', time: '3:30 PM', name: 'Abbey Falls', detail: '70-ft waterfall surrounded by coffee and spice estates. 1 km walk from parking.', duration: '1h 15m', warning: { severity: 'info', text: '~5 km detour from central Madikeri' } },
      { type: 'arrival', time: '5:00 PM', name: 'Check in, Madikeri', detail: 'Numerous homestays in and around Madikeri.' },
    ],
    warnings: [
      { severity: 'advisory', title: 'Talacauvery access varies by season', description: 'If you plan to include Talacauvery, check restrictions before visiting. The road adds ~65 km round trip from Madikeri.' },
    ],
  },
  3: {
    from: 'Coorg',
    to: 'Nagarhole',
    km: 80,
    driveTime: '2h 00m',
    stops: [
      { type: 'departure', time: '7:30 AM', name: 'Depart Madikeri', detail: 'Short driving day — use the early morning for a stroll through coffee estates.' },
      { type: 'attraction', time: '9:00 AM', name: 'Iruppu Falls', detail: 'Waterfall on the Lakshmana Tirtha river. Modest but serene. 2.5 km from Nagarhole boundary.', duration: '45m' },
      { type: 'drive', time: '9:45 AM', name: 'Drive to Kabini / Nagarhole', detail: 'Enter Nagarhole region via Kutta. Speed limits enforced. Watch for wildlife on the road.' },
      { type: 'food', time: '11:00 AM', name: 'Lunch at Kabini', detail: 'Jungle lodges and resorts serve day visitors. Jungle Lodges has a buffet option.', duration: '1h' },
      { type: 'attraction', time: '12:30 PM', name: 'Kabini Backwaters', detail: 'Walk or drive to the backwater bank. High chances of elephant sightings near the water in the afternoon.', duration: '1h 30m' },
      { type: 'break', time: '3:00 PM', name: 'Nagarhole Safari', detail: 'Evening safari slot. Booking requirements may apply — verify in advance. Self-drive not permitted inside the park.', duration: '~2–3h', warning: { severity: 'info', text: 'Booking requirement may apply. Verify current slot availability before your trip.' } },
      { type: 'arrival', time: '6:30 PM', name: 'Night stay, Kabini', detail: 'Kabini is a well-suited base for this area. Multiple accommodation options available.' },
    ],
    warnings: [
      { severity: 'info', title: 'Safari zone: booking requirement may apply', description: 'Verify current booking requirements and slot availability with the relevant forest authority before your trip. Self-drive is not permitted inside the park.' },
    ],
  },
  4: {
    from: 'Nagarhole',
    to: 'Ooty',
    km: 180,
    driveTime: '5h 10m',
    stops: [
      { type: 'departure', time: '7:00 AM', name: 'Depart Nagarhole — early start', detail: 'Long drive with ghat sections. An early start avoids peak afternoon traffic on the Ooty approach.' },
      { type: 'drive', time: '7:00 – 9:00 AM', name: 'Drive: Nagarhole → Gudalur', detail: '90 km via Kutta. Mostly flat, passes through mixed forests. Fuel up before leaving — limited options ahead.' },
      { type: 'break', time: '9:15 AM', name: 'Fuel + breakfast stop — Gudalur', detail: 'Last reliable fuel station and food options before the ghat climb to Ooty.', duration: '30m' },
      { type: 'drive', time: '9:45 AM', name: 'Ghat drive: Gudalur → Ooty', detail: '36 km of narrow, winding ghat road. 36 hairpin bends. Average speed: ~25–30 km/h.' },
      { type: 'food', time: '12:00 PM', name: 'Lunch — Ooty town', detail: "Willy's Coffee Pub and Shinkows are good options. Avoid peak lunch hour (1–2 PM).", duration: '1h' },
      { type: 'attraction', time: '1:30 PM', name: 'Botanical Garden', detail: 'Government Botanical Garden — 22 hectares. Good for a 1.5-hr walk. Annual flower show in May.', duration: '1h 30m' },
      { type: 'attraction', time: '3:30 PM', name: 'Emerald Lake', detail: '16 km from Ooty. Quiet, less touristy lake in the Nilgiri hills. Worth the short detour.', duration: '1h', detour: '16 km from central Ooty' },
      { type: 'arrival', time: '5:30 PM', name: 'Check in, Ooty', detail: 'Large selection of properties from budget hotels to hill bungalows.' },
    ],
    warnings: [
      { severity: 'important', title: 'Longest driving day: 5h 10m expected', description: 'This is the most demanding driving day. The Gudalur–Ooty ghat section takes 1.5–2 hours for 36 km. Do not rush this stretch.' },
    ],
  },
  5: {
    from: 'Ooty',
    to: 'Bengaluru',
    km: 295,
    driveTime: '6h 30m',
    stops: [
      { type: 'departure', time: '6:30 AM', name: 'Depart Ooty — very early start', detail: 'Return journey is 295 km. An early start avoids the afternoon Bandipur closure window.' },
      { type: 'drive', time: '6:30 – 9:30 AM', name: 'Drive: Ooty → Mysuru via Gudalur', detail: 'Descend via the same ghat road. Cooler and less crowded in early morning.' },
      { type: 'break', time: '9:30 AM', name: 'Breakfast stop — Gundlupet', detail: 'Last town before Bandipur. Good dhabas and filter coffee.', duration: '30m' },
      { type: 'drive', time: '10:00 AM', name: 'Drive through Bandipur National Park', detail: '18 km through the core zone. Speed limit: 40 km/h. No stopping. Park closes for vehicles from 9 PM – 6 AM.' },
      { type: 'attraction', time: '10:45 AM', name: 'Bandipur Forest Edge', detail: 'Pull over at designated viewpoints outside the core zone. Good elephant sightings on the NH 766 fringes.', duration: '20m' },
      { type: 'food', time: '1:00 PM', name: 'Lunch — Mysuru', detail: 'Stop for a proper lunch in Mysuru before the final highway stretch.', duration: '1h' },
      { type: 'drive', time: '2:00 – 5:30 PM', name: 'Drive: Mysuru → Bengaluru', detail: '145 km via NH 275. Keep stops minimal — this stretch can get congested after 5 PM on weekdays.' },
      { type: 'arrival', time: '5:30 PM', name: 'Arrive Bengaluru', detail: 'Trip complete. Estimated arrival varies depending on Bengaluru entry traffic.' },
    ],
    warnings: [
      { severity: 'advisory', title: 'Bandipur: strict speed limits and timing rules', description: 'Speed limits through the core zone are 40 km/h and enforced. The park is closed to vehicles between 9 PM and 6 AM — plan around this window on return.' },
    ],
  },
};

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
  onBack,
  onHome,
  onPlanNew,
  onNext,
  onPrev,
}: {
  day: number;
  totalDays: number;
  formData: FormData | null;
  onBack: () => void;
  onHome: () => void;
  onPlanNew: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const data = dayData[day] ?? dayData[1];

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
