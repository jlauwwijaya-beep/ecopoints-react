import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import DataTable from '../components/ui/DataTable';

export default function PointsPage() {
  const { user, transactions } = useAuth();

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const columns = [
    {
      header: 'ID & TANGGAL',
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
      header: 'KETERANGAN MUTASI',
      accessor: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.description}
        </span>
      )
    },
    {
      header: 'JUMLAH (PTS)',
      accessor: (row) => {
        const isCredit = row.type === 'credit';
        return (
          <span
            className={`font-mono tabular-nums ${isCredit ? 'text-organik' : 'text-b3'}`}
            style={{ fontWeight: 700, fontSize: '0.9375rem' }}
          >
            {isCredit ? `+${row.amount.toLocaleString('id-ID')}` : `-${row.amount.toLocaleString('id-ID')}`}
          </span>
        );
      }
    },
    {
      header: 'SALDO AKHIR',
      accessor: (row) => (
        <span className="font-mono tabular-nums" style={{ fontWeight: 600 }}>
          {row.balance.toLocaleString('id-ID')} PTS
        </span>
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
                BUKU BESAR MUTASI
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Riwayat & Mutasi Poin
              </h1>
            </div>
          </div>

          {/* Metric Summary Cards (3 cards) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-ink)',
                padding: '1.25rem'
              }}
            >
              <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                SALDO POIN AKTIF
              </div>
              <div className="font-mono text-poin tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {user ? user.points.toLocaleString('id-ID') : 0}{' '}
                <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>PTS</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '1.25rem'
              }}
            >
              <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                TOTAL POIN MASUK (KREDIT)
              </div>
              <div className="font-mono text-organik tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '0.25rem' }}>
                +{totalCredit.toLocaleString('id-ID')}{' '}
                <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>PTS</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                padding: '1.25rem'
              }}
            >
              <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', textTransform: 'uppercase' }}>
                TOTAL POIN DITUKAR (DEBIT)
              </div>
              <div className="font-mono text-b3 tabular-nums" style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '0.25rem' }}>
                -{totalDebit.toLocaleString('id-ID')}{' '}
                <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>PTS</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={transactions}
            emptyMessage="Belum ada riwayat transaksi mutasi poin."
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
