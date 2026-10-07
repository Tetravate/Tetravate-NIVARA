import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Send,
  Upload,
  FileCheck,
  Award,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from './workspace';

export default function AssignmentsView({ onBack }) {
  const { assignments, toggleAssignmentCompletion, submitStudentAssignment, currentUser } = useNivara();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'urgent' | 'pending' | 'submitted' | 'graded'
  const [expandedId, setExpandedId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [repoLink, setRepoLink] = useState('');

  const activeStudentId = currentUser?.studentId || '2024-AIDS-042';

  // Derived metrics
  const totalCount = assignments.length;
  const urgentCount = assignments.filter((a) => a.urgency === 'urgent' && !a.completed).length;
  const pendingCount = assignments.filter((a) => !a.completed).length;
  const submittedCount = assignments.filter((a) => a.completed && !a.grade).length;
  const gradedCount = assignments.filter((a) => Boolean(a.grade)).length;

  const assignmentMetrics = [
    {
      label: 'Deliverables Assigned',
      value: `${totalCount} Tasks`,
      subtext: 'Autumn 2026 Curriculum',
      state: 'info',
    },
    {
      label: 'Due Within 48 Hours',
      value: `${urgentCount} Urgent`,
      subtext: urgentCount > 0 ? 'Action required immediately' : 'No imminent deadlines',
      state: urgentCount > 0 ? 'urgent' : 'success',
    },
    {
      label: 'In Progress Queue',
      value: `${pendingCount} Pending`,
      subtext: 'Awaiting student completion',
      state: pendingCount > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Graded Submissions',
      value: `${gradedCount} Assessed`,
      subtext: 'Continuous CIA component',
      state: 'success',
    },
  ];

  const filtered = assignments.filter((a) => {
    if (activeFilter === 'urgent') return a.urgency === 'urgent' && !a.completed;
    if (activeFilter === 'pending') return !a.completed;
    if (activeFilter === 'submitted') return a.completed && !a.grade;
    if (activeFilter === 'graded') return Boolean(a.grade);
    return true;
  });

  const handleToggle = (id) => {
    const item = assignments.find((a) => a.id === id);
    if (item && !item.completed) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#026AA2', '#027A48', '#FDB022'],
      });
    }
    toggleAssignmentCompletion(id);
  };

  const handleOpenSubmit = (item) => {
    setSubmittingId(item.id);
    // Find existing submission if student already submitted
    const existingSub = (item.submissions || []).find((s) => s.studentId === activeStudentId);
    if (existingSub && existingSub.notes) {
      setRepoLink(existingSub.notes);
      setSubmissionNotes('');
    } else {
      setRepoLink('https://github.com/aadhi-narayanan/assignment-solution');
      setSubmissionNotes('');
    }
  };

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!submittingId) return;
    const finalNote = repoLink ? `${repoLink}${submissionNotes ? ` — Note: ${submissionNotes}` : ''}` : submissionNotes;
    submitStudentAssignment(submittingId, finalNote);
    setSubmittingId(null);
    setRepoLink('');
    setSubmissionNotes('');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Continuous Evaluation · Semester 5 · Autumn 2026"
        title="Assignments & Deliverables"
        description="Prioritized academic coursework, programming problem sets, and faculty evaluation grades."
        actions={
          onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          )
        }
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={assignmentMetrics} />

      {/* 3. Filter Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'all', label: `All Deliverables (${totalCount})` },
          { id: 'urgent', label: `Due Soon (${urgentCount})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'submitted', label: `Submitted (${submittedCount})` },
          { id: 'graded', label: `Graded (${gradedCount})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`btn btn-sm ${activeFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 4. Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No deliverables found in this view"
            description="All coursework deliverables matching this filter category are current and up to date."
          />
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const mySubmission = (item.submissions || []).find((s) => s.studentId === activeStudentId);

            return (
              <div
                key={item.id}
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: item.completed ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  opacity: item.completed ? 0.92 : 1,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div
                    className={`checkbox-custom ${item.completed ? 'checked' : ''}`}
                    onClick={() => handleToggle(item.id)}
                    role="checkbox"
                    aria-checked={item.completed}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleToggle(item.id);
                      }
                    }}
                    style={{ marginTop: '3px' }}
                    title={item.completed ? 'Mark as In Progress' : 'Mark as Complete'}
                  >
                    {item.completed && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          textDecoration: item.completed && !item.grade ? 'line-through' : 'none',
                        }}
                      >
                        {item.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.grade ? (
                          <span className="badge badge-success">
                            <Award size={11} /> Grade: {item.grade}
                          </span>
                        ) : item.completed ? (
                          <span className="badge badge-success">
                            <FileCheck size={11} /> Submitted
                          </span>
                        ) : item.urgency === 'urgent' ? (
                          <span className="badge badge-urgent">
                            <AlertTriangle size={11} /> Due Tomorrow
                          </span>
                        ) : item.urgency === 'important' ? (
                          <span className="badge badge-warning">Due This Week</span>
                        ) : (
                          <span className="badge badge-neutral">Normal Priority</span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.25rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ color: 'var(--text-secondary)' }}>{item.subject}</strong>
                      <span>•</span>
                      <span>Faculty: {item.faculty}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> Deadline: {item.dueFormatted}
                      </span>
                      <span>•</span>
                      <span>Weightage: {item.weightage}</span>
                    </div>

                    {/* Progress indicator */}
                    {!item.completed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem' }}>
                        <div className="progress-track" style={{ flex: 1, height: '4px' }}>
                          <div
                            className={`progress-fill ${
                              item.urgency === 'urgent'
                                ? 'progress-fill-urgent'
                                : item.urgency === 'important'
                                ? 'progress-fill-warning'
                                : ''
                            }`}
                            style={{ width: `${item.progress || 0}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {item.progress || 0}%
                        </span>
                      </div>
                    )}

                    {/* Expanded Brief, Instructions & Feedback */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.85rem 1rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.8125rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                            Deliverable Brief & Requirements:
                          </strong>
                          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.brief}</p>
                        </div>

                        {mySubmission && (
                          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                            <strong style={{ color: 'var(--brand-primary)', display: 'block', marginBottom: '0.2rem' }}>
                              My Submission Recorded:
                            </strong>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {mySubmission.notes || 'Submitted via portal.'}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Status: {mySubmission.status} · Submitted: {mySubmission.submittedAt || 'Recorded'}
                            </div>
                          </div>
                        )}

                        {item.feedback && (
                          <div
                            style={{
                              borderTop: '1px solid var(--border-subtle)',
                              paddingTop: '0.5rem',
                              background: 'var(--state-success-bg)',
                              padding: '0.6rem 0.8rem',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            <strong style={{ color: 'var(--state-success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Award size={13} /> Evaluator Feedback & Remarks ({item.grade}):
                            </strong>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                              {item.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    {isExpanded ? 'Hide Brief' : 'View Instructions'}
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${item.completed ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleOpenSubmit(item)}
                  >
                    <Upload size={12} /> {item.completed ? 'Update Submission' : 'Submit Work'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Submit Work Modal */}
      {submittingId && (
        <div className="modal-backdrop" onClick={() => setSubmittingId(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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
                <Upload size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Submit Assignment Deliverable
                </h3>
              </div>
              <button type="button" onClick={() => setSubmittingId(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitWork} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Repository Link or Solution URL (Required)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/aadhi-narayanan/assignment-solution"
                  value={repoLink}
                  onChange={(e) => setRepoLink(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Implementation Remarks & Methodology Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes on algorithmic complexity, benchmark results, or test run outputs..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-subtle)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  lineHeight: 1.4,
                }}
              >
                Deliverables are timestamped and cryptographically linked to your roll number (<code>{activeStudentId}</code>). The submission will immediately appear in the faculty grading queue.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSubmittingId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={12} /> Confirm & Dispatch Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
