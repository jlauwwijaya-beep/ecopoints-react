import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import CategoryDot from '../components/ui/CategoryDot';
import ReceiptRow from '../components/ui/ReceiptRow';
import { QRCodeSVG } from 'qrcode.react';

export default function DepositsCreatePage() {
  const navigate = useNavigate();
  const { addDeposit, wasteTypes, dropPoints, apiConnected } = useAuth();

  const [category, setCategory] = useState('anorganik');
  const [selectedWasteType, setSelectedWasteType] = useState(null); // { id, name, points_per_kg }
  const [selectedDropPoint, setSelectedDropPoint] = useState(null); // { id, name }
  const [weight, setWeight] = useState(3.5);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDeposit, setSubmittedDeposit] = useState(null);

  // Category classification for API waste types
  const classifyCategory = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('organik') || lower.includes('kompos') || lower.includes('jelantah')) return 'organik';
    if (lower.includes('e-waste') || lower.includes('elektronik') || lower.includes('baterai') || lower.includes('b3') || lower.includes('minyak')) return 'b3';
    return 'anorganik';
  };

  // Static fallback category rates (used when API is offline)
  const fallbackRates = {
    organik: { rate: 50, items: ['Kompos & Sisa Sayur Dapur Organik', 'Kulit Buah & Ampas Kopi/Teh', 'Dedaunan Kering'] },
    anorganik: { rate: 300, items: ['Plastik PET (Botol Bening Bersih)', 'Kardus & Kertas Dupleks', 'Kaleng Alumunium & Seng'] },
    b3: { rate: 800, items: ['Baterai Kering Bekas', 'E-Waste (Kabel, Charger Rusak, PCB)'] }
  };

  // Filtered waste types from API based on selected category
  const filteredWasteTypes = useMemo(() => {
    if (wasteTypes && wasteTypes.length > 0) {
      const seenNames = new Set();
      return wasteTypes.filter((wt) => {
        if (classifyCategory(wt.name) !== category || wt.is_active === false) return false;
        const normalizedName = (wt.name || '').trim().toLowerCase();
        if (seenNames.has(normalizedName)) return false;
        seenNames.add(normalizedName);
        return true;
      });
    }
    return [];
  }, [wasteTypes, category]);

  const currentPointsPerKg = selectedWasteType
    ? selectedWasteType.points_per_kg
    : (filteredWasteTypes[0]?.points_per_kg || fallbackRates[category]?.rate || 300);

  const currentWasteTypeName = selectedWasteType?.name || filteredWasteTypes[0]?.name || fallbackRates[category]?.items[0] || 'Sampah Terpilah';
  const currentLocation = selectedDropPoint?.name || dropPoints[0]?.name || 'Drop Point EcoPoints Pusat';

  const estimatedPoints = Math.floor(weight * currentPointsPerKg);
  const draftId = `DRAFT-DEP-${Math.floor(100 + Math.random() * 900)}`;

  const qrValue = submittedDeposit?.rawId
    ? JSON.stringify({ type: 'ecopoints-deposit', deposit_id: submittedDeposit.rawId })
    : '';

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setSelectedWasteType(null); // reset when category changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const activeWasteType = selectedWasteType || filteredWasteTypes[0];
    const wasteTypeId = activeWasteType?.id || null;
    const wasteTypeName = activeWasteType?.name || fallbackRates[category]?.items[0] || 'Sampah Terpilah';
    const dropPointId = selectedDropPoint?.id || (dropPoints[0]?.id || null);
    const dropPointName = selectedDropPoint?.name || (dropPoints[0]?.name || 'Drop Point EcoPoints Pusat');

    const result = await addDeposit({
      category,
      type: wasteTypeName,
      waste_type_id: wasteTypeId,
      drop_point_id: dropPointId,
      location: dropPointName,
      weight,
      points: estimatedPoints,
      notes
    });

    const item = result?.data || result;
    setSubmittedDeposit(item);
    setIsSubmitting(false);
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

              {qrValue && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'inline-block', padding: '0.75rem', background: '#fff', border: '1px solid var(--color-border)' }}>
                    <QRCodeSVG value={qrValue} size={180} level="M" includeMargin />
                  </div>
                  <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>
                    TUNJUKKAN QR INI KEPADA PETUGAS DROP POINT
                  </div>
                </div>
              )}

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
              className="deposit-form-layout"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
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
                    <div className="deposit-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        { id: 'organik', label: 'Organik', color: 'organik' },
                        { id: 'anorganik', label: 'Anorganik', color: 'anorganik' },
                        { id: 'b3', label: 'B3 / E-Waste', color: 'b3' }
                      ].map((cat) => {
                        const isSelected = category === cat.id;
                        // Get rate to display from API or fallback
                        const catWasteTypes = wasteTypes?.filter(wt => classifyCategory(wt.name) === cat.id) || [];
                        const displayRate = catWasteTypes.length > 0
                          ? Math.round(catWasteTypes.reduce((sum, wt) => sum + wt.points_per_kg, 0) / catWasteTypes.length)
                          : fallbackRates[cat.id]?.rate || 300;
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
                              ~{displayRate} pts/kg
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-item dropdown - dynamic from API or fallback */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="wasteType">
                      2. Jenis Spesifik Sampah
                      {apiConnected && <span style={{ fontSize: '0.6875rem', color: '#16a34a', marginLeft: 6 }}>● Dari Database</span>}
                    </label>
                    <select
                      id="wasteType"
                      className="form-select"
                      value={selectedWasteType?.id || filteredWasteTypes[0]?.id || ''}
                      onChange={(e) => {
                        const found = filteredWasteTypes.find(wt => String(wt.id) === String(e.target.value));
                        setSelectedWasteType(found || null);
                      }}
                    >
                      {filteredWasteTypes.length > 0
                        ? filteredWasteTypes.map((wt) => (
                            <option key={wt.id} value={wt.id}>
                              {wt.name} ({wt.points_per_kg} pts/kg)
                            </option>
                          ))
                        : fallbackRates[category]?.items.map((item, idx) => (
                            <option key={idx} value={''}>
                              {item}
                            </option>
                          ))
                      }
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

                  {/* Location Drop Point - dynamic from API or fallback */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      4. Lokasi Drop Point Tujuan
                      {apiConnected && <span style={{ fontSize: '0.6875rem', color: '#16a34a', marginLeft: 6 }}>● Dari Database</span>}
                    </label>
                    <select
                      id="location"
                      className="form-select"
                      value={selectedDropPoint?.id || ''}
                      onChange={(e) => {
                        const found = dropPoints.find(dp => String(dp.id) === String(e.target.value));
                        setSelectedDropPoint(found || null);
                      }}
                    >
                      {dropPoints.length > 0
                        ? dropPoints.map((dp) => (
                            <option key={dp.id} value={dp.id}>
                              {dp.name} – {dp.address?.substring(0, 40)}{dp.address?.length > 40 ? '...' : ''}
                            </option>
                          ))
                        : (
                          <>
                            <option value="">Drop Point EcoPoints Pusat – Jl. Sudirman, Jakarta</option>
                            <option value="">Drop Point EcoPoints Jakarta Selatan – Cilandak</option>
                          </>
                        )
                      }
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
                    disabled={isSubmitting}
                    style={{ width: '100%', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Konfirmasi & Kirim Setoran →'}
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
                  <ReceiptRow label="SUB-ITEM" value={currentWasteTypeName} />
                  <ReceiptRow label="BERAT BERSIH" value={`${weight.toFixed(1)} KG`} />
                  <ReceiptRow label="TARIF SATUAN" value={`${currentPointsPerKg} PTS / KG`} />
                  <ReceiptRow label="LOKASI" value={currentLocation} />

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
