// =============================================================
// RouteWise — LocationSearch Component
// =============================================================
// Provides a searchable location input with dropdown suggestions.
// Uses a built-in fallback mock for MVP; will connect to the
// backend geocoding endpoint once it is implemented.
// Geographic values are only committed when a suggestion is
// explicitly selected — free-form text is never accepted.
// =============================================================

import { useState, useRef, useEffect } from 'react';

// Curated list of real Indian places used as the MVP fallback
// while the backend geocoding endpoint is being implemented.
// These are real places — no coordinates or distances are invented here.
const SUGGESTIONS: Record<string, string[]> = {
  b: ['Bengaluru, Karnataka', 'Belgaum (Belagavi), Karnataka', 'Bidar, Karnataka', 'Bhopal, Madhya Pradesh'],
  be: ['Bengaluru, Karnataka', 'Belgaum (Belagavi), Karnataka'],
  ben: ['Bengaluru, Karnataka'],
  m: ['Mumbai, Maharashtra', 'Mysuru, Karnataka', 'Madurai, Tamil Nadu', 'Manali, Himachal Pradesh', 'Mangaluru, Karnataka'],
  my: ['Mysuru, Karnataka', 'Mysore Rural, Karnataka'],
  mu: ['Mumbai, Maharashtra', 'Munnar, Kerala'],
  c: ['Coorg (Kodagu), Karnataka', 'Chennai, Tamil Nadu', 'Chandigarh', 'Coimbatore, Tamil Nadu'],
  co: ['Coorg (Kodagu), Karnataka', 'Coimbatore, Tamil Nadu'],
  d: ['Delhi', 'Dehradun, Uttarakhand', 'Dharamshala, Himachal Pradesh', 'Dudhsagar Falls, Goa'],
  de: ['Delhi', 'Dehradun, Uttarakhand'],
  g: ['Goa', 'Guwahati, Assam', 'Gangtok, Sikkim', 'Gokarna, Karnataka'],
  go: ['Goa', 'Gokarna, Karnataka'],
  l: ['Leh, Ladakh', 'Lonavala, Maharashtra', 'Lakshadweep'],
  le: ['Leh, Ladakh'],
  o: ['Ooty (Udhagamandalam), Tamil Nadu', 'Orchha, Madhya Pradesh'],
  oo: ['Ooty (Udhagamandalam), Tamil Nadu'],
  p: ['Pune, Maharashtra', 'Pondicherry', 'Puri, Odisha', 'Pelling, Sikkim'],
  pu: ['Pune, Maharashtra', 'Puri, Odisha'],
  r: ['Rishikesh, Uttarakhand', 'Rajkot, Gujarat', 'Rann of Kutch, Gujarat'],
  ri: ['Rishikesh, Uttarakhand'],
  s: ['Shimla, Himachal Pradesh', 'Srinagar, Jammu & Kashmir', 'Spiti Valley, Himachal Pradesh'],
  sh: ['Shimla, Himachal Pradesh'],
  u: ['Udaipur, Rajasthan', 'Udupi, Karnataka'],
  ud: ['Udaipur, Rajasthan', 'Udupi, Karnataka'],
  v: ['Varanasi, Uttar Pradesh', 'Varkala, Kerala'],
  k: ['Kabini, Karnataka', 'Kochi, Kerala', 'Kodaikanal, Tamil Nadu', 'Kaziranga, Assam'],
  n: ['Nagarhole, Karnataka', 'Nainital, Uttarakhand', 'Nagpur, Maharashtra'],
  na: ['Nagarhole, Karnataka', 'Nainital, Uttarakhand'],
  t: ['Thekkady, Kerala', 'Tirupati, Andhra Pradesh', 'Thane, Maharashtra'],
  a: ['Agra, Uttar Pradesh', 'Ahmedabad, Gujarat', 'Alleppey (Alappuzha), Kerala', 'Auli, Uttarakhand'],
  j: ['Jaipur, Rajasthan', 'Jaisalmer, Rajasthan', 'Jodhpur, Rajasthan'],
  ja: ['Jaipur, Rajasthan', 'Jaisalmer, Rajasthan'],
  h: ['Hampi, Karnataka', 'Hyderabad, Telangana', 'Haridwar, Uttarakhand'],
  ha: ['Hampi, Karnataka', 'Haridwar, Uttarakhand'],
  du: ['Dudhsagar Falls, Goa', 'Dungarpur, Rajasthan'],
  ab: ['Abbey Falls, Coorg'],
  ka: ['Kabini, Karnataka', 'Kanyakumari, Tamil Nadu', 'Kasol, Himachal Pradesh'],
  ta: ['Talacauvery, Karnataka', 'Tarkarli, Maharashtra'],
};

