import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('nasabah@ecopoints.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap masukkan email dan kata sandi.');
      return;
    }

    login(email, password);
    navigate(from, { replace: true });
  };

  const handleDemoFill = () => {
    setEmail('nasabah@ecopoints.id');
    setPassword('password123');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--color-paper)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          border: '1px solid var(--color-ink)',
          backgroundColor: 'var(--color-surface)',
          padding: '2rem',
          boxShadow: '4px 4px 0px rgba(30, 33, 28, 0.12)'
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'var(--color-ink)',
              color: 'var(--color-paper)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '1rem',
              margin: '0 auto 0.75rem'
            }}
          >
            EP
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Masuk ke EcoPoints
          </h1>
          <p className="font-mono text-faint" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Sistem Sirkular Bank Sampah
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.625rem 0.75rem',
              backgroundColor: '#FCECE9',
              border: '1px solid var(--color-b3)',
              color: 'var(--color-b3)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              marginBottom: '1.25rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">
                Kata Sandi
              </label>
              <span
                className="font-mono text-faint"
                style={{ fontSize: '0.6875rem', cursor: 'pointer' }}
                onClick={() => alert('Fitur reset kata sandi telah dikirim ke email terdaftar (simulasi).')}
              >
                Lupa password?
              </span>
            </div>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Masuk Sekarang →
          </Button>

          {/* Quick Demo Helper */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem',
              backgroundColor: 'var(--color-paper)',
              border: '1px dashed var(--color-border)',
              textAlign: 'center'
            }}
          >
            <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', marginBottom: '0.375rem' }}>
              AKUN DEMO CEPAT:
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="font-mono"
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Gunakan: nasabah@ecopoints.id
            </button>
          </div>
        </form>

        {/* Footer Link to Register */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.8125rem'
          }}
        >
          <span className="text-muted">Belum punya akun nasabah? </span>
          <Link
            to="/register"
            style={{
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'underline'
            }}
          >
            Daftar Sekarang
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
