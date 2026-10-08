import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function FinanceRefunds() {
  const {
    refundRequests,
    paymentHistory,
    students,
    createRefundRequest,
    processRefundStatus,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [newRefundModal, setNewRefundModal] = useState(false);
  const [processModal, setProcessModal] = useState(null);

  // New Refund Form
  const [newRefundData, setNewRefundData] = useState({
    studentId: '',
    paymentId: '',
    amount: '',
    reason: '',
    remarks: '',
  });

  // Process Status Form
  const [newStatus, setNewStatus] = useState('approved');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [refundMode, setRefundMode] = useState('Manual Institutional NEFT Reversal');

  const filteredRefunds = useMemo(() => {
    return (refundRequests || []).filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.rollNo && r.rollNo.toLowerCase().includes(q)) ||
        (r.receiptNo && r.receiptNo.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [refundRequests, searchQuery, statusFilter]);

  const pendingCount = (refundRequests || []).filter(
    (r) => r.status === 'requested' || r.status === 'under_review'
  ).length;
  const approvedCount = (refundRequests || []).filter((r) => r.status === 'approved').length;
  const processedCount = (refundRequests || []).filter((r) => r.status === 'processed').length;
  const totalRefundedValue = (refundRequests || [])
    .filter((r) => r.status === 'processed')
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  const metrics = [
    {
      label: 'Petitions Under Review',
      value: pendingCount.toString(),
      subtext: 'Requires Bursar Authorization',
      state: pendingCount > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Approved for Payout',
      value: approvedCount.toString(),
      subtext: 'Pending Bank Batch Disbursement',
      state: approvedCount > 0 ? 'info' : 'neutral',
    },
    {
      label: 'Completed Reversals',
      value: processedCount.toString(),
      subtext: 'Vouchers Reconciled to Treasury',
      state: 'success',
    },
    {
      label: 'Total Reversal Value',
      value: `₹${(totalRefundedValue / 1000).toFixed(1)} K`,
      subtext: 'Historical Payments Preserved',
      state: 'neutral',
    },
  ];

  const handleCreateRefundSubmit = (e) => {
    e.preventDefault();
    if (!newRefundData.studentId) {
      showToast('Please select a valid student.', 'error');
      return;
    }
    const amt = Number(newRefundData.amount);
    if (!amt || amt <= 0) {
      showToast('Please enter a refund amount greater than zero.', 'error');
      return;
    }
    if (!newRefundData.reason.trim()) {
      showToast('Please enter a justifiable reason for this refund petition.', 'error');
      return;
    }

    const targetStudent = (students || []).find((s) => s.id === newRefundData.studentId);
    const targetPayment = (paymentHistory || []).find((p) => p.id === newRefundData.paymentId);

    createRefundRequest({
      studentId: targetStudent?.id || newRefundData.studentId,
      studentName: targetStudent?.name || 'Student',
      rollNo: targetStudent?.rollNo || targetStudent?.id,
      paymentId: targetPayment?.id || newRefundData.paymentId || `pay-${Date.now()}`,
      receiptNo: targetPayment?.receiptNo || `REC-REF-${Date.now()}`,
      amount: amt,
      reason: newRefundData.reason.trim(),
      remarks: newRefundData.remarks.trim(),
    });

    setNewRefundModal(false);
    setNewRefundData({
      studentId: '',
      paymentId: '',
      amount: '',
      reason: '',
      remarks: '',
    });
  };

  const handleProcessSubmit = (e) => {
    e.preventDefault();
    if (!processModal) return;

    processRefundStatus(processModal.id, newStatus, statusRemarks, refundMode);
    setProcessModal(null);
    setStatusRemarks('');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Ledger Adjustments"
        title="Fee Refunds & Reversals"
        description="Formal refund petition queue. Manages student fee reversals under audited Bursar supervision while preserving original payment records intact."
        actions={[
          <button
            key="new-refund"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setNewRefundModal(true)}
          >
            <Plus size={13} /> Initiate Refund Petition
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Filter Bar */}
      <section style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.45rem 0.75rem' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by student, roll number, refund ID, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Petition Statuses</option>
              <option value="requested">Requested (New)</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved for Payout</option>
              <option value="processed">Processed & Cleared</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </section>

      {/* Refunds Queue Table */}
      <section>
        <SectionHeader
          title={`Refund Vouchers & Petitions (${filteredRefunds.length})`}
          subtitle="Strict workflow: Requested → Under Review → Approved/Rejected → Processed"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <DataTable
            columns={[
              {
                header: 'Refund ID & Date',
                accessor: 'id',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{row.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.requestedDate}</div>
                  </div>
                ),
              },
              {
                header: 'Student & Roll No',
                accessor: 'studentName',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.rollNo || row.studentId}</div>
                  </div>
                ),
              },
              {
                header: 'Original Payment & Reason',
                accessor: 'reason',
                cell: (row) => (
                  <div style={{ maxWidth: '320px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Original Receipt: {row.receiptNo || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                      {row.reason}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Amount',
                accessor: 'amount',
                cell: (row) => (
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                    ₹{row.amount.toLocaleString()}
                  </div>
                ),
              },
              {
                header: 'Status & Mode',
                accessor: 'status',
                cell: (row) => {
                  let badgeClass = 'badge-neutral';
                  let label = row.status;
                  if (row.status === 'requested' || row.status === 'under_review') {
                    badgeClass = 'badge-warning';
                    label = row.status === 'requested' ? 'Pending Review' : 'Under Review';
                  } else if (row.status === 'approved') {
                    badgeClass = 'badge-info';
                    label = 'Approved';
                  } else if (row.status === 'processed') {
                    badgeClass = 'badge-success';
                    label = 'Disbursed ✓';
                  } else if (row.status === 'rejected') {
                    badgeClass = 'badge-danger';
                    label = 'Rejected ✕';
                  }

                  return (
                    <div>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6875rem' }}>
                        {label}
                      </span>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {row.mode}
                      </div>
                    </div>
                  );
                },
              },
              {
                header: 'Bursar Action',
                cell: (row) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setProcessModal(row);
                        setNewStatus(row.status === 'requested' ? 'under_review' : 'approved');
                        setStatusRemarks(row.remarks || '');
                        setRefundMode(row.mode || 'Manual Institutional NEFT Reversal');
                      }}
                    >
                      <Eye size={12} /> Process
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredRefunds}
            emptyMessage="No refund petitions in queue."
          />
        </div>
      </section>

      {/* INITIATE REFUND MODAL */}
      {newRefundModal && (
        <div className="modal-backdrop" onClick={() => setNewRefundModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Initiate Refund Petition
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Log statutory fee reversal voucher under Bursary review
                </div>
              </div>
              <button type="button" onClick={() => setNewRefundModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateRefundSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Select Student *
                </label>
                <select
                  value={newRefundData.studentId}
                  onChange={(e) => setNewRefundData({ ...newRefundData, studentId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="">-- Choose student from ledger --</option>
                  {(students || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo || s.id}) · {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Refund Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="2500"
                    value={newRefundData.amount}
                    onChange={(e) => setNewRefundData({ ...newRefundData, amount: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Original Payment Reference
                  </label>
                  <select
                    value={newRefundData.paymentId}
                    onChange={(e) => setNewRefundData({ ...newRefundData, paymentId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="">-- Associate with Payment --</option>
                    {(paymentHistory || []).slice(0, 10).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.receiptNo} - ₹{p.amount.toLocaleString()} ({p.studentName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Justification / Refund Reason *
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Duplicate payment via NEFT and UPI; hostel caution deposit return; course cancellation"
                  value={newRefundData.reason}
                  onChange={(e) => setNewRefundData({ ...newRefundData, reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Verification / Supporting Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank statement verified; Warden no-objection certificate on file."
                  value={newRefundData.remarks}
                  onChange={(e) => setNewRefundData({ ...newRefundData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewRefundModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit Refund Petition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCESS STATUS MODAL */}
      {processModal && (
        <div className="modal-backdrop" onClick={() => setProcessModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Process Refund Petition {processModal.id}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Student: {processModal.studentName} · Amount: ₹{processModal.amount.toLocaleString()}
                </div>
              </div>
              <button type="button" onClick={() => setProcessModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleProcessSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
                <div>Reason: <strong>{processModal.reason}</strong></div>
                <div>Receipt Ref: <strong>{processModal.receiptNo}</strong></div>
                <div>Current Standing: <span className="badge badge-neutral">{processModal.status}</span></div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Update Action / Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="under_review">Mark Under Review (Verifying with Accounts)</option>
                  <option value="approved">Approve Refund (Pending Institutional Payout)</option>
                  <option value="processed">Mark Processed & Disbursed (Completed Reversal)</option>
                  <option value="rejected">Reject Petition</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Disbursement Channel / Reversal Mode
                </label>
                <select
                  value={refundMode}
                  onChange={(e) => setRefundMode(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="Manual Institutional NEFT Reversal">Manual Institutional NEFT Reversal</option>
                  <option value="Accounts Cheque Disbursement">Bursary Accounts Cheque Disbursement</option>
                  <option value="Direct Counter Cash Settlement">Direct Bursar Counter Cash Settlement</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Bursar Remarks / Bank Reversal UTR Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Authorized by Principal; NEFT UTR-REV-202610-8849"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setProcessModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Commit Status Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
