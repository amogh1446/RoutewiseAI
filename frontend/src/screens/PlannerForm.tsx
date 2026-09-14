// =============================================================
// RouteWise — Planner Form Screen
// =============================================================
// 6-section trip planning form.
// Location fields only accept verified place selections.
// Past dates are disabled.
// =============================================================

import { useState } from 'react';
import Nav from '../components/Nav';
import LocationSearch from '../components/LocationSearch';
import type { GeocodeResult } from '../services/api';

const interests = ['Nature', 'Beaches', 'Mountains', 'Temples', 'Forts', 'Wildlife', 'Food', 'Culture', 'Adventure', 'Hidden gems'];

function WishlistSearch({ wishlist, onAdd, onRemove }: { wishlist: GeocodeResult[]; onAdd: (v: GeocodeResult) => void; onRemove: (v: GeocodeResult) => void }) {
  const [adding, setAdding] = useState(false);
  return (
    <div>
      {wishlist.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {wishlist.map(p => (
            <div key={p.place_id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF4EE', border: '1px solid #C8E6D0', borderRadius: 100, padding: '5px 12px' }}>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 1C3.79 1 2 2.79 2 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4z" stroke="#2D5A3D" strokeWidth="1.2" fill="none" />
                <circle cx="6" cy="5" r="1.5" fill="#2D5A3D" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#2D5A3D' }}>{p.name}</span>
              <button onClick={() => onRemove(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3D7A52', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      {adding ? (
        <LocationSearch
          label=""
          placeholder="Search a place to add…"
          value={null}
          onSelect={v => { if (v && !wishlist.find(x => x.place_id === v.place_id)) { onAdd(v); setAdding(false); } }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1.5px dashed #DDD7CC', borderRadius: 10, background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#6B6358' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add a place
        </button>
      )}
    </div>
  );
}

export type FormData = {
  start: GeocodeResult | null;
  destination: GeocodeResult | null;
  startDate: string;
  days: string;
  vehicle: 'car' | 'motorcycle' | '';
  tripType: 'one-way' | 'round-trip' | 'base' | '';
  group: string;
  pace: string;
  interests: string[];
  budget: string;
  toll: string;
  wishlist: GeocodeResult[];
};

export default function PlannerForm({
  onBack,
  onSubmit,
  onHome,
}: {
  onBack: () => void;
  onSubmit: (data: FormData) => void;
  onHome: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<FormData>({
    start: null,
    destination: null,
    startDate: '',
    days: '',
    vehicle: '',
    tripType: '',
    group: '',
    pace: '',
    interests: [],
    budget: '',
    toll: '',
    wishlist: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleInterest = (i: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter(x => x !== i) : [...f.interests, i],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.start) e.start = 'Select a start location from the dropdown';
    if (!form.destination) e.destination = 'Select a destination from the dropdown';
    if (!form.vehicle) e.vehicle = 'Select a vehicle type';
    if (!form.days || Number(form.days) < 1) e.days = 'Enter number of days (minimum 1)';
    if (form.startDate && form.startDate < today) e.startDate = 'Start date cannot be in the past';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (validate()) onSubmit(form);
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    border: `1.5px solid ${hasError ? '#C44B3A' : '#DDD7CC'}`,
    borderRadius: 10,
    fontSize: 15,
    color: '#1A1714',
    background: '#FFFFFF',
    outline: 'none',
    fontFamily: 'Outfit, system-ui, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  });

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
            ← Back
          </button>
        }
      />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 700, color: '#1A1714', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Plan Your Trip
          </h1>
          <p style={{ fontSize: 15, color: '#6B6358', margin: 0 }}>
            Tell us about your trip and we'll build a realistic, day-by-day itinerary.
          </p>
        </div>

        {/* Section 1 — Route */}
        <Section label="01" title="Route & Dates">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <LocationSearch
              label="Start location"
              placeholder="Search city, town, or place…"
              value={form.start}
              onSelect={v => setForm(f => ({ ...f, start: v }))}
              error={errors.start}
              required
            />
            <LocationSearch
              label="Destination / Base"
              placeholder="Search city, town, or place…"
              value={form.destination}
              onSelect={v => setForm(f => ({ ...f, destination: v }))}
              error={errors.destination}
              required
            />
            <Field label="Travel start date" error={errors.startDate}>
              <input
                type="date"
                min={today}
                style={inputStyle(!!errors.startDate)}
                value={form.startDate}
                onChange={e => {
                  const chosen = e.target.value;
                  if (chosen >= today) setForm(f => ({ ...f, startDate: chosen }));
                }}
                onFocus={el => (el.target.style.borderColor = '#2D5A3D')}
                onBlur={el => (el.target.style.borderColor = errors.startDate ? '#C44B3A' : '#DDD7CC')}
              />
            </Field>
            <Field label="Number of days" error={errors.days} required>
              <input
                type="number"
                min={1}
                max={30}
                style={inputStyle(!!errors.days)}
                placeholder="e.g. 3"
                value={form.days}
                onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
                onFocus={el => (el.target.style.borderColor = '#2D5A3D')}
                onBlur={el => (el.target.style.borderColor = errors.days ? '#C44B3A' : '#DDD7CC')}
              />
            </Field>
          </div>
        </Section>

        {/* Section 2 — Vehicle & Trip type */}
        <Section label="02" title="Vehicle & Trip Type">
          <Field label="Vehicle" error={errors.vehicle} required>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['car', 'motorcycle'] as const).map(v => (
                <ToggleCard
                  key={v}
                  selected={form.vehicle === v}
                  onClick={() => setForm(f => ({ ...f, vehicle: v }))}
                  icon={v === 'car' ? '🚗' : '🏍️'}
                  label={v === 'car' ? 'Car' : 'Motorcycle'}
                />
              ))}
            </div>
            {errors.vehicle && <span style={{ fontSize: 12, color: '#C44B3A', marginTop: 6, display: 'block' }}>{errors.vehicle}</span>}
          </Field>
          <Field label="Trip type" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { val: 'one-way', label: 'One-way', icon: '→' },
                { val: 'round-trip', label: 'Round trip', icon: '↺' },
                { val: 'base', label: 'Explore from base', icon: '◎' },
              ].map(t => (
                <ToggleCard
                  key={t.val}
                  selected={form.tripType === t.val}
                  onClick={() => setForm(f => ({ ...f, tripType: t.val as FormData['tripType'] }))}
                  icon={t.icon}
                  label={t.label}
                />
              ))}
            </div>
          </Field>
        </Section>

        {/* Section 3 — Group & Pace */}
        <Section label="03" title="Travel Group & Pace">
          <Field label="Travelling as">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Solo', 'Couple', 'Family', 'Friends', 'Cousins'].map(g => (
                <Chip key={g} selected={form.group === g} onClick={() => setForm(f => ({ ...f, group: g }))}>
                  {g}
                </Chip>
              ))}
            </div>
          </Field>
          <Field label="Travel pace" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { val: 'relaxed', label: 'Relaxed', desc: 'Typically 3–4 hrs driving/day', icon: '☕' },
                { val: 'balanced', label: 'Balanced', desc: 'Typically 5–6 hrs driving/day', icon: '⚖' },
                { val: 'fast', label: 'Fast-paced', desc: 'Typically 7–8 hrs driving/day', icon: '⚡' },
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setForm(f => ({ ...f, pace: p.val }))}
                  style={{
                    flex: 1,
                    padding: '14px 12px',
                    border: `1.5px solid ${form.pace === p.val ? '#2D5A3D' : '#DDD7CC'}`,
                    borderRadius: 10,
                    background: form.pace === p.val ? '#EBF4EE' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1714', marginBottom: 2 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#6B6358' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* Section 4 — Interests */}
        <Section label="04" title="Interests">
          <p style={{ fontSize: 13, color: '#6B6358', margin: '0 0 14px' }}>Select all that apply — we'll use these to find relevant stops.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {interests.map(i => (
              <Chip key={i} selected={form.interests.includes(i)} onClick={() => toggleInterest(i)}>
                {i}
              </Chip>
            ))}
          </div>
        </Section>

        {/* Section 5 — Preferences */}
        <Section label="05" title="Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Field label="Budget preference">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { val: 'budget', label: 'Budget', desc: 'Dhabas, budget stays' },
                  { val: 'moderate', label: 'Moderate', desc: 'Mid-range options' },
                  { val: 'premium', label: 'Premium', desc: 'Comfort-focused' },
                ].map(b => (
                  <RadioRow
                    key={b.val}
                    selected={form.budget === b.val}
                    onClick={() => setForm(f => ({ ...f, budget: b.val }))}
                    label={b.label}
                    desc={b.desc}
                  />
                ))}
              </div>
            </Field>
            <Field label="Toll preference">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { val: 'prefer', label: 'Prefer toll roads', desc: 'Faster, better roads' },
                  { val: 'avoid', label: 'Avoid toll roads', desc: 'Scenic, local routes' },
                  { val: 'balanced', label: 'Balanced', desc: 'Best of both' },
                ].map(t => (
                  <RadioRow
                    key={t.val}
                    selected={form.toll === t.val}
                    onClick={() => setForm(f => ({ ...f, toll: t.val }))}
                    label={t.label}
                    desc={t.desc}
                  />
                ))}
              </div>
            </Field>
          </div>
        </Section>

        {/* Section 6 — Wishlist */}
        <Section label="06" title="Must-visit / Wishlist">
          <p style={{ fontSize: 13, color: '#6B6358', margin: '0 0 16px' }}>
            Search and select specific places you'd like to visit. We'll try to include them where feasible.
          </p>
          <WishlistSearch
            wishlist={form.wishlist}
            onAdd={v => setForm(f => ({ ...f, wishlist: [...f.wishlist, v] }))}
            onRemove={place => setForm(f => ({ ...f, wishlist: f.wishlist.filter(p => p !== place) }))}
          />
          <p style={{ fontSize: 12, color: '#6B6358', margin: '12px 0 0' }}>
            ✦ Must-visit places are preferences. If a stop makes the trip infeasible, we'll let you know and suggest alternatives.
          </p>
        </Section>

        {/* Submit */}
        <div style={{ marginTop: 8, display: 'flex', gap: 14, alignItems: 'center' }}>
          <button
            onClick={submit}
            style={{
              background: '#2D5A3D',
              color: '#F7F4EF',
              border: 'none',
              borderRadius: 10,
              padding: '15px 36px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#3D7A52')}
            onMouseLeave={e => (e.currentTarget.style.background = '#2D5A3D')}
          >
            Plan My Route →
          </button>
          <p style={{ fontSize: 13, color: '#6B6358', margin: 0 }}>We'll check feasibility and build your itinerary.</p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid #EDE8DF' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500, color: '#6B6358', background: '#EDE8DF', borderRadius: 6, padding: '3px 8px' }}>
          {label}
        </span>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, color: '#1A1714', margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, error, required, style }: { label: string; children: React.ReactNode; error?: string; required?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D3830', marginBottom: 8 }}>
        {label}
        {required && <span style={{ color: '#C44B3A', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#C44B3A', marginTop: 5, display: 'block' }}>{error}</span>}
    </div>
  );
}

function ToggleCard({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '16px 12px',
        border: `1.5px solid ${selected ? '#2D5A3D' : '#DDD7CC'}`,
        borderRadius: 10,
        background: selected ? '#EBF4EE' : '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: selected ? '#2D5A3D' : '#1A1714' }}>{label}</span>
    </button>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px',
        border: `1.5px solid ${selected ? '#2D5A3D' : '#DDD7CC'}`,
        borderRadius: 100,
        background: selected ? '#EBF4EE' : '#FFFFFF',
        color: selected ? '#2D5A3D' : '#3D3830',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function RadioRow({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        border: `1.5px solid ${selected ? '#2D5A3D' : '#DDD7CC'}`,
        borderRadius: 10,
        background: selected ? '#EBF4EE' : '#FFFFFF',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${selected ? '#2D5A3D' : '#DDD7CC'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2D5A3D' }} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1714' }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6B6358' }}>{desc}</div>
      </div>
    </button>
  );
}
