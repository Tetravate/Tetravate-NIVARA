import React, { useState } from 'react';
import {
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

const LIFECYCLE_STAGES = [
  'Draft',
  'Scheduled',
  'Published',
  'Conducted',
  'Marks Processing',
  'Results Processing',
  'Completed',
];

export default function ExamCellManagement({ onNavigate }) {
  const { examSessions, updateExamSession, showToast } = useNivara();

  const [statusFilter, setStatusFilter] = useState('all');

  const handleStageAdvance = (session) => {
    const currentIdx = LIFECYCLE_STAGES.indexOf(session.status || 'Scheduled');
    if (currentIdx < LIFECYCLE_STAGES.length - 1) {
      const nextStage = LIFECYCLE_STAGES[currentIdx + 1];
      updateExamSession(session.id, { status: nextStage });
      showToast(`${session.code} transitioned to: ${nextStage} ✓`, 'success');
    } else {
      showToast(`${session.code} has already completed the final examination cycle.`, 'info');
    }
  };

  const handleSetStage = (sessionId, newStage) => {
    updateExamSession(sessionId, { status: newStage });
    showToast(`Session updated to ${newStage} ✓`, 'success');
  };

  const filteredSessions = (examSessions || []).filter((s) => {
    if (statusFilter === 'all') return true;
    return (s.status || 'Scheduled').toLowerCase() === statusFilter.toLowerCase();
  });

  const scheduledCount = (examSessions || []).filter((s) => (s.status || 'Scheduled') === 'Scheduled').length;
  const processingCount = (examSessions || []).filter(
    (s) => s.status === 'Marks Processing' || s.status === 'Results Processing'
  ).length;
  const completedCount = (examSessions || []).filter((s) => s.status === 'Completed' || s.status === 'Conducted').length;

  const managementMetrics = [
    {
      label: 'Lifecycle Series',
      value: `${(examSessions || []).length} Exams`,
      subtext: 'Autumn 2026 Assessment Pipeline',
      state: 'info',
    },
    {
      label: 'Scheduled / Published',
      value: `${scheduledCount} Sessions`,
      subtext: 'Timetable live on student portals',
      state: 'neutral',
    },
    {
      label: 'Tabulation & Processing',
      value: `${processingCount} Active`,
      subtext: 'Moderation boards convening',
      state: processingCount > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Conducted / Concluded',
      value: `${completedCount} Concluded`,
      subtext: 'Answer scripts secured in strongroom',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Examination Operations Lifecycle & Governance"
        title="Exam Lifecycle Management"
        description="Oversee the formal examination lifecycle from timetable drafting, hall conduction, and invigilation through marks moderation and final gazette processing."
        actions={[
          <button
            key="timetable"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('schedules')}
          >
            Manage Schedules
          </button>,
        ]}
      />

      <MetricStrip metrics={managementMetrics} />

      {/* Lifecycle Stage Visual Indicator */}
      <section style={{
        padding: '1.25rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
          OFFICIAL EXAMINATION GOVERNANCE LIFECYCLE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {LIFECYCLE_STAGES.map((stage, idx) => (
            <React.Fragment key={stage}>
              <div style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--brand-primary)',
                  color: 'white',
                  fontSize: '0.65rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {idx + 1}
                </span>
                {stage}
              </div>
              {idx < LIFECYCLE_STAGES.length - 1 && (
                <ChevronRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Filter and Session Table */}
      <section>
        <SectionHeader
          title="Examination Series Roster"
          subtitle="Governed progression of all papers in the active assessment term"
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '32px', fontSize: '0.8125rem' }}
              >
                <option value="all">All Stages</option>
                {LIFECYCLE_STAGES.map((s) => (
                  <option key={s} value={s.toLowerCase()}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Examinations in Selected Stage"
            message="No active sessions match the chosen filter."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'code',
                label: 'Course & Subject',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Code: {ex.code} · Dept: {ex.department || 'AI & Data Science'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'examType',
                label: 'Series & Academic Year',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600 }}>{ex.examType}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      AY 2026-2027 · Sem {ex.semester || 5}
                    </div>
                  </div>
                ),
              },
              {
                key: 'dateFormatted',
                label: 'Session Window',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{ex.dateFormatted}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.time}</div>
                  </div>
                ),
              },
              {
                key: 'venue',
                label: 'Venue & Hall Allotment',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>{ex.venue}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Invigilator Desk: {ex.seatingSeat || 'Assigned'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Current Lifecycle Stage',
                render: (ex) => {
                  const st = ex.status || 'Scheduled';
                  return (
                    <select
                      className="input-field"
                      value={st}
                      onChange={(e) => handleSetStage(ex.id, e.target.value)}
                      style={{ height: '30px', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {LIFECYCLE_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  );
                },
              },
              {
                key: 'actions',
                label: 'Advance Stage',
                align: 'right',
                width: '150px',
                render: (ex) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStageAdvance(ex)}
                  >
                    Advance <ChevronRight size={12} />
                  </button>
                ),
              },
            ]}
            data={filteredSessions}
            keyField="id"
          />
        )}
      </section>
    </div>
  );
}
