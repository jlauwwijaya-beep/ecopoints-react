import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppNav from '../components/layout/AppNav';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

export default function RewardsPage() {
  const { user, rewards, redeemReward } = useAuth();
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemStatus, setRedeemStatus] = useState(null); // { success: bool, message: string }
  const [loadingRedeem, setLoadingRedeem] = useState(false);

  const handleOpenRedeem = (reward) => {
    setSelectedReward(reward);
    setRedeemStatus(null);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || loadingRedeem) return;
    setLoadingRedeem(true);
    const res = await redeemReward(selectedReward.id);
    setLoadingRedeem(false);
    setRedeemStatus(res);
  };

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
              alignItems: 'baseline',
              gap: '1rem'
            }}
          >
            <div>
              <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                KATALOG PENUKARAN // EPS-REWARDS
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>
                Tukar Poin dengan Manfaat Nyata
              </h1>
            </div>

            {/* Current Balance Banner */}
            <div
              className="font-mono"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-ink)',
                padding: '0.5rem 1rem'
              }}
            >
              <span className="text-faint" style={{ fontSize: '0.75rem' }}>SALDO ANDA:</span>
              <span className="text-poin tabular-nums" style={{ fontWeight: 800, fontSize: '1.125rem' }}>
                {user ? user.points.toLocaleString('id-ID') : 0} PTS
              </span>
            </div>
          </div>

          {/* Grid Reward Cards */}
          <div className="grid-3">
            {rewards.map((item) => {
              const canAfford = user && user.points >= item.cost;
              const isOutOfStock = item.stock <= 0;

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header: Category Badge & Stock */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                        {item.category}
                      </span>
                      <span className="font-mono text-faint" style={{ fontSize: '0.6875rem' }}>
                        Sisa: {item.stock} unit
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {item.name}
                    </h3>

                    <p className="text-muted" style={{ fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Action Button */}
                  <div
                    style={{
                      borderTop: '1px dashed var(--color-border)',
                      paddingTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div className="font-mono text-faint" style={{ fontSize: '0.625rem', textTransform: 'uppercase' }}>
                        BIAYA POIN
                      </div>
                      <div className="font-mono text-poin tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                        {item.cost.toLocaleString('id-ID')}{' '}
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>PTS</span>
                      </div>
                    </div>

                    <Button
                      variant={canAfford && !isOutOfStock ? 'primary' : 'ghost'}
                      size="sm"
                      disabled={!canAfford || isOutOfStock}
                      onClick={() => handleOpenRedeem(item)}
                      style={{
                        border: '1px solid var(--color-ink)',
                        backgroundColor: canAfford && !isOutOfStock ? 'var(--color-primary)' : 'var(--color-paper)'
                      }}
                    >
                      {isOutOfStock ? 'Stok Habis' : canAfford ? 'Tukar Sekarang' : 'Poin Kurang'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Konfirmasi Penukaran */}
          {selectedReward && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(30, 33, 28, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1rem'
              }}
              onClick={() => setSelectedReward(null)}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-ink)',
                  width: '100%',
                  maxWidth: '440px',
                  padding: '2rem',
                  boxShadow: '6px 6px 0px rgba(0,0,0,0.25)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {!redeemStatus ? (
                  <>
                    <div className="font-mono text-faint" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      KONFIRMASI PENUKARAN VOUCHER
                    </div>
                    <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                      {selectedReward.name}
                    </h2>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      {selectedReward.description}
                    </p>

                    <div className="receipt-box" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>SALDO SAAT INI:</span>
                        <span className="font-mono" style={{ fontSize: '0.75rem' }}>{user?.points.toLocaleString('id-ID')} PTS</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className="font-mono text-faint" style={{ fontSize: '0.75rem' }}>BIAYA REWARD:</span>
                        <span className="font-mono text-b3" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          -{selectedReward.cost.toLocaleString('id-ID')} PTS
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-ink)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.8125rem' }}>SISA SALDO:</span>
                        <span className="font-mono text-poin" style={{ fontWeight: 800, fontSize: '0.9375rem' }}>
                          {((user?.points || 0) - selectedReward.cost).toLocaleString('id-ID')} PTS
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setSelectedReward(null)}
                        style={{ flex: 1 }}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        disabled={loadingRedeem}
                        onClick={handleConfirmRedeem}
                        style={{ flex: 1 }}
                      >
                        {loadingRedeem ? 'Memproses...' : 'Ya, Tukarkan →'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: redeemStatus.success ? 'var(--color-primary-light)' : '#FCECE9',
                        color: redeemStatus.success ? 'var(--color-organik)' : 'var(--color-b3)',
                        border: `1px solid ${redeemStatus.success ? 'var(--color-organik)' : 'var(--color-b3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: '0 auto 1rem'
                      }}
                    >
                      {redeemStatus.success ? '✓' : '✕'}
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                      {redeemStatus.success ? 'Penukaran Berhasil!' : 'Penukaran Gagal'}
                    </h2>
                    <p className="font-mono text-muted" style={{ fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
                      {redeemStatus.message}
                    </p>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setSelectedReward(null);
                        setRedeemStatus(null);
                      }}
                      style={{ width: '100%' }}
                    >
                      Tutup & Selesai
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
