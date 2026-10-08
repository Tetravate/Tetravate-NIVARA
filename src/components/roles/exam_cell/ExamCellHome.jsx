import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Download,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function ExamCellHome({ onNavigate }) {
  const {
    examSessions,
    internalMarks,
    publishedResults,
    revaluationRequests,
    auditLogs,
    roomConflicts,
    setInternalMarksLock,
    showToast,
  } = useNivara();

  const [seatingModal, setSeatingModal] = useState(null);

  const lockedMarksCount = (internalMarks || []).filter((im) => im.status === 'locked').length;
  const pendingRevalCount = (revaluationRequests || []).filter(
    (r) => r.status === 'submitted' || r.status === 'under_review'
  ).length;

  const examMetrics = [
    {
      label: 'Scheduled Exams',
      value: `${(examSessions || []).length} Sessions`,
      subtext: 'Autumn 2026 Examination Series',
      state: 'info',
    },
    {
      label: 'CIA Slates Moderated',
      value: `${lockedMarksCount} / ${(internalMarks || []).length} Courses`,
      subtext: lockedMarksCount === (internalMarks || []).length ? '100% Moderated & Locked' : 'Faculty submissions pending',
      state: lockedMarksCount === (internalMarks || []).length ? 'success' : 'warning',
    },
    {
      label: 'Revaluation Queue',
      value: `${pendingRevalCount} Pending`,
      subtext: pendingRevalCount === 0 ? 'All reviews completed' : 'Requires committee reassessment',
      state: pendingRevalCount > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Result Gazette Status',
      value: publishedResults?.status === 'published' ? 'Published' : 'Moderation Ready',
      subtext: `Pass rate benchmark: ${publishedResults?.departmentPassPct || 94.2}%`,
      state: publishedResults?.status === 'published' ? 'success' : 'neutral',
    },
  ];

  // Exam cell relevant audit entries
  const examAuditEntries = (auditLogs || []).filter(
    (log) =>
      log.actorRole === 'Exam Cell' ||
      log.action?.toLowerCase().includes('exam') ||
      log.action?.toLowerCase().includes('result') ||
      log.action?.toLowerCase().includes('cia') ||
      log.action?.toLowerCase().includes('revaluation')
  ).slice(0, 5);

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Exam Cell Controller Persona) */}
      <PageHeader
        eyebrow="Office of the Controller of Examinations · Operational Control"
        title="Examination & Evaluation Command"
        description="Comprehensive administration of institutional timetables, continuous internal assessment moderation, hall seating maps, and official result publishing."
        actions={[
          <button
            key="seating-master"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Generated institutional hall blueprint for Block B and Academic Auditorium', 'info')}
          >
            <Printer size={13} /> Seating Master Map
          </button>,
          <button
            key="schedule-action"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('schedules')}
          >
            <Plus size={13} /> Schedule Exam
          </button>,
        ]}
      />

      {/* 2. Key Workflow Metrics Strip */}
      <MetricStrip metrics={examMetrics} />

      {/* 3. Upcoming Examination Sessions */}
      <section>
        <SectionHeader
          title="Scheduled Examination Sessions"
          subtitle="Timetable allocations, examination halls, and invigilation rosters"
          actions={
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate && onNavigate('calendar')}
            >
              Full Calendar <ArrowRight size={13} />
            </button>
          }
        />

        {(!examSessions || examSessions.length === 0) ? (
          <EmptyState
            icon={Calendar}
            title="No Active Examination Sessions"
            message="No sessions are currently scheduled for the Autumn 2026 evaluation period."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'subject',
                label: 'Course & Subject',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {ex.code}
                    </div>
                  </div>
                ),
              },
              {
                key: 'examType',
                label: 'Assessment Type',
                width: '160px',
                render: (ex) => <span className="badge badge-info">{ex.examType}</span>,
              },
              {
                key: 'dateFormatted',
                label: 'Date & Time Slot',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{ex.dateFormatted} ({ex.day || 'Day'})</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.time}</div>
                  </div>
                ),
              },
              {
                key: 'venue',
                label: 'Examination Venue',
                render: (ex) => <strong>{ex.venue}</strong>,
              },
              {
                key: 'seatingSeat',
                label: 'Sample Desk',
                render: (ex) => (
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {ex.seatingSeat || 'Assigned'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Action',
                align: 'right',
                width: '160px',
                render: (ex) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSeatingModal(ex)}
                  >
                    View Seating Roster
                  </button>
                ),
              },
            ]}
            data={examSessions}
            keyField="id"
          />
        )}
      </section>

      {/* 4. Two-Column Operational Control: CIA Slates & Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Continuous Assessment Moderation Status */}
        <section>
          <SectionHeader
            title="CIA Mark Sheet Moderation"
            subtitle="Faculty submissions requiring Exam Cell validation prior to result tabulation"
            actions={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate && onNavigate('internals')}
              >
                Manage Slates <ArrowRight size={13} />
              </button>
            }
          />

          <DataTable
            columns={[
              {
                key: 'courseCode',
                label: 'Course',
                width: '90px',
                render: (im) => <span className="badge badge-neutral">{im.courseCode}</span>,
              },
              {
                key: 'subject',
                label: 'Subject & Faculty',
                render: (im) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{im.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{im.enteredBy}</div>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (im) => (
                  <span className={`badge ${im.status === 'locked' ? 'badge-success' : 'badge-warning'}`}>
                    {im.status === 'locked' ? 'Locked' : 'Faculty Draft'}
                  </span>
                ),
              },
              {
                key: 'action',
                label: 'Moderation',
                align: 'right',
                render: (im) => (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setInternalMarksLock(im.courseCode, im.status !== 'locked')}
                  >
                    {im.status === 'locked' ? 'Unlock' : 'Lock Slate'}
                  </button>
                ),
              },
            ]}
            data={internalMarks}
            keyField="courseCode"
          />
        </section>

        {/* Right: Operational Watch & Conflicts */}
        <section>
          <SectionHeader
            title="Operational Surveillance & Revaluations"
            subtitle="Active collisions, grievance appeals, and publishing readiness"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Revaluation Queue Callout */}
            <div style={{
              padding: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  Revaluation Grievance Queue
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {pendingRevalCount} pending student appeals awaiting second-examiner valuation
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate && onNavigate('revaluation')}
              >
                Review Appeals
              </button>
            </div>

            {/* Room Conflict Alert */}
            {(roomConflicts || []).length > 0 ? (
              <div style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid var(--border-danger, #ef4444)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger, #ef4444)', fontWeight: 700 }}>
                  <AlertTriangle size={15} /> Room Booking Conflict Detected
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  {roomConflicts[0].detail}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '0.875rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--color-success, #10b981)',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={16} /> All examination venues cleared of scheduling conflicts.
              </div>
            )}

            {/* Result Publication Snapshot */}
            <div style={{
              padding: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Semester {publishedResults?.semester || 4} Gazette
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Status: <strong>{publishedResults?.status === 'published' ? 'Officially Distributed' : 'Draft / Moderation'}</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate && onNavigate('results')}
              >
                Results Pipeline
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 5. Exam Cell Activity Trail */}
      <section>
        <SectionHeader
          title="Recent Examination Cell Operations"
          subtitle="Audit log events triggered by examination administrators and controllers"
        />

        {examAuditEntries.length === 0 ? (
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No recent examination logs recorded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {examAuditEntries.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.action}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.details} · <span style={{ fontFamily: 'var(--font-mono)' }}>{log.actorName}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEATING ROSTER MODAL */}
      {seatingModal && (
        <div className="modal-backdrop" onClick={() => setSeatingModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Seating Roster: {seatingModal.code}
                </h3>
              </div>
              <button type="button" onClick={() => setSeatingModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                Venue: <strong>{seatingModal.venue}</strong> · Scheduled: {seatingModal.dateFormatted} ({seatingModal.time})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS001 - Aarav Sharma</span>
                  <strong>Desk B-11</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS003 - Arun Kumar</span>
                  <strong>Desk B-12</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS014 - Kavin Venkatesh</span>
                  <strong>Desk B-13</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-hover)', borderRadius: '3px', border: '1px solid var(--brand-primary)' }}>
                  <span>22AIDS042 - Aadhi Narayanan</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{seatingModal.seatingSeat || 'Desk B-14'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Seating roster print file for ${seatingModal.code} generated ✓`, 'success');
                    setSeatingModal(null);
                  }}
                >
                  <Download size={13} /> Download Print Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
