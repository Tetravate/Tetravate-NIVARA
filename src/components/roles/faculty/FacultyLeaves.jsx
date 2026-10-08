import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Check,
  X,
  Search,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyLeaves() {
  const {
    leaveRequests,
    approveLeaveRequest,
    showToast,
  } = useNivara();

  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

  // Scoped to Faculty's students (AI & Data Science)
  const scopedLeaves = useMemo(() => {
    return (leaveRequests || []).filter((l) => {
      return l.department?.includes('AI & Data Science') || l.department === 'AIDS' || !l.department;
    });
  }, [leaveRequests]);

  const filteredLeaves = useMemo(() => {
    return scopedLeaves.filter((l) => {
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;

      const matchesSearch =
        l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [scopedLeaves, filterStatus, searchQuery]);

  const pendingCount = scopedLeaves.filter((l) => l.status === 'pending').length;
  const approvedCount = scopedLeaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = scopedLeaves.filter((l) => l.status === 'rejected').length;

  const metrics = [
    {
      label: 'Pending Concurrence',
      value: `${pendingCount} Requests`,
      subtext: pendingCount > 0 ? 'Requires faculty review' : 'Queue cleared',
      state: pendingCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Approved Waivers',
      value: `${approvedCount} Granted`,
      subtext: 'Attendance credit applied',
      state: 'success',
    },
    {
      label: 'Declined Requests',
      value: `${rejectedCount} Total`,
      subtext: 'Returned to student portal',
      state: 'neutral',
    },
    {
      label: 'Policy Concurrence',
      value: 'Automatic Sync',
      subtext: 'Concurs with HOD & Exam Cell',
      state: 'info',
    },
  ];

  const handleAction = (id, approve) => {
    approveLeaveRequest(id, approve);
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Student Attendance Waiver & Duty Concurrence"
        title="Student Leave Concurrence"
        description="Review on-duty (hackathons, sports, symposiums) and medical leave requests submitted by enrolled students to validate official attendance concessions."
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
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus('all')}
          >
            All Requests ({scopedLeaves.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending Concurrence ({pendingCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'approved' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterStatus === 'rejected' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Declined ({rejectedCount})
          </button>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search student or reason..."
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

      {/* Requests List */}
      {filteredLeaves.length === 0 ? (
        <EmptyState
          title="No leave requests found"
          description="There are no student leave requests matching the selected status filter."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredLeaves.map((leave) => {
            const isPending = leave.status === 'pending';
            const isApproved = leave.status === 'approved';

            return (
              <div
                key={leave.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {leave.studentName}
                    </strong>
                    <span className="badge badge-neutral">
                      {leave.days} Day{leave.days > 1 ? 's' : ''}
                    </span>
                    <span
                      className={`badge ${
                        isApproved ? 'badge-success' : isPending ? 'badge-warning' : 'badge-neutral'
                      }`}
                    >
                      {isApproved ? 'Approved ✓' : isPending ? 'Pending Concurrence' : 'Declined'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {leave.reason}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>
                      <Calendar size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      Duration: <strong>{leave.startDate}</strong> – <strong>{leave.endDate}</strong>
                    </span>
                    <span>•</span>
                    <span>Student ID: <code>{leave.studentId}</code></span>
                    {leave.approvedBy && (
                      <>
                        <span>•</span>
                        <span>Sign-off: <strong>{leave.approvedBy}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {isPending ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAction(leave.id, false)}
                    >
                      <X size={12} color="var(--state-urgent)" /> Decline
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAction(leave.id, true)}
                    >
                      <Check size={12} color="var(--state-success)" /> Approve Concurrence
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: isApproved ? 'var(--state-success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {isApproved ? 'Duty Attendance Credited' : 'Request Closed'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
