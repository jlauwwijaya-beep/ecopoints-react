import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import CategoryDot from '../components/ui/CategoryDot';
import ReceiptRow from '../components/ui/ReceiptRow';

export default function DepositsCreatePage() {
  const navigate = useNavigate();
  const { addDeposit } = useAuth();

  const [category, setCategory] = useState('anorganik');
  const [wasteType, setWasteType] = useState('Plastik PET (Botol Bening Bersih)');
  const [weight, setWeight] = useState(3.5);
  const [location, setLocation] = useState('Drop Point RW 04 Kebayoran');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDeposit, setSubmittedDeposit] = useState(null);

  const categoryRates = {
    organik: {
      rate: 50,
      unit: 'kg',
      items: [
        'Kompos & Sisa Sayur Dapur Organik',
        'Kulit Buah & Ampas Kopi/Teh',
        'Dedaunan Kering & Ranting Halus'
      ]
    },
    anorganik: {
      rate: 300,
      unit: 'kg',
      items: [
        'Plastik PET (Botol Bening Bersih)',
        'Plastik HDPE (Botol Sabun / Shampo)',
        'Kardus & Kertas Dupleks',
        'Kertas HVS & Arsip Kantor',
        'Kaleng Alumunium & Seng'
      ]
    },
    b3: {
      rate: 800,
      unit: 'unit/kg',
      items: [
        'Baterai Kering Bekas (Alkaline/Lithium)',
        'Lampu Neon & CFL Bekas',
        'E-Waste (Kabel, Charger Rusak, PCB)',
        'Kemasan Bahan Kimia / Pestisida'
      ]
    }
  };

  // When category changes, update wasteType to first item
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setWasteType(categoryRates[newCat].items[0]);
  };

  const currentRate = categoryRates[category].rate;
  const estimatedPoints = Math.floor(weight * currentRate);
  const draftId = `DRAFT-DEP-${Math.floor(100 + Math.random() * 900)}`;

  const handleSubmit = (e) => {
    e.preventDefault();

    const created = addDeposit({
      category,
      type: wasteType,
      weight,
      points: estimatedPoints,
      location,
      notes
    });

    setSubmittedDeposit(created);
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav />

      <main style={{ padding: '2.5rem 0 4rem', flexGrow: 1, backgroundColor: 'var(--color-paper)' }}>
        <div className="container" style={{ maxWidth: '64rem' }}>
          {/* Header */}
          <div
            style={{
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}
          >
            <div>
              <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                FORMULIR PENYETORAN // EPS-F01
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Input Setoran Sampah Baru
              </h1>
            </div>
            <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
              Standard Digital Timbangan
            </span>
          </div>

          {isSubmitted ? (
            /* Success Receipt Modal / Card */
            <div
              style={{
                maxWidth: '32rem',
                margin: '2rem auto',
                backgroundColor: 'var(--color-surface)',
                border: '2px solid var(--color-ink)',
                padding: '2rem',
                boxShadow: '6px 6px 0px rgba(30, 33, 28, 0.15)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-organik)',
                    border: '1px solid var(--color-organik)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}
                >
                  ✓
                </div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Setoran Berhasil Diajukan</h2>
                <p className="font-mono text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Nota tanda terima siap diverifikasi petugas drop point
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="receipt-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <div className="font-mono" style={{ fontWeight: 700 }}>ECOPOINTS DIGITAL RECEIPT</div>
                  <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>NO: {submittedDeposit?.id}</div>
                </div>

                <ReceiptRow label="WAKTU INPUT" value={submittedDeposit?.date} />
                <ReceiptRow label="KATEGORI" value={submittedDeposit?.category.toUpperCase()} />
                <ReceiptRow label="JENIS SAMPAH" value={submittedDeposit?.type} />
                <ReceiptRow label="BERAT TERUKUR" value={`${submittedDeposit?.weight} KG`} />
                <ReceiptRow label="LOKASI" value={submittedDeposit?.location} />
                <ReceiptRow label="STATUS" value="MENUNGGU VALIDASI" />

                <ReceiptRow
                  label="ESTIMASI POIN"
                  value={`+${submittedDeposit?.points.toLocaleString('id-ID')}`}
                  unit="PTS"
                  isTotal={true}
                  highlight={true}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedDeposit(null);
                  }}
                  style={{ flex: 1 }}
                >
                  + Setor Lagi
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/deposits')}
                  style={{ flex: 1 }}
                >
                  Ke Riwayat Setoran →
                </Button>
              </div>
            </div>
          ) : (
            /* Main Form Grid (2 Columns: Form Left, Digital Scale & Receipt Right) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              {/* Form Input (Left) */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: '1.75rem'
                }}
              >
                <form onSubmit={handleSubmit}>
                  {/* Category Selection */}
                  <div className="form-group">
                    <label className="form-label">
                      1. Kategori Sampah
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        { id: 'organik', label: 'Organik', color: 'organik', rate: '50' },
                        { id: 'anorganik', label: 'Anorganik', color: 'anorganik', rate: '300' },
                        { id: 'b3', label: 'B3 / E-Waste', color: 'b3', rate: '800' }
                      ].map((cat) => {
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategoryChange(cat.id)}
                            style={{
                              padding: '0.625rem 0.5rem',
                              border: isSelected ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
                              backgroundColor: isSelected ? 'var(--color-ink)' : 'var(--color-paper)',
                              color: isSelected ? 'var(--color-paper)' : 'var(--color-ink)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            <CategoryDot type={cat.color} size={8} />
                            <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              {cat.label}
                            </span>
                            <span
                              className="font-mono"
                              style={{
                                fontSize: '0.625rem',
                                color: isSelected ? 'var(--color-poin-light)' : 'var(--color-ink-muted)'
                              }}
                            >
                              {cat.rate} pts/kg
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-item dropdown */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="wasteType">
                      2. Jenis Spesifik Sampah
                    </label>
                    <select
                      id="wasteType"
                      className="form-select"
                      value={wasteType}
                      onChange={(e) => setWasteType(e.target.value)}
                    >
                      {categoryRates[category].items.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weight Slider + Input (Digital Scale Style) */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        3. Berat Sampah (Kilogram)
                      </label>
                      <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                        {weight.toFixed(1)} KG
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.2"
                      max="30.0"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0.2)}
                      style={{ width: '100%', marginBottom: '0.75rem' }}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        className="form-input font-mono"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0.1)}
                        style={{ fontWeight: 700 }}
                      />
                      <span
                        className="font-mono"
                        style={{
                          padding: '0.625rem 1rem',
                          background: 'var(--color-paper)',
                          border: '1px solid var(--color-border)',
                          fontWeight: 600
                        }}
                      >
                        KG
                      </span>
                    </div>
                    <p className="form-hint">* Dapat disesuaikan kembali oleh timbangan fisik petugas di lokasi.</p>
                  </div>

                  {/* Location Drop Point */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      4. Lokasi Drop Point Tujuan
                    </label>
                    <select
                      id="location"
                      className="form-select"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="Drop Point RW 04 Kebayoran">Drop Point RW 04 Kebayoran (Balai Warga)</option>
                      <option value="Drop Point Utama Balai Warga">Drop Point Utama Balai Warga Kecamatan</option>
                      <option value="Unit Komposting Mandiri">Unit Komposting Mandiri TPS 3R</option>
                      <option value="Drop Point Stasiun MRT">Drop Point Stasiun MRT Bundaran HI</option>
                    </select>
                  </div>

                  {/* Optional Notes */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">
                      5. Catatan / Kondisi Barang (Opsional)
                    </label>
                    <input
                      id="notes"
                      type="text"
                      className="form-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Sudah dicuci bersih & dipipihkan"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Konfirmasi & Kirim Setoran →
                  </Button>
                </form>
              </div>

              {/* Digital Scale HUD & Realtime Receipt (Right) */}
              <div>
                {/* Scale Display Box */}
                <div
                  className="scale-hud"
                  style={{
                    marginBottom: '1.5rem',
                    boxShadow: '3px 3px 0px rgba(30, 33, 28, 0.1)'
                  }}
                >
                  <div className="scale-hud-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CategoryDot type={category} pulse={true} size={8} />
                      <span>SCALE CALIBRATION HUD</span>
                    </div>
                    <span className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>
                      {draftId}
                    </span>
                  </div>

                  <div className="scale-hud-body">
                    <div className="scale-hud-col">
                      <div className="scale-hud-label">BERAT TERUKUR</div>
                      <div className="scale-hud-value tabular-nums">
                        {weight.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>KG</span>
                      </div>
                    </div>
                    <div className="scale-hud-col">
                      <div className="scale-hud-label">ESTIMASI NILAI</div>
                      <div className="scale-hud-value tabular-nums text-poin">
                        +{estimatedPoints.toLocaleString('id-ID')}{' '}
                        <span style={{ fontSize: '1rem', fontWeight: 500 }}>PTS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt / Nota Style Box */}
                <div className="receipt-box">
                  <div
                    style={{
                      textAlign: 'center',
                      borderBottom: '1px dashed var(--color-border)',
                      paddingBottom: '0.5rem',
                      marginBottom: '0.875rem'
                    }}
                  >
                    <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      PRATINJAU NOTA SETORAN
                    </div>
                    <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>
                      SISTEM PENIMBANGAN ELEKTRONIK
                    </div>
                  </div>

                  <ReceiptRow label="KATEGORI" value={category.toUpperCase()} />
                  <ReceiptRow label="SUB-ITEM" value={wasteType} />
                  <ReceiptRow label="BERAT BERSIH" value={`${weight.toFixed(1)} KG`} />
                  <ReceiptRow label="TARIF SATUAN" value={`${currentRate} PTS / KG`} />
                  <ReceiptRow label="LOKASI" value={location} />

                  <ReceiptRow
                    label="TOTAL ESTIMASI"
                    value={`+${estimatedPoints.toLocaleString('id-ID')}`}
                    unit="PTS"
                    isTotal={true}
                    highlight={true}
                  />

                  <div
                    className="font-mono text-faint"
                    style={{ fontSize: '0.6875rem', marginTop: '1rem', lineHeight: 1.4, borderTop: '1px dotted var(--color-border)', paddingTop: '0.5rem' }}
                  >
                    * Nota digital ini akan diverifikasi ulang saat fisik sampah ditimbang di meja drop point oleh petugas terverifikasi.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
