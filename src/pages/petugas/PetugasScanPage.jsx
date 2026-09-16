import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { depositApi, adminApi } from '../../api/apiClient';
import AppNav from '../../components/layout/AppNav';
import Footer from '../../components/layout/Footer';
import StatusBadge from '../../components/ui/StatusBadge';

function getDepositId(value) {
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type === 'ecopoints-deposit') return Number(parsed.deposit_id);
  } catch {
    // Allow scanning a plain numeric ID as a fallback.
  }
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

export default function PetugasScanPage() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanError, setScanError] = useState('');
  const [deposit, setDeposit] = useState(null);
  const [scanItems, setScanItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [manualId, setManualId] = useState('');
  const [notes, setNotes] = useState('');
  const [actualWeight, setActualWeight] = useState('');

  const loadDeposit = async (rawValue) => {
    const id = getDepositId(rawValue);
    if (!id) {
      setScanError('QR tidak berisi ID setoran yang valid.');
      return;
    }

    setScanError('');
    setLoading(true);
    const result = await depositApi.getById(id);
    setLoading(false);
    if (!result.success || !result.data) {
      setDeposit(null);
      setScanItems([]);
      setScanError(result.error || 'Setoran tidak ditemukan.');
      return;
    }

    const d = result.data;
    setDeposit(d);
    setNotes('');

    if (Array.isArray(d.items) && d.items.length > 0) {
      setScanItems(d.items.map(it => ({
        id: it.id,
        waste_type_name: it.waste_type_name || it.waste_type?.name || 'Sampah',
        points_per_kg: it.points_per_kg || it.waste_type?.points_per_kg || 300,
        weight_kg: it.weight_kg,
        actualWeight: String(it.actual_weight_kg || it.weight_kg || '')
      })));
      setActualWeight('');
    } else {
      setScanItems([]);
      setActualWeight(d.weight_kg ? String(d.weight_kg) : '');
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode('petugas-qr-reader');
    scannerRef.current = scanner;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      async (decodedText) => {
        await scanner.stop().catch(() => {});
        await loadDeposit(decodedText);
      },
      () => {}
    ).catch(() => setScanError('Kamera tidak dapat dibuka. Izinkan akses kamera atau gunakan input ID manual.'));

    return () => {
      scanner.stop().catch(() => {});
      scanner.clear().catch(() => {});
    };
  }, []);

  const handleItemWeightChange = (index, val) => {
    setScanItems(prev => prev.map((item, idx) => idx === index ? { ...item, actualWeight: val } : item));
  };

  const updateStatus = async (status) => {
    if (!deposit || actionLoading) return;

    if (status === 'verified') {
      if (scanItems.length > 0) {
        for (const it of scanItems) {
          if (!it.actualWeight || Number(it.actualWeight) <= 0) {
            setScanError(`Masukkan berat aktual untuk ${it.waste_type_name}.`);
            return;
          }
        }
      } else if (!actualWeight || Number(actualWeight) <= 0) {
        setScanError('Masukkan berat aktual hasil timbangan sebelum verifikasi.');
        return;
      }
    }

    setActionLoading(true);
    let result;
    if (scanItems.length > 0) {
      const itemsPayload = scanItems.map(it => ({
        item_id: it.id,
        weight_kg: Number(it.actualWeight)
      }));
      result = await adminApi.updateDepositStatus(deposit.id, status, notes || undefined, undefined, itemsPayload);
    } else {
      result = await adminApi.updateDepositStatus(deposit.id, status, notes || undefined, actualWeight || undefined);
    }

    setActionLoading(false);
    if (!result.success) {
      setScanError(result.error || 'Status setoran gagal diperbarui.');
      return;
    }
    setDeposit(result.data);
    setScanError('');
  };

  const calculatedPoints = scanItems.length > 0
    ? scanItems.reduce((sum, it) => sum + Math.floor(Number(it.actualWeight || 0) * Number(it.points_per_kg || 0)), 0)
    : Math.floor(Number(actualWeight || 0) * Number(deposit?.waste_type?.points_per_kg || 500));

  const totalRegisteredWeight = deposit?.items?.length
    ? deposit.items.reduce((sum, it) => sum + Number(it.weight_kg || 0), 0)
    : Number(deposit?.total_weight_kg || deposit?.weight_kg || 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav />
      <main style={{ flex: 1, padding: '2.5rem 1rem', background: 'var(--color-paper)' }}>
        <div className="container-wide" style={{ maxWidth: '960px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="font-mono text-faint" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>PETUGAS DROP POINT // SCAN SETORAN</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>Scan QR Setoran</h1>
            <p className="text-muted">Scan QR yang ditampilkan user untuk menimbang dan memvalidasi setoran multi-item.</p>
          </div>

          {scanError && <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid #e5a39a', background: '#fff3f1', color: '#a63225' }}>{scanError}</div>}

          <div className="petugas-scan-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.25fr)', gap: '1.5rem', alignItems: 'start' }}>
            <section className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Arahkan kamera ke QR user</h2>
              <div id="petugas-qr-reader" style={{ width: '100%' }} />
              <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1rem', paddingTop: '1rem' }}>
                <label className="form-label">Atau masukkan ID setoran</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="form-input" value={manualId} onChange={e => setManualId(e.target.value)} placeholder="Contoh: 15" />
                  <button className="btn btn-secondary" onClick={() => loadDeposit(manualId)} disabled={loading}>Cari</button>
                </div>
              </div>
            </section>

            <section className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Detail Setoran & Timbangan</h2>
              {loading ? <p className="text-faint">Memuat setoran...</p> : !deposit ? <p className="text-faint">Belum ada QR yang dipindai.</p> : (
                <>
                  <div className="receipt-box" style={{ marginBottom: '1rem' }}>
                    <div className="receipt-row"><span className="receipt-row-label">ID</span><span className="receipt-row-dots" /><span className="receipt-row-value">#{deposit.id}</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">NASABAH</span><span className="receipt-row-dots" /><span className="receipt-row-value">{deposit.user?.name || deposit.user_name || '-'}</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">TOTAL BERAT AWAL</span><span className="receipt-row-dots" /><span className="receipt-row-value">{totalRegisteredWeight.toFixed(1)} kg</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">STATUS</span><span className="receipt-row-dots" /><span className="receipt-row-value"><StatusBadge status={deposit.status} /></span></div>

                    {/* Breakdown items */}
                    {deposit.items && deposit.items.length > 0 && (
                      <div style={{ borderTop: '1px dashed var(--color-border)', margin: '0.65rem 0', paddingTop: '0.65rem' }}>
                        <div className="font-mono text-faint" style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                          DAFTAR ITEM ({deposit.items.length} JENIS):
                        </div>
                        {deposit.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            <span>{idx + 1}. {it.waste_type_name || it.waste_type?.name}</span>
                            <span className="font-mono">{Number(it.actual_weight_kg || it.weight_kg || 0).toFixed(1)} kg</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="receipt-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span className="receipt-row-label" style={{ fontWeight: 700 }}>POIN HASIL</span>
                      <span className="receipt-row-dots" />
                      <span className="receipt-row-value text-poin" style={{ fontWeight: 800 }}>
                        {deposit.status === 'verified'
                          ? (deposit.earned_points || 0).toLocaleString('id-ID')
                          : calculatedPoints.toLocaleString('id-ID')} pts
                      </span>
                    </div>
                  </div>

                  {deposit.status === 'pending' ? (
                    <>
                      {scanItems.length > 0 ? (
                        <div style={{ marginBottom: '1rem' }}>
                          <label className="form-label" style={{ fontWeight: 700 }}>
                            Berat Aktual Hasil Timbangan Fisik
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {scanItems.map((item, idx) => (
                              <div
                                key={item.id || idx}
                                style={{
                                  padding: '0.65rem',
                                  border: '1px solid var(--color-border)',
                                  background: 'var(--color-surface)'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                  <strong>{idx + 1}. {item.waste_type_name}</strong>
                                  <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                                    {item.points_per_kg} pts/kg
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input
                                    className="form-input font-mono"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={item.actualWeight}
                                    onChange={e => handleItemWeightChange(idx, e.target.value)}
                                    placeholder="Berat (kg)"
                                    style={{ fontWeight: 700 }}
                                    required
                                  />
                                  <span className="font-mono text-faint" style={{ fontSize: '0.8rem' }}>KG</span>
                                  <span className="font-mono text-poin" style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: 'auto' }}>
                                    +{Math.floor(Number(item.actualWeight || 0) * Number(item.points_per_kg || 0)).toLocaleString('id-ID')} pts
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: '1rem' }}>
                          <label className="form-label">Berat aktual setelah ditimbang (kg)</label>
                          <input
                            className="form-input font-mono"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={actualWeight}
                            onChange={e => setActualWeight(e.target.value)}
                            style={{ fontWeight: 700 }}
                          />
                        </div>
                      )}

                      <label className="form-label">Catatan petugas (opsional)</label>
                      <textarea className="form-textarea" rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan verifikasi atau alasan penolakan" />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => updateStatus('verified')} disabled={actionLoading} style={{ flex: 1 }}>{actionLoading ? 'Memproses...' : 'Verifikasi'}</button>
                        <button className="btn btn-danger" onClick={() => updateStatus('rejected')} disabled={actionLoading} style={{ flex: 1 }}>Tolak</button>
                      </div>
                    </>
                  ) : <p className="text-faint" style={{ marginTop: '1rem' }}>Setoran ini sudah diproses ({deposit.status}).</p>}
                </>
              )}
            </section>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1.5rem' }}>Kembali ke Dashboard</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
