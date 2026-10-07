import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  FileCheck,
  Check,
  ArrowLeft,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from './workspace';

export default function StudentFeesView({ onBack }) {
  const {
    students,
    currentUser,
    paymentHistory,
    payStudentFee,
    showToast,
  } = useNivara();

  const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId) || (students || [])[0] || {};

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [receiptViewModal, setReceiptViewModal] = useState(null);

  // Student's transaction records (filtered by active student id or student name)
  const studentPayments = (paymentHistory || []).filter(
    (p) => p.studentId === student.id || p.studentName === student.name
  );

  const totalBilled = 45000;
  const isPaid = student.feeStatus === 'paid';
  const pendingAmount = isPaid ? 0 : (student.feePendingAmount || 45000);
  const paidAmount = isPaid ? 45000 : 0;

  const feeMetrics = [
    {
      label: 'Semester Billed Dues',
      value: `₹${totalBilled.toLocaleString()}`,
      subtext: 'Semester 5 Tuition & Labs',
      state: 'info',
    },
    {
      label: 'Settled / Realized',
      value: `₹${paidAmount.toLocaleString()}`,
      subtext: isPaid ? '100% Realized by Bursar' : 'No payments realized',
      state: isPaid ? 'success' : 'neutral',
    },
    {
      label: 'Outstanding Balance',
      value: `₹${pendingAmount.toLocaleString()}`,
      subtext: isPaid ? 'Account in Good Standing' : `Due by ${student.feeDueDate || '15 Oct 2026'}`,
      state: isPaid ? 'success' : 'urgent',
    },
    {
      label: 'Account Reconciliation',
      value: isPaid ? 'Cleared' : 'Pending',
      subtext: isPaid ? 'Zero Encumbrance' : 'Payment Action Required',
      state: isPaid ? 'success' : 'warning',
    },
  ];

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    payStudentFee(pendingAmount, student.id);
    setPaymentModalOpen(false);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });
    showToast('Tuition fee settlement authorized and reconciled with Bursar Office ✓', 'success');
  };

  const downloadReceipt = (rec) => {
    const text = `NIVARA INSTITUTIONAL BURSAR DIVISION\nOFFICIAL TUITION PAYMENT ACKNOWLEDGMENT\n\nReceipt Number : ${rec.receiptNo}\nPayment Date   : ${rec.paidOn}\nStudent Roll   : ${student.rollNo || student.id}\nStudent Name   : ${student.name}\nDepartment     : ${student.department}\nAmount Cleared : INR ${rec.amount.toLocaleString()}\nDescription    : ${rec.description}\nStatus         : VERIFIED & RECONCILED\n\nSigned by: Office of the Chief Financial Officer & Bursar\nTimestamp: ${new Date().toISOString()}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rec.receiptNo}_receipt.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Receipt ${rec.receiptNo} voucher downloaded ✓`, 'success');
  };

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Bursary & Accounts · Semester 5 · Academic Year 2026–2027"
        title="Fees, Dues & Receipts"
        description="Official university tuition ledger, fee schedule breakdown, and verified tax acknowledgments."
        actions={
          onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          )
        }
      />

      {/* 2. Fee Metrics Strip */}
      <MetricStrip metrics={feeMetrics} />

      {/* 3. Current Term Tuition Ledger Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                {isPaid ? 'All Term Fees Cleared' : 'Pending Tuition Payment'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: {student.feeDueDate || '15 Oct 2026'}</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Autumn 2026 Semester 5 Academic Tuition & Lab Charges
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Billed to: <strong>{student.name}</strong> ({student.id}) · {student.department}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: isPaid ? 'var(--state-success)' : 'var(--text-primary)' }}>
              ₹{pendingAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isPaid ? 'Zero Balance' : 'Outstanding Balance'}
            </div>
          </div>
        </div>

        {/* Detailed Itemized Breakdown */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Itemized Statutory Schedule
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lecture Hall Tuition</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹35,000</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Core 22 Course Credits</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Computing & Lab Infrastructure</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹7,500</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>High-Performance Cloud Labs</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Library & Student Amenities</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹2,500</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Digital Journals & Campus Pass</div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          {!isPaid ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CreditCard size={14} /> Settle ₹{pendingAmount.toLocaleString()} Online
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                setReceiptViewModal(
                  studentPayments[0] || {
                    receiptNo: 'REC-2026-NIV-8921',
                    amount: 45000,
                    description: 'Semester 5 Tuition Cleared',
                    paidOn: 'Today',
                  }
                )
              }
            >
              <Download size={13} /> View Verified Receipt
            </button>
          )}
        </div>
      </div>

      {/* 4. Payment History & Verified Receipts */}
      <section>
        <SectionHeader
          title="Verified Payment Receipts & History"
          subtitle="Official Bursary ledger records"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {studentPayments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No transaction records found"
              description="Official payment receipts will appear here immediately once tuition dues are paid and reconciled."
            />
          ) : (
            studentPayments.map((pay) => (
              <div
                key={pay.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {pay.description}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                      <Check size={10} /> Reconciled
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Receipt: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{pay.receiptNo}</code> · Date: {pay.paidOn}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{pay.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setReceiptViewModal(pay)}
                    title="View Receipt"
                  >
                    <FileCheck size={14} color="var(--brand-primary)" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => downloadReceipt(pay)}
                    title="Download Receipt Voucher"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Payment Modal (Clearly Labeled as Simulated Institutional Gateway) */}
      {paymentModalOpen && (
        <div className="modal-backdrop" onClick={() => setPaymentModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '490px' }}>
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
                <CreditCard size={18} color="var(--brand-blue)" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Tuition Settlement Gateway
                  </h3>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    Simulated Bursary Settlement Gateway (Institutional Sandbox)
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '0.85rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable Amount</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{pendingAmount.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                  Student: <strong>{student.name}</strong><br />ID: {student.id}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Simulated Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { id: 'card', label: 'Debit / Credit Card' },
                    { id: 'upi', label: 'Instant UPI / QR' },
                    { id: 'netbanking', label: 'Net Banking' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`btn btn-sm ${paymentMethod === m.id ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Test Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8821"
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Expiry Date</label>
                      <input
                        type="text"
                        defaultValue="12/28"
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
                      <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>CVV</label>
                      <input
                        type="password"
                        defaultValue="•••"
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
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600 }}>nivara.bursar@university.icici</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Simulated instant UPI intent approval</div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '0.5rem' }}>
                  Simulated bank route: State Bank of India · HDFC Bank · ICICI Bank · Axis Bank
                </div>
              )}

              <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)' }}>
                <strong>Note:</strong> Real bank gateway credentials are not provisioned in this environment. Submitting triggers an authentic institutional ledger reconciliation in sandbox mode.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPaymentModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm & Authorize Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Receipt View Modal */}
      {receiptViewModal && (
        <div className="modal-backdrop" onClick={() => setReceiptViewModal(null)} role="dialog" aria-modal="true">
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
                <FileCheck size={18} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Official Fee Receipt
                </h3>
              </div>
              <button type="button" onClick={() => setReceiptViewModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ border: '2px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', background: 'var(--bg-canvas)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-blue)', letterSpacing: '0.05em' }}>
                  Office of the Bursar · Bursary Division
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0.75rem' }}>
                  Payment Acknowledgment
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Receipt No:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{receiptViewModal.receiptNo}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Paid Date:</span>
                    <div style={{ fontWeight: 700 }}>{receiptViewModal.paidOn}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                    <div style={{ fontWeight: 700 }}>{student.name}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Amount Cleared:</span>
                    <div style={{ fontWeight: 800, color: 'var(--state-success)' }}>₹{receiptViewModal.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Status: Verified & Reconciled by Bursary Accounts Server
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadReceipt(receiptViewModal)}
                >
                  <Download size={13} /> Download Receipt Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
