// =============================================================
// RouteWise — Warning Component (from Figma)
// =============================================================

type Severity = 'info' | 'warning' | 'critical' | 'advisory' | 'important'; // backwards compatibility

type WarningProps = {
  severity: Severity;
  title: string;
  description?: string;
  compact?: boolean;
  requiresVerification?: boolean;
};

const config: Record<Severity, { bg: string; border: string; icon: string; label: string; labelColor: string }> = {
  info: {
    bg: '#EEF4FB',
    border: '#C0D8EF',
    icon: 'ℹ',
    label: 'Information',
    labelColor: '#2B5F8A',
  },
  warning: {
    bg: '#FDF3E3',
    border: '#F0D5A8',
    icon: '⚠',
    label: 'Advisory',
    labelColor: '#C17B2E',
  },
  critical: {
    bg: '#FDF0EE',
    border: '#F0C4BC',
    icon: '!',
    label: 'Important',
    labelColor: '#C44B3A',
  },
  advisory: { bg: '#FDF3E3', border: '#F0D5A8', icon: '⚠', label: 'Advisory', labelColor: '#C17B2E' },
  important: { bg: '#FDF0EE', border: '#F0C4BC', icon: '!', label: 'Important', labelColor: '#C44B3A' },
};

export default function Warning({ severity, title, description, compact, requiresVerification }: WarningProps) {
  const c = config[severity];
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: compact ? '12px 14px' : '16px 18px',
        display: 'flex',
        gap: compact ? 12 : 16,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: c.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: c.labelColor,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {c.icon}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: description ? 4 : 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: c.labelColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {c.label}
          </span>
          {requiresVerification && (
            <span style={{ fontSize: 10, fontWeight: 600, background: '#FFFFFF', padding: '2px 6px', borderRadius: 100, border: `1px solid ${c.border}`, color: c.labelColor }}>
              Requires Verification
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#1A1714', fontWeight: 500, lineHeight: 1.4 }}>{title}</p>
        {description && !compact && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6358', lineHeight: 1.5 }}>{description}</p>
        )}
      </div>
    </div>
  );
}
