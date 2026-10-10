import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { ROLE_NAVIGATION_REGISTRY } from '../data/navigationConfig';

// Define logical grouping thresholds per role for clear enterprise information architecture
const ROLE_GROUPS = {
  student: [
    { title: 'Core & Schedule', itemIds: ['home', 'today', 'attendance', 'timetable'] },
    { title: 'Academics & Records', itemIds: ['assignments', 'materials', 'exams', 'results'] },
    { title: 'Campus & Career', itemIds: ['fees', 'placement', 'leaves'] },
  ],
  faculty: [
    { title: 'Teaching & Schedule', itemIds: ['home', 'today', 'classes', 'timetable'] },
    { title: 'Classroom & Grading', itemIds: ['attendance', 'assignments', 'materials', 'marks'] },
    { title: 'Students & Sanctions', itemIds: ['students', 'progress', 'leaves', 'announcements'] },
  ],
  hod: [
    { title: 'Department Command', itemIds: ['home', 'overview', 'timetable'] },
    { title: 'Faculty & Students', itemIds: ['students', 'faculty', 'attendance', 'performance', 'at_risk', 'workload'] },
    { title: 'Administration', itemIds: ['approvals', 'announcements', 'reports'] },
  ],
  principal: [
    { title: 'Executive Overview', itemIds: ['home', 'overview', 'departments', 'reports'] },
    { title: 'Campus Operations', itemIds: ['students', 'faculty', 'attendance', 'performance', 'exams_results'] },
    { title: 'Strategic Oversight', itemIds: ['placements', 'finance', 'approvals', 'announcements'] },
  ],
  admin: [
    { title: 'System Controller', itemIds: ['home', 'users', 'settings', 'audit_logs'] },
    { title: 'University Structure', itemIds: ['departments', 'programs', 'subjects', 'sections', 'academic_years'] },
    { title: 'Campus Logistics', itemIds: ['conflicts', 'students', 'faculty', 'announcements'] },
  ],
  exam_cell: [
    { title: 'Examination Series', itemIds: ['home', 'calendar', 'schedules', 'management'] },
    { title: 'Evaluation & Results', itemIds: ['internals', 'marks', 'results', 'revaluation'] },
    { title: 'Registry & Reports', itemIds: ['records', 'reports', 'announcements'] },
  ],
  finance: [
    { title: 'Treasury & Dues', itemIds: ['home', 'structure', 'students', 'dues'] },
    { title: 'Ledger & Concessions', itemIds: ['payments', 'receipts', 'refunds', 'scholarships'] },
    { title: 'Reports & Notices', itemIds: ['reports', 'announcements'] },
  ],
  placement: [
    { title: 'Corporate Relations', itemIds: ['home', 'companies', 'drives', 'eligibility'] },
    { title: 'Candidate Pipeline', itemIds: ['applications', 'interviews', 'offers', 'students'] },
    { title: 'Circulars & Reports', itemIds: ['announcements', 'reports'] },
  ],
};

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

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('nivara_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nivara_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

  const currentNav = ROLE_NAVIGATION_REGISTRY[currentRole] || ROLE_NAVIGATION_REGISTRY.student;
  const roleGroups = ROLE_GROUPS[currentRole];

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

  const renderNavItem = (item) => {
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
        title={isCollapsed ? item.label : undefined}
      >
        <Icon size={16} />
        <span className="nav-link-text">{item.label}</span>
        {badge !== undefined && badge !== 0 && (
          <span className="nav-badge-count">{badge}</span>
        )}
      </button>
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      {/* Sidebar Header with Role Title & Collapse Toggle */}
      <div className="sidebar-header-row">
        {!isCollapsed && (
          <span className="sidebar-role-label">
            {currentNav.title}
          </span>
        )}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Logical Nav Groups */}
      <nav className="sidebar-nav">
        {roleGroups ? (
          roleGroups.map((group, gIdx) => {
            const groupItems = currentNav.items.filter((item) => group.itemIds.includes(item.id));
            if (groupItems.length === 0) return null;

            return (
              <div key={gIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                {!isCollapsed && (
                  <div className="sidebar-group-label">
                    {group.title}
                  </div>
                )}
                {groupItems.map(renderNavItem)}
              </div>
            );
          })
        ) : (
          currentNav.items.map(renderNavItem)
        )}
      </nav>

      {/* Footer Utilities */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {/* Audit Trail Inspector */}
        <button
          type="button"
          className="nav-link"
          onClick={() => setAuditLogOpen(true)}
          style={{ color: 'var(--brand-blue)' }}
          title={isCollapsed ? 'Sync Audit Trail' : undefined}
        >
          <Clock size={16} />
          <span className="nav-link-text">Sync Audit Trail</span>
        </button>

        {/* Case Study & Architecture Principles */}
        <button
          type="button"
          className="nav-link"
          onClick={onOpenCaseStudy}
          title={isCollapsed ? 'Case Study & Architecture' : undefined}
        >
          <Sparkles size={16} />
          <span className="nav-link-text">Case Study & UX</span>
        </button>

        {!isCollapsed && (
          <div style={{ padding: '0.55rem 0.65rem', marginTop: '0.35rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Nivara ERP</strong><br />
            Task-oriented institutional operating system.
          </div>
        )}
      </div>
    </aside>
  );
}