function getSuggestions(query: string): string[] {
  if (!query || query.length < 2) return [];
  const key = query.toLowerCase().slice(0, 3);
  for (let len = Math.min(key.length, 3); len >= 2; len--) {
    const k = key.slice(0, len);
    if (SUGGESTIONS[k]) {
      return SUGGESTIONS[k].filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    }
  }
  return [];
}

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
};

export default function LocationSearch({ label, placeholder, value, onSelect, error, required }: Props) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(!!value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value !== query) {
      setQuery(value);
      setConfirmed(true);
    }
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setConfirmed(false);
    onSelect('');
    const s = getSuggestions(q);
    setSuggestions(s);
    setOpen(q.length >= 2);
  };

  const handleSelect = (s: string) => {
    setQuery(s);
    setConfirmed(true);
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setConfirmed(false);
    onSelect('');
    setSuggestions([]);
  };

  const showNoMatch = open && query.length >= 2 && suggestions.length === 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D3830', marginBottom: 8 }}>
        {label}
        {required && <span style={{ color: '#C44B3A', marginLeft: 3 }}>*</span>}
      </label>

      {confirmed && value ? (
        // Confirmed selection chip
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            border: '1.5px solid #2D5A3D',
            borderRadius: 10,
            background: '#EBF4EE',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="6" fill="#2D5A3D" />
            <path d="M4 7l2 2 4-4" stroke="#F7F4EF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#2D5A3D' }}>{value}</span>
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3D7A52', fontSize: 16, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
            aria-label="Clear location"
          >
            ×
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="5.5" cy="5.5" r="4.5" stroke="#6B6358" strokeWidth="1.3" />
            <path d="M9.5 9.5L13 13" stroke="#6B6358" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={handleChange}
            onFocus={() => { if (query.length >= 2) setOpen(true); }}
            placeholder={placeholder ?? 'Search city, town, or place…'}
            style={{
              width: '100%',
              padding: '12px 14px 12px 34px',
              border: `1.5px solid ${error ? '#C44B3A' : open ? '#2D5A3D' : '#DDD7CC'}`,
              borderRadius: 10,
              fontSize: 15,
              color: '#1A1714',
              background: '#FFFFFF',
              outline: 'none',
              fontFamily: 'Outfit, system-ui, sans-serif',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
        </div>
      )}

      {/* Dropdown */}
      {open && (suggestions.length > 0 || showNoMatch) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1.5px solid #DDD7CC',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(26,23,20,0.12)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {showNoMatch ? (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#6B6358' }}>
              No matching places found. Try another search.
            </div>
          ) : (
            suggestions.map((s, i) => (
              <button
                key={s}
                onMouseDown={() => handleSelect(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '11px 16px',
                  border: 'none',
                  borderBottom: i < suggestions.length - 1 ? '1px solid #EDE8DF' : 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  color: '#1A1714',
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F4EF')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M6 1C3.79 1 2 2.79 2 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4z" stroke="#6B6358" strokeWidth="1.2" fill="none" />
                  <circle cx="6" cy="5" r="1.5" fill="#6B6358" />
                </svg>
                {s}
              </button>
            ))
          )}
        </div>
      )}

      {error && <span style={{ fontSize: 12, color: '#C44B3A', marginTop: 5, display: 'block' }}>{error}</span>}
    </div>
  );
}
