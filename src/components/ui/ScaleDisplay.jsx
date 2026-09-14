import React from 'react';

/**
 * ScaleDisplay Component
 * @param {number|string} value
 * @param {'kg' | 'pts' | string} unit
 * @param {string} label
 */
export default function ScaleDisplay({
  value,
  unit = 'KG',
  label = 'BERAT TERUKUR',
  color = 'ink',
  className = ''
}) {
  const textColor = {
    ink: 'var(--color-ink)',
    poin: 'var(--color-poin)',
    organik: 'var(--color-organik)',
    anorganik: 'var(--color-anorganik)',
    b3: 'var(--color-b3)'
  }[color] || 'var(--color-ink)';

  return (
    <div className={`scale-display ${className}`.trim()} style={{ background: 'var(--color-surface)', padding: '1rem', border: '1px solid var(--color-border)' }}>
      <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
        <span
          className="font-mono tabular-nums"
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1,
            color: textColor
          }}
        >
          {value}
        </span>
        <span className="font-mono text-muted" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
