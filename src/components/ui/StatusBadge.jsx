import React from 'react';

/**
 * StatusBadge Component
 * @param {'pending' | 'verified' | 'rejected' | string} status
 */
export default function StatusBadge({ status = 'pending', label, className = '' }) {
  const normalized = (status || '').toLowerCase();

  let badgeClass = 'badge-neutral';
  let defaultLabel = status;
  let dotColor = '#5A5E55';

  if (normalized === 'verified' || normalized === 'selesai' || normalized === 'disetujui') {
    badgeClass = 'badge-verified';
    defaultLabel = 'Terverifikasi';
    dotColor = 'var(--color-organik)';
  } else if (normalized === 'pending' || normalized === 'menunggu' || normalized === 'diproses') {
    badgeClass = 'badge-pending';
    defaultLabel = 'Menunggu Validasi';
    dotColor = 'var(--color-poin)';
  } else if (normalized === 'rejected' || normalized === 'ditolak' || normalized === 'batal') {
    badgeClass = 'badge-rejected';
    defaultLabel = 'Ditolak';
    dotColor = 'var(--color-b3)';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`.trim()}>
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: dotColor
        }}
      />
      {label || defaultLabel}
    </span>
  );
}
