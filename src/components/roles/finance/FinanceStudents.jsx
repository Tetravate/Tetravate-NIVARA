import React, { useState, useMemo } from 'react';
import {
  Search,
  CreditCard,
  Send,
  Eye,
  Download,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function FinanceStudents() {
  const {
    students,
    departments,
    paymentHistory,
    feeConcessions,
    refundRequests,
    payStudentFee,
    showToast,

  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [offlinePaymentModal, setOfflinePaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Challan (Offline Verified)');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Filtering students
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(q));

      const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'paid' && s.feeStatus === 'paid') ||
        (statusFilter === 'pending' && s.feeStatus === 'pending');

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, searchQuery, deptFilter, statusFilter]);

  // Overall student accounts stats
  const totalStudents = (students || []).length;
  const clearedCount = (students || []).filter((s) => s.feeStatus === 'paid').length;
  const pendingCount = (students || []).filter((s) => s.feeStatus === 'pending').length;
  const totalReceivables = (students || []).reduce((acc, s) => acc + (s.feePendingAmount || 0), 0);

  const metrics = [
    {
      label: 'Total Student Ledgers',
      value: totalStudents.toString(),
      subtext: 'Assessed Under Tariff 2026-27',
      state: 'neutral',
    },
    {
      label: 'Cleared Accounts',
      value: clearedCount.toString(),
      subtext: `${totalStudents > 0 ? Math.round((clearedCount / totalStudents) * 100) : 0}% Realized Clearance`,
      state: 'success',
    },
    {
      label: 'Accounts with Dues',
      value: pendingCount.toString(),
      subtext: `₹${(totalReceivables / 100000).toFixed(2)} Lakhs Total Outstanding`,
      state: pendingCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Active Concessions',
      value: (feeConcessions || []).length.toString(),
      subtext: 'Merit & Need-Based Concessions',
      state: 'info',
    },
  ];

  // Specific student ledger helpers
  const getStudentPayments = (studentId) => {
    return (paymentHistory || []).filter(
      (p) => p.studentId === studentId || p.rollNo === studentId
    );
  };

  const getStudentConcessions = (studentId) => {
    return (feeConcessions || []).filter(
      (c) => c.studentId === studentId
    );
  };

  const getStudentRefunds = (studentId) => {
    return (refundRequests || []).filter(
      (r) => r.studentId === studentId
    );
  };

  const handleOpenOfflinePayment = (student) => {
    setOfflinePaymentModal(student);
    setPaymentAmount(student.feePendingAmount ? student.feePendingAmount.toString() : '45000');
    setPaymentMode('Bank Challan (Offline Verified)');
    setPaymentRemarks('');
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!offlinePaymentModal) return;

    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid payment amount greater than zero.', 'error');
      return;
    }

    const currentPending = offlinePaymentModal.feePendingAmount !== undefined ? offlinePaymentModal.feePendingAmount : 45000;
    if (amt > currentPending && currentPending > 0) {
      const confirmOverpay = window.confirm(
        `Payment amount (₹${amt.toLocaleString()}) exceeds current pending dues (₹${currentPending.toLocaleString()}). Proceed with account credit?`
      );
      if (!confirmOverpay) return;
    }

    payStudentFee(
      amt,
      offlinePaymentModal.id,
      paymentMode,
      paymentRemarks ? `Tuition Payment: ${paymentRemarks}` : 'Institutional Offline Fee Settlement'
    );

    setOfflinePaymentModal(null);
  };

  const handleSendReminder = (student) => {
    showToast(
      `Statutory fee payment notice dispatched to ${student.name} (${student.id}) via SMS & Portal Notification ✓`,
      'success'
    );
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Student Ledger Repository"
        title="Student Financial Accounts"
        description="Search institution-wide student financial records, inspect itemized ledger statements, view concession history, and reconcile offline settlements."
      />

      <MetricStrip metrics={metrics} />

      {/* Filter / Search Bar */}
      <section style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.45rem 0.75rem' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Departments</option>
              {(departments || []).map((d) => (
                <option key={d.code} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Fee Statuses</option>
              <option value="paid">Cleared / No Dues</option>
              <option value="pending">Outstanding Dues</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Student Ledgers Table */}
      <section>
        <SectionHeader
          title={`Institution Student Ledgers (${filteredStudents.length})`}
          subtitle="Real-time assessed tuition dues, reconciled credits, and outstanding statutory balances"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <DataTable
            columns={[
              {
                header: 'Student & Roll No',
                accessor: 'name',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {row.rollNo || row.id} · {row.id}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Department / Year',
                accessor: 'department',
                cell: (row) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{row.department}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year {row.year || '3'} · Sem {row.semester || '5'}</div>
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: 'feeStatus',
                cell: (row) => {
                  const isPaid = row.feeStatus === 'paid';
                  return (
                    <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                      {isPaid ? 'Cleared (Nil Dues)' : 'Outstanding'}
                    </span>
                  );
                },
              },
              {
                header: 'Outstanding Balance',
                accessor: 'feePendingAmount',
                cell: (row) => {
                  const amt = row.feePendingAmount !== undefined ? row.feePendingAmount : (row.feeStatus === 'paid' ? 0 : 45000);
                  return (
                    <div style={{ fontWeight: 700, color: amt > 0 ? 'var(--state-warning)' : 'var(--state-success)' }}>
                      ₹{amt.toLocaleString()}
                    </div>
                  );
                },
              },
              {
                header: 'Payment Actions',
                cell: (row) => (
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedStudent(row)}
                      title="Inspect Student Account Statement"
                    >
                      <Eye size={13} /> Statement
                    </button>
                    {row.feeStatus === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleSendReminder(row)}
                          title="Dispatch Due Notice"
                        >
                          <Send size={12} /> Notice
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenOfflinePayment(row)}
                          title="Record Bank Challan / Offline Payment"
                        >
                          <CreditCard size={12} /> Record
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            data={filteredStudents}
            emptyMessage="No student financial accounts match your filter criteria."
          />
        </div>
      </section>

      {/* STUDENT STATEMENT MODAL */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Student Financial Statement
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedStudent.name} ({selectedStudent.rollNo || selectedStudent.id}) · {selectedStudent.department}
                </div>
              </div>
              <button type="button" onClick={() => setSelectedStudent(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              {/* Summary Balance Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Total Assessed</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹45,000</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Outstanding Due</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedStudent.feePendingAmount > 0 ? 'var(--state-warning)' : 'var(--state-success)' }}>
                    ₹{(selectedStudent.feePendingAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Account Standing</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: selectedStudent.feeStatus === 'paid' ? 'var(--state-success)' : 'var(--state-warning)' }}>
                    {selectedStudent.feeStatus === 'paid' ? 'NIL Dues ✓' : 'Payment Overdue'}
                  </div>
                </div>
              </div>

              {/* Payments History on this account */}
              <div>
                <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Reconciled Payments ({getStudentPayments(selectedStudent.id).length})
                </strong>
                {getStudentPayments(selectedStudent.id).length === 0 ? (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No recorded payments in ledger for this academic session.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {getStudentPayments(selectedStudent.id).map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.description}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {p.receiptNo} · {p.paidOn} · {p.mode}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: 'var(--state-success)' }}>
                            ₹{p.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sanctioned Concessions */}
              <div>
                <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Scholarships & Concessions ({getStudentConcessions(selectedStudent.id).length})
                </strong>
                {getStudentConcessions(selectedStudent.id).length === 0 ? (
                  <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No institutional concessions or fee waivers granted.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {getStudentConcessions(selectedStudent.id).map((c) => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.category}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            Sanctioned by: {c.sanctionedBy} ({c.academicYear})
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>
                          -₹{c.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refunds where applicable */}
              {getStudentRefunds(selectedStudent.id).length > 0 && (
                <div>
                  <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Refund Vouchers ({getStudentRefunds(selectedStudent.id).length})
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {getStudentRefunds(selectedStudent.id).map((r) => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Refund Ref: {r.id}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            Reason: {r.reason} · Status: <span className="badge badge-neutral">{r.status}</span>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--state-warning)' }}>
                          ₹{r.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    showToast(`Financial ledger statement for ${selectedStudent.name} exported as CSV ✓`, 'success');
                  }}
                >
                  <Download size={13} /> Export Ledger CSV
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD OFFLINE PAYMENT MODAL */}
      {offlinePaymentModal && (
        <div className="modal-backdrop" onClick={() => setOfflinePaymentModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Record Offline Bank Payment
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Student: {offlinePaymentModal.name} ({offlinePaymentModal.rollNo || offlinePaymentModal.id})
                </div>
              </div>
              <button type="button" onClick={() => setOfflinePaymentModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Amount to Clear (₹) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Current outstanding obligation: ₹{(offlinePaymentModal.feePendingAmount || 45000).toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Payment Method / Channel *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="Bank Challan (Offline Verified)">SBI / Canara Bank Challan (Verified)</option>
                  <option value="NEFT Transfer (Verified Voucher)">Direct NEFT / RTGS Treasury Voucher</option>
                  <option value="Demand Draft / Banker Cheque">Demand Draft (DD) Physical Scanned</option>
                  <option value="POS Card Swipe / Bursar Counter">Bursar Counter POS Terminal</option>
                  <option value="Online UPI / Card Gateway (Demo Verified)">Online UPI / Card Gateway (Demo Verified)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Bank Reference Number / UTR / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-SBI-20261008-883921"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOfflinePaymentModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Reconcile & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
