import React, { useState } from 'react';
import {
  ClipboardList,
  Lock,
  Unlock,
  Clock,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function ExamCellInternals({ onNavigate }) {
  const {
    internalMarks,
    setInternalMarksLock,
    showToast,
  } = useNivara();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseRoster, setSelectedCourseRoster] = useState(null);

  const totalCourses = (internalMarks || []).length;
  const lockedCount = (internalMarks || []).filter((im) => im.status === 'locked').length;
  const pendingCount = totalCourses - lockedCount;
  const completionPct = totalCourses > 0 ? Math.round((lockedCount / totalCourses) * 100) : 100;

  const filteredMarks = (internalMarks || []).filter((im) => {
    const matchSearch =
      !searchQuery ||
      im.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      im.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      im.enteredBy?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'locked' && im.status === 'locked') ||
      (filterStatus === 'draft' && im.status !== 'locked');

    return matchSearch && matchStatus;
  });

  const handleToggleLock = (courseCode, currentStatus) => {
    const newLockState = currentStatus !== 'locked';
    setInternalMarksLock(courseCode, newLockState);
  };

  const handleLockAll = () => {
    (internalMarks || []).forEach((im) => {
      if (im.status !== 'locked') {
        setInternalMarksLock(im.courseCode, true);
      }
    });
    showToast('All continuous assessment mark slates locked for semester tabulation ✓', 'success');
  };

  const internalsMetrics = [
    {
      label: 'CIA Slates Tracked',
      value: `${totalCourses} Courses`,
      subtext: 'B.Tech Autumn Semester 5',
      state: 'info',
    },
    {
      label: 'Moderation Progress',
      value: `${completionPct}% Locked`,
      subtext: `${lockedCount} of ${totalCourses} slates finalized`,
      state: completionPct === 100 ? 'success' : 'warning',
    },
    {
      label: 'Awaiting Faculty Entry',
      value: `${pendingCount} Courses`,
      subtext: pendingCount === 0 ? 'All faculty sheets submitted' : 'Instructors notified of deadline',
      state: pendingCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Exam Cell Governance',
      value: 'Strict Lock',
      subtext: 'Re-entry requires COE authorization',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Continuous Internal Assessment (CIA) Moderation & Verification"
        title="Internal Assessment Oversight"
        description="Monitor faculty mark submissions, verify internal evaluation rubrics, identify missing components, and freeze final CIA grades for institutional tabulation."
        actions={[
          <button
            key="lock-all"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleLockAll}
          >
            <Lock size={13} /> Lock All Verified Slates
          </button>,
          <button
            key="results-view"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('marks')}
          >
            Master Marks Ledger
          </button>,
        ]}
      />

      <MetricStrip metrics={internalsMetrics} />

      {/* Filter and Search Bar */}
      <section style={{
        padding: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by course code, title, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', height: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '36px', minWidth: '150px' }}
          >
            <option value="all">All Submission States</option>
            <option value="locked">Locked & Verified</option>
            <option value="draft">Pending / Faculty Draft</option>
          </select>
        </div>
      </section>

      {/* CIA Data Table */}
      <section>
        <SectionHeader
          title="Faculty Continuous Assessment Mark Sheets"
          subtitle="Detailed status of internal mark submission by course instructors"
        />

        {filteredMarks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No Matching CIA Mark Sheets"
            message="No courses match the chosen criteria."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'courseCode',
                label: 'Course & Title',
                render: (im) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{im.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Code: {im.courseCode} · Credits: 4
                    </div>
                  </div>
                ),
              },
              {
                key: 'enteredBy',
                label: 'Course Instructor',
                render: (im) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>{im.enteredBy || 'Faculty Assigned'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department Faculty</div>
                  </div>
                ),
              },
              {
                key: 'maxMark',
                label: 'Max Weightage',
                align: 'right',
                width: '120px',
                render: (im) => (
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {im.maxMark || 25} Marks
                  </span>
                ),
              },
              {
                key: 'scoredMark',
                label: 'Benchmark Score',
                align: 'right',
                width: '140px',
                render: (im) => (
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {im.scoredMark} / {im.maxMark || 25}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Moderation Status',
                width: '180px',
                render: (im) => (
                  <span className={`badge ${im.status === 'locked' ? 'badge-success' : 'badge-warning'}`}>
                    {im.status === 'locked' ? (
                      <>
                        <Lock size={11} style={{ marginRight: '4px' }} /> Locked & Verified
                      </>
                    ) : (
                      <>
                        <Clock size={11} style={{ marginRight: '4px' }} /> Pending Faculty Lock
                      </>
                    )}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'COE Control',
                align: 'right',
                width: '200px',
                render: (im) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedCourseRoster(im)}
                    >
                      Inspect Slate
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${im.status === 'locked' ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={() => handleToggleLock(im.courseCode, im.status)}
                    >
                      {im.status === 'locked' ? (
                        <>
                          <Unlock size={12} /> Unlock
                        </>
                      ) : (
                        <>
                          <Lock size={12} /> Lock
                        </>
                      )}
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredMarks}
            keyField="courseCode"
          />
        )}
      </section>

      {/* INSPECT SLATE MODAL */}
      {selectedCourseRoster && (
        <div className="modal-backdrop" onClick={() => setSelectedCourseRoster(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  CIA Breakdown: {selectedCourseRoster.courseCode}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedCourseRoster(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <div>Subject: <strong>{selectedCourseRoster.subject}</strong></div>
                <div style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                  Instructor: {selectedCourseRoster.enteredBy} · Status: <strong>{selectedCourseRoster.status}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>Continuous Assessment 1 (Quiz & Problem Set)</span>
                  <strong>9.5 / 10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>Continuous Assessment 2 (Mid-Term Written Test)</span>
                  <strong>9.0 / 10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>Laboratory Record & Viva Voce / Assignment</span>
                  <strong>4.5 / 5</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'var(--bg-hover)', borderRadius: '3px', fontWeight: 700 }}>
                  <span>Final Scaled CIA Total (Out of 25)</span>
                  <span style={{ color: 'var(--brand-primary)' }}>{selectedCourseRoster.scoredMark} / 25</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    handleToggleLock(selectedCourseRoster.courseCode, selectedCourseRoster.status);
                    setSelectedCourseRoster(null);
                  }}
                >
                  {selectedCourseRoster.status === 'locked' ? 'Unlock Assessment' : 'Lock Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
