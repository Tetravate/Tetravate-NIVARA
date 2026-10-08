import React, { useState, useMemo } from 'react';
import {
  Send,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyAnnouncements() {
  const {
    announcements,
    publishAnnouncement,
    currentUser,
    students,
    showToast,
  } = useNivara();

  const [selectedCohortFilter, setSelectedCohortFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetCourse: '',
    targetSection: '',
    priority: 'normal', // 'normal' | 'high'
  });

  // Filter announcements relevant to Faculty's department and courses
  const facultyAnnouncements = useMemo(() => {
    return (announcements || []).filter((a) => {
      return (
        a.publishedRole === 'faculty' ||
        (currentUser?.userName && a.publishedBy?.includes(currentUser.userName)) ||
        a.targetDept === (currentUser?.deptCode || 'AIDS') ||
        a.targetDept === 'ALL'
      );
    });
  }, [announcements, currentUser]);

  const filteredAnnouncements = useMemo(() => {
    return facultyAnnouncements.filter((a) => {
      if (selectedCohortFilter !== 'ALL' && a.targetSection !== selectedCohortFilter && a.targetSection !== 'ALL') return false;

      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [facultyAnnouncements, selectedCohortFilter, searchQuery]);

  const noticesPostedByFaculty = facultyAnnouncements.filter(
    (a) => a.publishedRole === 'faculty' || (currentUser?.userName && a.publishedBy?.includes(currentUser.userName))
  ).length;

  const metrics = [
    {
      label: 'Class Notices Posted',
      value: `${noticesPostedByFaculty} Published`,
      subtext: currentUser?.userName ? `By ${currentUser.userName}` : 'By Faculty',
      state: 'info',
    },
    {
      label: 'Target Cohort Reach',
      value: `${(students || []).length} Students`,
      subtext: 'Enrolled Cohort',
      state: 'success',
    },
    {
      label: 'Department Circulars',
      value: `${facultyAnnouncements.length} Active`,
      subtext: 'AIDS Department & Campus',
      state: 'neutral',
    },
    {
      label: 'Dispatch Priority',
      value: 'Push & Portal',
      subtext: 'Real-time student alert',
      state: 'info',
    },
  ];

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please provide both notice title and content', 'error');
      return;
    }

    await publishAnnouncement({
      title: `[${formData.targetCourse}] ${formData.title}`,
      content: formData.content,
      scope: 'class',
      targetDept: currentUser?.deptCode || 'AIDS',
      targetSection: formData.targetSection,
      targetRole: 'student',
      priority: formData.priority,
      publishedBy: currentUser?.userName || 'Faculty',
      publishedRole: 'faculty',
    });

    setModalOpen(false);
    setFormData({
      title: '',
      content: '',
      targetCourse: '',
      targetSection: '',
      priority: 'normal',
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Class Noticeboard & Broadcast Dispatcher"
        title="Class Announcements"
        description="Broadcast lecture notices, laboratory instructions, test date reminders, and urgent advisories directly to your assigned student cohorts."
        actions={[
          <button
            key="post-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setModalOpen(true)}
          >
            <Send size={13} /> Dispatch Class Notice
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCohortFilter}
            onChange={(e) => setSelectedCohortFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Cohort Audiences</option>
            <option value="AIDS-A-SEM5">Section AIDS-A (CS301 & AI302)</option>
            <option value="AIDS-B-SEM5">Section AIDS-B (AI308)</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search circulars..."
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

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No notices found"
          description="Click 'Dispatch Class Notice' to broadcast instructions to your students."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredAnnouncements.map((anc) => {
            const isHighPriority = anc.priority === 'high';
            const isByMe = anc.publishedRole === 'faculty' || (currentUser?.userName && anc.publishedBy?.includes(currentUser.userName));

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
                      {anc.scope === 'class' ? 'Class Notice' : anc.scope === 'department' ? 'Department Circular' : 'Campus-Wide'}
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
                  <span>Dispatched by: <strong>{anc.publishedBy}</strong> ({anc.publishedRole || 'Author'})</span>
                  <span>•</span>
                  <span>Target Audience: <strong>{anc.targetRole || 'Students'} ({anc.targetSection || 'AIDS-A'})</strong></span>
                  {isByMe && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--state-success)', fontWeight: 600 }}>
                        <CheckCircle2 size={11} style={{ display: 'inline', marginRight: '2px' }} /> Authored by you
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISPATCH MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Dispatch Class Announcement
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Notice Title / Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring laptops with GCC for Dijkstra benchmarks tomorrow"
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
                    Teaching Course
                  </label>
                  <select
                    value={formData.targetCourse}
                    onChange={(e) => setFormData({ ...formData, targetCourse: e.target.value })}
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
                    <option value="CS301">CS301 - Data Structures</option>
                    <option value="AI302">AI302 - ML Foundations</option>
                    <option value="AI308">AI308 - Deep Learning</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Target Section Cohort
                  </label>
                  <select
                    value={formData.targetSection}
                    onChange={(e) => setFormData({ ...formData, targetSection: e.target.value })}
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
                    <option value="AIDS-A-SEM5">Section AIDS-A</option>
                    <option value="AIDS-B-SEM5">Section AIDS-B</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Priority Level
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="priority"
                      checked={formData.priority === 'normal'}
                      onChange={() => setFormData({ ...formData, priority: 'normal' })}
                    />
                    Normal Notice
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="priority"
                      checked={formData.priority === 'high'}
                      onChange={() => setFormData({ ...formData, priority: 'high' })}
                    />
                    High Priority (Urgent Push)
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Notice Content & Instructions
                </label>
                <textarea
                  rows="3"
                  placeholder="Type clear instructions for the lecture or lab session..."
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Broadcast to Enrolled Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
