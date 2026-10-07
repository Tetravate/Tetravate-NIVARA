import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  Send,
  FileText,
  UserCheck,
  TrendingDown,
  TrendingUp,
  BookOpen,
  Search,
  Check,
  X,
  Download,
} from 'lucide-react';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from '../workspace';

export default function HODDashboard() {
  const {
    activeTab,
    setActiveTab,
    departments,
    students,
    leaveRequests,
    approveLeaveRequest,
    coursesAttendance,
    facultyMembers,
    sendAnnouncement,
    showToast,
  } = useNivara();

  const [announcementText, setAnnouncementText] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [counselingModal, setCounselingModal] = useState(null);
  const [counselingNotes, setCounselingNotes] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // HOD oversees Department of AI & Data Science
  const dept = departments.find((d) => d.code === 'AIDS') || departments[0];
  const deptStudents = students.filter((s) => s.deptCode === 'AIDS');
  const atRiskStudents = deptStudents.filter((s) => s.attendancePct < 75 || s.backlogs > 0);
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');

  const filteredDeptStudents = deptStudents.filter((s) => {
    const q = studentSearchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  });

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    sendAnnouncement(`Department Circular: ${dept.name}`, announcementText, 'student');
    showToast(`Department Circular dispatched to ${dept.studentCount} AI & DS students ✓`, 'success');
    setAnnouncementText('');
  };

  const handleConfirmCounseling = (e) => {
    e.preventDefault();
    if (!counselingModal) return;
    showToast(`Academic mentor alert & counseling notice issued for ${counselingModal.name} ✓`, 'success');
    setCounselingModal(null);
    setCounselingNotes('');
  };

  const hodMetrics = [
    {
      label: 'Enrolled Students',
      value: dept.studentCount,
      subtext: 'Years 1 through 4',
      state: 'neutral',
    },
    {
      label: 'Dept Attendance',
      value: `${dept.attendancePct}%`,
      subtext: 'Synchronized live from faculty',
      state: dept.attendancePct >= 75 ? 'success' : 'warning',
    },
    {
      label: 'Academic Risk',
      value: `${atRiskStudents.length} Students`,
      subtext: 'Below 75% cutoff threshold',
      state: atRiskStudents.length > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Placement Conversion',
      value: `${dept.placedPct}%`,
      subtext: 'Career Development Center',
      state: 'info',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (HOD Persona) */}
      <PageHeader
        eyebrow={`Department Administration · ${dept.name}`}
        title="Good Morning, Dr. K. Mohan"
        description="Aggregated department academic health, at-risk student monitoring, faculty allocations, and approvals."
        actions={[
          <button
            key="report"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setReportModalOpen(true)}
          >
            <FileText size={13} /> Department Audit Report
          </button>,
        ]}
      />

      {/* 2. Department Key Performance Indicators */}
      <MetricStrip metrics={hodMetrics} />

      {/* 3. HOME / OVERVIEW VIEW (Analytical Workspace) */}
      {(activeTab === 'home' || activeTab === 'overview' || activeTab === 'attendance' || activeTab === 'performance' || activeTab === 'timetable' || activeTab === 'announcements' || activeTab === 'reports') && (
        <div className="split-panel" style={{ gridTemplateColumns: '1.5fr 1.1fr' }}>
          {/* LEFT COLUMN: Active Courses & Announcements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <SectionHeader
                title="Active Semester 5 Courses & Lecture Delivery"
                subtitle="Continuous lecture session tracking across department faculty"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {coursesAttendance.map((c) => (
                  <div
                    key={c.code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {c.name} ({c.code})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Faculty: <strong>{c.faculty}</strong> · {c.attended} of {c.total} sessions conducted · Venue: {c.room}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: c.percentage >= 80 ? 'var(--state-success)' : 'var(--state-warning)',
                      }}>
                        {c.percentage}%
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Attendance Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Circular Dispatcher */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Dispatch Departmental Announcement to AI & DS Students
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Reaches all {dept.studentCount} enrolled undergraduates immediately in their live activity feed.
              </p>
              <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Continuous assessment schedule and laboratory review for next week..."
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={13} /> Send Circular
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: At-Risk Intervention & Pending Approvals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* At-Risk Students */}
            <div>
              <SectionHeader
                title="At-Risk Students"
                subtitle="Attendance &lt; 75% or active academic backlogs"
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab('at_risk')}
                    className="btn btn-ghost btn-sm"
                  >
                    View All ({atRiskStudents.length})
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {atRiskStudents.length === 0 ? (
                  <div style={{ padding: '1.25rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    <CheckCircle size={24} color="var(--state-success)" style={{ margin: '0 auto 0.5rem' }} />
                    All students currently meet academic thresholds.
                  </div>
                ) : (
                  atRiskStudents.slice(0, 3).map((st) => (
                    <div
                      key={st.id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--state-urgent-bg)',
                        border: '1px solid var(--state-urgent-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {st.name}
                          </strong>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                            {st.id}
                          </span>
                        </div>
                        <span className="badge badge-urgent">{st.attendancePct}%</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Advisor: {st.advisor || 'Dr. Priya Raman'} · CGPA: {st.cgpa}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setCounselingModal(st)}
                        >
                          Initiate Counseling
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div>
              <SectionHeader
                title="Pending Leave Approvals"
                subtitle="Student duty & medical attendance waivers"
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab('leaves')}
                    className="btn btn-ghost btn-sm"
                  >
                    View All ({pendingLeaves.length})
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {pendingLeaves.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No pending approval requests.
                  </div>
                ) : (
                  pendingLeaves.slice(0, 3).map((leave) => (
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
                        <span className="badge badge-neutral">{leave.days} Days</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {leave.reason} ({leave.startDate} to {leave.endDate})
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: '0.2rem' }}>
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
          </div>
        </div>
      )}

      {/* VIEW: AT-RISK STUDENTS FULL LIST */}
      {activeTab === 'at_risk' && (
        <section>
          <SectionHeader
            title="Students Requiring Academic Counseling & Mentorship"
            subtitle="Students falling below the mandatory 75% institutional attendance cutoff"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {atRiskStudents.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="All Students Within Good Standing"
                description="Zero students currently below the 75% attendance cutoff or at critical academic risk."
              />
            ) : (
              atRiskStudents.map((st) => (
                <div
                  key={st.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--state-urgent-bg)',
                    border: '1px solid var(--state-urgent-border)',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {st.name}
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {st.id} ({st.rollNo || 'Roll'})
                      </span>
                      <span className="badge badge-urgent">Attendance: {st.attendancePct}%</span>
                      {st.backlogs > 0 && <span className="badge badge-warning">{st.backlogs} Backlogs</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Current CGPA: <strong>{st.cgpa}</strong> · Assigned Academic Advisor: <strong>{st.advisor || 'Dr. Priya Raman'}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCounselingModal(st)}
                  >
                    Initiate Counseling Notice
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* VIEW: LEAVE APPROVALS FULL LIST */}
      {(activeTab === 'leaves' || activeTab === 'approvals') && (
        <section>
          <SectionHeader
            title="Duty & Medical Leave Approval Queue"
            subtitle="Verified approvals automatically credit student attendance ledgers"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {leaveRequests.map((leave) => (
              <div
                key={leave.id}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {leave.studentName}
                    </strong>
                    <span className="badge badge-neutral">{leave.days} Days</span>
                    <span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-urgent' : 'badge-warning'}`}>
                      {leave.status === 'approved' ? 'Approved by HOD' : leave.status === 'rejected' ? 'Rejected' : 'Action Required'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Justification: {leave.reason} ({leave.startDate} to {leave.endDate})
                  </div>
                </div>

                {leave.status === 'pending' ? (
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
                      <Check size={12} /> Grant Official Approval
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--state-success)', fontWeight: 600 }}>
                    Attendance Credited ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VIEW: FACULTY WORKLOAD */}
      {(activeTab === 'faculty' || activeTab === 'workload') && (
        <section>
          <SectionHeader
            title="Department Faculty Roster & Workload Distribution"
            subtitle={`${dept.facultyCount} Teaching faculty members assigned to ${dept.name}`}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {facultyMembers.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {f.name} · <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{f.designation}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Assigned: {f.courses.join(', ')} · Student Rating: <strong>{f.rating} ★</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {f.workloadHours} / {f.maxHours} hrs/wk
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--state-success)' }}>Compliance {f.compliancePct}%</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => showToast(`Workload adjusted for ${f.name} ✓`, 'info')}
                  >
                    Adjust
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* VIEW: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <section>
          <SectionHeader
            title={`AI & Data Science Student Directory (${deptStudents.length})`}
            subtitle="Undergraduate Batch Enrolled 2024–2028"
          />

          <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.4rem 0.75rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredDeptStudents.map((st) => (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={st.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {st.id} · {st.year} · Advisor: {st.advisor || 'Dr. Priya Raman'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: st.attendancePct >= 75 ? 'var(--state-success)' : 'var(--state-urgent)' }}>
                      {st.attendancePct}%
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Attendance</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {st.cgpa}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>CGPA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COUNSELING MODAL */}
      {counselingModal && (
        <div className="modal-backdrop" onClick={() => setCounselingModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="var(--state-urgent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Initiate Academic Intervention
                </h3>
              </div>
              <button type="button" onClick={() => setCounselingModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleConfirmCounseling} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Target Student: <strong>{counselingModal.name}</strong> ({counselingModal.id})<br />
                Attendance: <strong style={{ color: 'var(--state-urgent)' }}>{counselingModal.attendancePct}%</strong> (Below 75% Cutoff)
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Counseling Directive & Action Plan
                </label>
                <textarea
                  rows="3"
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  placeholder="e.g. Mandatory meeting with Academic Advisor Dr. Priya Raman and remedial makeup lectures."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCounselingModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Dispatch Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT REPORT MODAL */}
      {reportModalOpen && (
        <div className="modal-backdrop" onClick={() => setReportModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Department Academic Audit Report
                </h3>
              </div>
              <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div>Department: <strong>{dept.name} ({dept.code})</strong></div>
                <div>Head of Department: <strong>{dept.hod}</strong></div>
                <div>Average Continuous Attendance: <strong>{dept.attendancePct}%</strong></div>
                <div>Department Average CGPA: <strong>{dept.avgCgpa}</strong></div>
                <div>Placement Conversion Rate: <strong>{dept.placedPct}%</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast('Department Audit Report PDF generated ✓', 'success');
                    setReportModalOpen(false);
                  }}
                >
                  <Download size={12} /> Download Official PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
