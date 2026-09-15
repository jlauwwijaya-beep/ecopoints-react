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
            className="dash-fadein"
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
                Selamat datang, {user?.name || 'Budi Pratama'} 👋
              </h1>
            </div>
            <div className="font-mono text-faint" style={{ fontSize: '0.8125rem' }}>
              {todayDate}
            </div>
          </div>

          {/* Kartu Saldo Poin - Dark Gradient */}
          <div
            className="dash-fadein dash-fadein-2"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #1a3528 100%)',
              border: '2px solid var(--color-ink)',
              padding: '2rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: '6px 6px 0px rgba(30, 33, 28, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', right: '80px', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

            <div>
              <div className="font-mono" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.55)' }}>
                ⭐ SALDO POIN AKTIF ANDA
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span className="font-mono tabular-nums" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, lineHeight: 1, color: 'var(--color-poin)' }}>
                  {user ? user.points.toLocaleString('id-ID') : 0}
                </span>
                <span className="font-mono" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>PTS</span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.8125rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6FCF97', display: 'inline-block' }} />
                <span>poin aktif · bisa ditukar sekarang</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" size="md" onClick={() => navigate('/rewards')} style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                🎁 Tukar Reward
              </Button>
              <Button variant="primary" size="md" className="btn-shimmer" onClick={() => navigate('/deposits/create')} style={{ backgroundColor: 'var(--color-poin)', color: 'var(--color-ink)', border: 'none', fontWeight: 700 }}>
                + Setor Sampah
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="dash-fadein dash-fadein-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { icon: '📋', title: 'Riwayat Setoran', desc: 'Pantau status penimbangan dan verifikasi petugas', link: '/deposits', badge: deposits.length + ' Catatan' },
              { icon: '📊', title: 'Mutasi Poin', desc: 'Lihat aliran kredit poin masuk dan debit penukaran', link: '/points', badge: 'Keluar & Masuk' },
              { icon: '🎁', title: 'Katalog Reward', desc: 'Tukarkan saldo poin dengan voucher, pulsa, atau sembako', link: '/rewards', badge: '6 Pilihan' }
            ].map((item, idx) => (
              <Link key={idx} to={item.link} className="quick-link-card" style={{ display: 'block', backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', padding: '1.5rem', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', textDecoration: 'none' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>{item.badge}</span>
                  <span className="font-mono text-faint" style={{ fontSize: '0.875rem' }}>→</span>
                </div>
                <h3 className="quick-link-title" style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.375rem', transition: 'color 0.15s ease' }}>{item.title}</h3>
                <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.4 }}>{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* Two Columns */}
          <div className="dash-fadein dash-fadein-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>

            {/* Recent Deposits */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>🌿 Aktivitas Setoran Terakhir</h3>
                <Link to="/deposits" className="font-mono text-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Lihat Semua →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentDeposits.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-ink-faint)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                    <div className="font-mono" style={{ fontSize: '0.8125rem' }}>Belum ada setoran</div>
                  </div>
                )}
                {recentDeposits.map((item) => (
                  <div key={item.id} className="deposit-row-card" style={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-border)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <CategoryDot type={item.category} size={7} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.type}</span>
                      </div>
                      <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>{item.date} · {item.location}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="font-mono text-poin tabular-nums" style={{ fontWeight: 700, fontSize: '0.875rem' }}>+{item.points} PTS</div>
                      <div style={{ marginTop: '0.25rem' }}><StatusBadge status={item.status} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cara Kerja */}
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>⚡ Cara Kerja EcoPoints</h3>
                <span className="font-mono text-faint" style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}>Panduan Nasabah</span>
              </div>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: '🌱', title: 'Pilah Sampah Berdasarkan Jenis', desc: 'Pisahkan antara kemasan plastik, kertas/kardus, dan limbah organik dapur dalam kantong terpisah.' },
                  { icon: '⚖️', title: 'Bawa & Timbang di Drop Point', desc: 'Petugas akan menimbang menggunakan timbangan berkalibrasi dan mencatat ke sistem.' },
                  { icon: '✅', title: 'Verifikasi & Kredit Poin Instan', desc: 'Setelah verifikasi petugas, poin otomatis terakumulasi di dashboard Anda.' },
                  { icon: '🎁', title: 'Tukarkan Poin Kapan Saja', desc: 'Pilih reward yang diinginkan di Katalog Reward dan tukarkan dengan mudah.' }
                ].map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, border: '1px solid var(--color-primary)', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{step.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{step.desc}</div>
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
        .quick-link-card:hover { background-color: var(--color-surface) !important; border-color: var(--color-primary) !important; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(38,71,58,0.1); }
        .quick-link-card:hover .quick-link-title { color: var(--color-primary) !important; }
        .deposit-row-card:hover { border-color: var(--color-primary) !important; box-shadow: 0 2px 8px rgba(38,71,58,0.08); }
        @keyframes dashFadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .dash-fadein   { animation: dashFadeIn 0.45s ease-out both; }
        .dash-fadein-2 { animation-delay: 0.08s; }
        .dash-fadein-3 { animation-delay: 0.16s; }
        .dash-fadein-4 { animation-delay: 0.24s; }
      `}</style>
    </div>
  );
}
