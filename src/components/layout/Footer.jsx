import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: '2rem 0',
        marginTop: 'auto'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Left info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <img
              src="/logo.png"
              alt="EcoPoints Logo"
              style={{ width: 22, height: 22, objectFit: 'contain' }}
            />
            <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              EcoPoints © 2025
            </span>
            <span className="font-mono text-faint" style={{ fontSize: '0.8125rem' }}>
              |
            </span>
            <span className="font-mono text-muted" style={{ fontSize: '0.8125rem' }}>
              Platform Sirkular Ekonomi Mandiri
            </span>
          </div>

          {/* Right info */}
          <div className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
            Built with precision typography & digital scale mechanics.
          </div>
        </div>
      </div>
    </footer>
  );
}
