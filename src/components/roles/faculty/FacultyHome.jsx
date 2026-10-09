import React from 'react';
import {
  MapPin,
  Zap,
  Check,
  Award,
  Send,
  ArrowRight,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader } from '../../workspace';

export default function FacultyHome() {
  const {
    currentUser,
    facultyRoster,
    assignments,
    internalMarks,
    leaveRequests,
    students,
    announcements,
    timetableEntries,
    setActiveTab,
    approveLeaveRequest,
  } = useNivara();

  const facultyName = currentUser?.userName || currentUser?.name || 'Faculty Member';
  const facultyDept = currentUser?.dept || currentUser?.department || 'Academic Department';

  const todaySessions = (timetableEntries || []).filter((e) => (e.dayOfWeek || e.day_of_week) === 'Tuesday');
  const liveSession = todaySessions.find((e) => (e.startTime || e.start_time) <= '10:30:00' && (e.endTime || e.end_time) >= '10:00:00') || (todaySessions.length > 0 ? todaySessions[0] : null);

  const activeClass = liveSession ? {
    code: liveSession.courseCode || liveSession.code || 'CS301',
    subject: liveSession.subjectName || liveSession.subject || 'Class Session',
    section: liveSession.sectionCode || 'Section A',
    room: liveSession.room || 'Lecture Hall',
    timeSlot: liveSession.timeSlot || '10:00 AM – 11:30 AM',
    enrolledCount: facultyRoster?.length || 0,
    status: 'in-session',
    topic: 'Course Curriculum Session',
  } : null;

  // 2. NEEDS ACTION METRICS & ITEMS
  const presentCount = (facultyRoster || []).filter((s) => s.status === 'present').length;
  const absentCount = (facultyRoster || []).filter((s) => s.status === 'absent').length;

  // Ungraded assignments
  const pendingGradingAssignments = (assignments || []).filter(
    (a) => (a.submittedCount || 0) > (a.gradedCount || 0)
  );
  const totalSubmissionsToGrade = pendingGradingAssignments.reduce(
    (sum, a) => sum + ((a.submittedCount || 0) - (a.gradedCount || 0)),
    0
  );

  // Pending student duty leave requests
  const pendingLeaves = (leaveRequests || []).filter((l) => l.status === 'pending');

  // Critical attendance students (<75%)
  const atRiskStudents = (students || []).filter(
    (s) => s.deptCode === 'AIDS' && s.attendancePct < 75
  );

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Page Header (Concise & Operational) */}
      <PageHeader
        eyebrow={`Academic Term: Autumn 2026 · ${facultyDept}`}
        title={`Faculty Workspace · ${facultyName}`}
        description="Daily teaching sessions, rapid lecture attendance, deliverable grading queue, and student academic standing."
        actions={[
          <button
            key="announcement"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('announcements')}
          >
            <Send size={13} /> Broadcast Notice
          </button>,
          <button
            key="attendance-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('attendance')}
          >
            <Zap size={13} /> Take Attendance
          </button>,
        ]}
      />

      {/* 2. Operational 2-Column Split */}
      <div className="split-panel" style={{ gridTemplateColumns: '1.45fr 1.15fr', gap: '1.25rem' }}>
        {/* LEFT COLUMN: TODAY & ACTIVE SESSION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Class Highlight Callout */}
          {activeClass ? (
            <section style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-info">
                    <span className="pulse-dot" /> Live In-Session
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {activeClass.timeSlot}
                  </span>
                </div>
                <span className="badge badge-neutral">{activeClass.section}</span>
              </div>

              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeClass.subject} ({activeClass.code})
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={12} /> {activeClass.room}
                  </span>
                  <span>•</span>
                  <span>{activeClass.enrolledCount} Enrolled Students</span>
                  <span>•</span>
                  <span>Topic: {activeClass.topic}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Session roster: <strong>{presentCount} Present</strong>, <strong>{absentCount} Absent</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveTab('attendance')}
                  >
                    <Zap size={12} /> Record Classroom Roster
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Active Class In Session
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                You have no active teaching lectures or laboratory sessions running at this time slot.
              </div>
            </section>
          )}

          {/* Today's Teaching Stream */}
          <section>
            <SectionHeader
              title="Today's Teaching Schedule"
              subtitle="Chronological lectures and practical laboratories"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('today')}
                >
                  Full Day Stream <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {todaySessions.length === 0 ? (
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                }}>
                  No teaching sessions scheduled for today in the academic timetable.
                </div>
              ) : (
                todaySessions.map((session, idx) => (
                  <div key={idx} style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: idx === 1 ? 'var(--bg-hover)' : 'var(--bg-surface)',
                    border: '1px solid',
                    borderColor: idx === 1 ? 'var(--border-strong)' : 'var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {session.timeSlot || session.time} — {session.subjectName || session.subject} ({session.courseCode || session.code})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {session.room} · {session.sectionCode || 'Section A'} · {facultyRoster?.length || 0} Students
                      </div>
                    </div>
                    <span className={`badge ${idx === 0 ? 'badge-success' : idx === 1 ? 'badge-info' : 'badge-neutral'}`}>
                      {idx === 0 ? 'Conducted ✓' : idx === 1 ? 'In Progress' : 'Scheduled'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Assigned Classes Quick Strip */}
          <section>
            <SectionHeader
              title="Assigned Teaching Classes"
              subtitle="Active courses assigned for Autumn 2026 term"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('classes')}
                >
                  View All Classes <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span className="badge badge-info">CS301</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>4 Credits</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Data Structures & Algorithms</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>III Year AI & DS (Sec A) · 28 Students</div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span className="badge badge-info">AI302</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>2 Credits</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Machine Learning Lab</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>III Year AI & DS (Sec A) · 28 Students</div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: NEEDS ACTION & UPCOMING QUEUES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Queue 1: Deliverables Grading */}
          <section>
            <SectionHeader
              title={`Deliverable Grading Queue (${totalSubmissionsToGrade})`}
              subtitle="Student programming solutions awaiting evaluation"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('assignments')}
                >
                  Grade Queue <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingGradingAssignments.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  All assignment submissions graded and synchronized ✓
                </div>
              ) : (
                pendingGradingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {asg.title}
                      </strong>
                      <span className="badge badge-warning">
                        {(asg.submittedCount || 0) - (asg.gradedCount || 0)} to grade
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{asg.courseCode} · Weight: {asg.weightage}</span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('assignments')}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.71875rem' }}
                      >
                        <Award size={11} /> Grade Next
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Action Queue 2: Pending Leave Requests Requiring Concurrence */}
          <section>
            <SectionHeader
              title={`Duty Leave Concurrence (${pendingLeaves.length})`}
              subtitle="Student waivers requiring faculty endorsement"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('leaves')}
                >
                  Manage Leaves <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingLeaves.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No pending student leave requests requiring review ✓
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
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {leave.studentName}
                      </strong>
                      <span className="badge badge-warning">{leave.days} Day(s)</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {leave.reason} ({leave.startDate} – {leave.endDate})
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => approveLeaveRequest(leave.id, false)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.71875rem' }}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => approveLeaveRequest(leave.id, true)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.71875rem' }}
                      >
                        <Check size={11} /> Concur & Endorse
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Action Queue 3: Student Attendance Risk Alerts */}
          {atRiskStudents.length > 0 && (
            <section>
              <SectionHeader
                title={`Attendance Warnings (${atRiskStudents.length})`}
                subtitle="Students crossing below 75% examination threshold"
                action={
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveTab('progress')}
                  >
                    Student Progress <ArrowRight size={12} />
                  </button>
                }
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {atRiskStudents.slice(0, 3).map((st) => (
                  <div
                    key={st.id}
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--state-urgent-bg)',
                      border: '1px solid var(--state-urgent-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {st.name} ({st.rollNo || st.id})
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Standing: <strong>{st.attendancePct}%</strong> · Mandatory counseling advisory
                      </div>
                    </div>
                    <span className="badge badge-urgent">{st.attendancePct}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Assessment & CIA Moderation Reminder */}
          <section>
            <SectionHeader
              title="Continuous Assessment (CIA) Moderation"
              subtitle="Semester internal components"
            />
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
                  CS301 Data Structures CIA Sheet
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Max 25 Marks · Final Lock due prior to Mid-Semester II
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('marks')}
              >
                Inspect Marks
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
