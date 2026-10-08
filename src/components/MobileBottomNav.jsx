import React, { useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import {
  getPrimaryMobileTabs,
  getSecondaryMobileTabs,
} from '../data/navigationConfig';

export default function MobileBottomNav({ onOpenCaseStudy: _onOpenCaseStudy }) {
  const {
    currentRole,
    currentUser,
    activeTab,
    setActiveTab,
    students,
    assignments,
    leaveRequests,
    roomConflicts,
    studentPlacementApplications,
  } = useNivara();

  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const activeStudentId = currentUser?.studentId || currentUser?.id || '';
  const currentStudent = (students || []).find((s) => (activeStudentId && s.id === activeStudentId) || (currentUser?.email && s.email === currentUser?.email)) || null;
  const pendingAssignmentsCount = (assignments || []).filter((a) => {
    const isSubmitted = (a.submissions || []).some((sub) => sub.studentId === activeStudentId && (sub.status === 'submitted' || sub.status === 'graded'));
    return !a.completed && !isSubmitted;
  }).length;
  const pendingLeavesCount = (leaveRequests || []).filter((l) => l.status === 'pending').length;
  const atRiskCount = (students || []).filter(
    (s) => s.deptCode === 'AIDS' && (s.attendancePct < 75 || s.backlogs > 0)
  ).length;

  const getBadgeForModule = (moduleId) => {
    if (currentRole === 'student') {
      if (moduleId === 'assignments') return pendingAssignmentsCount || undefined;
      if (moduleId === 'fees') return currentStudent?.feeStatus === 'pending' ? 'Due' : undefined;
    } else if (currentRole === 'faculty') {
      if (moduleId === 'attendance') return 'Due';
      if (moduleId === 'assignments') {
        const pendingGrading = (assignments || []).filter((a) => (a.submittedCount || 0) > (a.gradedCount || 0)).length;
        return pendingGrading || undefined;
      }
      if (moduleId === 'leaves') return pendingLeavesCount || undefined;
    } else if (currentRole === 'hod') {
      if (moduleId === 'at_risk') return atRiskCount || undefined;
      if (moduleId === 'approvals') return pendingLeavesCount || undefined;
    } else if (currentRole === 'principal') {
      if (moduleId === 'approvals') return pendingLeavesCount || undefined;
    } else if (currentRole === 'admin') {
      if (moduleId === 'conflicts') return (roomConflicts || []).length || undefined;
    } else if (currentRole === 'finance') {
      if (moduleId === 'dues' || moduleId === 'students') {
        const count = (students || []).filter((s) => s.feeStatus === 'pending').length;
        return count || undefined;
      }
    } else if (currentRole === 'placement') {
      if (moduleId === 'applications') return (studentPlacementApplications || []).length || undefined;
    }
    return undefined;
  };

  const primaryTabs = getPrimaryMobileTabs(currentRole);
  const secondaryTabs = getSecondaryMobileTabs(currentRole);

  const isSecondaryActive = secondaryTabs.some((tab) => tab.id === activeTab);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMoreSheetOpen(false);
  };

  return (
    <>
      {/* Primary Mobile Bottom Bar (Max 4 primary tabs + 1 More trigger) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = getBadgeForModule(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={18} />
                {badge !== undefined && badge !== 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      background: 'var(--state-urgent)',
                      color: '#fff',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '0 4px',
                      lineHeight: '13px',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* 5th Button: More Drawer Trigger */}
        {secondaryTabs.length > 0 && (
          <button
            type="button"
            className={`mobile-nav-btn ${isSecondaryActive ? 'active' : ''}`}
            onClick={() => setMoreSheetOpen(true)}
            aria-expanded={moreSheetOpen}
            aria-label="Open more modules menu"
          >
            <MoreHorizontal size={18} />
            <span>More</span>
          </button>
        )}
      </nav>

      {/* Slide-Up Drawer for Secondary Modules */}
      {moreSheetOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100,
              backdropFilter: 'blur(3px)',
            }}
            onClick={() => setMoreSheetOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--bg-surface)',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              borderTop: '1px solid var(--border-card)',
              boxShadow: 'var(--shadow-elevated)',
              zIndex: 101,
              maxHeight: '75vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem 1.25rem 2rem',
            }}
            role="dialog"
            aria-label="More navigation modules"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Additional Modules
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setMoreSheetOpen(false)}
                aria-label="Close menu"
                style={{ minHeight: '32px', minWidth: '32px', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem',
                overflowY: 'auto',
              }}
            >
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const badge = getBadgeForModule(tab.id);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.75rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--bg-subtle)' : 'var(--bg-canvas)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--brand-blue)' : 'var(--border-subtle)',
                      color: isActive ? 'var(--brand-blue)' : 'var(--text-primary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.8125rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    <Icon size={16} color={isActive ? 'var(--brand-blue)' : 'var(--text-secondary)'} />
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tab.label}
                    </span>
                    {badge !== undefined && badge !== 0 && (
                      <span
                        style={{
                          background: 'var(--state-urgent)',
                          color: '#fff',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          padding: '0 5px',
                          lineHeight: '14px',
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
