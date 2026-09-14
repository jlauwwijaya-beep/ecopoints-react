import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import CategoryDot from '../components/ui/CategoryDot';

export default function DashboardPage() {
  const { user, deposits } = useAuth();
  const navigate = useNavigate();

  const todayDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const recentDeposits = deposits.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav />

      <main style={{ padding: '2.5rem 0 4rem', flexGrow: 1, backgroundColor: 'var(--color-paper)' }}>
        <div className="container-wide">
          {/* Header Dashboard */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>
              <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ID NASABAH // {user?.memberId || 'EP-ID-8821'}
              </div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Dashboard Nasabah, {user?.name || 'Budi Pratama'}
              </h1>
            </div>
            <div className="font-mono text-faint" style={{ fontSize: '0.8125rem' }}>
              {todayDate}
            </div>
          </div>

          {/* Kartu Saldo Poin (Full Width) */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-ink)',
              padding: '2rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: '4px 4px 0px rgba(30, 33, 28, 0.15)'
            }}
          >
            <div>
              <div
                className="font-mono text-faint"
                style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}
              >
                SALDO POIN ANDA
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span
                  className="font-mono tabular-nums text-poin"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                    fontWeight: 800,
                    lineHeight: 1
                  }}
                >
                  {user ? user.points.toLocaleString('id-ID') : 0}
                </span>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink-muted)' }}>
                  PTS
                </span>
              </div>
              <div
                className="font-mono text-muted"
                style={{ fontSize: '0.8125rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <CategoryDot type="poin" size={6} />
                <span>poin aktif · bisa ditukar sekarang</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/rewards')}
              >
                Tukar Reward
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/deposits/create')}
              >
                + Setor Sampah
              </Button>
            </div>
          </div>

          {/* Grid 3 Kolom Quick Links */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            {[
              {
                title: 'Riwayat Setoran',
                desc: 'Pantau status penimbangan dan verifikasi petugas',
                link: '/deposits',
                badge: `${deposits.length} Catatan`
              },
              {
                title: 'Mutasi Poin',
                desc: 'Lihat aliran kredit poin masuk dan debit penukaran',
                link: '/points',
                badge: 'Keluar & Masuk'
              },
              {
                title: 'Katalog Reward',
                desc: 'Tukarkan saldo poin dengan voucher, pulsa, atau sembako',
                link: '/rewards',
                badge: '6 Pilihan'
              }
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className="quick-link-card"
                style={{
                  display: 'block',
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                    {item.badge}
                  </span>
                  <span className="font-mono text-faint" style={{ fontSize: '0.875rem' }}>
                    →
                  </span>
                </div>
                <h3
                  className="quick-link-title"
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    marginBottom: '0.375rem',
                    transition: 'color 0.15s ease'
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>

          {/* Two Columns: Recent Deposits & Cara Kerja */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {/* Left: Recent Deposits Preview */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                  Aktivitas Setoran Terakhir
                </h3>
                <Link to="/deposits" className="font-mono text-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Lihat Semua →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentDeposits.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      border: '1px solid var(--color-border)',
                      padding: '0.875rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <CategoryDot type={item.category} size={7} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.type}</span>
                      </div>
                      <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>
                        {item.date} · {item.location}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="font-mono text-poin tabular-nums" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        +{item.points} PTS
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Cara Kerja EcoPoints */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                  Cara Kerja EcoPoints
                </h3>
                <span className="font-mono text-faint" style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                  Panduan Nasabah
                </span>
              </div>

              <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    num: '1',
                    title: 'Pilah Sampah Berdasarkan Jenis',
                    desc: 'Pisahkan antara kemasan plastik, kertas/kardus, dan limbah organik dapur dalam kantong terpisah.'
                  },
                  {
                    num: '2',
                    title: 'Bawa & Timbang di Drop Point',
                    desc: 'Petugas akan menimbang menggunakan timbangan berkalibrasi dan mencatat ke sistem.'
                  },
                  {
                    num: '3',
                    title: 'Verifikasi & Kredit Poin Instan',
                    desc: 'Setelah verifikasi petugas, poin otomatis terakumulasi di dashboard Anda.'
                  },
                  {
                    num: '4',
                    title: 'Tukarkan Poin Kapan Saja',
                    desc: 'Pilih reward yang diinginkan di Katalog Reward dan tukarkan dengan mudah.'
                  }
                ].map((step) => (
                  <li key={step.num} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        border: '1px solid var(--color-ink)',
                        backgroundColor: 'var(--color-paper)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {step.num}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>
                        {step.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {step.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .quick-link-card:hover {
          background-color: var(--color-surface) !important;
          border-color: var(--color-ink) !important;
        }
        .quick-link-card:hover .quick-link-title {
          color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
}
