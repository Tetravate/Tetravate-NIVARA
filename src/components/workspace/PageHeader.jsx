import React from 'react';

/**
 * Reusable Page Header for institutional workspaces.
 * Follows hierarchy: Eyebrow -> Title -> Description + Actions
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions = null,
  badge = null,
}) {
  return (
    <header className="workspace-page-header">
      <div className="workspace-header-main">
        {eyebrow && (
          <div className="workspace-eyebrow">
            {eyebrow}
          </div>
        )}
        <div className="workspace-title-row">
          <h1 className="workspace-title">{title}</h1>
          {badge && <span className="workspace-title-badge">{badge}</span>}
        </div>
        {description && (
          <p className="workspace-description">{description}</p>
        )}
      </div>

      {actions && (
        <div className="workspace-header-actions">
          {actions}
        </div>
      )}
    </header>
  );
}
