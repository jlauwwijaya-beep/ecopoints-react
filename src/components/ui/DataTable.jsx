import React from 'react';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'Tidak ada data yang tersedia.',
  className = ''
}) {
  return (
    <div className={`data-table-container ${className}`.trim()}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  textAlign: col.align || 'left',
                  width: col.width || 'auto'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  color: 'var(--color-ink-muted)'
                }}
              >
                <div className="font-mono" style={{ fontSize: '0.875rem' }}>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
