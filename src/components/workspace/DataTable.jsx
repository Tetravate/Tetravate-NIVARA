import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Institutional Data Table
 * Enterprise-grade table with column hierarchy, optional live search,
 * sorting, pagination for large lists, and responsive overflow handling.
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found.',
  onRowClick,
  className = '',
  dense = false,
  searchable = false,
  searchPlaceholder = 'Search records...',
  pageSize = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter by search term across all text fields if searchable is enabled
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();
    return data.filter((row) => {
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchable, searchTerm]);

  // 2. Sort data if column header is clicked
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // 3. Paginate if pageSize is specified
  const effectivePageSize = pageSize;
  const totalPages = effectivePageSize ? Math.ceil(sortedData.length / effectivePageSize) : 1;
  const paginatedData = useMemo(() => {
    if (!effectivePageSize) return sortedData;
    const start = (currentPage - 1) * effectivePageSize;
    return sortedData.slice(start, start + effectivePageSize);
  }, [sortedData, effectivePageSize, currentPage]);

  const handleHeaderClick = (col) => {
    const key = col.key || col.accessor;
    if (!key || col.sortable === false) return;
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
      {/* Optional Search Toolbar */}
      {searchable && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px', maxWidth: '340px', flex: 1 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.45rem 0.65rem 0.45rem 2rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
              }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {sortedData.length} of {data.length} records
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className={`data-table-container ${className}`}>
        <table className={`data-table ${dense ? 'dense' : ''}`}>
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const colKey = col.key || col.accessor || idx;
                const isSorted = sortConfig.key === colKey;
                const canSort = col.sortable !== false && Boolean(colKey);

                return (
                  <th
                    key={colKey}
                    onClick={() => canSort && handleHeaderClick(col)}
                    style={{
                      textAlign: col.align || 'left',
                      width: col.width || 'auto',
                      cursor: canSort ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
                        width: '100%',
                      }}
                    >
                      <span>{col.label ?? col.header ?? ''}</span>
                      {canSort && (
                        <span style={{ color: isSorted ? 'var(--text-primary)' : 'var(--text-tertiary)', display: 'inline-flex' }}>
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                          ) : (
                            <ArrowUpDown size={11} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
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
                  {searchTerm ? `No matching records found for "${searchTerm}".` : emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
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
                        key={col.key || col.accessor || colIdx}
                        style={{
                          textAlign: col.align || 'left',
                        }}
                      >
                        {col.render ? col.render(row) : (row[col.key || col.accessor] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {effectivePageSize && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>
            Page {currentPage} of {totalPages} ({sortedData.length} total)
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: '0.25rem 0.5rem', minHeight: '26px' }}
            >
              <ChevronLeft size={12} /> Prev
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: '0.25rem 0.5rem', minHeight: '26px' }}
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
