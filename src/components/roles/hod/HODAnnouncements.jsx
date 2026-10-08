import React, { useState, useMemo } from 'react';
import {
  Send,
  Plus,
  Bell,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODAnnouncements() {
  const {
    announcements,
    publishAnnouncement,
    currentUser,
    students,
    facultyMembers,
    showToast,
  } = useNivara();

  const [selectedTargetAudience, setSelectedTargetAudience] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL_STUDENTS',
    priority: 'high', // 'normal' | 'high'
  });

  // Filter announcements to Department of AI & Data Science
  const deptAnnouncements = useMemo(() => {
    return (announcements || []).filter((a) => {
      return (
        a.targetDept === (currentUser?.deptCode || 'AIDS') ||
        a.targetDept === 'ALL' ||
        a.publishedRole === 'hod' ||
        (currentUser?.userName && a.publishedBy?.includes(currentUser.userName))
      );
    });
  }, [announcements, currentUser]);

  const filteredAnnouncements = useMemo(() => {
    return deptAnnouncements.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [deptAnnouncements, searchQuery]);

  const publishedByHOD = deptAnnouncements.filter(
    (a) => a.publishedRole === 'hod' || (currentUser?.userName && a.publishedBy?.includes(currentUser.userName))
  ).length;

  const deptStudentsCount = (students || []).filter(
    (s) => s.deptCode === (currentUser?.deptCode || 'AIDS') || s.department?.includes('AI & Data Science')
  ).length;

  const deptFacultyCount = (facultyMembers || []).filter(
    (f) => f.deptCode === (currentUser?.deptCode || 'AIDS') || f.department?.includes('AI & Data Science')
  ).length;

  const metrics = [
    {
      label: 'Department Circulars',
      value: `${publishedByHOD} Published`,
      subtext: currentUser?.userName ? `By ${currentUser.userName} (HOD)` : 'By Head of Department',
      state: 'info',
    },
    {
      label: 'Undergraduate Reach',
      value: `${deptStudentsCount} Students`,
      subtext: 'Department Cohort Scope',
      state: 'success',
    },
    {
      label: 'Instructional Staff Reach',
      value: `${deptFacultyCount} Faculty`,
      subtext: 'Department Faculty Council',
      state: 'neutral',
    },
    {
      label: 'Delivery Channel',
      value: 'Broadcast & Feed',
      subtext: 'Real-time synchronization',
      state: 'info',
    },
  ];

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please provide both circular title and content', 'error');
      return;
    }

    await publishAnnouncement({
      title: `[Dept Directive] ${formData.title}`,
      content: formData.content,
      scope: 'department',
      targetDept: currentUser?.deptCode || 'AIDS',
      targetSection: 'ALL',
      targetRole: formData.targetAudience === 'FACULTY' ? 'faculty' : 'student',
      priority: formData.priority,
      publishedBy: currentUser?.userName || 'Head of Department',
      publishedRole: 'hod',
    });

    setModalOpen(false);
    setFormData({
      title: '',
      content: '',
      targetAudience: 'ALL_STUDENTS',
      priority: 'high',
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Official Circular Dispatcher"
        title="Department Announcements"
        description="Broadcast official directives, autonomous examination schedules, symposium advisories, and academic policies across AI & DS undergraduate batches and instructional staff."
        actions={[
          <button
            key="post-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setModalOpen(true)}
          >
            <Send size={13} /> Dispatch Department Circular
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Target Audience: Department of AI & Data Science
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search department circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem 0.4rem 2rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Announcements Feed */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No circulars found"
          description="Click 'Dispatch Department Circular' to broadcast a directive to your students and faculty."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredAnnouncements.map((anc) => {
            const isHighPriority = anc.priority === 'high';
            const isByHOD = anc.publishedRole === 'hod' || (currentUser?.userName && anc.publishedBy?.includes(currentUser.userName));

            return (
              <div
                key={anc.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {anc.title}
                    </strong>
                    <span className={`badge ${isHighPriority ? 'badge-urgent' : 'badge-neutral'}`}>
                      {isHighPriority ? 'High Priority' : 'Normal'}
                    </span>
                    <span className="badge badge-info">
                      {anc.scope === 'department' ? 'Department Circular' : 'Campus-Wide Directive'}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {anc.publishedAt || 'Today'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {anc.content}
                </div>

                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>Sign-off: <strong>{anc.publishedBy}</strong> ({anc.publishedRole || 'Executive'})</span>
                  <span>•</span>
                  <span>Audience: <strong>{anc.targetRole || 'Students'} (Dept: {anc.targetDept || 'AIDS'})</strong></span>
                  {isByHOD && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--state-success)', fontWeight: 600 }}>
                        <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '2px' }} /> Authored by HOD
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH CIRCULAR MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Dispatch Departmental Circular
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Circular Heading / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule of Continuous Internal Assessment II and Practical Evaluations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-canvas)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <option value="ALL_STUDENTS">All AIDS Undergraduates (Y1–Y4)</option>
                    <option value="YEAR3">3rd Year AIDS (Semester 5)</option>
                    <option value="YEAR4">4th Year AIDS (Semester 7)</option>
                    <option value="FACULTY">Department Faculty Council</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Priority Dispatch
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-canvas)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <option value="high">High Priority (Push Notification)</option>
                    <option value="normal">Standard Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Directive Text & Instructions
                </label>
                <textarea
                  rows="4"
                  placeholder="Detail instructions, test schedule dates, laboratory submission requirements, and official deadlines..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Broadcast Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
