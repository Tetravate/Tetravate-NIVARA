import React, { useState } from 'react';
import {
  FileText,
  Award,
  Download,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from '../workspace';

export default function ExamCellDashboard() {
  const {
    activeTab,
    setActiveTab,
    examSessions,
    internalMarks,
    publishedResults,
    publishExamResults,
    showToast,
  } = useNivara();

  const [seatingModal, setSeatingModal] = useState(null);

  const handlePublishResults = () => {
    publishExamResults();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const lockedMarksCount = internalMarks.filter((im) => im.status === 'locked').length;

  const examMetrics = [
    {
      label: 'Scheduled Exams',
      value: `${examSessions.length} Sessions`,
      subtext: 'Autumn 2026 Internal II',
      state: 'info',
    },
    {
      label: 'CIA Slates Verified',
      value: `${lockedMarksCount} / ${internalMarks.length}`,
      subtext: lockedMarksCount === internalMarks.length ? '100% Locked' : 'Faculty entries pending',
      state: lockedMarksCount === internalMarks.length ? 'success' : 'warning',
    },
    {
      label: 'Moderation Pass Rate',
      value: `${publishedResults.departmentPassPct}%`,
      subtext: 'Across evaluated divisions',
      state: 'success',
    },
    {
      label: 'Publishing Status',
      value: publishedResults.status === 'published' ? 'Published' : 'Ready',
      subtext: 'Semester 4 Final Moderated',
      state: publishedResults.status === 'published' ? 'success' : 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Exam Cell Controller Persona) */}
      <PageHeader
        eyebrow="Office of the Controller of Examinations · Exam Cell"
        title="Examination & Evaluation Operations"
        description="Manage assessment schedules, collect verified internal marks, and publish official semester results."
        actions={[
          <button
            key="seating-master"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Generating comprehensive seat allotment blueprint for Hall B and Computing Center', 'info')}
          >
            <Printer size={13} /> Seating Master Map
          </button>,
        ]}
      />

      {/* 2. Key Workflow Metrics */}
      <MetricStrip metrics={examMetrics} />

      {/* VIEW: EXAM SCHEDULES (Default on home or related modules) */}
      {(!['internals', 'marks', 'publish', 'results'].includes(activeTab)) && (
        <section>
          <SectionHeader
            title="Scheduled Examination Sessions"
            subtitle="Autumn 2026 Internal Assessment II timetable and venue allocations"
          />

          <DataTable
            columns={[
              {
                key: 'subject',
                label: 'Subject & Code',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ex.code}</div>
                  </div>
                ),
              },
              {
                key: 'examType',
                label: 'Type',
                width: '140px',
                render: (ex) => <span className="badge badge-info">{ex.examType}</span>,
              },
              {
                key: 'dateFormatted',
                label: 'Date & Time',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{ex.dateFormatted}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.time}</div>
                  </div>
                ),
              },
              {
                key: 'venue',
                label: 'Venue',
                render: (ex) => <strong>{ex.venue}</strong>,
              },
              {
                key: 'seatingSeat',
                label: 'Seating Desk',
                render: (ex) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ex.seatingSeat}</span>,
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
        </section>
      )}

      {/* VIEW: FACULTY CIA MARKS COLLECTION */}
      {(activeTab === 'internals' || activeTab === 'marks') && (
        <section>
          <SectionHeader
            title="Faculty Continuous Assessment Mark Sheets"
            subtitle="Required marks moderation prior to final semester tabulation"
          />

          <DataTable
            columns={[
              {
                key: 'subject',
                label: 'Subject',
                render: (im) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{im.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: {im.enteredBy}</div>
                  </div>
                ),
              },
              {
                key: 'courseCode',
                label: 'Code',
                width: '90px',
                render: (im) => <span className="badge badge-neutral">{im.courseCode}</span>,
              },
              {
                key: 'maxMark',
                label: 'Max Marks',
                align: 'right',
                render: (im) => im.maxMark,
              },
              {
                key: 'scoredMark',
                label: 'Benchmark Score',
                align: 'right',
                render: (im) => <span style={{ fontWeight: 700 }}>{im.scoredMark} / 25</span>,
              },
              {
                key: 'status',
                label: 'Verification Status',
                width: '180px',
                render: (im) => (
                  <span className={`badge ${im.status === 'locked' ? 'badge-success' : 'badge-warning'}`}>
                    {im.status === 'locked' ? 'Verified & Locked' : 'Pending Faculty Submission'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Action',
                align: 'right',
                width: '120px',
                render: (im) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => showToast(`Opening verified grade roster for ${im.courseCode}`, 'info')}
                  >
                    Verify Slate
                  </button>
                ),
              },
            ]}
            data={internalMarks}
            keyField="courseCode"
          />
        </section>
      )}

      {/* VIEW: PUBLISH RESULTS */}
      {(activeTab === 'publish' || activeTab === 'results') && (
        <section>
          <SectionHeader
            title="Result Moderation & Formal Publishing"
            subtitle="Semester evaluation publishing pipeline"
          />

          <div style={{
            padding: '1.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            marginTop: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Semester 4 Final Moderated Grade Sheets
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Evaluation status: <strong>{publishedResults.status === 'published' ? 'Officially Published & Distributed' : 'Under Committee Moderation'}</strong> · Pass Rate: <strong>{publishedResults.departmentPassPct}%</strong>
                </div>
              </div>

              <span className={`badge ${publishedResults.status === 'published' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                {publishedResults.status === 'published' ? 'Published to Portals' : 'Ready for Publishing'}
              </span>
            </div>

            <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Publishing formal results synchronizes verified grade sheets to all student portfolios, computes updated cumulative CGPAs, and notifies the Principal and HODs immediately.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePublishResults}
              >
                <Award size={14} /> Publish Semester Results Now
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SEATING ROSTER MODAL */}
      {seatingModal && (
        <div className="modal-backdrop" onClick={() => setSeatingModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Seating Roster: {seatingModal.code}
                </h3>
              </div>
              <button type="button" onClick={() => setSeatingModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                Venue: <strong>{seatingModal.venue}</strong> · Scheduled: {seatingModal.dateFormatted} ({seatingModal.time})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS001 - Aarav Sharma</span>
                  <strong>Desk B-11</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS003 - Arun Kumar</span>
                  <strong>Desk B-12</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS014 - Kavin Venkatesh</span>
                  <strong>Desk B-13</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg-hover)', borderRadius: '3px', border: '1px solid var(--brand-primary)' }}>
                  <span>22AIDS042 - Aadhi Narayanan</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{seatingModal.seatingSeat}</strong>
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
                  <Download size={12} /> Download Print Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
