import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import CategoryDot from '../components/ui/CategoryDot';
import { QRCodeSVG } from 'qrcode.react';

export default function DepositsIndexPage() {
  const { deposits, clearDepositHistory } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  const filteredDeposits = deposits.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleClearHistory = () => {
    if (!deposits.length) return;
    if (window.confirm('Bersihkan riwayat dari tampilan Anda? Data tetap tersimpan di database.')) {
      clearDepositHistory();
      setSelectedDeposit(null);
    }
  };

  const columns = [
    {
      header: 'ID & WAKTU',
      accessor: (row) => (
        <div>
          <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>
            {row.id}
          </div>
          <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>
            {row.date}
          </div>
        </div>
      )
    },
    {
      header: 'JENIS SAMPAH',
      accessor: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CategoryDot type={row.category} size={8} />
            <span style={{ fontWeight: 600 }}>{row.type}</span>
          </div>
          <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', marginTop: '0.125rem' }}>
            {row.location}
          </div>
        </div>
      )
    },
    {
      header: 'BERAT',
      accessor: (row) => (
        <span className="font-mono tabular-nums" style={{ fontWeight: 600 }}>
          {row.weight.toFixed(1)} KG
        </span>
      )
    },
    {
      header: 'POIN',
      accessor: (row) => (
        <span className="font-mono tabular-nums text-poin" style={{ fontWeight: 700 }}>
          +{row.points.toLocaleString('id-ID')} PTS
        </span>
      )
    },
    {
      header: 'STATUS',
      accessor: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'AKSI',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => setSelectedDeposit(row)}
          className="font-mono text-primary"
          style={{ fontSize: '0.75rem', fontWeight: 600, textDecoration: 'underline' }}
        >
          Lihat Nota
        </button>
      )
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNav />

      <main style={{ padding: '2.5rem 0 4rem', flexGrow: 1, backgroundColor: 'var(--color-paper)' }}>
        <div className="container-wide">
          {/* Header */}
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
                LOG TRANSAKSI TIMBANGAN // EPS-LOG
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Riwayat Setoran Sampah
              </h1>
            </div>

            <Button variant="primary" size="md" onClick={() => navigate('/deposits/create')}>
              + Setor Sampah Baru
            </Button>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            {[
              { id: 'all', label: `Semua (${deposits.length})` },
              { id: 'verified', label: `Terverifikasi (${deposits.filter((d) => d.status === 'verified').length})` },
              { id: 'pending', label: `Menunggu (${deposits.filter((d) => d.status === 'pending').length})` },
              { id: 'rejected', label: `Ditolak (${deposits.filter((d) => d.status === 'rejected').length})` }
            ].map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.375rem 0.75rem',
                    border: '1px solid var(--color-ink)',
                    backgroundColor: isActive ? 'var(--color-ink)' : 'var(--color-surface)',
                    color: isActive ? 'var(--color-paper)' : 'var(--color-ink)',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
            <div style={{ marginLeft: 'auto' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearHistory}
                disabled={!deposits.length}
              >
                Bersihkan Riwayat
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={filteredDeposits}
            emptyMessage="Tidak ada data setoran yang cocok dengan filter."
          />

          {/* Modal / Nota Pop-up for Selected Deposit */}
          {selectedDeposit && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(30, 33, 28, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1rem'
              }}
              onClick={() => setSelectedDeposit(null)}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-ink)',
                  width: '100%',
                  maxWidth: '420px',
                  padding: '1.75rem',
                  boxShadow: '6px 6px 0px rgba(0,0,0,0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>
                    RINCIAN NOTA RESMI
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDeposit(null)}
                    className="font-mono"
                    style={{ fontSize: '1rem', fontWeight: 700 }}
                  >
                    ✕
                  </button>
                </div>

                <div className="receipt-box" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <div className="font-mono" style={{ fontWeight: 700 }}>ECOPOINTS TERA TIMBANGAN</div>
                    <div className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>{selectedDeposit.id}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>WAKTU:</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem' }}>{selectedDeposit.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>KATEGORI:</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem' }}>{selectedDeposit.category.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>JENIS:</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem' }}>{selectedDeposit.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>BERAT:</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{selectedDeposit.weight} KG</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>LOKASI:</span>
                    <span className="font-mono" style={{ fontSize: '0.75rem' }}>{selectedDeposit.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>STATUS:</span>
                    <StatusBadge status={selectedDeposit.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-ink)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                    <span className="font-mono" style={{ fontWeight: 700 }}>POIN DIPEROLEH:</span>
                    <span className="font-mono text-poin" style={{ fontWeight: 800, fontSize: '1.125rem' }}>
                      +{selectedDeposit.points} PTS
                    </span>
                  </div>
                </div>

                {selectedDeposit.status === 'pending' && selectedDeposit.rawId && (
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'inline-block', padding: '0.625rem', background: '#fff', border: '1px solid var(--color-border)' }}>
                      <QRCodeSVG
                        value={String(selectedDeposit.rawId)}
                        size={160}
                        level="M"
                        includeMargin
                      />
                    </div>
                    <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', marginTop: '0.5rem' }}>
                      QR SETORAN UNTUK PETUGAS
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedDeposit(null)}>
                    Tutup Nota
                  </Button>
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
