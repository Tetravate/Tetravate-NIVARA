import React, { useState, useMemo } from 'react';
import {
  Plus,
  Award,
  CheckCircle2,
  Search,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, EmptyState } from '../../workspace';

export default function FacultyAssignments() {
  const {
    assignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeStudentSubmission,
    currentUser,
    showToast,
  } = useNivara();

  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending-grade' | 'completed'
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Assignment Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    courseCode: 'CS301',
    subject: 'Data Structures (CS301)',
    dueFormatted: 'Next Tuesday · 11:59 PM',
    dueTimestamp: '2026-10-14T23:59:00',
    weightage: '10% of Internal Mark',
    brief: '',
  });

  // Edit Assignment Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    dueFormatted: '',
    weightage: '',
    brief: '',
  });

  // Focused Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState(null); // { asgId, asgTitle, courseCode, submission }
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeValidationError, setGradeValidationError] = useState('');

  // Filter assignments strictly to those taught by current faculty
  const facultyAssignments = useMemo(() => {
    const facultyName = currentUser?.userName || '';
    return (assignments || []).filter((a) => {
      return !facultyName || a.faculty === facultyName || a.faculty?.includes(facultyName);
    });
  }, [assignments, currentUser]);

  const filteredAssignments = useMemo(() => {
    return facultyAssignments.filter((asg) => {
      if (selectedCourseFilter !== 'ALL' && asg.courseCode !== selectedCourseFilter) return false;

      const matchesSearch =
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const hasPendingGrading = (asg.submittedCount || 0) > (asg.gradedCount || 0);

      if (filterTab === 'pending-grade') return hasPendingGrading;
      if (filterTab === 'completed') return (asg.submittedCount || 0) > 0 && !hasPendingGrading;
      return true;
    });
  }, [facultyAssignments, selectedCourseFilter, searchQuery, filterTab]);

  // Aggregate metrics
  const totalDeliverables = facultyAssignments.length;
  const totalSubmitted = facultyAssignments.reduce((acc, a) => acc + (a.submittedCount || 0), 0);
  const totalGraded = facultyAssignments.reduce((acc, a) => acc + (a.gradedCount || 0), 0);
  const pendingGradingCount = Math.max(0, totalSubmitted - totalGraded);

  const metrics = [
    {
      label: 'Course Deliverables',
      value: `${totalDeliverables} Active`,
      subtext: 'CS301 & AI302 Assigned',
      state: 'info',
    },
    {
      label: 'Grading Queue',
      value: `${pendingGradingCount} Pending`,
      subtext: pendingGradingCount > 0 ? 'Requires faculty evaluation' : 'All submissions evaluated',
      state: pendingGradingCount > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Evaluation Rate',
      value: totalSubmitted > 0 ? `${Math.round((totalGraded / totalSubmitted) * 100)}%` : '100%',
      subtext: `${totalGraded} of ${totalSubmitted} submissions graded`,
      state: 'success',
    },
    {
      label: 'Enrolled Workload',
      value: '28 Students',
      subtext: 'Section AIDS-A Batch',
      state: 'neutral',
    },
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Assignment title cannot be empty', 'error');
      return;
    }

    createAssignment({
      ...formData,
      faculty: currentUser?.userName || 'Faculty',
    });

    setCreateModalOpen(false);
    setFormData({
      title: '',
      courseCode: 'CS301',
      subject: 'Data Structures (CS301)',
      dueFormatted: 'Next Tuesday · 11:59 PM',
      dueTimestamp: '2026-10-14T23:59:00',
      weightage: '10% of Internal Mark',
      brief: '',
    });
  };

  const handleOpenEdit = (asg) => {
    setEditFormData({
      id: asg.id,
      title: asg.title,
      dueFormatted: asg.dueFormatted || '',
      weightage: asg.weightage || '',
      brief: asg.brief || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) {
      showToast('Assignment title cannot be empty', 'error');
      return;
    }
    await updateAssignment(editFormData.id, {
      title: editFormData.title,
      dueFormatted: editFormData.dueFormatted,
      weightage: editFormData.weightage,
      brief: editFormData.brief,
    });
    setEditModalOpen(false);
  };

  const handleDeleteAssignment = async (asg) => {
    if (window.confirm(`Are you sure you want to archive assignment "${asg.title}"? Submissions will remain preserved.`)) {
      await deleteAssignment(asg.id);
    }
  };

  const handleOpenGrading = (asg, sub) => {
    setGradingSubmission({
      asgId: asg.id,
      asgTitle: asg.title,
      courseCode: asg.courseCode,
      submission: sub,
    });
    setGradeScore(sub.grade || '18 / 20');
    setGradeFeedback(sub.feedback || 'Well-structured algorithm implementation with sound complexity proof.');
    setGradeValidationError('');
  };

  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!gradeScore.trim()) {
      setGradeValidationError('Please enter a valid numeric or formatted score (e.g. 19 / 20).');
      return;
    }

    gradeStudentSubmission(
      gradingSubmission.asgId,
      gradingSubmission.submission.studentId,
      gradeScore,
      gradeFeedback
    );

    setGradingSubmission(null);
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Course Deliverables & Evaluation Workspace"
        title="Assignments & Grading Queue"
        description="Publish problem sets, monitor student submission telemetry, inspect code repositories, and return rubric-based feedback and CIA grades."
        actions={[
          <button
            key="create-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus size={13} /> Create Assignment
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
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterTab('all')}
            >
              All Deliverables ({facultyAssignments.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'pending-grade' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterTab('pending-grade')}
            >
              Pending Grading ({pendingGradingCount})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterTab === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterTab('completed')}
            >
              Fully Evaluated
            </button>
          </div>

          <div style={{ height: '20px', width: '1px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Assigned Courses</option>
            <option value="CS301">CS301 — Data Structures</option>
            <option value="AI302">AI302 — ML Foundations</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search deliverables..."
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

      {/* Assignments List with Submissions Breakdown */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments match the selected filter"
          description="Adjust your search criteria or create a new assignment deliverable."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAssignments.map((asg) => {
            const pendingInAsg = Math.max(0, (asg.submittedCount || 0) - (asg.gradedCount || 0));

            return (
              <div
                key={asg.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-info">{asg.courseCode}</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {asg.title}
                      </strong>
                      {pendingInAsg > 0 ? (
                        <span className="badge badge-warning">
                          {pendingInAsg} Submission{pendingInAsg > 1 ? 's' : ''} to Grade
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} style={{ marginRight: '3px' }} /> All Graded
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>Due: <strong>{asg.dueFormatted}</strong></span>
                      <span>•</span>
                      <span>Weightage: <strong>{asg.weightage || '10% CIA'}</strong></span>
                      <span>•</span>
                      <span>Enrolled: <strong>{asg.totalEnrolled || 28}</strong></span>
                      <span>•</span>
                      <span>Submissions: <strong>{asg.submittedCount || 0}</strong></span>
                      <span>•</span>
                      <span>Evaluated: <strong>{asg.gradedCount || 0}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {asg.submissions && asg.submissions.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenGrading(asg, asg.submissions[0])}
                      >
                        <Award size={13} /> Open Grading Sheet
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(asg)}
                      title="Edit Assignment"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => handleDeleteAssignment(asg)}
                      title="Archive Assignment"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Brief description */}
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Deliverable Brief: </strong>
                  {asg.brief}
                </div>

                {/* Submissions Section */}
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Student Submissions & Telemetry ({asg.submissions ? asg.submissions.length : 0})
                  </div>

                  {(!asg.submissions || asg.submissions.length === 0) ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                      No student submissions recorded for this assignment yet.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                      {asg.submissions.map((sub, sIdx) => (
                        <div
                          key={sub.studentId || sIdx}
                          style={{
                            padding: '0.75rem 0.95rem',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {sub.studentName || 'Student'}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {sub.studentId} · {sub.status === 'graded' || sub.grade ? `Graded (${sub.grade})` : 'Submitted (Awaiting Review)'}
                            </div>
                          </div>

                          {sub.status === 'graded' || sub.grade ? (
                            <span className="badge badge-success">{sub.grade}</span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                              onClick={() => handleOpenGrading(asg, sub)}
                            >
                              Grade
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Create & Publish Assignment
                </h3>
              </div>
              <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Min-Heap Priority Queue & Benchmark Analysis"
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
                    Assigned Course
                  </label>
                  <select
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value, subject: `${e.target.value === 'CS301' ? 'Data Structures' : 'Machine Learning'} (${e.target.value})` })}
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
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Submission Deadline
                  </label>
                  <input
                    type="text"
                    value={formData.dueFormatted}
                    onChange={(e) => setFormData({ ...formData, dueFormatted: e.target.value })}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Weightage / Assessment Tag
                </label>
                <input
                  type="text"
                  value={formData.weightage}
                  onChange={(e) => setFormData({ ...formData, weightage: e.target.value })}
                  placeholder="e.g. 10% of Continuous Internal Assessment"
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Deliverable Brief & Requirements
                </label>
                <textarea
                  rows="4"
                  placeholder="Describe problem statements, test case matrices, and submission format (e.g. Git repository URL + PDF report)..."
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
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
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish to Student Portals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOCUSED GRADING MODAL */}
      {gradingSubmission && (
        <div className="modal-backdrop" onClick={() => setGradingSubmission(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Grade Submission: {gradingSubmission.submission.studentName}
                </h3>
              </div>
              <button type="button" onClick={() => setGradingSubmission(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveGrade} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {gradingSubmission.asgTitle} ({gradingSubmission.courseCode})
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Student ID: <strong>{gradingSubmission.submission.studentId}</strong> · Submitted: {gradingSubmission.submission.submittedAt || 'Today'}
                </div>
                {gradingSubmission.submission.notes && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.4rem' }}>
                    <strong>Student Notes:</strong> {gradingSubmission.submission.notes}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Awarded Score / Marks
                </label>
                <input
                  type="text"
                  placeholder="e.g. 19 / 20"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Constructive Instructor Feedback
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide specific feedback on code efficiency, modularity, and algorithm complexity analysis..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
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

              {gradeValidationError && (
                <div style={{ fontSize: '0.75rem', color: 'var(--state-urgent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={12} /> {gradeValidationError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Assignment Modal */}
      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Assignment Deliverable
                </h3>
              </div>
              <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Deliverable Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Submission Deadline
                  </label>
                  <input
                    type="text"
                    value={editFormData.dueFormatted}
                    onChange={(e) => setEditFormData({ ...editFormData, dueFormatted: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Internal Weightage
                  </label>
                  <input
                    type="text"
                    value={editFormData.weightage}
                    onChange={(e) => setEditFormData({ ...editFormData, weightage: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Problem Brief & Instructions
                </label>
                <textarea
                  rows="3"
                  value={editFormData.brief}
                  onChange={(e) => setEditFormData({ ...editFormData, brief: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
