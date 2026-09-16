import React, { useState, useEffect, useCallback } from 'react';
import { depositApi, adminApi } from '../../api/apiClient';
import AdminNav from '../../components/layout/AdminNav';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modal, setModal] = useState(null); // { deposit, action: 'verify'|'reject' }
  const [notes, setNotes] = useState('');
  const [actualWeight, setActualWeight] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDeposits = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await depositApi.getAll();
    if (res.success && Array.isArray(res.data)) {
      setDeposits(res.data);
    } else if (!res.success) {
      setError(res.error || 'Data setoran tidak dapat dimuat.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadDeposits(); }, [loadDeposits]);

  // Filter gabungan: Status, Pencarian Ketikan, dan Rentang Tanggal
  const filtered = deposits.filter((d) => {
    // 1. Filter Status
    if (filter !== 'all' && d.status !== filter) {
      return false;
    }

    // 2. Pencarian Ketikan (ID, Kode, Nasabah, Email, Jenis Sampah, Drop Point, Catatan)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const idMatch = String(d.id || '').toLowerCase().includes(q);
      const codeMatch = String(d.code || '').toLowerCase().includes(q);
      const userMatch = String(d.user_name || d.user?.name || '').toLowerCase().includes(q);
      const emailMatch = String(d.user?.email || '').toLowerCase().includes(q);
      const wasteMatch = String(d.waste_type_name || d.waste_type?.name || '').toLowerCase().includes(q);
      const dropMatch = String(d.drop_point_name || d.drop_point?.name || '').toLowerCase().includes(q);
      const notesMatch = String(d.notes || '').toLowerCase().includes(q);

      if (!idMatch && !codeMatch && !userMatch && !emailMatch && !wasteMatch && !dropMatch && !notesMatch) {
        return false;
      }
    }

    // 3. Pencarian Berdasarkan Tanggal
    if (startDate || endDate) {
      const dateVal = d.created_at || d.CreatedAt;
      if (!dateVal) return false;
      const itemDate = new Date(dateVal);
      if (Number.isNaN(itemDate.getTime())) return false;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
    }

    return true;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || startDate !== '' || endDate !== '' || filter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilter('all');
  };

  const handleAction = async () => {
    if (!modal) return;
    if (modal.action === 'verify' && (!actualWeight || Number(actualWeight) <= 0)) {
      setError('Masukkan berat aktual hasil timbangan sebelum verifikasi.');
      return;
    }
    setActionLoading(true);
    const status = modal.action === 'verify' ? 'verified' : 'rejected';
    const res = await adminApi.updateDepositStatus(modal.deposit.id, status, notes || undefined, actualWeight || undefined);
    if (res.success) {
      await loadDeposits();
      setModal(null);
      setNotes('');
      setActualWeight('');
    } else {
      setError(res.error || 'Status setoran gagal diperbarui.');
    }
    setActionLoading(false);
  };

  const statusBadge = (s) => {
    const map = {
      pending: { cls: 'badge-pending', label: 'PENDING' },
      verified: { cls: 'badge-verified', label: 'VERIFIED' },
      rejected: { cls: 'badge-rejected', label: 'REJECTED' }
    };
    const m = map[s] || map.pending;
    return <span className={`badge ${m.cls}`}>{m.label}</span>;
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <AdminNav />
      <main className="container-wide admin-page-content" style={{ padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--color-primary)', color: 'var(--color-paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.75rem', fontFamily: 'var(--font-mono)'
            }}>DEP</div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Manajemen Setoran</h1>
              <p className="text-faint font-mono" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Verifikasi & kelola setoran nasabah
              </p>
            </div>
          </div>
        </div>

        {error && <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid #e5a39a', background: '#fff3f1', color: '#a63225' }}>{error}</div>}

        {/* Panel Pencarian & Filter */}
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end'
            }}
          >
            {/* Input Pencarian Ketikan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label
                className="font-mono text-faint"
                style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
              >
                Pencarian Ketikan
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, nasabah, jenis, lokasi..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 2rem 0.6rem 0.75rem',
                    fontSize: '0.85rem',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#fff',
                    borderRadius: 0
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      padding: '0.2rem 0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-ink-faint)',
                      fontWeight: 700
                    }}
                    title="Hapus ketikan"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dari Tanggal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label
                className="font-mono text-faint"
                style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
              >
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff',
                  borderRadius: 0
                }}
              />
            </div>

            {/* Filter Sampai Tanggal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label
                className="font-mono text-faint"
                style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
              >
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff',
                  borderRadius: 0
                }}
              />
            </div>

            {/* Tombol Reset Filter */}
            <div>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', height: '39px' }}
                >
                  Reset Filter
                </button>
              ) : (
                <div style={{ height: '39px', display: 'flex', alignItems: 'center' }}>
                  <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                    Total: <strong>{deposits.length}</strong> setoran
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Keterangan Filter Aktif */}
          {hasActiveFilters && (
            <div
              style={{
                marginTop: '0.85rem',
                paddingTop: '0.75rem',
                borderTop: '1px dashed var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.75rem'
              }}
            >
              <span className="font-mono text-faint">
                Menampilkan <strong>{filtered.length}</strong> dari <strong>{deposits.length}</strong> setoran
                {searchQuery && <> · Kata kunci: <em>"{searchQuery}"</em></>}
                {startDate && <> · Mulai: <strong>{startDate}</strong></>}
                {endDate && <> · Sampai: <strong>{endDate}</strong></>}
                {filter !== 'all' && <> · Status: <strong>{filter.toUpperCase()}</strong></>}
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs Status */}
        <div style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
          borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'Semua', count: deposits.length },
            { key: 'pending', label: 'Pending', count: deposits.filter(d => d.status === 'pending').length },
            { key: 'verified', label: 'Verified', count: deposits.filter(d => d.status === 'verified').length },
            { key: 'rejected', label: 'Rejected', count: deposits.filter(d => d.status === 'rejected').length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="btn btn-sm"
              style={{
                background: filter === f.key ? 'var(--color-ink)' : 'transparent',
                color: filter === f.key ? 'var(--color-paper)' : 'var(--color-ink-muted)',
                border: filter === f.key ? '1px solid var(--color-ink)' : '1px solid var(--color-border)',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink-faint)' }}>
            <div className="font-mono">Memuat data setoran...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="font-mono text-faint">
              {hasActiveFilters ? 'Tidak ada data setoran yang cocok dengan filter atau pencarian Anda.' : 'Tidak ada data setoran.'}
            </span>
            {hasActiveFilters && (
              <div style={{ marginTop: '1rem' }}>
                <button type="button" onClick={resetAllFilters} className="btn btn-sm btn-secondary">
                  Bersihkan Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="data-table-container fade-in">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nasabah</th>
                  <th>Jenis Sampah</th>
                  <th>Berat (kg)</th>
                  <th>Drop Point</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>#{d.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.user_name || d.user?.name || '-'}</div>
                      <div className="text-faint" style={{ fontSize: '0.75rem' }}>{d.user?.email || ''}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="category-dot category-dot-anorganik"></span>
                        {d.waste_type_name || d.waste_type?.name || 'Sampah'}
                      </div>
                    </td>
                    <td className="font-mono tabular-nums" style={{ fontWeight: 700 }}>{d.weight_kg?.toFixed(1) || '0.0'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{d.drop_point_name || d.drop_point?.name || '-'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{formatDate(d.created_at)}</td>
                    <td>{statusBadge(d.status)}</td>
                    <td>
                      {d.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => { setModal({ deposit: d, action: 'verify' }); setNotes(''); setActualWeight(String(d.weight_kg || '')); }}
                            style={{ fontSize: '0.6875rem' }}
                          >Verifikasi</button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => { setModal({ deposit: d, action: 'reject' }); setNotes(''); setActualWeight(String(d.weight_kg || '')); }}
                            style={{ fontSize: '0.6875rem' }}
                          >Tolak</button>
                        </div>
                      ) : (
                        <span className="text-faint font-mono" style={{ fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setModal(null)}
          >
            <div
              className="card fade-in"
              style={{ maxWidth: 480, width: '100%', background: 'var(--color-paper)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="card-header">
                <h3 className="card-title">
                  {modal.action === 'verify' ? 'Verifikasi Setoran' : 'Tolak Setoran'}
                </h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div className="receipt-box" style={{ marginBottom: '1rem' }}>
                  <div className="receipt-row">
                    <span className="receipt-row-label">ID</span>
                    <span className="receipt-row-dots"></span>
                    <span className="receipt-row-value">#{modal.deposit.id}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-row-label">Nasabah</span>
                    <span className="receipt-row-dots"></span>
                    <span className="receipt-row-value">{modal.deposit.user_name || modal.deposit.user?.name || '-'}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-row-label">Jenis</span>
                    <span className="receipt-row-dots"></span>
                    <span className="receipt-row-value">{modal.deposit.waste_type_name || modal.deposit.waste_type?.name || '-'}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-row-label">Drop Point</span>
                    <span className="receipt-row-dots"></span>
                    <span className="receipt-row-value">{modal.deposit.drop_point_name || modal.deposit.drop_point?.name || '-'}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-row-label">Berat Terdaftar</span>
                    <span className="receipt-row-dots"></span>
                    <span className="receipt-row-value">{modal.deposit.weight_kg?.toFixed(1)} kg</span>
                  </div>
                  <div className="receipt-total">
                    <span>{modal.action === 'verify' ? 'Poin Setelah Verifikasi' : 'Estimasi Poin'}</span>
                    <span style={{ color: 'var(--color-poin)' }}>
                      ★ {modal.action === 'verify'
                        ? Math.floor(Number(actualWeight || 0) * Number(modal.deposit.points_per_kg || modal.deposit.waste_type?.points_per_kg || 500))
                        : (modal.deposit.earned_points || modal.deposit.estimated_points || modal.deposit.points_earned || Math.round((modal.deposit.weight_kg || 0) * (modal.deposit.points_per_kg || modal.deposit.waste_type?.points_per_kg || 500)))}
                    </span>
                  </div>
                </div>

                {modal.action === 'verify' && (
                  <div className="form-group">
                    <label className="form-label">Berat aktual setelah ditimbang (kg)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={actualWeight}
                      onChange={e => setActualWeight(e.target.value)}
                      required
                    />
                    <p className="form-hint">Poin akan dihitung ulang berdasarkan berat aktual ini.</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Catatan Petugas (Opsional)</label>
                  <textarea
                    className="form-textarea"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder={modal.action === 'reject' ? 'Alasan penolakan...' : 'Catatan verifikasi...'}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => setModal(null)}>Batal</button>
                <button
                  className={`btn btn-sm ${modal.action === 'verify' ? 'btn-primary' : 'btn-danger'}`}
                  onClick={handleAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Memproses...' : modal.action === 'verify' ? 'Verifikasi' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
