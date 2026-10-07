import React from 'react';

/**
 * SectionHeader: Consistent section header across workspaces.
 * Follows: Section Name / Context -> Optional Counter -> Optional Action Link/Button
 */
export default function SectionHeader({
  title,
  subtitle = null,
  action = null,
  badge = null,
}) {
  return (
    <div className="workspace-section-header">
      <div className="workspace-section-title-wrap">
        <h2 className="workspace-section-title">{title}</h2>
        {badge && <span className="workspace-section-badge">{badge}</span>}
        {subtitle && <span className="workspace-section-sub">{subtitle}</span>}
      </div>
      {action && (
        <div className="workspace-section-action">
          {action}
        </div>
      )}
    </div>
  );
}
