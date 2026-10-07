import React from 'react';

/**
 * EmptyState: Quiet, institutional empty/resolved state.
 * Never flashy, clear and actionable.
 */
export default function EmptyState({
  icon = null,
  title = 'No records found',
  message = "You're all caught up.",
  action = null,
  compact = false,
}) {
  return (
    <div className={`workspace-empty-state ${compact ? 'workspace-empty-compact' : ''}`} role="status">
      {icon && <div className="workspace-empty-icon">{icon}</div>}
      <h3 className="workspace-empty-title">{title}</h3>
      {message && <p className="workspace-empty-msg">{message}</p>}
      {action && <div className="workspace-empty-action">{action}</div>}
    </div>
  );
}
