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
import { geocodeQuery, type GeocodeResult } from '../services/api';

type Props = {
  label: string;
  placeholder?: string;
  value: GeocodeResult | null;
  onSelect: (value: GeocodeResult | null) => void;
  error?: string;
  required?: boolean;
};

export default function LocationSearch({ label, placeholder, value, onSelect, error, required }: Props) {
  const [query, setQuery] = useState(value?.name || '');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(!!value);
  const ref = useRef<HTMLDivElement>(null);

  // Sync prop value
  useEffect(() => {
    if (value && value.name !== query) {
      setQuery(value.name);
      setConfirmed(true);
    } else if (!value) {
      setQuery('');
      setConfirmed(false);
    }
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced API call
  useEffect(() => {
    if (confirmed || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setApiError(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setApiError(null);
      geocodeQuery(query)
        .then(res => {
          setSuggestions(res);
          setLoading(false);
        })
        .catch(err => {
          setApiError(err.message || 'Failed to fetch suggestions');
          setLoading(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [query, confirmed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setConfirmed(false);
    onSelect(null);
    setOpen(q.length >= 2);
  };

  const handleSelect = (s: GeocodeResult) => {
    setQuery(s.name);
    setConfirmed(true);
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setConfirmed(false);
    onSelect(null);
    setSuggestions([]);
  };

  const showNoMatch = open && query.length >= 2 && !loading && !apiError && suggestions.length === 0;

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
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2D5A3D' }}>{value.name}</span>
          </div>
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
      {open && query.length >= 2 && !confirmed && (
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
          {loading && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#6B6358', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, border: '2px solid #DDD7CC', borderTopColor: '#2D5A3D', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Searching...
            </div>
          )}
          {apiError && !loading && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#C44B3A' }}>
              {apiError}
            </div>
          )}
          {showNoMatch && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: '#6B6358' }}>
              No matching places found. Try another search.
            </div>
          )}
          {!loading && !apiError && suggestions.map((s, i) => (
            <button
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                width: '100%',
                padding: '11px 16px',
                border: 'none',
                borderBottom: i < suggestions.length - 1 ? '1px solid #EDE8DF' : 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Outfit, system-ui, sans-serif',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F7F4EF')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0, marginTop: 4 }}>
                <path d="M6 1C3.79 1 2 2.79 2 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4z" stroke="#6B6358" strokeWidth="1.2" fill="none" />
                <circle cx="6" cy="5" r="1.5" fill="#6B6358" />
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1714', marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#6B6358' }}>{s.formatted_address}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <span style={{ fontSize: 12, color: '#C44B3A', marginTop: 5, display: 'block' }}>{error}</span>}
    </div>
  );
}
