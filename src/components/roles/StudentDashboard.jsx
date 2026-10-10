import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronRight,
  Check,
  AlertCircle,
  CreditCard,
  Download,
  Plus,
  Send,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../../context/NivaraContext';
import TodayTimeline from '../TodayTimeline';
import SmartAttendance from '../SmartAttendance';
import AssignmentsView from '../AssignmentsView';
import StudentCoursesView from '../StudentCoursesView';
import StudentFeesView from '../StudentFeesView';
import StudentPlacementView from '../StudentPlacementView';
import StudentLeavesView from '../StudentLeavesView';
import ExamTimeline from '../ExamTimeline';
import ResultsView from '../ResultsView';
import TimetableSwitch from '../TimetableSwitch';
import StudentProfile from '../StudentProfile';
import { PageHeader, MetricStrip, SectionHeader } from '../workspace';

export default function StudentDashboard() {
  const {
    students,
    currentUser,
    coursesAttendance,
    assignments,
    toggleAssignmentCompletion,
    placementDrives,
    studentPlacementApplications,
    leaveRequests,
    submitLeaveRequest,
    examSessions,
    timetableEntries,
    activeTab,
    setActiveTab,
    showToast,
  } = useNivara();

  // Dynamic student identity resolution from authenticated session
  const activeStudentId = currentUser?.studentId || currentUser?.id || '';
  const student = (students || []).find((s) => (activeStudentId && s.id === activeStudentId) || (currentUser?.email && s.email === currentUser?.email)) || (students || [])[0] || {};

  // Modals inside Student dashboard
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    reason: '',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    days: 2,
  });

  // Urgency context & aggregated derived data
  // 1. RIGHT NOW: active class from timetable entries (Tuesday current schedule slot)
  const tuesdayEntries = (timetableEntries || [])
    .filter((e) => (e.dayOfWeek || e.day_of_week) === 'Tuesday')
    .sort((a, b) => ((a.startTime || a.start_time) || '').localeCompare((b.startTime || b.start_time) || ''));

  const liveClass = tuesdayEntries.find((e) => {
    const start = e.startTime || e.start_time || '';
    const end = e.endTime || e.end_time || '';
    return start <= '10:30:00' && end >= '10:00:00';
  }) || null;

  // 2. NEXT: next class, upcoming assignment, upcoming exam, immediate item
  const nextClass = tuesdayEntries.find((e) => ((e.startTime || e.start_time) || '') > '10:30:00') || (tuesdayEntries.length > 1 ? tuesdayEntries[1] : null);

  const urgentAssignment = (assignments || []).find((a) => !a.completed && (a.urgency === 'urgent' || a.urgency === 'important')) || (assignments || []).find((a) => !a.completed);
  const nextExam = examSessions && examSessions.length > 0 ? examSessions[0] : null;
  const nextDrive = (placementDrives || []).find((d) => d.status === 'active');

  const getExamDaysRemaining = (exam) => {
    if (typeof exam?.daysRemaining === 'number') return exam.daysRemaining;
    const targetDate = exam?.exam_date || exam?.date;
    if (!targetDate) return null;
    const examTime = new Date(targetDate).getTime();
    const refTime = new Date('2026-10-07').getTime();
    const diffDays = Math.ceil((examTime - refTime) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };
  const examDaysLeft = nextExam ? getExamDaysRemaining(nextExam) : null;

  // 3. NEEDS ATTENTION: attendance risk, pending assignments, fee dues, leave status, notifications
  const lowAttendanceCourses = (coursesAttendance || []).filter((c) => (c.percentage || 0) < 80);
  const myLeaves = (leaveRequests || []).filter(
    (l) => (student?.id && l.studentId === student.id) || (student?.name && l.studentName === student.name)
  );
  const pendingLeave = myLeaves.find((l) => l.status === 'pending');
  const recentApprovedLeave = myLeaves.find((l) => l.status === 'approved' && l.dutyAttendanceGranted);
  const isFeePending = student?.feeStatus === 'pending';

  // Student's personal placement applications
  const myApplications = (studentPlacementApplications || []).filter(
    (a) => a.studentId === student.id || a.studentName === student.name
  );

  // Handle Leave Request Submission
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveFormData.reason.trim()) {
      showToast('Please provide an official justification for your leave', 'warning');
      return;
    }
    submitLeaveRequest(leaveFormData);
    setLeaveModalOpen(false);
    setLeaveFormData({
      reason: '',
      startDate: '2026-10-15',
      endDate: '2026-10-16',
      days: 2,
    });
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // -------------------------------------------------------------
  // SUB-NAVIGATION VIEW ROUTING BASED ON activeTab (11 EXACT MODULES)
  // -------------------------------------------------------------
  if (activeTab === 'today' || activeTab === 'schedule') return <TodayTimeline onBack={() => setActiveTab('home')} />;
  if (activeTab === 'attendance') return <SmartAttendance onBack={() => setActiveTab('home')} />;
  if (activeTab === 'assignments') return <AssignmentsView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'materials' || activeTab === 'courses') return <StudentCoursesView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'fees' || activeTab === 'dues') return <StudentFeesView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'placement' || activeTab === 'drives' || activeTab === 'placements') return <StudentPlacementView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'leaves' || activeTab === 'leave') return <StudentLeavesView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'exams' || activeTab === 'exam') return <ExamTimeline onBack={() => setActiveTab('home')} />;
  if (activeTab === 'results' || activeTab === 'result') return <ResultsView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'timetable') return <TimetableSwitch onBack={() => setActiveTab('home')} />;
  if (activeTab === 'profile') return <StudentProfile onBack={() => setActiveTab('home')} />;

  // -------------------------------------------------------------
  // DEFAULT VIEW: STUDENT HOME (`home`)
  // Derived directly from live timetable, assignments, attendance, fees, leave, exams
  // -------------------------------------------------------------
  const pendingAssignmentsList = (assignments || []).filter((a) => !a.completed);
  const attendancePct = student?.attendancePct ?? 84.2;

  const studentMetrics = [
    {
      label: 'Live Attendance',
      value: `${attendancePct}%`,
      subtext: attendancePct >= 75 ? 'Meets 75% institutional cutoff' : 'Counseling required (<75%)',
      state: attendancePct < 75 ? 'urgent' : attendancePct < 80 ? 'warning' : 'success',
    },
    {
      label: 'Pending Deliverables',
      value: `${pendingAssignmentsList.length} Tasks`,
      subtext: urgentAssignment ? `Due soon: ${urgentAssignment.title}` : 'All assignments submitted',
      state: urgentAssignment ? 'urgent' : pendingAssignmentsList.length > 0 ? 'warning' : 'success',
    },
    {
      label: 'Semester 5 Tuition',
      value: isFeePending ? `₹${(student.feePendingAmount || 45000).toLocaleString()}` : 'Cleared',
      subtext: isFeePending ? `Due by ${student.feeDueDate || '15 Oct 2026'}` : 'Zero outstanding balance',
      state: isFeePending ? 'warning' : 'success',
    },
    {
      label: 'Academic Milestone',
      value: nextExam
        ? (examDaysLeft ? `In ${examDaysLeft} Days` : (nextExam.date || 'Term Active'))
        : nextDrive
        ? `${nextDrive.package_lpa || nextDrive.packageLpa || 'Drive Active'}`
        : 'Term Active',
      subtext: nextExam
        ? (nextExam.subject_name || nextExam.subject || nextExam.code || 'Mid-Term Exam')
        : nextDrive
        ? `${nextDrive.company_name || nextDrive.company || 'Campus'} Drive`
        : 'Regular Schedule',
      state: 'info',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={
          <>
            <span>Tuesday · 7 October 2026</span>
            {student.department && (
              <>
                <span style={{ color: 'var(--border-strong)' }}>/</span>
                <span>{student.department}{student.year ? ` · ${student.year}` : ''}{student.semester ? ` (Sem ${student.semester})` : ''}</span>
              </>
            )}
          </>
        }
        title={student.name ? `Student Workspace · ${student.name.split(' ')[0]}` : 'Student Workspace'}
        description="Daily teaching sessions, rapid lecture attendance, deliverable submissions, and institutional milestones."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('today')}
            >
              <Clock size={13} /> Full Schedule
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setLeaveModalOpen(true)}
            >
              <Plus size={13} /> Apply for Leave
            </button>
          </div>
        }
      />

      {/* 2. Institutional KPI Tiles */}
      <MetricStrip metrics={studentMetrics} />

      {/* 3. Operational 2-Column Split */}
      <div className="split-panel" style={{ gridTemplateColumns: '1.45fr 1.15fr', gap: '1.25rem' }}>
        {/* LEFT COLUMN: TODAY'S SCHEDULE & ACTIVE LECTURE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Class In-Session Highlight */}
          {liveClass ? (
            <section style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-info">
                    <span className="pulse-dot" /> Live In-Session
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {liveClass.timeSlot}
                  </span>
                </div>
                <span className="badge badge-neutral">{liveClass.courseCode}</span>
              </div>

              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {liveClass.subjectName || liveClass.subject}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={12} /> {liveClass.room}
                  </span>
                  <span>•</span>
                  <span>Instructor: <strong>{liveClass.facultyName || liveClass.faculty}</strong></span>
                  <span>•</span>
                  <span>Section: {student.deptCode ? `${student.deptCode}-${student.section || 'A'}` : (student.section || 'General')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Attendance verified & recorded by faculty instructor
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('attendance')}
                >
                  Inspect Roster
                </button>
              </div>
            </section>
          ) : (
            <section style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                No Active Class in This Time Slot
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                You have no scheduled lectures running right now. Next upcoming session listed below.
              </div>
            </section>
          )}

          {/* Today's Teaching Stream */}
          <section>
            <SectionHeader
              title="Today's Academic Sequence"
              subtitle="Chronological timetable stream for Tuesday"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('today')}
                >
                  Full Timeline <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tuesdayEntries.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No classes scheduled for today in the academic calendar.
                </div>
              ) : (
                tuesdayEntries.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: session === liveClass ? 'var(--bg-hover)' : 'var(--bg-surface)',
                      border: '1px solid',
                      borderColor: session === liveClass ? 'var(--border-strong)' : 'var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {session.timeSlot || session.time} — {session.subjectName || session.subject} ({session.courseCode || session.code})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {session.room} · {session.facultyName || session.faculty}
                      </div>
                    </div>
                    <span className={`badge ${session === liveClass ? 'badge-info' : idx === 0 ? 'badge-success' : 'badge-neutral'}`}>
                      {session === liveClass ? 'In Session' : idx === 0 ? 'Conducted ✓' : 'Upcoming'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Pending Course Deliverables */}
          <section>
            <SectionHeader
              title={`Course Deliverables Queue (${pendingAssignmentsList.length})`}
              subtitle="Assignments and programming deliverables"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('assignments')}
                >
                  View All ({assignments.length}) <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingAssignmentsList.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--state-success)', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ margin: '0 auto 0.25rem', display: 'block' }} />
                  All coursework submitted and current!
                </div>
              ) : (
                pendingAssignmentsList.slice(0, 3).map((asg) => (
                  <div
                    key={asg.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: asg.urgency === 'urgent' ? '3px solid var(--state-urgent)' : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                        <span className={`badge ${asg.urgency === 'urgent' ? 'badge-urgent' : 'badge-neutral'}`}>
                          {asg.dueFormatted || 'Upcoming'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asg.courseCode || asg.subject}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {asg.title}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab('assignments')}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Submit Work
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleAssignmentCompletion(asg.id)}
                        title="Mark Done"
                        style={{ padding: '0.25rem 0.45rem' }}
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ACTION REQUIRED & MILESTONES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Required Items */}
          <section>
            <SectionHeader
              title="Items Requiring Your Attention"
              subtitle="Attendance alerts, bursar dues, and leave statuses"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Low Attendance Warning */}
              {lowAttendanceCourses.length > 0 && lowAttendanceCourses.map((c) => (
                <div
                  key={c.code}
                  onClick={() => setActiveTab('attendance')}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--state-warning-bg)',
                    border: '1px solid var(--state-warning-border)',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <AlertCircle size={16} color="var(--state-warning)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      <strong>{c.name} ({c.code})</strong> attendance is at <strong>{c.percentage}%</strong>. Safe to miss: <strong>{c.safeToMiss || 1} lecture</strong> before counseling cutoff.
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--state-warning)" style={{ flexShrink: 0 }} />
                </div>
              ))}

              {/* Pending Tuition Fee Due */}
              {isFeePending ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--state-warning)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                      <span className="badge badge-warning">Tuition Due</span>
                      <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Due by {student.feeDueDate || '15 Oct 2026'}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Semester 5 Tuition & Amenities (₹{(student.feePendingAmount || 45000).toLocaleString()})
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setActiveTab('fees')}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                  >
                    <CreditCard size={12} /> Pay Now
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--state-success-bg)',
                    border: '1px solid var(--state-success-border)',
                    fontSize: '0.8125rem',
                    color: 'var(--state-success)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={14} />
                    <span>All Semester 5 Tuition Fees Cleared. Zero Outstanding Balance.</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveTab('fees')}
                    style={{ color: 'var(--state-success)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <Download size={12} /> Receipt
                  </button>
                </div>
              )}

              {/* Leave Status Notification */}
              {pendingLeave && (
                <div
                  onClick={() => setActiveTab('leaves')}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-neutral">Duty Leave</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {pendingLeave.days} Days Under Review
                      </span>
                    </div>
                    <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {pendingLeave.reason} ({pendingLeave.startDate} – {pendingLeave.endDate})
                    </div>
                  </div>
                  <span className="badge badge-warning">Pending HOD</span>
                </div>
              )}

              {recentApprovedLeave && !pendingLeave && (
                <div
                  onClick={() => setActiveTab('leaves')}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--state-success-bg)',
                    border: '1px solid var(--state-success-border)',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', color: 'var(--state-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={14} />
                    <span>Duty Leave Approved · {recentApprovedLeave.days} lecture days attendance concession credited.</span>
                  </div>
                  <ArrowRight size={13} color="var(--state-success)" />
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Examinations & Academic Papers */}
          <section>
            <SectionHeader
              title="Upcoming Examination Papers"
              subtitle="Central Examination Cell synchronized dates"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('exams')}
                >
                  Hall Ticket <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(examSessions || []).length === 0 ? (
                <div style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
                  No examination sessions currently scheduled.
                </div>
              ) : (
                (examSessions || []).slice(0, 2).map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setActiveTab('exams')}
                    style={{
                      cursor: 'pointer',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ex.subject || ex.subjectName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {ex.venue} · Desk: <strong>{ex.seatingSeat || 'Assigned'}</strong>
                      </div>
                    </div>
                    <span className="badge badge-neutral">In {ex.daysRemaining || 8} days</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Placement Opportunities Radar */}
          <section>
            <SectionHeader
              title="Campus Recruitment Drives"
              subtitle="Active drives matching your eligibility profile"
              action={
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActiveTab('placement')}
                >
                  All Drives <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(placementDrives || []).length === 0 ? (
                <div style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
                  No recruitment drives currently active.
                </div>
              ) : (
                (placementDrives || []).slice(0, 2).map((drv) => {
                  const applied = myApplications.some((a) => a.driveId === drv.id);
                  return (
                    <div
                      key={drv.id}
                      onClick={() => setActiveTab('placement')}
                      style={{
                        cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{drv.company}</strong>
                          <span className="badge badge-info">{drv.packageLpa}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {drv.role} · Deadline: {drv.deadline}
                        </div>
                      </div>
                      <span className={`badge ${applied ? 'badge-success' : 'badge-neutral'}`}>
                        {applied ? 'Applied ✓' : 'Open'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Leave Request Modal */}
      {leaveModalOpen && (
        <div className="modal-backdrop" onClick={() => setLeaveModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
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
                <Calendar size={18} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Apply for Duty / Medical Leave
                </h3>
              </div>
              <button type="button" onClick={() => setLeaveModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Reason / Official Justification (Required)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delegating to Inter-Collegiate AI Hackathon or Physician Note"
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Start Date</label>
                  <input
                    type="date"
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-canvas)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>End Date</label>
                  <input
                    type="date"
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
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
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Number of Days</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={leaveFormData.days}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, days: Number(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
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
                }}
              >
                Approved duty leave automatically credits lecture attendance upon HOD authorization.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setLeaveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={12} /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
