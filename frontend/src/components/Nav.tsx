// =============================================================
// RouteWise — Nav Component (from Figma)
// =============================================================

type NavProps = {
  onLogoClick?: () => void;
  transparent?: boolean;
  actions?: React.ReactNode;
  navLinks?: { label: string; onClick: () => void; primary?: boolean }[];
};

export default function Nav({ onLogoClick, transparent, actions, navLinks }: NavProps) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: transparent ? 'transparent' : '#F7F4EF',
        borderBottom: transparent ? 'none' : '1px solid #DDD7CC',
        padding: '0 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            onClick={onLogoClick}
            title="Home"
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <RouteWiseMark />
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 20, color: '#1A1714', letterSpacing: '-0.02em' }}>
              RouteWise
            </span>
          </button>

          {navLinks && navLinks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  style={{
                    background: link.primary ? '#2D5A3D' : 'none',
                    border: link.primary ? 'none' : 'none',
                    borderRadius: link.primary ? 7 : 0,
                    padding: link.primary ? '7px 14px' : '7px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: link.primary ? '#F7F4EF' : '#6B6358',
                    cursor: 'pointer',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (link.primary) e.currentTarget.style.background = '#3D7A52';
                    else e.currentTarget.style.color = '#1A1714';
                  }}
                  onMouseLeave={e => {
                    if (link.primary) e.currentTarget.style.background = '#2D5A3D';
                    else e.currentTarget.style.color = '#6B6358';
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
      </div>
    </nav>
  );
}

function RouteWiseMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill="#2D5A3D" />
      <path d="M7 19 L11 10 L15 15 L18 11 L21 19" stroke="#F7F4EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="21" cy="9" r="2" fill="#C8E6D0" />
      <circle cx="7" cy="19" r="2" fill="#EBF4EE" />
    </svg>
  );
}
