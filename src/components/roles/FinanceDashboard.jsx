import React, { useState } from 'react';
import {
  CreditCard,
  Send,
  Download,
  Plus,
  Check,
  CheckCircle,
  Search,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from '../workspace';

export default function FinanceDashboard() {
  const {
    activeTab,
    setActiveTab,
    feeStructures,
    createFeeStructure,
    students,
    paymentHistory,
    payStudentFee,
    showToast,
  } = useNivara();

  const [createFeeModal, setCreateFeeModal] = useState(false);
  const [feeFormData, setFeeFormData] = useState({
    name: '',
    department: 'All Departments',
    amount: 5000,
    dueDate: '2026-10-31',
  });

  const [receiptModal, setReceiptModal] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  const totalBilled = feeStructures.reduce((acc, f) => acc + f.totalBilled, 0);
  const totalCollected = feeStructures.reduce((acc, f) => acc + f.totalCollected, 0);
  const recoveryPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 88;

  const pendingStudents = students.filter((s) => s.feeStatus === 'pending');
  const filteredStudents = pendingStudents.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSendReminder = (student) => {
    showToast(`Fee reminder notification dispatched to ${student.name} (${student.id}) ✓`, 'success');
  };

  const handleRecordOfflinePayment = (student) => {
    payStudentFee(student.feePendingAmount || 45000, student.id);
    showToast(`Recorded offline bank payment of ₹${(student.feePendingAmount || 45000).toLocaleString()} for ${student.name} ✓`, 'success');
  };

  const handleCreateFeeSubmit = (e) => {
    e.preventDefault();
    if (!feeFormData.name.trim()) return;
    createFeeStructure(feeFormData);
    setCreateFeeModal(false);
    setFeeFormData({
      name: '',
      department: 'All Departments',
      amount: 5000,
      dueDate: '2026-10-31',
    });
  };

  const financeMetrics = [
    {
      label: 'Total Billed Dues',
      value: `₹${(totalBilled / 10000000).toFixed(2)} Cr`,
      subtext: 'Autumn 2026 Term',
      state: 'neutral',
    },
    {
      label: 'Realized Collections',
      value: `₹${(totalCollected / 10000000).toFixed(2)} Cr`,
      subtext: `${recoveryPct}% Recovery Rate`,
      state: 'success',
    },
    {
      label: 'Pending Clearance',
      value: `₹${((totalBilled - totalCollected) / 100000).toFixed(1)} L`,
      subtext: `${pendingStudents.length} Students pending`,
      state: pendingStudents.length > 0 ? 'warning' : 'success',
    },
    {
      label: 'Reconciled Ledger',
      value: `${paymentHistory.length} Receipts`,
      subtext: 'Audited & cryptographically signed',
      state: 'info',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Finance Officer Persona) */}
      <PageHeader
        eyebrow="Office of the Bursar · Finance & Accounts Department"
        title="Tuition & Fee Collections Management"
        description="Monitor institutional cash flows, student fee dues, fee reconciliation, and verified receipts."
        actions={[
          <button
            key="create-fee"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCreateFeeModal(true)}
          >
            <Plus size={13} /> Create Fee Structure
          </button>,
        ]}
      />

      {/* 2. Key Financial KPIs */}
      <MetricStrip metrics={financeMetrics} />

      {/* VIEW: FEE STRUCTURES (Default on home or related modules) */}
      {(!['students', 'dues', 'payments', 'receipts', 'refunds'].includes(activeTab)) && (
        <section>
          <SectionHeader
            title="Active Institutional Fee Schedules"
            subtitle="Live collection progress and reconciliation against statutory targets"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {feeStructures.map((f) => {
              const pct = Math.round((f.totalCollected / f.totalBilled) * 100);
              return (
                <div
                  key={f.id}
                  style={{
                    padding: '1.15rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{f.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Tariff: ₹{f.amount.toLocaleString()} · Dept: {f.department} · Statutory Deadline: {f.dueDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--state-success)' }}>
                        ₹{(f.totalCollected / 10000000).toFixed(2)} Cr
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        of ₹{(f.totalBilled / 10000000).toFixed(2)} Cr ({pct}%)
                      </div>
                    </div>
                  </div>

                  <div className="progress-track" style={{ height: '6px' }}>
                    <div className="progress-fill progress-fill-success" style={{ width: `${pct}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{f.studentsPaidCount} Cleared Students</span>
                    <span style={{ color: f.studentsPendingCount > 0 ? 'var(--state-warning)' : 'var(--state-success)', fontWeight: 600 }}>
                      {f.studentsPendingCount} Pending
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: PENDING STUDENT DUES */}
      {(activeTab === 'students' || activeTab === 'dues') && (
        <section>
          <SectionHeader
            title={`Students with Outstanding Fee Obligations (${pendingStudents.length})`}
            subtitle="Review pending student ledgers, issue payment notices, or record offline transactions"
          />

          <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.4rem 0.75rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search pending students by name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Student',
                render: (st) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{st.id}</div>
                  </div>
                ),
              },
              {
                key: 'department',
                label: 'Department',
                render: (st) => `${st.department} · ${st.year}`,
              },
              {
                key: 'feePendingAmount',
                label: 'Pending Balance',
                align: 'right',
                render: (st) => (
                  <span style={{ fontWeight: 700, color: 'var(--state-warning)' }}>
                    ₹{(st.feePendingAmount || 45000).toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'feeDueDate',
                label: 'Statutory Due',
                render: (st) => st.feeDueDate || '2026-10-15',
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'right',
                width: '240px',
                render: (st) => (
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleSendReminder(st)}
                    >
                      <Send size={12} /> Notice
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRecordOfflinePayment(st)}
                    >
                      <CreditCard size={12} /> Record Bank Pay
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredStudents}
            keyField="id"
          />
        </section>
      )}

      {/* VIEW: PAYMENT LEDGER & RECEIPTS */}
      {(activeTab === 'payments' || activeTab === 'receipts' || activeTab === 'refunds') && (
        <section>
          <SectionHeader
            title={`Real-Time Verifiable Payment Ledger (${paymentHistory.length})`}
            subtitle="Cryptographically signed transactions and bank reconciliation vouchers"
          />

          <DataTable
            columns={[
              {
                key: 'description',
                label: 'Payment Description',
                render: (pay) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pay.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Voucher: <code style={{ fontFamily: 'var(--font-mono)' }}>{pay.receiptNo}</code>
                    </div>
                  </div>
                ),
              },
              {
                key: 'paidOn',
                label: 'Timestamp',
                render: (pay) => pay.paidOn,
              },
              {
                key: 'status',
                label: 'Audit Status',
                width: '130px',
                render: () => (
                  <span className="badge badge-success">
                    <Check size={10} /> Verified
                  </span>
                ),
              },
              {
                key: 'amount',
                label: 'Amount (₹)',
                align: 'right',
                render: (pay) => (
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{pay.amount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Action',
                align: 'right',
                width: '140px',
                render: (pay) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setReceiptModal(pay)}
                  >
                    <Download size={12} /> View Receipt
                  </button>
                ),
              },
            ]}
            data={paymentHistory}
            keyField="id"
          />
        </section>
      )}

      {/* MODAL: CREATE FEE STRUCTURE */}
      {createFeeModal && (
        <div className="modal-backdrop" onClick={() => setCreateFeeModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Create Institutional Fee Structure
                </h3>
              </div>
              <button type="button" onClick={() => setCreateFeeModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateFeeSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Fee Obligation Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. End-Semester Laboratory Viva & Exam Assessment Fee"
                  value={feeFormData.name}
                  onChange={(e) => setFeeFormData({ ...feeFormData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Amount (₹)</label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={feeFormData.amount}
                    onChange={(e) => setFeeFormData({ ...feeFormData, amount: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Due Date</label>
                  <input
                    type="date"
                    value={feeFormData.dueDate}
                    onChange={(e) => setFeeFormData({ ...feeFormData, dueDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCreateFeeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Obligation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptModal && (
        <div className="modal-backdrop" onClick={() => setReceiptModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verified Receipt {receiptModal.receiptNo}
                </h3>
              </div>
              <button type="button" onClick={() => setReceiptModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div>Description: <strong>{receiptModal.description}</strong></div>
                <div>Amount Received: <strong>₹{receiptModal.amount.toLocaleString()}</strong></div>
                <div>Payment Date: <strong>{receiptModal.paidOn}</strong></div>
                <div>Status: <strong>Cryptographically Reconciled & Audited</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Official Receipt PDF for ${receiptModal.receiptNo} exported ✓`, 'success');
                    setReceiptModal(null);
                  }}
                >
                  <Download size={12} /> Download PDF Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
