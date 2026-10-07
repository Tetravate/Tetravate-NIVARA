import React from 'react';

/**
 * MetricStrip: Renders a dense, responsive grid of institutional metrics.
 * Eliminates oversized cards in favor of compact, scannable data tiles.
 */
export default function MetricStrip({ metrics = [] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="metric-strip" role="region" aria-label="Key operational indicators">
      {metrics.map((item, idx) => {
        const statusClass = item.status ? `metric-tile-${item.status}` : '';
        return (
          <div key={item.id || idx} className={`metric-tile ${statusClass}`}>
            <div className="metric-tile-header">
              <span className="metric-tile-label">{item.label}</span>
              {item.icon && <span className="metric-tile-icon">{item.icon}</span>}
            </div>
            <div className="metric-tile-body">
              <span className="metric-tile-value">{item.value}</span>
              {item.unit && <span className="metric-tile-unit">{item.unit}</span>}
            </div>
            {item.subtext && (
              <div className="metric-tile-footer">
                <span className={`metric-tile-subtext ${item.subtextStatus ? `text-${item.subtextStatus}` : ''}`}>
                  {item.subtext}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
