import React from 'react';

/**
 * EmptyState: Quiet, institutional empty/resolved state.
 * Never flashy, clear and actionable.
 * Robust against icon passed as component, forwardRef object, or element.
 */
export default function EmptyState({
  icon = null,
  title = 'No records found',
  message = null,
  description = null,
  action = null,
  compact = false,
}) {
  const displayMsg = message ?? description ?? "You're all caught up.";

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComp = icon;
      return <IconComp size={compact ? 24 : 36} aria-hidden="true" />;
    }
    if (typeof icon === 'string') return <span>{icon}</span>;
    return null;
  };

  return (
    <div className={`workspace-empty-state ${compact ? 'workspace-empty-compact' : ''}`} role="status">
      {icon && <div className="workspace-empty-icon">{renderIcon()}</div>}
      <h3 className="workspace-empty-title">{title}</h3>
      {displayMsg && (
        <p className="workspace-empty-msg">
          {typeof displayMsg === 'object' && !React.isValidElement(displayMsg)
            ? (displayMsg?.message || String(displayMsg))
            : displayMsg}
        </p>
      )}
      {action && <div className="workspace-empty-action">{action}</div>}
    </div>
  );
}
