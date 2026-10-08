import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { ROLE_NAVIGATION_REGISTRY } from '../data/navigationConfig';

export default function Sidebar({ onOpenCaseStudy }) {
  const {
    currentRole,
    currentUser,
    activeTab,
    setActiveTab,
    setAuditLogOpen,
    students,
    assignments,
    leaveRequests,
    roomConflicts,
    studentPlacementApplications,
  } = useNivara();

  const activeStudentId = currentUser?.studentId || currentUser?.id || '2024-AIDS-042';
  const currentStudent = (students || []).find((s) => s.id === activeStudentId || s.email === currentUser?.email) || (students || [])[0] || {};
  const pendingAssignmentsCount = (assignments || []).filter((a) => {
    const isSubmitted = (a.submissions || []).some((sub) => sub.studentId === activeStudentId && (sub.status === 'submitted' || sub.status === 'graded'));
    return !a.completed && !isSubmitted;
  }).length;
  const pendingLeavesCount = (leaveRequests || []).filter((l) => l.status === 'pending').length;
  const atRiskCount = (students || []).filter(
    (s) => s.deptCode === 'AIDS' && (s.attendancePct < 75 || s.backlogs > 0)
  ).length;

  const currentNav = ROLE_NAVIGATION_REGISTRY[currentRole] || ROLE_NAVIGATION_REGISTRY.student;

  // Compute contextual badge for specific module IDs based on real data
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

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            paddingLeft: '0.65rem',
            marginBottom: '0.35rem',
          }}
        >
          {currentNav.title}
        </span>

        <nav className="sidebar-nav">
          {currentNav.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = getBadgeForModule(item.id);

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {badge !== undefined && badge !== 0 && (
                  <span className="nav-badge-count">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {/* Audit Trail Inspector */}
        <button
          type="button"
          className="nav-link"
          onClick={() => setAuditLogOpen(true)}
          style={{ color: 'var(--brand-blue)' }}
        >
          <Clock size={16} />
          <span>Sync Audit Trail</span>
        </button>

        {/* Case Study & UX Principles */}
        <button
          type="button"
          className="nav-link"
          onClick={onOpenCaseStudy}
        >
          <Sparkles size={16} />
          <span>Case Study & UX</span>
        </button>

        <div style={{ padding: '0.65rem 0.75rem', marginTop: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Nivara Concept</strong><br />
          “Don't show everything. Show what matters.”
        </div>
      </div>
    </aside>
  );
}
