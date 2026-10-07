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
  Briefcase,
  Download,
  Plus,
  Send,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../../context/NivaraContext';
import { TODAY_TIMELINE } from '../../data/mockData';
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
import MetricStrip from '../workspace/MetricStrip';
import SectionHeader from '../workspace/SectionHeader';

export default function StudentDashboard() {
  const {
    students,
    currentUser,
    coursesAttendance,
    assignments,
    toggleAssignmentCompletion,
    placementDrives,
    studentPlacementApplications,
    applyPlacementDrive,
    submitLeaveRequest,
    examSessions,
    courseMaterials,
    timetableEntries,
    activeTab,
    setActiveTab,
    showToast,
  } = useNivara();

  // Dynamic student identity resolution from authenticated session
  const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId) || (students || [])[0] || {};

  // Modals inside Student dashboard
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    reason: '',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    days: 2,
  });

  // Urgency context
  // 1. Right now active class from timetable entries (Tuesday 10:00 AM slot)
  const tuesdayEntries = (timetableEntries || []).filter((e) => e.dayOfWeek === 'Tuesday');
  const liveClass = tuesdayEntries.find((e) => e.startTime <= '10:30:00' && e.endTime >= '10:00:00') ||
    TODAY_TIMELINE.find((c) => c.status === 'in-progress');

  const urgentAssignment = assignments.find((a) => a.urgency === 'urgent' && !a.completed);
  const nextExam = examSessions && examSessions.length > 0 ? examSessions[0] : null;
  const oopCourse = coursesAttendance.find((c) => c.code === 'CS302' || c.percentage < 80);

  // Student's personal applications
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
  // SUB-NAVIGATION VIEW ROUTING BASED ON activeTab
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
  // -------------------------------------------------------------
  const studentMetrics = [
    {
      id: 'attendance',
      label: 'Continuous Attendance',
      value: `${student.attendancePct || 87}%`,
      subtext: (student.attendancePct || 87) >= 75 ? 'In Good Standing (Cutoff 75%)' : 'Caution: Below 75% Cutoff',
      status: (student.attendancePct || 87) >= 75 ? 'success' : 'urgent',
    },
    {
      id: 'cgpa',
      label: 'Academic Standing',
      value: `${student.cgpa || 8.72}`,
      unit: 'CGPA',
      subtext: `Rank 4 · ${student.department || 'AI & DS'}`,
      status: 'info',
    },
    {
      id: 'assignments',
      label: 'Assignments Queue',
      value: `${assignments.filter((a) => !a.completed).length}`,
      subtext: urgentAssignment ? '1 Deliverable Due Tomorrow' : 'All deliverables submitted',
      status: urgentAssignment ? 'warning' : 'success',
    },
    {
      id: 'fees',
      label: 'Fee Reconciliation',
      value: student.feeStatus === 'paid' ? '₹0' : `₹${(student.feePendingAmount || 45000).toLocaleString()}`,
      subtext: student.feeStatus === 'paid' ? 'Autumn Term Fees Cleared' : `Statutory Due: ${student.feeDueDate || '15 Oct 2026'}`,
      status: student.feeStatus === 'paid' ? 'success' : 'warning',
    },
  ];

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Institutional Page Header */}
      <PageHeader
        eyebrow={
          <>
            <span>Tuesday · 7 October 2026</span>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span>{student.department || 'AI & Data Science'} · {student.year || '3rd Year'} (Sem {student.semester || 5})</span>
          </>
        }
        title={`Good Morning, ${(student.name || 'Aadhi').split(' ')[0]}`}
        description="2 operational items need your attention today across lectures, deliverables, and university milestones."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('today')}
            >
              <Clock size={13} /> Full Day Timeline
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setLeaveModalOpen(true)}
            >
              <Plus size={13} /> Request Duty Leave
            </button>
          </div>
        }
      />

      {/* 2. Key Academic & Standing Metrics Strip */}
      <MetricStrip metrics={studentMetrics} />

      {/* 3. Split-Panel Operating Workspace */}
      <div className="split-panel">
        {/* LEFT COLUMN: Immediate Day Operations & Action Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* RIGHT NOW & NEXT UP */}
          <section>
            <SectionHeader
              title="Schedule Stream"
              subtitle="Real-time academic sequence"
              action={
                <button type="button" onClick={() => setActiveTab('today')} className="prompt-section-link">
                  Detailed Stream <ArrowRight size={13} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Right Now */}
              <div
                className="prompt-item-block"
                onClick={() => setActiveTab('today')}
                style={{ cursor: 'pointer', borderLeft: '3px solid var(--brand-primary)' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                    <span className="prompt-time-label">10:00 AM — In Session</span>
                    <span className="badge badge-info">
                      <span className="pulse-dot" /> {liveClass ? liveClass.room : 'Computing Lab 2'}
                    </span>
                  </div>
                  <div className="prompt-title-large">
                    {liveClass ? (liveClass.subjectName || liveClass.subject) : 'Data Structures & Algorithms (CS301)'}
                  </div>
                  <div className="prompt-meta-text">
                    <MapPin size={13} />
                    <span>
                      {liveClass?.room || 'Computing Lab 2'} · Instructor: {liveClass?.facultyName || liveClass?.faculty || 'Dr. Priya Raman'} · Section AIDS-A
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
              </div>

              {/* Next Up */}
              <div
                className="prompt-item-block"
                onClick={() => setActiveTab('today')}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <span className="prompt-time-label">11:30 AM → 01:00 PM</span>
                  <div className="prompt-title-large">
                    Free Study Window & Library Resource Access
                  </div>
                  <div className="prompt-meta-text">
                    <span>Followed by Database Systems at 02:00 PM in Room B104</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
              </div>
            </div>
          </section>

          {/* NEEDS ATTENTION */}
          <section>
            <SectionHeader
              title="Needs Attention"
              badge="Action Required"
              action={
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Synchronized with faculty & bursar
                </span>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Urgent Assignment */}
              {urgentAssignment && (
                <div className="prompt-item-block" style={{ borderLeft: '3px solid var(--state-urgent)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-urgent">Assignment Due Tomorrow</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>11:59 PM Deadline</span>
                    </div>
                    <div className="prompt-title-large">
                      {urgentAssignment.title}
                    </div>
                    <div className="prompt-meta-text">
                      <span>{urgentAssignment.subject}</span>
                      <span>•</span>
                      <span>{urgentAssignment.faculty}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignSelf: 'center', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setActiveTab('assignments')}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => toggleAssignmentCompletion(urgentAssignment.id)}
                    >
                      <Check size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Attendance Caution Callout if any subject < 80% */}
              {oopCourse && oopCourse.percentage < 80 && (
                <div
                  className="notion-callout notion-callout-warning"
                  onClick={() => setActiveTab('attendance')}
                  style={{ cursor: 'pointer' }}
                >
                  <AlertCircle size={15} color="var(--state-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1, fontSize: '0.8125rem' }}>
                    <strong>{oopCourse.name}</strong> is at <strong>{oopCourse.percentage}%</strong>. You can safely miss only <strong>{oopCourse.safeToMiss || 1} more lecture</strong> before mandatory counseling.
                  </div>
                  <ArrowRight size={14} color="var(--state-warning)" style={{ alignSelf: 'center' }} />
                </div>
              )}

              {/* Fee Notice */}
              {student.feeStatus === 'pending' ? (
                <div className="prompt-item-block" style={{ borderLeft: '3px solid var(--state-warning)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-warning">Tuition Fee Due</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Statutory Due: {student.feeDueDate || '15 Oct 2026'}</span>
                    </div>
                    <div className="prompt-title-large">
                      Semester 5 Tuition & Infrastructure Fee (₹{(student.feePendingAmount || 45000).toLocaleString()})
                    </div>
                    <div className="prompt-meta-text">
                      <span>Bursar Office · Online payment instant receipt clearance</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => setActiveTab('fees')}
                    style={{ alignSelf: 'center', flexShrink: 0 }}
                  >
                    <CreditCard size={13} /> Pay Now
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--state-success-bg)',
                    border: '1px solid var(--state-success-border)',
                    fontSize: '0.8125rem',
                    color: 'var(--state-success)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={15} />
                    <span>All Semester 5 Tuition Fees Cleared. Zero Outstanding Balance.</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveTab('fees')}
                    style={{ color: 'var(--state-success)', padding: '0.2rem 0.5rem' }}
                  >
                    <Download size={13} /> Receipt
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Upcoming Milestones, Placement & Courseware */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* UPCOMING EXAMINATION */}
          {nextExam && (
            <section>
              <SectionHeader
                title="Upcoming Examinations"
                action={
                  <button type="button" onClick={() => setActiveTab('exams')} className="prompt-section-link">
                    Admit Card <ArrowRight size={13} />
                  </button>
                }
              />

              <div className="prompt-item-block" onClick={() => setActiveTab('exams')} style={{ cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-neutral">{nextExam.dateFormatted}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In {nextExam.daysRemaining} days</span>
                  </div>
                  <div className="prompt-title-large">{nextExam.subject}</div>
                  <div className="prompt-meta-text">
                    <span>Venue: {nextExam.venue}</span>
                    <span>•</span>
                    <span>Seat: {nextExam.seatingSeat}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
              </div>
            </section>
          )}

          {/* CAMPUS PLACEMENT RADAR */}
          <section>
            <SectionHeader
              title="Placement Radar"
              action={
                <button type="button" onClick={() => setActiveTab('placement')} className="prompt-section-link">
                  All Drives <ArrowRight size={13} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(placementDrives || []).slice(0, 2).map((drive) => {
                const isEligible = (student.cgpa || 8.72) >= drive.minCgpa && (student.backlogs || 0) <= drive.allowedBacklogs;
                const hasApplied = myApplications.some((a) => a.driveId === drive.id);

                return (
                  <div key={drive.id} className="prompt-item-block">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span className="badge badge-info">{drive.packageLpa}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Due {drive.deadline}</span>
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {drive.company}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {drive.role} · Min CGPA {drive.minCgpa}
                      </div>
                    </div>

                    <div style={{ alignSelf: 'center', flexShrink: 0 }}>
                      {hasApplied ? (
                        <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                          <Check size={11} /> Applied
                        </span>
                      ) : isEligible ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => applyPlacementDrive(drive.id)}
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Briefcase size={12} /> Apply
                        </button>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>Ineligible</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* COURSEWARE & STUDY MATERIALS */}
          <section>
            <SectionHeader
              title="Course Resources"
              action={
                <button type="button" onClick={() => setActiveTab('materials')} className="prompt-section-link">
                  Repository <ArrowRight size={13} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(courseMaterials || []).slice(0, 2).map((mat) => (
                <div
                  key={mat.id}
                  className="prompt-item-block"
                  onClick={() => setActiveTab('materials')}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-neutral">{mat.courseCode}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{mat.downloads || 0} downloads</span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {mat.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {mat.facultyName}
                    </div>
                  </div>
                  <Download size={14} color="var(--brand-blue)" style={{ alignSelf: 'center' }} />
                </div>
              ))}
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
