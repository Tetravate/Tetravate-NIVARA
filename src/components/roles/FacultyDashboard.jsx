import React, { useState } from 'react';
import {
  Check,
  X,
  Zap,
  Plus,
  Send,
  Upload,
  Award,
} from 'lucide-react';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader } from '../workspace';

export default function FacultyDashboard() {
  const {
    activeTab,
    setActiveTab,
    facultyRoster,
    markAttendance,
    assignments,
    createAssignment,
    gradeStudentSubmission,
    internalMarks,
    updateInternalMarks,
    leaveRequests,
    approveLeaveRequest,
    studyMaterials,
    uploadStudyMaterial,
    sendAnnouncement,
    showToast,
  } = useNivara();

  const [localRoster, setLocalRoster] = useState(facultyRoster);
  const selectedCourse = 'CS301 (Data Structures & Algorithms)';

  // Modals state
  const [createAsgModal, setCreateAsgModal] = useState(false);
  const [asgFormData, setAsgFormData] = useState({
    title: '',
    courseCode: 'CS301',
    subject: 'Data Structures (CS301)',
    dueFormatted: 'Next Tuesday · 11:59 PM',
    weightage: '10% of Internal Mark',
    brief: '',
  });

  const [gradeModal, setGradeModal] = useState(null); // { asgId, studentId, studentName }
  const [gradeScore, setGradeScore] = useState('18 / 20');
  const [gradeFeedback, setGradeFeedback] = useState('Well structured implementation with clear time complexity analysis.');

  const [materialModal, setMaterialModal] = useState(false);
  const [matFormData, setMatFormData] = useState({
    title: '',
    courseCode: 'CS301',
    fileType: 'PDF Document (3.4 MB)',
  });

  const [announcementModal, setAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // Editable CIA state
  const [editingMarks, setEditingMarks] = useState({});

  const presentCount = localRoster.filter((s) => s.status === 'present').length;
  const absentCount = localRoster.filter((s) => s.status === 'absent').length;

  const pendingGradingCount = assignments.filter((a) => a.submittedCount > a.gradedCount).length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  const handleMarkAllPresent = () => {
    setLocalRoster((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    showToast('Marked all students as Present', 'info');
  };

  const handleMarkAllAbsent = () => {
    setLocalRoster((prev) => prev.map((s) => ({ ...s, status: 'absent' })));
    showToast('Marked all students as Absent', 'info');
  };

  const handleToggleStudent = (id) => {
    setLocalRoster((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'present' ? 'absent' : 'present' }
          : s
      )
    );
  };

  const handleSaveAttendance = () => {
    markAttendance('CS301', localRoster);
  };

  const handleCreateAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!asgFormData.title.trim()) return;
    createAssignment(asgFormData);
    setCreateAsgModal(false);
    setAsgFormData({
      title: '',
      courseCode: 'CS301',
      subject: 'Data Structures (CS301)',
      dueFormatted: 'Next Tuesday · 11:59 PM',
      weightage: '10% of Internal Mark',
      brief: '',
    });
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!gradeModal) return;
    gradeStudentSubmission(gradeModal.asgId, gradeModal.studentId, gradeScore, gradeFeedback);
    setGradeModal(null);
  };

  const handleUploadMaterialSubmit = (e) => {
    e.preventDefault();
    if (!matFormData.title.trim()) return;
    uploadStudyMaterial(matFormData);
    setMaterialModal(false);
    setMatFormData({
      title: '',
      courseCode: 'CS301',
      fileType: 'PDF Document (3.4 MB)',
    });
  };

  const handleSendAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    sendAnnouncement('Class Announcement: CS301', announcementText, 'student');
    setAnnouncementModal(false);
    setAnnouncementText('');
  };

  const facultyMetrics = [
    {
      label: "Today's Schedule",
      value: '3 Lectures',
      subtext: 'Next: Computing Lab 2 at 10:00 AM',
      state: 'info',
    },
    {
      label: 'Session Attendance',
      value: `${presentCount} / ${localRoster.length}`,
      subtext: `${absentCount} Absent · Unsynchronized`,
      state: absentCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Grading Queue',
      value: `${pendingGradingCount} Pending`,
      subtext: 'Across CS301 & CS304',
      state: pendingGradingCount > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Leave Approvals',
      value: `${pendingLeaves.length} Requests`,
      subtext: 'Duty & medical waivers',
      state: pendingLeaves.length > 0 ? 'warning' : 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Faculty Persona) */}
      <PageHeader
        eyebrow="Faculty Operating Workspace · Dept of AI & Data Science"
        title="Good Morning, Dr. Priya Raman"
        description="Today: 3 Lectures scheduled · 1 Attendance session ready for synchronization · Continuous Internal Assessment active."
        actions={[
          <button
            key="broadcast"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setAnnouncementModal(true)}
          >
            <Send size={13} /> Broadcast Notice
          </button>,
          <button
            key="asg"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCreateAsgModal(true)}
          >
            <Plus size={13} /> Create Assignment
          </button>,
        ]}
      />

      {/* 2. Key Operational Metrics */}
      <MetricStrip metrics={facultyMetrics} />

      {/* 3. HOME VIEW (Operational Workspace) */}
      {activeTab === 'home' && (
        <div className="split-panel" style={{ gridTemplateColumns: '1.6fr 1.1fr' }}>
          {/* LEFT COLUMN: In Session + Today's Teaching Roster & Attendance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Active Class Banner */}
            <div style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span className="badge badge-info">
                    <span className="pulse-dot" /> In Session · 10:00 AM
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    III B.Tech AI & Data Science (Batch A)
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Data Structures & Algorithms (CS301)
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                  <span>Computing Lab 2 (Block B)</span>
                  <span>•</span>
                  <span>28 Enrolled Students</span>
                  <span>•</span>
                  <span>Topic: Dijkstra Min-Heap Benchmarking</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('attendance')}
              >
                <Zap size={13} /> Take Attendance Now
              </button>
            </div>

            {/* Today's Teaching Roster */}
            <div>
              <SectionHeader
                title="Today's Teaching Schedule"
                subtitle="Thursday, 7 October · 3 Lecture Sessions"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      09:00 AM — Advanced Algorithms (CS301)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Computing Lab 2 · III Year AI & DS · 28 Students
                    </div>
                  </div>
                  <span className="badge badge-success">Conducted ✓</span>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--brand-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      11:30 AM — Database Management Lab (CS304)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Software Lab 3 · II Year CSE · 32 Students
                    </div>
                  </div>
                  <span className="badge badge-info">Next Up</span>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      02:15 PM — Machine Learning Foundations (AI302)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Hall 302 · III Year AI & DS · 45 Students
                    </div>
                  </div>
                  <span className="badge badge-neutral">Scheduled</span>
                </div>
              </div>
            </div>

            {/* Quick Inline Roster Attendance for Active Class */}
            <div>
              <SectionHeader
                title={`Active Session Roster · ${selectedCourse}`}
                subtitle={`${presentCount} Present · ${absentCount} Absent`}
                action={
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleMarkAllPresent}
                    >
                      <Check size={12} color="var(--state-success)" /> All Present
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleSaveAttendance}
                    >
                      Save Attendance
                    </button>
                  </div>
                }
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '0.45rem',
              }}>
                {localRoster.map((st) => {
                  const isPresent = st.status === 'present';
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleToggleStudent(st.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-xs)',
                        background: isPresent ? 'var(--bg-surface)' : 'var(--state-urgent-bg)',
                        border: '1px solid',
                        borderColor: isPresent ? 'var(--border-subtle)' : 'var(--state-urgent-border)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {st.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {st.roll}
                        </div>
                      </div>

                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isPresent ? 'var(--state-success-bg)' : 'var(--state-urgent)',
                        color: isPresent ? 'var(--state-success)' : '#FFFFFF',
                        flexShrink: 0,
                      }}>
                        {isPresent ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION QUEUE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Action Queue 1: Ungraded Submissions */}
            <div>
              <SectionHeader
                title="Grading Queue"
                subtitle="Student deliverable submissions awaiting evaluation"
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="btn btn-ghost btn-sm"
                  >
                    View All
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {assignments.map((asg) => (
                  <div
                    key={asg.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {asg.title}
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {asg.courseCode} · Due {asg.dueFormatted}
                        </div>
                      </div>
                      <span className="badge badge-warning">
                        {asg.submittedCount - asg.gradedCount} to grade
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {asg.gradedCount} of {asg.submittedCount} completed
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setGradeModal({ asgId: asg.id, studentId: '2024-AIDS-042', studentName: 'Aadhi Narayanan' })}
                      >
                        <Award size={12} /> Grade Next
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Queue 2: Pending Leave Requests */}
            <div>
              <SectionHeader
                title="Student Leave Concurrence"
                subtitle={`${pendingLeaves.length} Requests pending faculty review`}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pendingLeaves.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No pending leave waivers.
                  </div>
                ) : (
                  pendingLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {leave.studentName}
                        </strong>
                        <span className="badge badge-neutral">{leave.days} Days</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {leave.reason} ({leave.startDate} – {leave.endDate})
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => approveLeaveRequest(leave.id, false)}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => approveLeaveRequest(leave.id, true)}
                        >
                          <Check size={12} /> Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Queue 3: Internal Marks / CIA Status */}
            <div>
              <SectionHeader
                title="Continuous Internal Assessment"
                subtitle="CIA marks collection and moderation"
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab('marks')}
                    className="btn btn-ghost btn-sm"
                  >
                    Open Sheet
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {internalMarks.map((im) => (
                  <div
                    key={im.courseCode}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {im.courseCode} — {im.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Max {im.maxMark} · Score: {im.scoredMark} / 25
                      </div>
                    </div>
                    <span className={`badge ${im.status === 'locked' ? 'badge-success' : 'badge-warning'}`}>
                      {im.status === 'locked' ? 'Locked' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DEDICATED RAPID ATTENDANCE */}
      {activeTab === 'attendance' && (
        <section>
          <SectionHeader
            title={`Roster Attendance · ${selectedCourse}`}
            subtitle={`${presentCount} Present · ${absentCount} Absent · Computing Lab 2`}
            action={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleMarkAllPresent}
                >
                  <Check size={12} color="var(--state-success)" /> All Present
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleMarkAllAbsent}
                >
                  <X size={12} color="var(--state-urgent)" /> All Absent
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAttendance}
                >
                  Save & Synchronize Attendance
                </button>
              </div>
            }
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem',
            marginTop: '0.75rem',
          }}>
            {localRoster.map((st) => {
              const isPresent = st.status === 'present';
              return (
                <div
                  key={st.id}
                  onClick={() => handleToggleStudent(st.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-xs)',
                    background: isPresent ? 'var(--bg-surface)' : 'var(--state-urgent-bg)',
                    border: '1px solid',
                    borderColor: isPresent ? 'var(--border-subtle)' : 'var(--state-urgent-border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {st.roll}
                    </div>
                  </div>

                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isPresent ? 'var(--state-success-bg)' : 'var(--state-urgent)',
                    color: isPresent ? 'var(--state-success)' : '#FFFFFF',
                  }}>
                    {isPresent ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: INTERNAL MARKS ENTRY */}
      {activeTab === 'marks' && (
        <section>
          <SectionHeader
            title="Continuous Internal Assessment (CIA) Entry & Moderation"
            subtitle="Synchronizes with Exam Cell & Student Portals upon verification"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {internalMarks.map((im) => {
              const currentScore = editingMarks[im.courseCode] !== undefined ? editingMarks[im.courseCode] : im.scoredMark;
              return (
                <div
                  key={im.courseCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {im.subject} ({im.courseCode})
                      </span>
                      <span className={`badge ${im.status === 'locked' ? 'badge-success' : 'badge-warning'}`}>
                        {im.status === 'locked' ? 'Submitted to Exam Cell' : 'Draft Assessment'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Instructor: {im.enteredBy} · Max Marks: {im.maxMark} · Continuous weightage: 25%
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Score (Aadhi):</span>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={currentScore}
                        onChange={(e) => setEditingMarks({ ...editingMarks, [im.courseCode]: Number(e.target.value) })}
                        style={{
                          width: '56px',
                          padding: '0.3rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-strong)',
                          background: 'var(--bg-canvas)',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/ 25</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => updateInternalMarks(im.courseCode, currentScore, false)}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => updateInternalMarks(im.courseCode, currentScore, true)}
                    >
                      Lock & Submit to Exam Cell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: ASSIGNMENT GRADING QUEUE */}
      {(activeTab === 'submissions' || activeTab === 'assignments') && (
        <section>
          <SectionHeader
            title="Assignment Submissions & Grading Queue"
            subtitle="Manage course deliverables, briefs, and evaluation rubrics"
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCreateAsgModal(true)}
              >
                <Plus size={12} /> Create New Assignment
              </button>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            {assignments.map((asg) => (
              <div
                key={asg.id}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {asg.title}
                      </span>
                      <span className="badge badge-info">{asg.courseCode}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Due: {asg.dueFormatted} · Enrolled: {asg.totalEnrolled} · Submissions Received: <strong>{asg.submittedCount}</strong> · Graded: <strong>{asg.gradedCount}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setGradeModal({ asgId: asg.id, studentId: '2024-AIDS-042', studentName: 'Aadhi Narayanan' })}
                    >
                      <Award size={12} /> Grade Aadhi ({asg.completed ? 'Graded' : 'Pending'})
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  Brief: {asg.brief}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VIEW: STUDENT LEAVES */}
      {activeTab === 'leaves' && (
        <section>
          <SectionHeader
            title="Student Duty & Medical Leave Concurrence"
            subtitle="Reviewed leaves automatically adjust student attendance records"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {leaveRequests.map((leave) => (
              <div
                key={leave.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {leave.studentName}
                    </strong>
                    <span className="badge badge-neutral">{leave.days} Days</span>
                    <span className={`badge ${leave.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                      {leave.status === 'approved' ? 'Approved' : 'Pending Concurrence'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {leave.reason} ({leave.startDate} – {leave.endDate})
                  </div>
                </div>

                {leave.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => approveLeaveRequest(leave.id, false)}
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => approveLeaveRequest(leave.id, true)}
                    >
                      <Check size={12} /> Approve Leave
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VIEW: STUDY RESOURCES */}
      {activeTab === 'materials' && (
        <section>
          <SectionHeader
            title="Uploaded Lecture Notes & Problem Sets"
            subtitle="Course repositories distributed to student workspaces"
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setMaterialModal(true)}
              >
                <Upload size={12} /> Upload Resource
              </button>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {studyMaterials.map((mat) => (
              <div
                key={mat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {mat.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Course: {mat.courseCode} · Type: {mat.fileType} · Uploaded: {mat.uploadedAt} · Downloads: {mat.downloads}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => showToast(`Resource ${mat.title} downloaded ✓`, 'info')}
                >
                  Download File
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {createAsgModal && (
        <div className="modal-backdrop" onClick={() => setCreateAsgModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Create Course Assignment
                </h3>
              </div>
              <button type="button" onClick={() => setCreateAsgModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateAssignmentSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Min-Heap Priority Queue & Benchmark Analysis"
                  value={asgFormData.title}
                  onChange={(e) => setAsgFormData({ ...asgFormData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Course Code</label>
                  <select
                    value={asgFormData.courseCode}
                    onChange={(e) => setAsgFormData({ ...asgFormData, courseCode: e.target.value, subject: `Data Structures (${e.target.value})` })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="CS301">CS301 - Data Structures</option>
                    <option value="CS304">CS304 - Database Systems</option>
                    <option value="AI302">AI302 - ML Foundations</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Due Deadline</label>
                  <input
                    type="text"
                    value={asgFormData.dueFormatted}
                    onChange={(e) => setAsgFormData({ ...asgFormData, dueFormatted: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Instructions / Brief</label>
                <textarea
                  rows="3"
                  placeholder="Describe implementation requirements, test cases, and deliverables..."
                  value={asgFormData.brief}
                  onChange={(e) => setAsgFormData({ ...asgFormData, brief: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCreateAsgModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRADE SUBMISSION */}
      {gradeModal && (
        <div className="modal-backdrop" onClick={() => setGradeModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Grade Submission: {gradeModal.studentName}
                </h3>
              </div>
              <button type="button" onClick={() => setGradeModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Awarded Score / Marks
                </label>
                <input
                  type="text"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  placeholder="e.g. 19 / 20"
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Constructive Instructor Feedback
                </label>
                <textarea
                  rows="3"
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGradeModal(null)}>
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

      {/* MODAL: UPLOAD STUDY RESOURCE */}
      {materialModal && (
        <div className="modal-backdrop" onClick={() => setMaterialModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Upload Course Resource
                </h3>
              </div>
              <button type="button" onClick={() => setMaterialModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Document / Material Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Disjoint Set Forests & Union-Find"
                  value={matFormData.title}
                  onChange={(e) => setMatFormData({ ...matFormData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Course Code</label>
                <select
                  value={matFormData.courseCode}
                  onChange={(e) => setMatFormData({ ...matFormData, courseCode: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="CS301">CS301 - Data Structures</option>
                  <option value="CS304">CS304 - Database Management</option>
                  <option value="AI302">AI302 - Machine Learning</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMaterialModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Upload & Distribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {announcementModal && (
        <div className="modal-backdrop" onClick={() => setAnnouncementModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Dispatch Class Announcement
                </h3>
              </div>
              <button type="button" onClick={() => setAnnouncementModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSendAnnouncementSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Notice Text
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Please bring laptop with GCC compiler installed for tomorrow's graph traversal lab session in Computing Lab 2."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAnnouncementModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Broadcast to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
