import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Harap lengkapi semua bidang.');
      return;
    }
    if (!/^[A-Za-z ]+$/.test(name.trim())) {
      setError('Nama hanya boleh berisi huruf alfabet dan spasi.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Pendaftaran gagal. Silakan coba lagi.');
    }
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
          maxWidth: '440px',
          border: '1px solid var(--color-ink)',
          backgroundColor: 'var(--color-surface)',
          padding: '2rem',
          boxShadow: '4px 4px 0px rgba(30, 33, 28, 0.12)'
        }}
      >
        {/* Header with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/logo.png"
            alt="EcoPoints Logo"
            style={{ width: 44, height: 44, objectFit: 'contain', margin: '0 auto 0.75rem', display: 'block' }}
          />
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Daftar Jadi Nasabah
          </h1>
          <p className="font-mono text-faint" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Bergabung dengan Bank Sampah Digital
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

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Siti Rahmawati"
              pattern="[A-Za-z ]+"
              title="Nama hanya boleh berisi huruf alfabet dan spasi."
              required
            />
          </div>

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
            <label className="form-label" htmlFor="password">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Konfirmasi Kata Sandi
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi"
              required
            />
          </div>

          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-paper)',
              border: '1px solid var(--color-border)',
              marginBottom: '1.25rem',
              fontSize: '0.75rem'
            }}
          >
            <span className="font-mono text-primary" style={{ fontWeight: 700 }}>
              BONUS REGISTRASI:
            </span>{' '}
            <span className="text-muted">
              Dapatkan langsung <strong>100 Poin Selamat Datang</strong> yang dapat Anda kumpulkan untuk reward pertama!
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Membuat Akun...' : 'Selesaikan Pendaftaran'}
          </Button>
        </form>

        {/* Footer Link to Login */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.8125rem'
          }}
        >
          <span className="text-muted">Sudah memiliki akun? </span>
          <Link
            to="/login"
            style={{
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'underline'
            }}
          >
            Masuk di Sini
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
