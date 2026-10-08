import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Send,
  Check,
  X,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader } from '../../workspace';

export default function HODHome({ onNavigate }) {
  const {
    departments,
    students,
    facultyMembers,
    leaveRequests,
    approveLeaveRequest,
    coursesAttendance,
    sendAnnouncement,
    showToast,
  } = useNivara();

  const [announcementText, setAnnouncementText] = useState('');
  const [counselingModal, setCounselingModal] = useState(null);
  const [counselingNotes, setCounselingNotes] = useState('');

  // Department of AI & Data Science (AIDS)
  const dept = (departments || []).find((d) => d.code === 'AIDS') || {
    code: 'AIDS',
    name: 'Department of AI & Data Science',
    studentCount: 380,
    facultyCount: 14,
    attendancePct: 84.8,
    avgCgpa: 8.42,
    placedPct: 82,
  };

  const deptStudents = useMemo(() => {
    return (students || []).filter((s) => s.deptCode === 'AIDS' || s.department?.includes('AI & Data Science'));
  }, [students]);

  const atRiskStudents = useMemo(() => {
    return deptStudents.filter((s) => (s.attendancePct || 0) < 75 || (s.backlogs || 0) > 0 || s.standing === 'Academic Risk');
  }, [deptStudents]);

  const pendingLeaves = useMemo(() => {
    return (leaveRequests || []).filter((l) => l.status === 'pending');
  }, [leaveRequests]);

  const overloadedFaculty = useMemo(() => {
    return (facultyMembers || []).filter((f) => f.workloadHours >= 18);
  }, [facultyMembers]);

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

  const metrics = [
    {
      label: 'Enrolled Students',
      value: `${dept.studentCount} Undergrads`,
      subtext: 'B.Tech AI & Data Science (Y1–Y4)',
      state: 'neutral',
    },
    {
      label: 'Department Attendance',
      value: `${dept.attendancePct}%`,
      subtext: 'Synchronized live from faculty roll calls',
      state: dept.attendancePct >= 75 ? 'success' : 'warning',
    },
    {
      label: 'Academic Risk Attention',
      value: `${atRiskStudents.length} Students`,
      subtext: atRiskStudents.length > 0 ? 'Below 75% cutoff threshold' : 'All in good standing',
      state: atRiskStudents.length > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Placement Conversion',
      value: `${dept.placedPct}%`,
      subtext: 'Career Development Center radar',
      state: 'info',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (HOD Persona) */}
      <PageHeader
        eyebrow={`Department Operating System · ${dept.name}`}
        title="Good Morning, Dr. K. Mohan"
        description="Immediate department operational status, lecture session tracking, student academic health alerts, and pending administrative sanctions."
        actions={[
          <button
            key="approvals-btn"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('approvals')}
          >
            <Check size={13} /> Review Approvals ({pendingLeaves.length})
          </button>,
          <button
            key="atrisk-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('at_risk')}
          >
            <ShieldAlert size={13} /> At-Risk Queue ({atRiskStudents.length})
          </button>,
        ]}
      />

      {/* 2. Department Key Operational Metrics */}
      <MetricStrip metrics={metrics} />

      {/* 3. Operational 2-Column Split Workspace */}
      <div className="split-panel" style={{ gridTemplateColumns: '1.45fr 1.15fr', gap: '1.25rem' }}>
        {/* LEFT COLUMN: Course Delivery & Circular Dispatcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Semester 5 Courses Lecture Delivery */}
          <div>
            <SectionHeader
              title="Active Semester 5 Courses & Lecture Delivery"
              subtitle="Continuous lecture session tracking across department faculty"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className="btn btn-ghost btn-sm"
                >
                  Analytics <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {(coursesAttendance || []).map((c) => (
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
                      Instructor: <strong>{c.faculty}</strong> · {c.attended} of {c.total} conducted · Venue: {c.room}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: c.percentage >= 80 ? 'var(--state-success)' : 'var(--state-warning)',
                      }}
                    >
                      {c.percentage}%
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Roll Call Attendance</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Circular Dispatcher */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Dispatch Departmental Directive to AI & DS Students
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Synchronizes immediately into student activity streams and push alerts.
            </p>
            <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. CIA II schedule and laboratory review sessions commence next Monday..."
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
                <Send size={13} /> Dispatch Circular
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: NEEDS ATTENTION & APPROVALS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Action Queue 1: At-Risk Students Radar */}
          <div>
            <SectionHeader
              title={`At-Risk Students Radar (${atRiskStudents.length})`}
              subtitle="Attendance &lt; 75% or active course backlogs"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate('at_risk')}
                  className="btn btn-ghost btn-sm"
                >
                  View Queue <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {atRiskStudents.length === 0 ? (
                <div
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem',
                  }}
                >
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
                          {st.rollNo || st.id}
                        </span>
                      </div>
                      <span className="badge badge-urgent">{st.attendancePct}%</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Advisor: <strong>{st.advisor || 'Dr. Priya Raman'}</strong> · CGPA: <strong>{st.cgpa}</strong>
                      {st.backlogs > 0 && <span> · Backlogs: <strong style={{ color: 'var(--state-urgent)' }}>{st.backlogs}</strong></span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
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

          {/* Action Queue 2: Pending Duty & Medical Approvals */}
          <div>
            <SectionHeader
              title={`Pending Leave Sanctions (${pendingLeaves.length})`}
              subtitle="Student duty & medical attendance waivers"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate('approvals')}
                  className="btn btn-ghost btn-sm"
                >
                  View All <ArrowRight size={12} />
                </button>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {pendingLeaves.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem',
                  }}
                >
                  No pending student leave requests requiring review ✓
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
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                        onClick={() => approveLeaveRequest(leave.id, false)}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                        onClick={() => approveLeaveRequest(leave.id, true)}
                      >
                        <Check size={11} /> Grant Approval
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Queue 3: Faculty Workload Alert */}
          {overloadedFaculty.length > 0 && (
            <div>
              <SectionHeader
                title="Faculty Workload Advisory"
                subtitle="Staff teaching at or exceeding 18 hours/week maximum"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.45rem' }}>
                {overloadedFaculty.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--state-warning-bg)',
                      border: '1px solid var(--state-warning-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {f.name} ({f.designation})
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Courses: {f.courses.join(', ')}
                      </div>
                    </div>
                    <span className="badge badge-warning">{f.workloadHours} / {f.maxHours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
