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
      setScanError(result.error || 'Setoran tidak ditemukan.');
      return;
    }
    setDeposit(result.data);
    setNotes('');
    setActualWeight(result.data?.weight_kg ? String(result.data.weight_kg) : '');
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

  const updateStatus = async (status) => {
    if (!deposit || actionLoading) return;
    if (status === 'verified' && (!actualWeight || Number(actualWeight) <= 0)) {
      setScanError('Masukkan berat aktual hasil timbangan sebelum verifikasi.');
      return;
    }
    setActionLoading(true);
    const result = await adminApi.updateDepositStatus(deposit.id, status, notes || undefined, actualWeight || undefined);
    setActionLoading(false);
    if (!result.success) {
      setScanError(result.error || 'Status setoran gagal diperbarui.');
      return;
    }
    setDeposit(result.data);
    setScanError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav />
      <main style={{ flex: 1, padding: '2.5rem 1rem', background: 'var(--color-paper)' }}>
        <div className="container-wide" style={{ maxWidth: '900px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="font-mono text-faint" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>PETUGAS DROP POINT // SCAN SETORAN</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>Scan QR Setoran</h1>
            <p className="text-muted">Scan QR yang ditampilkan user untuk memeriksa dan memvalidasi setoran.</p>
          </div>

          {scanError && <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid #e5a39a', background: '#fff3f1', color: '#a63225' }}>{scanError}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
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
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Detail Setoran</h2>
              {loading ? <p className="text-faint">Memuat setoran...</p> : !deposit ? <p className="text-faint">Belum ada QR yang dipindai.</p> : (
                <>
                  <div className="receipt-box" style={{ marginBottom: '1rem' }}>
                    <div className="receipt-row"><span className="receipt-row-label">ID</span><span className="receipt-row-dots" /><span className="receipt-row-value">#{deposit.id}</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">NASABAH</span><span className="receipt-row-dots" /><span className="receipt-row-value">{deposit.user?.name || '-'}</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">SAMPAH</span><span className="receipt-row-dots" /><span className="receipt-row-value">{deposit.waste_type?.name || '-'}</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">BERAT</span><span className="receipt-row-dots" /><span className="receipt-row-value">{Number(deposit.weight_kg || 0).toFixed(1)} kg</span></div>
                    <div className="receipt-row"><span className="receipt-row-label">STATUS</span><span className="receipt-row-dots" /><span className="receipt-row-value"><StatusBadge status={deposit.status} /></span></div>
                    <div className="receipt-row"><span className="receipt-row-label">POIN</span><span className="receipt-row-dots" /><span className="receipt-row-value">{Math.floor(Number(actualWeight || 0) * Number(deposit.waste_type?.points_per_kg || 500)).toLocaleString('id-ID')} pts</span></div>
                  </div>
                  {deposit.status === 'pending' ? (
                    <>
                      <label className="form-label">Berat aktual setelah ditimbang (kg)</label>
                      <input className="form-input" type="number" min="0.01" step="0.01" value={actualWeight} onChange={e => setActualWeight(e.target.value)} />
                      <p className="form-hint">Poin akan dihitung berdasarkan berat aktual ini.</p>
                      <label className="form-label">Catatan petugas (opsional)</label>
                      <textarea className="form-textarea" rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan verifikasi atau alasan penolakan" />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => updateStatus('verified')} disabled={actionLoading} style={{ flex: 1 }}>{actionLoading ? 'Memproses...' : 'Verifikasi'}</button>
                        <button className="btn btn-danger" onClick={() => updateStatus('rejected')} disabled={actionLoading} style={{ flex: 1 }}>Tolak</button>
                      </div>
                    </>
                  ) : <p className="text-faint" style={{ marginTop: '1rem' }}>Setoran ini sudah diproses.</p>}
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
