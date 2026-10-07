import React from 'react';

/**
 * Institutional Data Table
 * Provides consistent styling, readable typography, compact rows,
 * and responsive horizontal scroll management without breaking layouts.
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found.',
  onRowClick,
  className = '',
  dense = false,
}) {
  return (
    <div className={`data-table-container ${className}`}>
      <table className={`data-table ${dense ? 'dense' : ''}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                }}
              >
                {col.label}
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
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const rowKey = row[keyField] || rowIdx;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      style={{
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
