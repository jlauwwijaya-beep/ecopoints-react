import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import CategoryDot from '../components/ui/CategoryDot';
import ReceiptRow from '../components/ui/ReceiptRow';

export default function DepositsCreatePage() {
  const navigate = useNavigate();
  const { addDeposit, wasteTypes, dropPoints, apiConnected } = useAuth();

  // Helper to categorize waste types
  const classifyCategory = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('organik') || lower.includes('kompos') || lower.includes('jelantah')) return 'organik';
    if (lower.includes('e-waste') || lower.includes('elektronik') || lower.includes('baterai') || lower.includes('b3') || lower.includes('minyak')) return 'b3';
    return 'anorganik';
  };

  // Fallback rates
  const fallbackRates = useMemo(() => ({
    organik: { rate: 50, items: ['Kompos & Sisa Sayur Dapur Organik', 'Kulit Buah & Ampas Kopi/Teh', 'Dedaunan Kering'] },
    anorganik: { rate: 300, items: ['Plastik PET (Botol Bening Bersih)', 'Kardus & Kertas Dupleks', 'Kaleng Alumunium & Seng'] },
    b3: { rate: 800, items: ['Baterai Kering Bekas', 'E-Waste (Kabel, Charger Rusak, PCB)'] }
  }), []);

  // Filter available waste types by category
  const getCategoryWasteTypes = (cat) => {
    if (wasteTypes && wasteTypes.length > 0) {
      return wasteTypes.filter(wt => classifyCategory(wt.name) === cat && wt.is_active !== false);
    }
    return [];
  };

  // Default initial item
  const createDefaultItem = (tempId, cat = 'anorganik') => {
    const list = getCategoryWasteTypes(cat);
    const firstType = list[0];
    return {
      tempId,
      category: cat,
      wasteTypeId: firstType ? firstType.id : null,
      wasteTypeName: firstType ? firstType.name : (fallbackRates[cat]?.items[0] || 'Sampah'),
      pointsPerKg: firstType ? firstType.points_per_kg : (fallbackRates[cat]?.rate || 300),
      weight: 1.0,
    };
  };

  const [items, setItems] = useState([
    {
      tempId: 1,
      category: 'anorganik',
      wasteTypeId: null,
      wasteTypeName: '',
      pointsPerKg: 300,
      weight: 1.0,
    }
  ]);

  // Synchronize initial item with loaded waste types once available
  React.useEffect(() => {
    if (wasteTypes && wasteTypes.length > 0) {
      setItems(prevItems => prevItems.map(item => {
        if (item.wasteTypeId) return item;
        const list = getCategoryWasteTypes(item.category);
        const firstType = list[0] || wasteTypes[0];
        return {
          ...item,
          wasteTypeId: firstType.id,
          wasteTypeName: firstType.name,
          pointsPerKg: firstType.points_per_kg
        };
      }));
    }
  }, [wasteTypes]);

  const [selectedDropPoint, setSelectedDropPoint] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDeposit, setSubmittedDeposit] = useState(null);

  // Calculations
  const totalWeight = useMemo(() => {
    return items.reduce((sum, it) => sum + (parseFloat(it.weight) || 0), 0);
  }, [items]);

  const totalEstimatedPoints = useMemo(() => {
    return items.reduce((sum, it) => {
      const w = parseFloat(it.weight) || 0;
      const rate = Number(it.pointsPerKg) || 0;
      return sum + Math.floor(w * rate);
    }, 0);
  }, [items]);

  const currentLocation = selectedDropPoint?.name || dropPoints[0]?.name || 'Drop Point EcoPoints Pusat';

  // Item handlers
  const handleAddItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map(it => it.tempId)) + 1 : 1;
    setItems(prev => [...prev, createDefaultItem(nextId, 'anorganik')]);
  };

  const handleRemoveItem = (tempId) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.tempId !== tempId));
  };

  const handleItemCategoryChange = (tempId, newCat) => {
    const list = getCategoryWasteTypes(newCat);
    const firstType = list[0];
    setItems(prev => prev.map(it => {
      if (it.tempId !== tempId) return it;
      return {
        ...it,
        category: newCat,
        wasteTypeId: firstType ? firstType.id : null,
        wasteTypeName: firstType ? firstType.name : (fallbackRates[newCat]?.items[0] || 'Sampah'),
        pointsPerKg: firstType ? firstType.points_per_kg : (fallbackRates[newCat]?.rate || 300)
      };
    }));
  };

  const handleItemWasteTypeChange = (tempId, wasteTypeId) => {
    const found = wasteTypes?.find(wt => String(wt.id) === String(wasteTypeId));
    setItems(prev => prev.map(it => {
      if (it.tempId !== tempId) return it;
      return {
        ...it,
        wasteTypeId: found ? found.id : null,
        wasteTypeName: found ? found.name : it.wasteTypeName,
        pointsPerKg: found ? found.points_per_kg : it.pointsPerKg
      };
    }));
  };

  const handleItemWeightChange = (tempId, val) => {
    let weightVal = parseFloat(val);
    if (isNaN(weightVal)) weightVal = 0;
    if (weightVal < 0) weightVal = 0.1;
    if (weightVal > 100) weightVal = 100;
    setItems(prev => prev.map(it => it.tempId === tempId ? { ...it, weight: weightVal } : it));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.weight || it.weight <= 0) {
        alert(`Berat sampah pada Item #${i + 1} harus lebih dari 0 kg!`);
        return;
      }
      if (it.weight > 100) {
        alert(`Berat sampah pada Item #${i + 1} maksimal 100 kg!`);
        return;
      }
    }

    setIsSubmitting(true);

    const dropPointId = selectedDropPoint?.id || (dropPoints[0]?.id || null);
    const dropPointName = selectedDropPoint?.name || (dropPoints[0]?.name || 'Drop Point EcoPoints Pusat');

    const depositPayload = {
      category: items[0].category,
      type: items.length > 1 ? `${items[0].wasteTypeName} (+${items.length - 1} jenis lain)` : items[0].wasteTypeName,
      drop_point_id: dropPointId,
      location: dropPointName,
      weight: totalWeight,
      points: totalEstimatedPoints,
      notes,
      items: items.map(it => ({
        waste_type_id: it.wasteTypeId || 1,
        waste_type_name: it.wasteTypeName,
        weight_kg: it.weight,
        points_per_kg: it.pointsPerKg
      }))
    };

    const result = await addDeposit(depositPayload);
    const item = result?.data || result;
    setSubmittedDeposit({
      ...item,
      items: item?.items?.length ? item.items : items.map(it => ({
        waste_type_name: it.wasteTypeName,
        weight_kg: it.weight,
        points_per_kg: it.pointsPerKg,
        points_earned: Math.floor(it.weight * it.pointsPerKg)
      }))
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav />

      <main style={{ padding: '2.5rem 0 4rem', flexGrow: 1, backgroundColor: 'var(--color-paper)' }}>
        <div className="container" style={{ maxWidth: '68rem' }}>
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
                FORMULIR PENYETORAN MULTI-ITEM
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Input Setoran Sampah Baru
              </h1>
            </div>
            <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
              Standard Digital Timbangan • 1 Transaksi Banyak Sampah
            </span>
          </div>

          {isSubmitted ? (
            /* Success Receipt Modal / Card */
            <div
              style={{
                maxWidth: '36rem',
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
                    width: 48,
                    height: 48,
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
                  OK
                </div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Setoran Berhasil Diajukan</h2>
                <p className="font-mono text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Nota digital siap diverifikasi dan ditimbang petugas drop point
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="receipt-box" style={{ marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <div className="font-mono" style={{ fontWeight: 700 }}>ECOPOINTS DIGITAL RECEIPT</div>
                  <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>NO: {submittedDeposit?.id}</div>
                </div>

                <ReceiptRow label="WAKTU INPUT" value={submittedDeposit?.date} />
                <ReceiptRow label="LOKASI" value={submittedDeposit?.location} />
                <ReceiptRow label="STATUS" value="MENUNGGU VALIDASI" />

                <div style={{ borderTop: '1px dashed var(--color-border)', margin: '0.75rem 0', paddingTop: '0.75rem' }}>
                  <div className="font-mono text-faint" style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    RINCIAN ITEM ({submittedDeposit?.items?.length || 1} JENIS):
                  </div>
                  {(submittedDeposit?.items || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <span>{idx + 1}. {it.waste_type_name || it.waste_type?.name || 'Sampah'} ({Number(it.weight_kg || it.weight || 0).toFixed(1)} kg)</span>
                      <span className="font-mono text-poin" style={{ fontWeight: 600 }}>
                        +{((it.points_earned || it.earned_points || (Number(it.weight_kg || 0) * (it.points_per_kg || 300)))).toLocaleString('id-ID')} pts
                      </span>
                    </div>
                  ))}
                </div>

                <ReceiptRow label="TOTAL BERAT" value={`${submittedDeposit?.weight} KG`} />
                <ReceiptRow
                  label="TOTAL ESTIMASI POIN"
                  value={`+${submittedDeposit?.points?.toLocaleString('id-ID')}`}
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
                    setItems([createDefaultItem(1, 'anorganik')]);
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
                  Ke Riwayat Setoran
                </Button>
              </div>
            </div>
          ) : (
            /* Main Form Grid (2 Columns: Multi-Item Form Left, HUD & Summary Right) */
            <div
              className="deposit-form-layout"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Daftar Sampah yang Disetor</h2>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                      {items.length} Jenis Sampah
                    </span>
                  </div>

                  {/* Multi-Item Card List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {items.map((item, index) => {
                      const catWasteTypes = getCategoryWasteTypes(item.category);
                      return (
                        <div
                          key={item.tempId}
                          style={{
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-paper)',
                            padding: '1.25rem',
                            position: 'relative'
                          }}
                        >
                          {/* Item Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span
                                style={{
                                  background: 'var(--color-ink)',
                                  color: 'var(--color-paper)',
                                  fontSize: '0.6875rem',
                                  fontWeight: 800,
                                  fontFamily: 'var(--font-mono)',
                                  padding: '0.15rem 0.45rem'
                                }}
                              >
                                #{index + 1}
                              </span>
                              <strong style={{ fontSize: '0.9rem' }}>
                                {item.wasteTypeName || 'Pilih Sampah'}
                              </strong>
                            </div>

                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.tempId)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Hapus
                              </button>
                            )}
                          </div>

                          {/* Category Selection for this Item */}
                          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Kategori Sampah</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                              {[
                                { id: 'organik', label: 'Organik', color: 'organik' },
                                { id: 'anorganik', label: 'Anorganik', color: 'anorganik' },
                                { id: 'b3', label: 'B3 / E-Waste', color: 'b3' }
                              ].map((cat) => {
                                const isSelected = item.category === cat.id;
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleItemCategoryChange(item.tempId, cat.id)}
                                    style={{
                                      padding: '0.45rem 0.35rem',
                                      border: isSelected ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
                                      backgroundColor: isSelected ? 'var(--color-ink)' : 'var(--color-surface)',
                                      color: isSelected ? 'var(--color-paper)' : 'var(--color-ink)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.35rem',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <CategoryDot type={cat.color} size={6} />
                                    <span>{cat.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Waste Type Dropdown */}
                          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Jenis Sampah</label>
                            <select
                              className="form-select"
                              value={item.wasteTypeId || ''}
                              onChange={(e) => handleItemWasteTypeChange(item.tempId, e.target.value)}
                              style={{ fontSize: '0.85rem' }}
                            >
                              {catWasteTypes.length > 0
                                ? catWasteTypes.map((wt) => (
                                    <option key={wt.id} value={wt.id}>
                                      {wt.name} ({wt.points_per_kg} pts/kg)
                                    </option>
                                  ))
                                : (fallbackRates[item.category]?.items || []).map((name, idx) => (
                                    <option key={idx} value={''}>
                                      {name}
                                    </option>
                                  ))
                              }
                            </select>
                          </div>

                          {/* Weight Slider & Input */}
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>Berat Sampah</label>
                              <span className="font-mono text-poin" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                +{Math.floor(item.weight * item.pointsPerKg).toLocaleString('id-ID')} PTS
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="100"
                                className="form-input font-mono"
                                value={item.weight}
                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                onChange={(e) => handleItemWeightChange(item.tempId, e.target.value)}
                                style={{ fontWeight: 700, width: '120px' }}
                              />
                              <span className="font-mono text-faint" style={{ fontSize: '0.8rem', fontWeight: 600 }}>KG</span>
                              <input
                                type="range"
                                min="0.1"
                                max="20.0"
                                step="0.1"
                                value={item.weight}
                                onChange={(e) => handleItemWeightChange(item.tempId, e.target.value)}
                                style={{ flex: 1 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add More Waste Type Button */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="btn btn-secondary"
                      style={{ width: '100%', borderStyle: 'dashed', padding: '0.75rem', fontWeight: 700 }}
                    >
                      + Tambah Jenis Sampah Lain
                    </button>
                  </div>

                  {/* Drop Point Location */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">
                      Lokasi Drop Point Tujuan
                      {apiConnected && <span style={{ fontSize: '0.6875rem', color: '#16a34a', marginLeft: 6 }}>Database Terhubung</span>}
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
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      id="notes"
                      type="text"
                      className="form-input"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Plastik sudah dipilah & dibersihkan"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    style={{ width: '100%', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? 'Mengirim...' : `Kirim Setoran (${items.length} Jenis • ${totalWeight.toFixed(1)} KG)`}
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
                      <CategoryDot type="anorganik" pulse={true} size={8} />
                      <span>SCALE CALIBRATION HUD // MULTI-ITEM</span>
                    </div>
                  </div>

                  <div className="scale-hud-body">
                    <div className="scale-hud-col">
                      <div className="scale-hud-label">TOTAL BERAT</div>
                      <div className="scale-hud-value tabular-nums">
                        {totalWeight.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>KG</span>
                      </div>
                    </div>
                    <div className="scale-hud-col">
                      <div className="scale-hud-label">TOTAL ESTIMASI</div>
                      <div className="scale-hud-value tabular-nums text-poin">
                        +{totalEstimatedPoints.toLocaleString('id-ID')}{' '}
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
                      SISTEM PENIMBANGAN ELEKTRONIK ({items.length} ITEM)
                    </div>
                  </div>

                  <ReceiptRow label="LOKASI DROP" value={currentLocation} />

                  <div style={{ borderTop: '1px dashed var(--color-border)', margin: '0.75rem 0', paddingTop: '0.75rem' }}>
                    <div className="font-mono text-faint" style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      ITEM DISERAHKAN:
                    </div>
                    {items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                        <div>
                          <span className="font-mono" style={{ fontWeight: 600 }}>{idx + 1}. {it.wasteTypeName}</span>
                          <span className="text-faint font-mono" style={{ fontSize: '0.7rem', marginLeft: '0.35rem' }}>
                            ({it.weight.toFixed(1)} kg @ {it.pointsPerKg} pts)
                          </span>
                        </div>
                        <span className="font-mono text-poin" style={{ fontWeight: 700 }}>
                          +{Math.floor(it.weight * it.pointsPerKg).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ReceiptRow label="TOTAL BERAT" value={`${totalWeight.toFixed(1)} KG`} />

                  <ReceiptRow
                    label="TOTAL ESTIMASI"
                    value={`+${totalEstimatedPoints.toLocaleString('id-ID')}`}
                    unit="PTS"
                    isTotal={true}
                    highlight={true}
                  />

                  <div
                    className="font-mono text-faint"
                    style={{ fontSize: '0.6875rem', marginTop: '1rem', lineHeight: 1.4, borderTop: '1px dotted var(--color-border)', paddingTop: '0.5rem' }}
                  >
                    * Nota digital ini akan diverifikasi dan ditimbang per item oleh petugas di lokasi drop point.
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
