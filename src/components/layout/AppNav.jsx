import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavLink from '../ui/NavLink';
import Button from '../ui/Button';

export default function AppNav() {
  const { user, logout, apiConnected } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div
        className="container-wide"
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Left: Logo & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {/* Inline SVG Recycle/Circle Icon */}
            <div
              style={{
                width: 32,
                height: 32,
                border: '1px solid var(--color-ink)',
                background: 'var(--color-primary)',
                color: 'var(--color-paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
                <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
                <path d="M11 19h8.2a1.8 1.8 0 0 0 1.583-.914.79.79 0 0 0-.017-.792l-3.21-5.694" />
                <path d="M14.5 4.5 12 9l-2.5-4.5" />
                <path d="M3.5 12h5" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}
              >
                EcoPoints
              </span>
              <span
                className="font-mono text-faint"
                style={{ fontSize: '0.5625rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Portal Nasabah
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            className="desktop-nav"
          >
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/deposits/create">Input Setoran</NavLink>
            <NavLink to="/deposits" end>Riwayat Setoran</NavLink>
            <NavLink to="/points">Poin</NavLink>
            <NavLink to="/rewards">Reward</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          </nav>
        </div>

        {/* Right: User points & profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* API Status Indicator */}
          <div
            title={apiConnected ? 'API Backend Terhubung' : 'API Backend Offline'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              background: apiConnected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${apiConnected ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: '4px',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: apiConnected ? '#16a34a' : '#dc2626'
            }}
            className="api-status-badge"
          >
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: apiConnected ? '#22c55e' : '#ef4444',
              display: 'inline-block',
              boxShadow: apiConnected ? '0 0 0 2px rgba(34,197,94,0.3)' : '0 0 0 2px rgba(239,68,68,0.3)'
            }} />
            {apiConnected ? 'API Online' : 'Offline'}
          </div>

          {/* User Points Badge */}
          <div
            className="font-mono tabular-nums"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem'
            }}
          >
            <span style={{ color: 'var(--color-poin)', fontWeight: 800 }}>★</span>
            <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>
              {user ? (user.points || 0).toLocaleString('id-ID') : 0}
            </span>
            <span className="text-faint" style={{ fontSize: '0.6875rem' }}>PTS</span>
          </div>

          {/* User Name & Role */}
          <div
            style={{
              display: 'none',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.2
            }}
            className="user-profile-box"
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || 'Nasabah'}</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}>
              {user?.role || 'nasabah'}
            </span>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title="Keluar dari akun"
            style={{ padding: '0.375rem 0.625rem' }}
          >
            Keluar
          </Button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)'
            }}
            aria-label="Toggle navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
            <NavLink to="/deposits/create" onClick={() => setMobileMenuOpen(false)}>Input Setoran</NavLink>
            <NavLink to="/deposits" end onClick={() => setMobileMenuOpen(false)}>Riwayat Setoran</NavLink>
            <NavLink to="/points" onClick={() => setMobileMenuOpen(false)}>Poin</NavLink>
            <NavLink to="/rewards" onClick={() => setMobileMenuOpen(false)}>Reward</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</NavLink>}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .user-profile-box {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .api-status-badge {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
