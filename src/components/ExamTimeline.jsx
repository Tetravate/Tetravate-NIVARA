import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Download,
  ShieldCheck,
  Check,
  AlertCircle,
  Armchair,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from './workspace';

export default function ExamTimeline({ onBack }) {
  const { examSessions, students, currentUser, showToast } = useNivara();

  const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId) || (students || [])[0] || {};

  const [expandedId, setExpandedId] = useState(null);
  const [hallTicketModal, setHallTicketModal] = useState(null);

  const totalExams = (examSessions || []).length;
  const nextExam = examSessions && examSessions.length > 0 ? examSessions[0] : null;

  const examMetrics = [
    {
      label: 'Scheduled Assessments',
      value: `${totalExams} Papers`,
      subtext: 'Autumn Mid-Term Examinations',
      state: 'info',
    },
    {
      label: 'Next Examination',
      value: nextExam ? `In ${nextExam.daysRemaining} Days` : 'None',
      subtext: nextExam ? `${nextExam.code} · ${nextExam.dateFormatted}` : 'No upcoming papers',
      state: nextExam ? 'warning' : 'neutral',
    },
    {
      label: 'Exam Center / Block',
      value: 'Block B Examination Hall',
      subtext: 'Central Campus Assessment Wing',
      state: 'neutral',
    },
    {
      label: 'Admit Card Status',
      value: student.attendancePct >= 75 ? 'Cleared & Ready' : 'Provisional Clearance',
      subtext: student.attendancePct >= 75 ? 'Continuous Attendance >75%' : 'Requires HOD Endorsement',
      state: student.attendancePct >= 75 ? 'success' : 'warning',
    },
  ];

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Formal Assessment Schedule · Autumn 2026 · Office of the COE"
        title="Exams & Seating Allotment"
        description="Official university mid-semester assessments with designated examination hall seating and digital admit cards."
        actions={
          onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          )
        }
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={examMetrics} />

      {/* 3. Examination Assessments List */}
      <section>
        <SectionHeader
          title={`Scheduled Assessment Sessions (${totalExams})`}
          subtitle="Timetable verified by Controller of Examinations"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(!examSessions || examSessions.length === 0) ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming examinations scheduled"
              description="Assessment timetables and seating charts will appear here once finalized by the Examination Cell."
            />
          ) : (
            examSessions.map((exam) => {
              const isExpanded = expandedId === exam.id;
              const dateParts = (exam.dateFormatted || '12 OCT').split(' ');

              return (
                <div
                  key={exam.id}
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.15rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          textAlign: 'center',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.4rem 0.65rem',
                          minWidth: '58px',
                        }}
                      >
                        <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          {dateParts[1] || 'OCT'}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                          {dateParts[0] || '12'}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {exam.subject}
                          </span>
                          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {exam.code}
                          </span>
                          <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>
                            {exam.examType || 'Mid-Term Paper'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          In <strong>{exam.daysRemaining} days</strong> · Seating: <strong>{exam.seatingSeat}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setHallTicketModal(exam)}
                      >
                        <Download size={12} /> Hall Ticket
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setExpandedId(isExpanded ? null : exam.id)}
                      >
                        {isExpanded ? 'Hide' : 'Instructions'}
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.65rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={12} color="var(--text-muted)" /> {exam.time} ({exam.day || 'Scheduled'})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={12} color="var(--text-muted)" /> {exam.venue}
                    </span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Armchair size={13} /> Desk Allocation: {exam.seatingSeat}
                    </span>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                        Candidate Examination Directives:
                      </strong>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        <li>Carry valid physical university smart card ID and printed digital admit card.</li>
                        <li>Entry into {exam.venue} begins strictly 15 minutes prior to session commencement.</li>
                        <li>Calculators and formula sheets permitted according to paper syllabus guidelines.</li>
                        <li>Candidate assigned specifically to Terminal / Desk <strong>{exam.seatingSeat}</strong>.</li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. Digital Hall Ticket Modal */}
      {hallTicketModal && (
        <div className="modal-backdrop" onClick={() => setHallTicketModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Official Digital Hall Ticket
                </h3>
              </div>
              <button type="button" onClick={() => setHallTicketModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  border: '2px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  background: 'var(--bg-canvas)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-blue)' }}>
                      Office of the Controller of Examinations
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Autumn 2026 Examination Admit Slip
                    </div>
                  </div>
                  <span className="badge badge-success">
                    <Check size={11} /> Verified Clearance
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Registration ID:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{student.id}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Subject Paper:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hallTicketModal.subject} ({hallTicketModal.code})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Examination Date:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hallTicketModal.dateFormatted} ({hallTicketModal.time})</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Examination Venue:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hallTicketModal.venue}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Terminal:</span>
                    <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{hallTicketModal.seatingSeat}</div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    BARCODE: ||||| | |||| ||| ||||||| | {hallTicketModal.code}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--state-success)', fontWeight: 600 }}>
                    Attendance: {student.attendancePct}% (Cleared)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Hall Ticket for ${hallTicketModal.code} downloaded successfully ✓`, 'success');
                    setHallTicketModal(null);
                  }}
                >
                  <Download size={12} /> Save PDF Admit Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
