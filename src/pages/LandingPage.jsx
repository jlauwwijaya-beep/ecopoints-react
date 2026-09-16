import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import CategoryDot from '../components/ui/CategoryDot';

export default function LandingPage() {
  const navigate = useNavigate();

  // Interactive Scale Simulator State
  const [weight, setWeight] = useState(4.5);
  const [category, setCategory] = useState('plastik'); // 'plastik' | 'kertas' | 'organik'
  const [popKey, setPopKey] = useState(0);

  const rates = {
    plastik: { label: 'Plastik (PET/HDPE)', rate: 300, unit: 'pts/kg' },
    kertas: { label: 'Kertas & Kardus', rate: 150, unit: 'pts/kg' },
    organik: { label: 'Organik Kompos', rate: 50, unit: 'pts/kg' }
  };

  const calculatedPoints = Math.floor(weight * rates[category].rate);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: '3.5rem 0 4.5rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-paper)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column */}
            <div style={{ maxWidth: '42rem' }}>
              {/* Badge/Chip */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3125rem 0.75rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  marginBottom: '1.5rem'
                }}
              >
                <CategoryDot type="organik" pulse={true} size={8} />
                <span
                  className="font-mono text-muted"
                  style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  Sistem Penimbangan Bank Sampah Terpadu
                </span>
              </div>

              {/* H1 Heading */}
              <h1
                style={{
                  fontSize: 'clamp(2.125rem, 4.5vw, 3.25rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem'
                }}
              >
                Setiap kilogram sampah terpilah kini bernilai poin nyata.
              </h1>

              {/* Description */}
              <p
                className="text-muted"
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.65,
                  marginBottom: '2rem',
                  maxWidth: '36rem'
                }}
              >
                Ubah sisa kemasan plastik, kertas, dan organik dapur menjadi saldo poin terkonversi.
                Dapatkan insentif ekonomi langsung melalui timbangan berkalibrasi di drop point mitra terdekat.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-shimmer"
                  onClick={() => navigate('/register')}
                >
                  Daftar Jadi Nasabah
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Masuk Akun
                </Button>
              </div>

              {/* Trust & Jaminan Layanan */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '2.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                    [01] Tera Digital Resmi
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                    [02] Poin Langsung Masuk
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                    [03] Tukar Sembako & Saldo
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column — Interactive Scale Simulator */}
            <div>
              <div
                className="scale-hud"
                style={{
                  boxShadow: '4px 4px 0px rgba(30, 33, 28, 0.15)',
                  position: 'relative'
                }}
              >
                {/* Header Bar */}
                <div className="scale-hud-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CategoryDot type="organik" pulse={true} size={8} />
                    <span>SCALE SIMULATOR</span>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      letterSpacing: '0.08em'
                    }}
                  >
                    LIVE CONVERT
                  </span>
                </div>

                {/* HUD Display 2 Columns */}
                <div className="scale-hud-body">
                  <div className="scale-hud-col">
                    <div className="scale-hud-label">BERAT TERUKUR</div>
                    <div className="scale-hud-value tabular-nums">
                      {weight.toFixed(1)} <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>KG</span>
                    </div>
                  </div>
                  <div className="scale-hud-col" style={{ position: 'relative', overflow: 'visible' }}>
                    <div className="scale-hud-label">ESTIMASI NILAI</div>
                    <div className="scale-hud-value tabular-nums text-poin">
                      +{calculatedPoints.toLocaleString('id-ID')}{' '}
                      <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>PTS</span>
                    </div>
                    {/* Floating micro-reward pop */}
                    <div
                      key={popKey}
                      className="float-pop font-mono"
                      style={{
                        position: 'absolute',
                        top: '-0.375rem',
                        right: '0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-organik)',
                        pointerEvents: 'none'
                      }}
                    >
                      +{calculatedPoints} PTS
                    </div>
                  </div>
                </div>

                {/* Interactive Controls */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface)' }}>
                  {/* Category Toggle Buttons */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      className="font-mono text-faint"
                      style={{ fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}
                    >
                      PILIH KATEGORI BAHAN:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        { id: 'plastik', name: 'Plastik', rate: '300' },
                        { id: 'kertas', name: 'Kertas', rate: '150' },
                        { id: 'organik', name: 'Organik', rate: '50' }
                      ].map((item) => {
                        const isActive = category === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCategory(item.id);
                              setPopKey((k) => k + 1);
                            }}
                            style={{
                              padding: '0.625rem 0.375rem',
                              textAlign: 'center',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: 0,
                              border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-ink)',
                              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-paper)',
                              color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>{item.name}</div>
                            <div
                              style={{
                                fontSize: '0.625rem',
                                color: isActive ? 'var(--color-poin-light)' : 'var(--color-ink-muted)',
                                marginTop: '0.125rem'
                              }}
                            >
                              {item.rate} pts/kg
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weight Range Slider */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <span
                        className="font-mono text-faint"
                        style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        SIMULASI BOBOT TIMBANGAN:
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        {weight.toFixed(1)} KG
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="25"
                      step="0.5"
                      value={weight}
                      onChange={(e) => {
                        setWeight(parseFloat(e.target.value));
                        setPopKey((k) => k + 1);
                      }}
                      style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                    />
                    {/* Capacity Gauge Bar */}
                    <div className="scale-gauge-bar" title="Indikator Beban Timbangan">
                      <div
                        className="scale-gauge-fill"
                        style={{ width: `${Math.min(100, (weight / 25) * 100)}%` }}
                      />
                    </div>
                    <div
                      className="font-mono text-faint"
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', marginTop: '0.375rem' }}
                    >
                      <span>0.5 KG</span>
                      <span>12.5 KG</span>
                      <span>25.0 KG</span>
                    </div>
                  </div>

                  {/* Summary Note */}
                  <div
                    style={{
                      paddingTop: '0.875rem',
                      borderTop: '1px dashed var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.375rem'
                    }}
                  >
                    <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', lineHeight: 1.4 }}>
                      * Poin otomatis dikreditkan sesaat setelah timbangan divalidasi petugas.
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem'
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                        Tarif: {rates[category].rate} pts / kg
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/deposits/create')}
                      >
                        Setor Sekarang
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Eco-Commodity Marquee Ticker */}
      <div
        style={{
          borderTop: '1px solid var(--color-ink)',
          borderBottom: '1px solid var(--color-ink)',
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-paper)',
          padding: '0.625rem 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        <div className="marquee-track font-mono" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {[1, 2].map((loop) => (
            <span key={loop} style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', paddingRight: '2rem' }}>
              <span><strong style={{ color: '#98C379' }}>PLASTIK PET & HDPE</strong> +300 PTS/KG</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span><strong style={{ color: '#E5C07B' }}>KERTAS & KARDUS</strong> +150 PTS/KG</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span><strong style={{ color: '#61AFEF' }}>ORGANIK KOMPOS</strong> +50 PTS/KG</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span><strong style={{ color: 'var(--color-poin)' }}>TERA DIGITAL REAL-TIME</strong></span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span><strong style={{ color: '#98C379' }}>TUKAR SEMBAKO & SALDO DIGITAL</strong></span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: 'var(--color-paper)' }}>BEBAS MINIMUM PENYETORAN</span>
              <span style={{ opacity: 0.4 }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Section: Alur Sirkulasi (4 Langkah) */}
      <section
        style={{
          padding: '4.5rem 0',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-paper)'
        }}
      >
        <div className="container">
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '2.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>
              <span
                className="font-mono text-primary"
                style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
              >
                ALUR SIRKULASI
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Prosedur Penyetoran Sampah Terpadu
              </h2>
            </div>
            <span className="font-mono text-faint" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Standard SOP // V-2025
            </span>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid-4">
            {[
              {
                step: '[STEP 01]',
                title: 'Pilah di Sumber',
                desc: 'Kelompokkan sampah rumah tangga ke dalam wadah organik, anorganik kering, dan limbah B3.'
              },
              {
                step: '[STEP 02]',
                title: 'Bawa ke Drop Point',
                desc: 'Kunjungi unit bank sampah terdekat di balai RW atau loket stasiun mitra terdaftar.'
              },
              {
                step: '[STEP 03]',
                title: 'Penimbangan Riil',
                desc: 'Petugas melakukan tera kalibrasi timbangan digital dan mencatat berat bersih sampah.'
              },
              {
                step: '[STEP 04]',
                title: 'Tukar Reward',
                highlight: true,
                desc: 'Poin langsung masuk ke akun Anda dan dapat ditukarkan voucher sembako, pulsa, maupun saldo e-wallet.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="step-card"
                style={{
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '180px',
                  cursor: 'default'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.625rem'
                    }}
                  >
                    <div
                      className="font-mono tabular-nums"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: item.highlight ? 'var(--color-poin)' : 'var(--color-ink-muted)'
                      }}
                    >
                      {item.step}
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Panduan Pemilahan Sampah (3 Kolom) */}
      {false && <section
        style={{
          padding: '4.5rem 0',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div className="container">
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '2.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>
              <span
                className="font-mono text-primary"
                style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}
              >
                KLASIFIKASI PENERIMAAN
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Panduan Kategori & Tarif Poin
              </h2>
            </div>
            <span className="font-mono text-faint" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Standard SNI 19-3964-1994
            </span>
          </div>

          {/* 3 Cards */}
          <div className="grid-3">
            {/* Organik */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-paper)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <CategoryDot type="organik" size={10} />
                  <span className="font-mono text-organik" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Kategori A · Organik
                  </span>
                </div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Sampah Organik
                </h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Sisa sayuran, kulit buah, ampas kopi/teh, daun kering, dan sisa bahan masakan dapur non-minyak.
                </p>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1rem'
                  }}
                >
                  <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>TARIF PENERIMAAN:</div>
                  <div className="font-mono text-organik" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    50 – 100 poin / kg
                  </div>
                </div>
              </div>
              <div className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                Diolah menjadi kompos granular & pakan maggot BSF.
              </div>
            </div>

            {/* Anorganik */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-paper)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <CategoryDot type="anorganik" size={10} />
                  <span className="font-mono text-anorganik" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Kategori B · Anorganik
                  </span>
                </div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Sampah Anorganik
                </h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Botol plastik PET, wadah HDPE, kardus dupleks, kertas HVS arsip, kaleng seng & alumunium.
                </p>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1rem'
                  }}
                >
                  <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>TARIF PENERIMAAN:</div>
                  <div className="font-mono text-anorganik" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    150 – 500 poin / kg
                  </div>
                </div>
              </div>
              <div className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                Daur ulang industri manufaktur & daur serat kertas.
              </div>
            </div>

            {/* Limbah B3 */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-paper)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <CategoryDot type="b3" size={10} />
                  <span className="font-mono text-b3" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Kategori C · Limbah B3 & Elektronik
                  </span>
                </div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Limbah B3 & E-Waste
                </h3>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Baterai kering, lampu neon bekas, aki, kabel rusak, komponen ponsel, dan perangkat elektronik kecil.
                </p>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    marginBottom: '1rem'
                  }}
                >
                  <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>TARIF PENERIMAAN:</div>
                  <div className="font-mono text-b3" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    500 – 2.000 poin / unit
                  </div>
                </div>
              </div>
              <div className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                Pengolahan limbah khusus bersama pengolah berizin KLHK.
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* CTA Bottom Banner */}
      <section style={{ padding: '3.5rem 0', backgroundColor: 'var(--color-paper)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '44rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Mulai kelola sampah rumah tangga Anda hari ini.
          </h2>
          <p className="text-muted" style={{ fontSize: '0.9375rem', marginBottom: '1.75rem' }}>
            Bergabunglah dengan ribuan warga yang telah mengubah kebiasaan membuang sampah menjadi tabungan poin bernilai nyata.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
