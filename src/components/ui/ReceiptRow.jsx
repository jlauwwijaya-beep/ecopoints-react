import React from 'react';

export default function ReceiptRow({
  label,
  value,
  unit = '',
  isTotal = false,
  highlight = false,
  className = ''
}) {
  if (isTotal) {
    return (
      <div className={`receipt-total ${className}`.trim()}>
        <span className="receipt-total-label font-mono">{label}</span>
        <span className={`receipt-total-value font-mono tabular-nums ${highlight ? 'text-poin' : ''}`}>
          {value} {unit}
        </span>
      </div>
    );
  }

  return (
    <div className={`receipt-row ${className}`.trim()}>
      <span className="receipt-row-label font-mono">{label}</span>
      <span className="receipt-row-dots" />
      <span className={`receipt-row-value font-mono tabular-nums ${highlight ? 'text-poin' : ''}`}>
        {value} {unit}
      </span>
    </div>
  );
}
