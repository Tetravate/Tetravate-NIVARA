import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Users,
  Edit2,
  Award,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementInterviews({ onNavigate }) {
  const {
    placementInterviews,
    scheduleInterview,
    updateInterviewOutcome,
    studentPlacementApplications,
    placementDrives,
    showToast,
  } = useNivara();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [outcomeModalTarget, setOutcomeModalTarget] = useState(null);

  // Form state for scheduling
  const [scheduleForm, setScheduleForm] = useState({
    candidateAppIndex: 0,
    type: 'Interview',
    stage: 'Technical Interview (Round 1)',
    scheduledDate: '2026-10-18',
    timeSlot: '10:00 AM – 11:00 AM',
    venue: 'CDC Interview Suite 1',
    panel: 'CDC Technical Panelist',
    scoreOrNotes: '',
  });

  // Outcome form state
  const [outcomeForm, setOutcomeForm] = useState({
    status: 'selected',
    scoreOrNotes: '',
    advanceStage: 'Technical Interview (Round 2)',
  });

  // Active applicants eligible for scheduling
  const availableCandidates = useMemo(() => {
    return (studentPlacementApplications || []).filter(
      (a) =>
        !a.stage?.toLowerCase().includes('reject') &&
        !a.stage?.toLowerCase().includes('not selected')
    );
  }, [studentPlacementApplications]);

  const handleOpenSchedule = () => {
    setScheduleForm({
      candidateAppIndex: 0,
      type: 'Interview',
      stage: 'Technical Interview (Round 1)',
      scheduledDate: '2026-10-18',
      timeSlot: '10:00 AM – 11:00 AM',
      venue: 'CDC Interview Suite 1',
      panel: 'CDC Technical Panelist',
      scoreOrNotes: '',
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const candidate = availableCandidates[scheduleForm.candidateAppIndex];
    if (!candidate) {
      showToast('Please select a valid candidate from active applications', 'warning');
      return;
    }

    scheduleInterview({
      driveId: candidate.driveId,
      company: candidate.company,
      studentId: candidate.studentId,
      studentName: candidate.studentName,
      type: scheduleForm.type,
      stage: scheduleForm.stage,
      scheduledDate: scheduleForm.scheduledDate,
      timeSlot: scheduleForm.timeSlot,
      venue: scheduleForm.venue,
      panel: scheduleForm.panel,
      scoreOrNotes: scheduleForm.scoreOrNotes || 'Scheduled by Career Development Center',
    });

    setShowScheduleModal(false);
  };

  const handleOpenOutcome = (interview) => {
    setOutcomeModalTarget(interview);
    setOutcomeForm({
      status: interview.status === 'scheduled' ? 'selected' : interview.status,
      scoreOrNotes: interview.scoreOrNotes || '',
      advanceStage:
        interview.stage.includes('Round 1')
          ? 'Technical Interview (Round 2)'
          : interview.stage.includes('Round 2')
          ? 'Final HR Evaluation'
          : interview.stage.includes('HR')
          ? 'Offer Extended (Selected)'
          : 'Technical Interview (Round 1)',
    });
  };

  const handleOutcomeSubmit = (e) => {
    e.preventDefault();
    if (!outcomeModalTarget) return;

    updateInterviewOutcome(
      outcomeModalTarget.id,
      outcomeForm.status,
      outcomeForm.scoreOrNotes,
      outcomeForm.status === 'selected' ? outcomeForm.advanceStage : null
    );

    setOutcomeModalTarget(null);
  };

  // Filtered interviews
  const filteredInterviews = useMemo(() => {
    return (placementInterviews || []).filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        (item.panel || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.venue || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : item.status === statusFilter;

      const matchesType =
        typeFilter === 'all' ? true : item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [placementInterviews, search, statusFilter, typeFilter]);

  // Metrics
  const totalRounds = (placementInterviews || []).length;
  const scheduledCount = (placementInterviews || []).filter((i) => i.status === 'scheduled').length;
  const completedCount = (placementInterviews || []).filter((i) => i.status === 'completed' || i.status === 'selected').length;
  const selectedCount = (placementInterviews || []).filter((i) => i.status === 'selected').length;

  const metrics = [
    {
      label: 'Scheduled Selection Rounds',
      value: `${scheduledCount} Pending`,
      subtext: `${totalRounds} total rounds on docket`,
      state: scheduledCount > 0 ? 'info' : 'neutral',
    },
    {
      label: 'Evaluations Completed',
      value: `${completedCount} Finished`,
      subtext: 'Feedback recorded by panels',
      state: 'neutral',
    },
    {
      label: 'Candidates Cleared / Selected',
      value: `${selectedCount} Selected`,
      subtext: 'Advanced to subsequent rounds',
      state: 'success',
    },
    {
      label: 'Conversion to Offer Stage',
      value: totalRounds > 0 ? `${Math.round((selectedCount / totalRounds) * 100)}%` : '0%',
      subtext: `${selectedCount} cleared of ${totalRounds} rounds`,
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Selection Schedules"
        title="Tests, Assessments & Interview Rounds"
        description="Coordinate proctored online assessments, technical coding interviews, and final HR evaluations. Record evaluation outcomes and feedback to advance candidates across the hiring pipeline."
        actions={[
          <button
            key="schedule-round"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenSchedule}
          >
            <Plus size={13} /> Schedule New Round
          </button>,
        ]}
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={metrics} />

      {/* 3. Schedules Table */}
      <section>
        <SectionHeader
          title="Interview & Assessment Docket"
          subtitle="All scheduled rounds with assigned venues, timing, and evaluation status"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter candidate, company, panel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem 0.25rem 1.65rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    width: '100%',
                  }}
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter round type"
              >
                <option value="all">All Types</option>
                <option value="Assessment">Online Assessment</option>
                <option value="Interview">Interview</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter interview status"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="selected">Selected / Cleared</option>
                <option value="rejected">Rejected</option>
                <option value="not_attended">Not Attended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'studentName',
              label: 'Candidate & Target Drive',
              render: (item) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.studentName}
                    </strong>
                    <span className="badge badge-info">{item.type}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {item.company} · <strong style={{ color: 'var(--text-secondary)' }}>{item.stage}</strong>
                  </div>
                </div>
              ),
            },
            {
              key: 'scheduledDate',
              label: 'Date & Time Slot',
              width: '180px',
              render: (item) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <Calendar size={12} color="var(--brand-blue)" /> {item.scheduledDate}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {item.timeSlot}
                  </div>
                </div>
              ),
            },
            {
              key: 'venue',
              label: 'Venue & Assessment Panel',
              render: (item) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                    <MapPin size={11} color="var(--text-muted)" />
                    <span>{item.venue}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Panel: {item.panel}
                  </div>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              width: '130px',
              render: (item) => {
                const isSelected = item.status === 'selected';
                const isRejected = item.status === 'rejected';
                const isScheduled = item.status === 'scheduled';
                return (
                  <span className={`badge ${isSelected ? 'badge-success' : isRejected ? 'badge-urgent' : isScheduled ? 'badge-info' : 'badge-neutral'}`}>
                    {item.status.toUpperCase()}
                  </span>
                );
              },
            },
            {
              key: 'scoreOrNotes',
              label: 'Feedback / Notes',
              render: (item) => (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.scoreOrNotes || 'Pending assessment completion'}
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'Action',
              align: 'right',
              width: '140px',
              render: (item) => (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => handleOpenOutcome(item)}
                >
                  Record Result
                </button>
              ),
            },
          ]}
          data={filteredInterviews}
          keyField="id"
          emptyMessage="No tests or interviews match the selected parameters."
        />
      </section>

      {/* 4. MODAL: Schedule New Round */}
      {showScheduleModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowScheduleModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Schedule Selection Round / Interview
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Target Candidate & Application
                </label>
                <select
                  value={scheduleForm.candidateAppIndex}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, candidateAppIndex: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  required
                >
                  {availableCandidates.map((app, idx) => (
                    <option key={idx} value={idx}>
                      {app.studentName} — {app.company} ({app.role || 'Role'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Format / Type</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Interview">Technical / HR Interview</option>
                    <option value="Assessment">Online Coding / Aptitude Test</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Selection Stage</label>
                  <select
                    value={scheduleForm.stage}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, stage: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Technical Interview (Round 1)">Technical Interview (Round 1)</option>
                    <option value="Technical Interview (Round 2)">Technical Interview (Round 2)</option>
                    <option value="Final HR Evaluation">Final HR Evaluation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Scheduled Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 18 Oct 2026"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Time Slot Window</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM – 11:30 AM"
                    value={scheduleForm.timeSlot}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Room / Venue / Lab</label>
                  <input
                    type="text"
                    placeholder="e.g. CDC Interview Suite 2"
                    value={scheduleForm.venue}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Panel / Evaluator</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Priya Raman / Mr. S. Iyer"
                    value={scheduleForm.panel}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, panel: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Instructions / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Candidate preparation instructions, system requirements, or assessment link notes..."
                  value={scheduleForm.scoreOrNotes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scoreOrNotes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Record Result & Feedback */}
      {outcomeModalTarget && (
        <div
          className="modal-backdrop"
          onClick={() => setOutcomeModalTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Record Round Outcome
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {outcomeModalTarget.studentName} · {outcomeModalTarget.company} ({outcomeModalTarget.stage})
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setOutcomeModalTarget(null)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleOutcomeSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Round Decision / Status
                </label>
                <select
                  value={outcomeForm.status}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="selected">Selected / Cleared Round</option>
                  <option value="rejected">Rejected / Not Selected</option>
                  <option value="completed">Completed (Evaluation Under Review)</option>
                  <option value="not_attended">Candidate Not Attended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {outcomeForm.status === 'selected' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--state-success)', marginBottom: '0.2rem' }}>
                    Advance Candidate Pipeline To:
                  </label>
                  <select
                    value={outcomeForm.advanceStage}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, advanceStage: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Technical Interview (Round 2)">Technical Interview (Round 2)</option>
                    <option value="Final HR Evaluation">Final HR Evaluation</option>
                    <option value="Offer Extended (Selected)">Offer Extended (Selected)</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Score, Performance Metrics & Panel Remarks
                </label>
                <textarea
                  rows="3"
                  placeholder="Coding assessment score (e.g. 94/100), algorithmic problem solving quality, communication feedback..."
                  value={outcomeForm.scoreOrNotes}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, scoreOrNotes: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setOutcomeModalTarget(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Evaluation Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
