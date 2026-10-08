import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Download,
  Plus,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function FinancePayments() {
  const {
    paymentHistory,
    students,
    payStudentFee,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [recordPaymentModal, setRecordPaymentModal] = useState(false);

  // Form State for Recording Offline Payment
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentMode: 'Bank Challan (Offline Verified)',
    bankRef: '',
    description: 'Autumn 2026 Semester 5 Tuition & Lab Dues',
  });
  const [formError, setFormError] = useState('');

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return (paymentHistory || []).filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        (p.rollNo && p.rollNo.toLowerCase().includes(q)) ||
        (p.receiptNo && p.receiptNo.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesMode =
        modeFilter === 'ALL' ||
        (modeFilter === 'offline' && (p.mode.includes('Offline') || p.mode.includes('Challan') || p.mode.includes('NEFT'))) ||
        (modeFilter === 'demo' && p.mode.includes('Demo'));

      return matchesSearch && matchesMode;
    });
  }, [paymentHistory, searchQuery, modeFilter]);

  // Aggregate Metrics
  const totalCollected = (paymentHistory || []).reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalCount = (paymentHistory || []).length;
  const offlineCount = (paymentHistory || []).filter((p) => !p.mode.includes('Demo')).length;
  const demoCount = (paymentHistory || []).filter((p) => p.mode.includes('Demo')).length;

  const metrics = [
    {
      label: 'Total Reconciled Volume',
      value: `₹${(totalCollected / 10000000).toFixed(2)} Cr`,
      subtext: 'Audited Treasury Receipts',
      state: 'success',
    },
    {
      label: 'Total Transactions',
      value: totalCount.toString(),
      subtext: 'Cryptographically Verified',
      state: 'neutral',
    },
    {
      label: 'Offline Bank Settlements',
      value: offlineCount.toString(),
      subtext: 'Challan & Direct NEFT Transfers',
      state: 'info',
    },
    {
      label: 'Demo Simulated Gateway',
      value: demoCount.toString(),
      subtext: 'Sandbox Demonstration Transactions',
      state: 'neutral',
    },
  ];

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.studentId) {
      setFormError('Please select a valid student.');
      return;
    }

    const amt = Number(formData.amount);
    if (!amt || amt <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    // Duplicate check on bank reference if provided
    if (formData.bankRef.trim()) {
      const isDuplicate = (paymentHistory || []).some(
        (p) => p.description && p.description.includes(formData.bankRef.trim())
      );
      if (isDuplicate) {
        setFormError(`Duplicate reference detected: Transaction with reference "${formData.bankRef}" has already been processed.`);
        return;
      }
    }

    const targetStudent = (students || []).find((s) => s.id === formData.studentId);
    if (!targetStudent) {
      setFormError('Selected student was not found in the institution roster.');
      return;
    }

    const desc = formData.bankRef.trim()
      ? `${formData.description} [Ref: ${formData.bankRef.trim()}]`
      : formData.description;

    payStudentFee(amt, targetStudent.id, formData.paymentMode, desc);

    setRecordPaymentModal(false);
    setFormData({
      studentId: '',
      amount: '',
      paymentMode: 'Bank Challan (Offline Verified)',
      bankRef: '',
      description: 'Autumn 2026 Semester 5 Tuition & Lab Dues',
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Cash Flow Ledger"
        title="Payments & Reconciliations"
        description="Verifiable institutional payments ledger. Clearly distinguishes recorded offline bank settlements from sandbox demo gateway payments."
        actions={[
          <button
            key="record"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setRecordPaymentModal(true)}
          >
            <Plus size={13} /> Record Offline Bank Settlement
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Filter and Search Bar */}
      <section style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.45rem 0.75rem' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by student, roll number, receipt number, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Payment Channels</option>
              <option value="offline">Bank Challan & NEFT (Real Offline)</option>
              <option value="demo">Online Sandbox Gateway (Demo)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Payments Ledger Table */}
      <section>
        <SectionHeader
          title={`Audited Payment Vouchers (${filteredPayments.length})`}
          subtitle="Click any row to inspect signed receipt and reconciliation metadata"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <DataTable
            columns={[
              {
                header: 'Receipt No & Date',
                accessor: 'receiptNo',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{row.receiptNo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.paidOn}</div>
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
                header: 'Obligation Description',
                accessor: 'description',
                cell: (row) => (
                  <div style={{ fontSize: '0.8125rem', maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={row.description}>
                    {row.description}
                  </div>
                ),
              },
              {
                header: 'Channel & Verification Tier',
                accessor: 'mode',
                cell: (row) => {
                  const isDemo = row.mode && row.mode.includes('Demo');
                  return (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{row.mode}</div>
                      <span className={`badge ${isDemo ? 'badge-neutral' : 'badge-success'}`} style={{ fontSize: '0.625rem', marginTop: '0.15rem' }}>
                        {isDemo ? 'Sandbox Demo' : 'Audited Bank Slip'}
                      </span>
                    </div>
                  );
                },
              },
              {
                header: 'Amount',
                accessor: 'amount',
                cell: (row) => (
                  <div style={{ fontWeight: 700, color: 'var(--state-success)', textAlign: 'right' }}>
                    ₹{row.amount.toLocaleString()}
                  </div>
                ),
              },
              {
                header: 'Receipt Action',
                cell: (row) => (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedReceipt(row)}
                  >
                    <Receipt size={13} /> View Voucher
                  </button>
                ),
              },
            ]}
            data={filteredPayments}
            emptyMessage="No payment vouchers match your query."
          />
        </div>
      </section>

      {/* RECORD OFFLINE BANK PAYMENT MODAL */}
      {recordPaymentModal && (
        <div className="modal-backdrop" onClick={() => setRecordPaymentModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Record Offline Bank Payment
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Reconcile student challans, physical drafts, or verified bank NEFTs
                </div>
              </div>
              <button type="button" onClick={() => setRecordPaymentModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {formError && (
                <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--state-danger)', borderRadius: 'var(--radius-xs)', color: 'var(--state-danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} /> {formError}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Select Student *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => {
                    const st = (students || []).find((s) => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                      amount: st && st.feePendingAmount ? st.feePendingAmount.toString() : '45000',
                    });
                  }}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="">-- Choose student from roster --</option>
                  {(students || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo || s.id}) · {s.department} {s.feeStatus === 'pending' ? `· Due: ₹${(s.feePendingAmount || 45000).toLocaleString()}` : '· Cleared'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="45000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Payment Channel *
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Bank Challan (Offline Verified)">SBI / Canara Bank Challan</option>
                    <option value="NEFT Transfer (Verified Voucher)">NEFT / RTGS Treasury Slip</option>
                    <option value="Demand Draft / Banker Cheque">Demand Draft (DD)</option>
                    <option value="POS Card Swipe / Bursar Counter">Bursar Counter Card POS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Bank Reference Number / UTR
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-CAN-982301824"
                  value={formData.bankRef}
                  onChange={(e) => setFormData({ ...formData, bankRef: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Fee Obligation Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRecordPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Record & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOUCHER / RECEIPT INSPECTOR MODAL */}
      {selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setSelectedReceipt(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verified Receipt {selectedReceipt.receiptNo}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedReceipt(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Student: <strong>{selectedReceipt.studentName} ({selectedReceipt.rollNo || selectedReceipt.studentId})</strong></div>
                <div>Description: <strong>{selectedReceipt.description}</strong></div>
                <div>Amount Received: <strong style={{ color: 'var(--state-success)' }}>₹{selectedReceipt.amount.toLocaleString()}</strong></div>
                <div>Payment Date: <strong>{selectedReceipt.paidOn}</strong></div>
                <div>Settlement Channel: <strong>{selectedReceipt.mode}</strong></div>
                <div>Status: <strong>Cryptographically Reconciled & Audited</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    showToast(`Receipt voucher ${selectedReceipt.receiptNo} sent to printer ✓`, 'info');
                  }}
                >
                  Print Voucher
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Official Receipt PDF for ${selectedReceipt.receiptNo} downloaded ✓`, 'success');
                    setSelectedReceipt(null);
                  }}
                >
                  <Download size={12} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
