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
import PageHeader from '../workspace/PageHeader';

export default function StudentDashboard() {
  const {
    students,
    currentUser,
    coursesAttendance,
    assignments,
    toggleAssignmentCompletion,
    placementDrives,
    studentPlacementApplications,
    submitLeaveRequest,
    examSessions,
    timetableEntries,
    activeTab,
    setActiveTab,
    showToast,
  } = useNivara();

  // Dynamic student identity resolution from authenticated session
  // Dynamic student identity resolution from authenticated session
  const activeStudentId = currentUser?.studentId || currentUser?.id || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId || s.email === currentUser?.email) || (students || [])[0] || {};

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
    .filter((e) => e.dayOfWeek === 'Tuesday')
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const liveClass = tuesdayEntries.find((e) => e.startTime <= '10:30:00' && e.endTime >= '10:00:00') || {
    subjectName: 'Data Structures & Algorithms',
    courseCode: 'CS301',
    facultyName: 'Dr. Priya Raman',
    room: 'Computing Lab 2 (Block B)',
    timeSlot: '10:00 AM – 11:30 AM',
    status: 'in-progress',
  };

  // 2. NEXT: next class, upcoming assignment, upcoming exam, immediate item
  const nextClass = tuesdayEntries.find((e) => e.startTime > '10:30:00') || {
    subjectName: 'Database Management Systems',
    courseCode: 'CS304',
    facultyName: 'Dr. K. Mohan',
    room: 'Room B104',
    timeSlot: '02:00 PM – 03:30 PM',
  };

  const urgentAssignment = assignments.find((a) => !a.completed && (a.urgency === 'urgent' || a.urgency === 'important')) || assignments.find((a) => !a.completed);
  const nextExam = examSessions && examSessions.length > 0 ? examSessions[0] : null;
  const nextDrive = (placementDrives || []).find((d) => d.status === 'active');

  // 3. NEEDS ATTENTION: attendance risk, pending assignments, fee dues, leave status, notifications
  const lowAttendanceCourses = coursesAttendance.filter((c) => c.percentage < 80);
  const myLeaves = (leaveRequests || []).filter(
    (l) => l.studentId === student.id || l.studentName === student.name
  );
  const pendingLeave = myLeaves.find((l) => l.status === 'pending');
  const recentApprovedLeave = myLeaves.find((l) => l.status === 'approved' && l.dutyAttendanceGranted);
  const isFeePending = student.feeStatus === 'pending';

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
  if (activeTab === 'today') return <TodayTimeline onBack={() => setActiveTab('home')} />;
  if (activeTab === 'attendance') return <SmartAttendance onBack={() => setActiveTab('home')} />;
  if (activeTab === 'assignments') return <AssignmentsView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'materials') return <StudentCoursesView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'fees') return <StudentFeesView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'placement') return <StudentPlacementView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'leaves') return <StudentLeavesView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'exams') return <ExamTimeline onBack={() => setActiveTab('home')} />;
  if (activeTab === 'results') return <ResultsView onBack={() => setActiveTab('home')} />;
  if (activeTab === 'timetable') return <TimetableSwitch onBack={() => setActiveTab('home')} />;
  if (activeTab === 'profile') return <StudentProfile onBack={() => setActiveTab('home')} />;

  // -------------------------------------------------------------
  // DEFAULT VIEW: STUDENT HOME (`home`)
  // Derived directly from live timetable, assignments, attendance, fees, leave, exams
  // -------------------------------------------------------------
  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Institutional Compact Header */}
      <PageHeader
        eyebrow={
          <>
            <span>Tuesday · 7 October 2026</span>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span>{student.department || 'AI & Data Science'} · {student.year || '3rd Year'} (Sem {student.semester || 5})</span>
          </>
        }
        title={`Student Workspace · ${(student.name || 'Aadhi').split(' ')[0]}`}
        description="Unified operational aggregation for lectures, deadlines, institutional standing, and university milestones."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('today')}
            >
              <Clock size={13} /> Today's Schedule
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setLeaveModalOpen(true)}
            >
              <Plus size={13} /> Request Leave
            </button>
          </div>
        }
      />

      {/* 1. RIGHT NOW */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-primary)' }}>
              RIGHT NOW
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>
              <span className="pulse-dot" /> In Session
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setActiveTab('today')}
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
          >
            Full Timeline <ArrowRight size={12} />
          </button>
        </div>

        <div
          onClick={() => setActiveTab('today')}
          style={{
            cursor: 'pointer',
            padding: '0.75rem 1rem',
            background: 'var(--bg-hover)',
            borderRadius: 'var(--radius-xs)',
            borderLeft: '3px solid var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {liveClass.timeSlot || '10:00 AM – 11:30 AM'}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                {liveClass.courseCode || 'CS301'}
              </span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {liveClass.subjectName || liveClass.subject || 'Data Structures & Algorithms'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={12} /> {liveClass.room || 'Computing Lab 2 (Block B)'}
              </span>
              <span>•</span>
              <span>Instructor: <strong>{liveClass.facultyName || liveClass.faculty || 'Dr. Priya Raman'}</strong></span>
              <span>•</span>
              <span>Section: {student.deptCode || 'AIDS'}-A</span>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </section>

      {/* 2. NEXT */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
            NEXT
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Upcoming academic sequence</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
          {/* Next Class */}
          <div
            onClick={() => setActiveTab('today')}
            style={{
              cursor: 'pointer',
              padding: '0.75rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Next Lecture</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{nextClass.timeSlot}</span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {nextClass.subjectName || 'Database Systems'}
            </div>
            <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {nextClass.room} · {nextClass.facultyName || 'Dr. K. Mohan'}
            </div>
          </div>

          {/* Upcoming Assignment */}
          {urgentAssignment ? (
            <div
              onClick={() => setActiveTab('assignments')}
              style={{
                cursor: 'pointer',
                padding: '0.75rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--state-urgent)' }}>Deliverable Due</span>
                <span className="badge badge-urgent" style={{ fontSize: '0.625rem' }}>{urgentAssignment.dueFormatted || 'Tomorrow'}</span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {urgentAssignment.title}
              </div>
              <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {urgentAssignment.subject} · {urgentAssignment.faculty}
              </div>
            </div>
          ) : (
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Deliverables</span>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--state-success)', marginTop: '0.2rem' }}>
                All assignments submitted ✓
              </div>
            </div>
          )}

          {/* Upcoming Exam */}
          {nextExam ? (
            <div
              onClick={() => setActiveTab('exams')}
              style={{
                cursor: 'pointer',
                padding: '0.75rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Next Exam Paper</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>In {nextExam.daysRemaining} days</span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {nextExam.subject}
              </div>
              <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {nextExam.venue} · Seat: <strong>{nextExam.seatingSeat}</strong>
              </div>
            </div>
          ) : null}

          {/* Placement / Career Horizon */}
          {nextDrive ? (
            <div
              onClick={() => setActiveTab('placement')}
              style={{
                cursor: 'pointer',
                padding: '0.75rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Campus Drive</span>
                <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>{nextDrive.packageLpa}</span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {nextDrive.company}
              </div>
              <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {nextDrive.role} · Deadline: {nextDrive.deadline}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 3. NEEDS ATTENTION */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--state-urgent)' }}>
              NEEDS ATTENTION
            </span>
            <span className="badge badge-urgent" style={{ fontSize: '0.625rem' }}>Immediate Action Queue</span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Bursar, Faculty & HOD updates</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
                  <strong>{c.name} ({c.code})</strong> attendance is at <strong>{c.percentage}%</strong>. You can safely miss only <strong>{c.safeToMiss || 1} more lecture</strong> before mandatory counseling cutoff.
                </div>
              </div>
              <ArrowRight size={14} color="var(--state-warning)" style={{ flexShrink: 0 }} />
            </div>
          ))}

          {/* Urgent Assignment */}
          {urgentAssignment && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                borderLeft: '3px solid var(--state-urgent)',
                border: '1px solid var(--border-subtle)',
                borderLeftWidth: '3px',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                  <span className="badge badge-urgent" style={{ fontSize: '0.625rem' }}>Pending Deliverable Due</span>
                  <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Due {urgentAssignment.dueFormatted}</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {urgentAssignment.title} ({urgentAssignment.courseCode || urgentAssignment.subject})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => setActiveTab('assignments')}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  Submit Deliverable
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => toggleAssignmentCompletion(urgentAssignment.id)}
                  title="Mark Complete"
                  style={{ padding: '0.3rem 0.5rem' }}
                >
                  <Check size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Pending Fee Due */}
          {isFeePending ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                borderLeft: '3px solid var(--state-warning)',
                border: '1px solid var(--border-subtle)',
                borderLeftWidth: '3px',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>Tuition Dues Outstanding</span>
                  <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Due by {student.feeDueDate || '15 Oct 2026'}</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Semester 5 Tuition & Infrastructure Fee (₹{(student.feePendingAmount || 45000).toLocaleString()})
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
                <Download size={12} /> View Receipt
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
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>Duty Leave Status</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {pendingLeave.days} Days Request Under Review
                  </span>
                </div>
                <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {pendingLeave.reason} ({pendingLeave.startDate} – {pendingLeave.endDate})
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>Pending HOD</span>
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
                <span>Duty Leave Approved by HOD · {recentApprovedLeave.days} lecture days attendance concession credited.</span>
              </div>
              <ArrowRight size={13} color="var(--state-success)" />
            </div>
          )}
        </div>
      </section>

      {/* 4. COMING UP */}
      <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
            COMING UP
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Forward horizon across classes, exams & recruitment</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {/* Upcoming Classes */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Classes Stream</span>
              <button type="button" onClick={() => setActiveTab('timetable')} className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.71875rem' }}>
                Timetable <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(timetableEntries || []).slice(0, 3).map((cls) => (
                <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {cls.courseCode}: {cls.subjectName}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {cls.dayOfWeek.substring(0, 3)} {cls.startTime?.substring(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Deadlines */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Assignment Deadlines</span>
              <button type="button" onClick={() => setActiveTab('assignments')} className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.71875rem' }}>
                Queue <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {assignments.slice(0, 3).map((asg) => (
                <div key={asg.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {asg.title}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: asg.completed ? 'var(--state-success)' : 'var(--text-muted)', fontWeight: asg.completed ? 700 : 400 }}>
                    {asg.completed ? 'Done' : asg.dueFormatted.split('·')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Schedule */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Examination Papers</span>
              <button type="button" onClick={() => setActiveTab('exams')} className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.71875rem' }}>
                Hall Ticket <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(examSessions || []).slice(0, 3).map((ex) => (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {ex.code}: {ex.subject}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {ex.dateFormatted}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Deadlines */}
          <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Placement Opportunities</span>
              <button type="button" onClick={() => setActiveTab('placement')} className="btn btn-ghost btn-sm" style={{ padding: 0, fontSize: '0.71875rem' }}>
                All Drives <ArrowRight size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(placementDrives || []).slice(0, 3).map((drv) => {
                const applied = myApplications.some((a) => a.driveId === drv.id);
                return (
                  <div key={drv.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {drv.company}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: applied ? 'var(--state-success)' : 'var(--text-muted)', fontWeight: applied ? 700 : 400 }}>
                      {applied ? 'Applied' : `Due ${drv.deadline}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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
