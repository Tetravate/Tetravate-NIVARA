import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Send,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from './workspace';

export default function StudentLeavesView({ onBack }) {
  const {
    students,
    currentUser,
    leaveRequests,
    submitLeaveRequest,
    showToast,
  } = useNivara();

  const activeStudentId = currentUser?.studentId || currentUser?.id || '';
  const student = (students || []).find((s) => (activeStudentId && s.id === activeStudentId) || (currentUser?.email && s.email === currentUser?.email)) || (students || [])[0] || {};

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'approved' | 'pending' | 'rejected'
  const [leaveFormData, setLeaveFormData] = useState({
    reason: '',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    days: 2,
  });

  // Filter student's own requests
  const studentLeaves = (leaveRequests || []).filter(
    (l) => (student.id && l.studentId === student.id) || (student.name && l.studentName === student.name) || (activeStudentId && l.studentId === activeStudentId)
  );

  const approvedLeaves = studentLeaves.filter((l) => l.status === 'approved');
  const pendingLeaves = studentLeaves.filter((l) => l.status === 'pending');
  const rejectedLeaves = studentLeaves.filter((l) => l.status === 'rejected');
  const dutyDaysCredited = approvedLeaves.reduce((sum, l) => sum + (l.dutyAttendanceGranted ? (Number(l.days) || 0) : 0), 0);

  const leaveMetrics = [
    {
      label: 'Submitted Requests',
      value: `${studentLeaves.length} Total`,
      subtext: 'Semester 5 Leave Ledger',
      state: 'info',
    },
    {
      label: 'HOD Approved',
      value: `${approvedLeaves.length} Concurred`,
      subtext: 'Official institutional waivers',
      state: 'success',
    },
    {
      label: 'Pending HOD Review',
      value: `${pendingLeaves.length} In Review`,
      subtext: 'Awaiting faculty endorsement',
      state: pendingLeaves.length > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Attendance Credited',
      value: `${dutyDaysCredited} Days`,
      subtext: 'On-Duty Attendance Restored',
      state: 'success',
    },
  ];

  const handleDateChange = (field, val) => {
    const updated = { ...leaveFormData, [field]: val };
    if (updated.startDate && updated.endDate) {
      const d1 = new Date(updated.startDate);
      const d2 = new Date(updated.endDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      updated.days = diffDays > 0 ? diffDays : 1;
    }
    setLeaveFormData(updated);
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveFormData.reason.trim()) {
      showToast('Please provide an official justification for your leave', 'warning');
      return;
    }
    if (new Date(leaveFormData.endDate) < new Date(leaveFormData.startDate)) {
      showToast('End date cannot precede the start date', 'warning');
      return;
    }

    // Validate duplicate or overlapping leave dates for the active student
    const hasConflict = studentLeaves.some((l) => {
      if (l.status === 'rejected') return false;
      const startReq = new Date(leaveFormData.startDate).getTime();
      const endReq = new Date(leaveFormData.endDate).getTime();
      const startExist = new Date(l.startDate).getTime();
      const endExist = new Date(l.endDate).getTime();
      return startReq <= endExist && endReq >= startExist;
    });

    if (hasConflict) {
      showToast('An active leave request already covers these dates. Please choose another date range.', 'warning');
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
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
    });
    showToast('Leave request submitted to HOD & Faculty queue ✓', 'success');
  };

  const filteredLeaves = studentLeaves.filter((l) => {
    if (filterStatus === 'ALL') return true;
    return l.status === filterStatus;
  });

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Academic Affairs & Concessions · Semester 5 · Autumn 2026"
        title="Student Leave Requests"
        description="Official duty leave submissions, inter-collegiate hackathon authorizations, and medical absence waivers."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setLeaveModalOpen(true)}
            >
              <Plus size={13} /> Request Duty Leave
            </button>
            {onBack && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
                <ArrowLeft size={13} /> Back to Home
              </button>
            )}
          </div>
        }
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={leaveMetrics} />

      {/* 3. Filter Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'ALL', label: `All Requests (${studentLeaves.length})` },
          { id: 'pending', label: `Pending Review (${pendingLeaves.length})` },
          { id: 'approved', label: `Approved (${approvedLeaves.length})` },
          { id: 'rejected', label: `Rejected (${rejectedLeaves.length})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`btn btn-sm ${filterStatus === f.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 4. Requests List */}
      <section>
        <SectionHeader
          title={`My Submitted Requests (${filteredLeaves.length})`}
          subtitle="Official review status and attendance concession log"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredLeaves.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No leave requests in this category"
              description="Click 'Request Duty Leave' above to apply for official on-duty or medical concessions."
            />
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  padding: '1.15rem 1.25rem',
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
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {leave.reason}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                      {leave.days} Day{leave.days > 1 ? 's' : ''}
                    </span>
                    <span
                      className={`badge ${
                        leave.status === 'approved'
                          ? 'badge-success'
                          : leave.status === 'rejected'
                          ? 'badge-urgent'
                          : 'badge-warning'
                      }`}
                    >
                      {leave.status === 'approved'
                        ? 'Approved by HOD'
                        : leave.status === 'rejected'
                        ? 'Declined by HOD'
                        : 'Pending HOD Concurrence'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    <span>Period: <strong>{leave.startDate}</strong> to <strong>{leave.endDate}</strong></span>
                    <span>•</span>
                    <span>Submitted: {leave.submittedAt || 'Recorded'}</span>
                    {leave.status !== 'pending' && (
                      <>
                        <span>•</span>
                        <span>Reviewed by: <strong>{leave.approvedBy || 'Department Head'}</strong></span>
                      </>
                    )}
                  </div>

                  {leave.comment && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-xs)', borderLeft: '2px solid var(--brand-primary)' }}>
                      <strong>Reviewer Remarks:</strong> {leave.comment}
                    </div>
                  )}

                  {leave.dutyAttendanceGranted && (
                    <div
                      style={{
                        marginTop: '0.35rem',
                        fontSize: '0.75rem',
                        color: 'var(--state-success)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <CheckCircle2 size={13} /> On-Duty Attendance Concession Applied (+{leave.days} lecture days credited)
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Request Leave Modal */}
      {leaveModalOpen && (
        <div className="modal-backdrop" onClick={() => setLeaveModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
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
                  Official Justification / Reason (Required)
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
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
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
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
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
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Calculated Absence Days</label>
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
                  fontSize: '0.71875rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-subtle)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  lineHeight: 1.4,
                }}
              >
                Upon HOD concurrence, approved duty leaves automatically credit lecture attendance to prevent continuous attendance degradation.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
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
