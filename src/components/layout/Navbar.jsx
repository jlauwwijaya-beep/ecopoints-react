import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(243, 241, 234, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div
        className="container"
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.png"
            alt="EcoPoints Logo"
            style={{ width: '34px', height: '34px', objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              EcoPoints
            </span>
            <span
              className="font-mono text-faint"
              style={{ fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Bank Sampah Digital
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <div
                className="font-mono text-poin tabular-nums"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.625rem',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <span>★</span>
                <span>{user.points.toLocaleString('id-ID')} PTS</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard →
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Daftar Nasabah
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
