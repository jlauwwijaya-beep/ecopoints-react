import React from 'react';

/**
 * CategoryDot Component
 * @param {'organik' | 'anorganik' | 'b3' | 'poin'} type
 */
export default function CategoryDot({ type = 'organik', pulse = false, size = 8, className = '' }) {
  const colorMap = {
    organik: 'var(--color-organik)',
    anorganik: 'var(--color-anorganik)',
    b3: 'var(--color-b3)',
    poin: 'var(--color-poin)'
  };

  const bg = colorMap[type] || 'var(--color-ink-muted)';

  return (
    <span
      className={`category-dot ${pulse ? 'pulse' : ''} ${className}`.trim()}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        display: 'inline-block',
        borderRadius: '50%',
        flexShrink: 0
      }}
    />
  );
}
