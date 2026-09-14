// =============================================================
// RouteWise — Loading Screen
// =============================================================
// Animated progress screen between form submission and results.
// Shows planning stages sequentially to set user expectations.
// =============================================================

import { useEffect, useState } from 'react';
import type { FormData } from './PlannerForm';

const stages = [
  { label: 'Checking trip feasibility', detail: 'Verifying route distances and driving time limits' },
  { label: 'Finding realistic routes', detail: 'Mapping highway corridors and road quality across the route' },
  { label: 'Checking route constraints', detail: 'Permits, seasonal restrictions, and fuel availability' },
  { label: 'Finding places along your route', detail: 'Attractions, restaurants, and rest stops within reach' },
  { label: 'Building your itinerary', detail: 'Assembling a day-by-day plan with realistic timing' },
];

export default function LoadingScreen({ formData, onDone }: { formData: FormData | null; onDone: () => void }) {
  const [activeStage, setActiveStage] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const from = formData?.start?.name ?? 'Origin';
  const to = formData?.destination?.name ?? 'Destination';

  useEffect(() => {
    let i = 0;
    const tick = () => {
      if (i < stages.length) {
        setActiveStage(i);
        i++;
        setTimeout(() => {
          setCompleted(c => [...c, i - 1]);
          if (i < stages.length) {
            setTimeout(tick, 300);
          } else {
            setTimeout(onDone, 600);
          }
        }, 1100);
      }
    };
    tick();
  }, [onDone]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F4EF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Logo mark */}
      <div style={{ marginBottom: 48 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <rect width="52" height="52" rx="16" fill="#2D5A3D" />
          <path d="M13 35 L20 18 L28 27 L34 19 L39 35" stroke="#F7F4EF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="39" cy="17" r="3.5" fill="#C8E6D0" />
          <circle cx="13" cy="35" r="3.5" fill="#EBF4EE" />
        </svg>
      </div>

      <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 30, fontWeight: 700, color: '#1A1714', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'center' }}>
        Planning your route
      </h2>
      <p style={{ fontSize: 15, color: '#6B6358', margin: '0 0 8px', textAlign: 'center' }}>
        {from} → {to}
      </p>
      <p style={{ fontSize: 14, color: '#6B6358', margin: '0 0 48px', textAlign: 'center' }}>
        This usually takes a few seconds
      </p>

      {/* Stages */}
      <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {stages.map((stage, idx) => {
          const isDone = completed.includes(idx);
          const isActive = activeStage === idx && !isDone;
          const isPending = idx > activeStage;

          return (
            <div
              key={stage.label}
              style={{
                display: 'flex',
                gap: 16,
                opacity: isPending ? 0.35 : 1,
                transition: 'opacity 0.3s',
                position: 'relative',
                paddingBottom: idx < stages.length - 1 ? 24 : 0,
              }}
            >
              {/* Connector line */}
              {idx < stages.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 19,
                    top: 38,
                    width: 2,
                    height: 'calc(100% - 14px)',
                    background: isDone ? '#2D5A3D' : '#DDD7CC',
                    transition: 'background 0.4s',
                  }}
                />
              )}

              {/* Step indicator */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `2px solid ${isDone ? '#2D5A3D' : isActive ? '#3D7A52' : '#DDD7CC'}`,
                  background: isDone ? '#2D5A3D' : isActive ? '#EBF4EE' : '#F7F4EF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                  zIndex: 1,
                }}
              >
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="#F7F4EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <Spinner />
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DDD7CC' }} />
                )}
              </div>

              {/* Stage text */}
              <div style={{ paddingTop: 8 }}>
                <p
                  style={{
                    margin: '0 0 3px',
                    fontSize: 15,
                    fontWeight: isDone || isActive ? 600 : 400,
                    color: isDone ? '#2D5A3D' : isActive ? '#1A1714' : '#6B6358',
                    transition: 'all 0.3s',
                  }}
                >
                  {stage.label}
                </p>
                {isActive && (
                  <p style={{ margin: 0, fontSize: 13, color: '#6B6358', animation: 'fadeIn 0.3s ease' }}>
                    {stage.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="8" cy="8" r="6" stroke="#C8E6D0" strokeWidth="2.5" fill="none" />
      <path d="M8 2 A6 6 0 0 1 14 8" stroke="#2D5A3D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
