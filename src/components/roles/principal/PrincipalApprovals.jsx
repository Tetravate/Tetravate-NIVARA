import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Check,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Building,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, EmptyState } from '../../workspace';

export default function PrincipalApprovals() {
  const {
    leaveRequests,
    approveLeaveRequest,
    showToast,
  } = useNivara();

  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');

  const approvals = useMemo(() => {
    return (leaveRequests || []).filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (req.studentName && req.studentName.toLowerCase().includes(q)) ||
        (req.reason && req.reason.toLowerCase().includes(q)) ||
        (req.department && req.department.toLowerCase().includes(q));

      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, searchQuery, filterStatus]);

  const pendingCount = useMemo(() => {
    return (leaveRequests || []).filter((l) => l.status === 'pending').length;
  }, [leaveRequests]);

  const approvedCount = useMemo(() => {
    return (leaveRequests || []).filter((l) => l.status === 'approved').length;
  }, [leaveRequests]);

  const approvalMetrics = [
    {
      label: 'Pending Institutional Sanctions',
      value: `${pendingCount} Petitions`,
      subtext: 'Awaiting Executive Concurrence',
      state: pendingCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Sanctioned Requests',
      value: `${approvedCount} Approved`,
      subtext: 'Duty leave & attendance concessions',
      state: 'success',
    },
    {
      label: 'Average Turnaround',
      value: '2.4 Hours',
      subtext: 'Executive Council SLA',
      state: 'neutral',
    },
  ];

  const handleAction = (id, approve) => {
    approveLeaveRequest(id, approve);
    showToast(
      approve
        ? `Request sanctioned by Office of the Principal ✓ Attendance concession credited.`
        : `Request declined by Office of the Principal.`,
      approve ? 'success' : 'info'
    );
  };

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Executive Secretariat · Office of the Principal"
        title="Institutional Approvals & Escalation Queue"
        description="Statutory review and executive concurrence for inter-collegiate duty leave, medical condonations, and faculty development requests."
      />

      {/* 2. Metrics */}
      <MetricStrip metrics={approvalMetrics} />

      {/* 3. Controls & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          padding: '0.85rem 1.15rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by requester or petition reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                type="button"
                className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                onClick={() => setFilterStatus(status)}
                style={{ textTransform: 'capitalize' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{approvals.length}</strong> institutional petitions
        </div>
      </div>

      {/* 4. Requests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {approvals.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Zero Pending Institutional Petitions"
            description="All duty leave waivers, medical condonations, and institutional requests are up to date."
          />
        ) : (
          approvals.map((req) => (
            <div
              key={req.id}
              style={{
                padding: '1.15rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {req.studentName}
                  </strong>
                  <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                    {req.studentId || req.id}
                  </span>
                  <span className={`badge ${req.type === 'Duty Leave' ? 'badge-info' : 'badge-neutral'}`}>
                    {req.type || 'Duty Leave'}
                  </span>
                  <span className={`badge ${
                    req.status === 'approved'
                      ? 'badge-success'
                      : req.status === 'rejected'
                      ? 'badge-urgent'
                      : 'badge-warning'
                  }`}>
                    {req.status === 'approved' ? 'Sanctioned' : req.status === 'rejected' ? 'Declined' : 'Pending Concurrence'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <strong>Petition Reason:</strong> {req.reason}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Duration: {req.startDate} to {req.endDate} ({req.days} Days) · Department: {req.department || 'AI & Data Science'}
                </div>
              </div>

              {/* Action Buttons if Pending */}
              {req.status === 'pending' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAction(req.id, false)}
                  >
                    <X size={12} /> Decline
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAction(req.id, true)}
                  >
                    <Check size={12} /> Sanction Request
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Processed on {req.updatedAt || new Date().toISOString().split('T')[0]}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
