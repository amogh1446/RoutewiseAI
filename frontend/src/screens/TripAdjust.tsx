import { useState } from 'react';
import Nav from '../components/Nav';
import LocationSearch from '../components/LocationSearch';
import type { FormData } from './PlannerForm';
import type { GeocodeResult } from '../services/api';

const interests = ['Nature', 'Beaches', 'Mountains', 'Temples', 'Forts', 'Wildlife', 'Food', 'Culture', 'Adventure', 'Hidden gems'];

export default function TripAdjust({
  formData,
  onBack,
  onHome,
  onReplan,
}: {
  formData: FormData | null;
  onBack: () => void;
  onHome: () => void;
  onReplan: (updated: FormData) => void;
}) {
  const today = new Date().toISOString().split('T')[0];

  const [days, setDays] = useState(formData?.days ? Number(formData.days) : 5);
  const [vehicle, setVehicle] = useState<'car' | 'motorcycle'>(formData?.vehicle || 'car');
  const [pace, setPace] = useState(formData?.pace || 'balanced');
  const [toll, setToll] = useState(formData?.toll || 'balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(formData?.interests ?? ['Nature', 'Wildlife', 'Food']);
  const [wishlist, setWishlist] = useState<GeocodeResult[]>(formData?.wishlist ?? []);
  const [startDate, setStartDate] = useState(formData?.startDate || today);

  const toggleInterest = (i: string) => {
    setSelectedInterests(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  };

  const handleReplan = () => {
    const updated: FormData = {
      ...(formData ?? { start: null, destination: null, tripType: '', group: '', budget: '' }),
      days: String(days),
      vehicle,
      pace,
      toll,
      interests: selectedInterests,
      wishlist,
      startDate,
    };
    onReplan(updated);
  };

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
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 32, fontWeight: 700, color: '#1A1714', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Adjust Your Trip
          </h1>
          <p style={{ fontSize: 15, color: '#6B6358', margin: 0 }}>
            Modify any parameters and replan — we'll rebuild the itinerary.
          </p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #DDD7CC', borderRadius: 16, overflow: 'hidden' }}>
          {/* Travel Dates */}
          <AdjustSection label="Travel Dates">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6358', marginBottom: 6 }}>Start date</label>
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={e => { if (e.target.value >= today) setStartDate(e.target.value); }}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #DDD7CC', borderRadius: 9, fontSize: 14, color: '#1A1714', background: '#F7F4EF', fontFamily: 'Outfit, system-ui, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6358', marginBottom: 6 }}>Number of days</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => setDays(d => Math.max(1, d - 1))}
                    style={{ width: 36, height: 36, border: '1.5px solid #DDD7CC', borderRadius: 8, background: '#F7F4EF', fontSize: 18, cursor: 'pointer', color: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    −
                  </button>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: '#1A1714', minWidth: 24, textAlign: 'center' }}>{days}</span>
                  <button
                    onClick={() => setDays(d => Math.min(30, d + 1))}
                    style={{ width: 36, height: 36, border: '1.5px solid #DDD7CC', borderRadius: 8, background: '#F7F4EF', fontSize: 18, cursor: 'pointer', color: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: 13, color: '#6B6358' }}>days</span>
                </div>
              </div>
            </div>
          </AdjustSection>

          {/* Vehicle */}
          <AdjustSection label="Vehicle">
            <div style={{ display: 'flex', gap: 12 }}>
              {(['car', 'motorcycle'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVehicle(v)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    border: `1.5px solid ${vehicle === v ? '#2D5A3D' : '#DDD7CC'}`,
                    borderRadius: 10,
                    background: vehicle === v ? '#EBF4EE' : '#F7F4EF',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{v === 'car' ? '🚗' : '🏍️'}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: vehicle === v ? '#2D5A3D' : '#1A1714' }}>
                    {v === 'car' ? 'Car' : 'Motorcycle'}
                  </span>
                </button>
              ))}
            </div>
          </AdjustSection>

          {/* Pace */}
          <AdjustSection label="Travel Pace">
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: 'relaxed', label: 'Relaxed', sub: 'Typically 3–4 hrs driving/day', icon: '☕' },
                { val: 'balanced', label: 'Balanced', sub: 'Typically 5–6 hrs driving/day', icon: '⚖' },
                { val: 'fast', label: 'Fast-paced', sub: 'Typically 7–8 hrs driving/day', icon: '⚡' },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setPace(p.val)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    border: `1.5px solid ${pace === p.val ? '#2D5A3D' : '#DDD7CC'}`,
                    borderRadius: 10,
                    background: pace === p.val ? '#EBF4EE' : '#F7F4EF',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: pace === p.val ? '#2D5A3D' : '#3D3830',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{p.icon}</div>
                  <div>{p.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, color: pace === p.val ? '#3D7A52' : '#6B6358', marginTop: 2 }}>{p.sub}</div>
                </button>
              ))}
            </div>
          </AdjustSection>

          {/* Toll */}
          <AdjustSection label="Toll Preference">
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: 'prefer', label: 'Prefer tolls' },
                { val: 'balanced', label: 'Balanced' },
                { val: 'avoid', label: 'Avoid tolls' },
              ].map(t => (
                <button
                  key={t.val}
                  onClick={() => setToll(t.val)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    border: `1.5px solid ${toll === t.val ? '#2D5A3D' : '#DDD7CC'}`,
                    borderRadius: 10,
                    background: toll === t.val ? '#EBF4EE' : '#F7F4EF',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: toll === t.val ? '#2D5A3D' : '#3D3830',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </AdjustSection>

          {/* Interests */}
          <AdjustSection label="Interests">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {interests.map(i => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  style={{
                    padding: '6px 13px',
                    border: `1.5px solid ${selectedInterests.includes(i) ? '#2D5A3D' : '#DDD7CC'}`,
                    borderRadius: 100,
                    background: selectedInterests.includes(i) ? '#EBF4EE' : '#F7F4EF',
                    color: selectedInterests.includes(i) ? '#2D5A3D' : '#3D3830',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </AdjustSection>

          {/* Must-visit */}
          <AdjustSection label="Must-visit / Wishlist" last>
            <p style={{ fontSize: 13, color: '#6B6358', margin: '0 0 12px' }}>Search and select verified places. Must-visit places are preferences — feasibility takes priority.</p>
            {wishlist.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {wishlist.map(p => (
                  <div key={p.place_id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF4EE', border: '1px solid #C8E6D0', borderRadius: 100, padding: '5px 12px' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2D5A3D' }}>{p.name}</span>
                    <button onClick={() => setWishlist(w => w.filter(x => x.place_id !== p.place_id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3D7A52', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <WishlistAddRow existing={wishlist} onAdd={v => setWishlist(w => [...w, v])} />
          </AdjustSection>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            onClick={onBack}
            style={{ flex: 1, padding: '13px', border: '1px solid #DDD7CC', borderRadius: 10, background: 'none', fontSize: 14, fontWeight: 600, color: '#3D3830', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleReplan}
            style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 10, background: '#2D5A3D', fontSize: 15, fontWeight: 700, color: '#F7F4EF', cursor: 'pointer' }}
          >
            Replan Trip →
          </button>
        </div>
      </div>
    </div>
  );
}

function AdjustSection({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: '22px 24px', borderBottom: last ? 'none' : '1px solid #EDE8DF' }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#6B6358', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>{label}</h3>
      {children}
    </div>
  );
}

function WishlistAddRow({ existing, onAdd }: { existing: GeocodeResult[]; onAdd: (v: GeocodeResult) => void }) {
  const [adding, setAdding] = useState(false);
  if (adding) {
    return (
      <LocationSearch
        label=""
        placeholder="Search a place to add…"
        value={null}
        onSelect={v => { if (v && !existing.find(x => x.place_id === v.place_id)) { onAdd(v); setAdding(false); } }}
      />
    );
  }
  return (
    <button
      onClick={() => setAdding(true)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: '1.5px dashed #DDD7CC', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#6B6358' }}
    >
      <span style={{ fontSize: 16 }}>+</span> Add a place
    </button>
  );
}
