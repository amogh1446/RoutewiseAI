// =============================================================
// RouteWise — Landing Page
// =============================================================

import Nav from '../components/Nav';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=700&fit=crop&auto=format';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="#2D5A3D" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Realistic Routes',
    desc: 'Itineraries built around actual driving times, road quality, and daily limits — not straight-line distances.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#2D5A3D" strokeWidth="1.5" />
        <path d="M10 6V10L13 12" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'India-Focused',
    desc: 'Built for Indian roads — highways, state roads, mountain passes, and everything in between.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="7" width="14" height="9" rx="2" stroke="#2D5A3D" strokeWidth="1.5" />
        <path d="M7 7V5a3 3 0 016 0v2" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Self-Drive Only',
    desc: 'Car and motorcycle trips. No flights, trains, or buses — pure road trip planning.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M10 4v12" stroke="#2D5A3D" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="8" stroke="#2D5A3D" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Smart Planning',
    desc: 'Flags fuel gaps, permit requirements, seasonal restrictions, and long driving days automatically.',
  },
];

const sampleTrips = [
  { from: 'Bengaluru', to: 'Coorg', days: 3, km: '820 km', image: 'https://images.unsplash.com/photo-1598890777032-bde835b9c337?w=400&h=240&fit=crop&auto=format' },
  { from: 'Mumbai', to: 'Goa', days: 4, km: '970 km', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=240&fit=crop&auto=format' },
  { from: 'Delhi', to: 'Leh', days: 8, km: '1,430 km', image: 'https://images.unsplash.com/photo-1626015364112-a8a0b6c77b21?w=400&h=240&fit=crop&auto=format' },
];

export default function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EF' }}>
      <Nav
        onLogoClick={() => {}}
        actions={
          <>
            <a href="#how-it-works" style={{ fontSize: 14, color: '#6B6358', textDecoration: 'none', fontWeight: 500 }}>
              How it works
            </a>
            <button
              onClick={onStart}
              style={{
                background: '#2D5A3D',
                color: '#F7F4EF',
                border: 'none',
                borderRadius: 8,
                padding: '9px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              Plan a Trip
            </button>
          </>
        }
      />

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#EBF4EE',
              border: '1px solid #C8E6D0',
              borderRadius: 100,
              padding: '5px 14px 5px 10px',
              marginBottom: 28,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D5A3D', display: 'block' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2D5A3D', letterSpacing: '0.02em' }}>India road trips, done right</span>
          </div>
          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 56,
              fontWeight: 700,
              color: '#1A1714',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
            }}
          >
            Smart. Realistic.
            <br />
            <em style={{ fontStyle: 'italic', color: '#2D5A3D' }}>India-focused</em>
            <br />
            Trip Planning.
          </h1>
          <p style={{ fontSize: 18, color: '#6B6358', lineHeight: 1.65, margin: '0 0 36px', maxWidth: 440 }}>
            RouteWise plans self-drive road trips across India using real route data, driving feasibility, and
            contextual warnings — so your trip stays exciting, not exhausting.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={onStart}
              style={{
                background: '#2D5A3D',
                color: '#F7F4EF',
                border: 'none',
                borderRadius: 10,
                padding: '14px 32px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#3D7A52')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2D5A3D')}
            >
              Plan My Trip →
            </button>
            <span style={{ fontSize: 13, color: '#6B6358' }}>No sign-up required · Plan your trip in minutes</span>
          </div>
        </div>

        {/* Hero image */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              aspectRatio: '4/3',
              background: '#DDD7CC',
              boxShadow: '0 24px 64px rgba(26,23,20,0.12)',
              position: 'relative',
            }}
          >
            <img src={HERO_IMAGE} alt="Scenic mountain road in India" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,23,20,0.4) 0%, transparent 50%)' }} />
          </div>
          {/* Floating stat card */}
          <div
            style={{
              position: 'absolute',
              bottom: -20,
              left: -24,
              background: '#F7F4EF',
              border: '1px solid #DDD7CC',
              borderRadius: 14,
              padding: '14px 18px',
              boxShadow: '0 8px 32px rgba(26,23,20,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6358', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sample Route</span>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, fontWeight: 600, color: '#1A1714' }}>Delhi → Manali</span>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Stat label="Distance" value="570 km" />
              <Stat label="Days" value="4 days" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" style={{ background: '#EDE8DF', borderTop: '1px solid #DDD7CC', borderBottom: '1px solid #DDD7CC', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 13, fontWeight: 600, color: '#6B6358', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 40, textAlign: 'center' }}>
            Built for the Indian self-driver
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#F7F4EF', border: '1px solid #DDD7CC', borderRadius: 14, padding: '24px 20px' }}>
                <div style={{ width: 40, height: 40, background: '#EBF4EE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1714', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B6358', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample trips */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6B6358', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Popular Routes</p>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 34, fontWeight: 700, color: '#1A1714', margin: 0, letterSpacing: '-0.02em' }}>
              Where will you drive next?
            </h2>
          </div>
          <button
            onClick={onStart}
            style={{ background: 'none', border: '1px solid #DDD7CC', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#3D3830', cursor: 'pointer' }}
          >
            Plan custom trip →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {sampleTrips.map(t => (
            <button
              key={t.from}
              onClick={onStart}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,23,20,0.07)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,23,20,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,23,20,0.07)'; }}
            >
              <div style={{ height: 180, background: '#DDD7CC', overflow: 'hidden', position: 'relative' }}>
                <img src={t.image} alt={`${t.from} to ${t.to}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,23,20,0.5) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                  <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 700, color: '#F7F4EF', letterSpacing: '-0.01em' }}>
                    {t.from} → {t.to}
                  </span>
                </div>
              </div>
              <div style={{ background: '#F7F4EF', padding: '16px 18px', display: 'flex', gap: 16, borderTop: '1px solid #EDE8DF' }}>
                <Stat label="Distance" value={t.km} dark />
                <Stat label="Duration" value={`${t.days} days`} dark />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section style={{ background: '#2D5A3D', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 42, fontWeight: 700, color: '#F7F4EF', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Ready to hit the road?
        </h2>
        <p style={{ fontSize: 17, color: '#C8E6D0', margin: '0 0 32px' }}>
          Plan your next Indian road trip in minutes.
        </p>
        <button
          onClick={onStart}
          style={{ background: '#F7F4EF', color: '#2D5A3D', border: 'none', borderRadius: 10, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}
        >
          Plan My Trip →
        </button>
      </section>
    </div>
  );
}

function Stat({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: dark ? '#6B6358' : 'rgba(247,244,239,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: dark ? '#1A1714' : '#F7F4EF' }}>{value}</div>
    </div>
  );
}
