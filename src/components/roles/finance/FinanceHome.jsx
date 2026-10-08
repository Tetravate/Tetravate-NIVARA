import React from 'react';
import {
  CreditCard,
  Plus,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FinanceHome({ onNavigate }) {
  const {
    feeStructures,
    paymentHistory,
    students,
    refundRequests,
    feeConcessions,
    auditLogs,
  } = useNivara();

  const totalBilled = (feeStructures || []).reduce((acc, f) => acc + (f.totalBilled || 0), 0);
  const totalCollected = (feeStructures || []).reduce((acc, f) => acc + (f.totalCollected || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const recoveryPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const pendingStudents = (students || []).filter((s) => s.feeStatus === 'pending');
  const pendingRefunds = (refundRequests || []).filter(
    (r) => r.status === 'requested' || r.status === 'under_review'
  );
  const totalConcessions = (feeConcessions || []).reduce((acc, c) => acc + (c.amount || 0), 0);

  const financeMetrics = [
    {
      label: 'Total Expected Dues',
      value: totalBilled > 0 ? `₹${(totalBilled / 10000000).toFixed(2)} Cr` : '₹0.00',
      subtext: totalBilled > 0 ? 'Autumn 2026 Statutory Assessment' : 'No fee structures scheduled',
      state: 'neutral',
    },
    {
      label: 'Realized Collections',
      value: totalCollected > 0 ? `₹${(totalCollected / 10000000).toFixed(2)} Cr` : '₹0.00',
      subtext: totalBilled > 0 ? `${recoveryPct}% Institutional Recovery` : 'No collections recorded',
      state: totalCollected > 0 ? 'success' : 'neutral',
    },
    {
      label: 'Outstanding Receivables',
      value: `₹${(totalOutstanding / 100000).toFixed(1)} L`,
      subtext: `${pendingStudents.length} Students Pending Clearance`,
      state: pendingStudents.length > 0 ? 'warning' : 'success',
    },
    {
      label: 'Audited Receipts',
      value: `${(paymentHistory || []).length} Vouchers`,
      subtext: `₹${(totalConcessions / 1000).toFixed(0)}k Concessions Granted`,
      state: 'info',
    },
  ];

  // Finance relevant audit events
  const financeAuditEntries = (auditLogs || []).filter(
    (log) =>
      log.actorRole === 'Finance' ||
      log.action?.toLowerCase().includes('payment') ||
      log.action?.toLowerCase().includes('fee') ||
      log.action?.toLowerCase().includes('refund') ||
      log.action?.toLowerCase().includes('concession')
  ).slice(0, 5);

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Bursar Persona) */}
      <PageHeader
        eyebrow="Office of the Bursar · Finance & Accounts Department"
        title="Institutional Financial Command"
        description="Comprehensive treasury operations, student fee ledger reconciliation, verified bank challan auditing, scholarship concessions, and refund processing."
        actions={[
          <button
            key="record-pay"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('payments')}
          >
            <CreditCard size={13} /> Payment Ledger
          </button>,
          <button
            key="create-fee"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('structure')}
          >
            <Plus size={13} /> Manage Fee Schedules
          </button>,
        ]}
      />

      {/* 2. Key Workflow Financial Metrics */}
      <MetricStrip metrics={financeMetrics} />

      {/* 3. Operational "Needs Attention" Panel */}
      <section style={{
        padding: '1.25rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Operational Treasury Attention Queue
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Immediate encumbrance clearance, pending refund grievances, and statutory deadline alerts
            </div>
          </div>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
            {pendingStudents.length + pendingRefunds.length} Action Items
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {/* Overdue Accounts Snapshot */}
          <div style={{
            padding: '1rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Overdue Accounts Flagged</span>
              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{pendingStudents.length} Students</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Candidates with pending balance past the 15 Oct statutory cut-off. Examination hall ticket generation is placed on hold until reconciled.
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: '0.35rem' }}
              onClick={() => onNavigate && onNavigate('dues')}
            >
              Review Pending Dues <ArrowRight size={12} />
            </button>
          </div>

          {/* Pending Refunds Snapshot */}
          <div style={{
            padding: '1rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>Refund Petitions Under Review</span>
              <span className={`badge ${pendingRefunds.length > 0 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                {pendingRefunds.length} Active
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {pendingRefunds.length > 0
                ? `${pendingRefunds.length} duplicate payment / caution deposit reimbursement requests awaiting bursary sign-off.`
                : 'All student refund vouchers have been audited and closed.'}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: '0.35rem' }}
              onClick={() => onNavigate && onNavigate('refunds')}
            >
              Inspect Refunds <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Two-Column Layout: Active Schedules & Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Active Fee Schedules Progress */}
        <section>
          <SectionHeader
            title="Institutional Fee Schedules"
            subtitle="Statutory collection targets and realization rates"
            actions={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate && onNavigate('structure')}
              >
                All Schedules <ArrowRight size={13} />
              </button>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(feeStructures || []).map((f) => {
              const pct = f.totalBilled > 0 ? Math.round((f.totalCollected / f.totalBilled) * 100) : 0;
              return (
                <div
                  key={f.id}
                  style={{
                    padding: '1rem 1.15rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{f.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tariff: ₹{f.amount.toLocaleString()} · Due: {f.dueDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-success, #10b981)', fontSize: '0.9rem' }}>
                        ₹{(f.totalCollected / 10000000).toFixed(2)} Cr
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {pct}% realized
                      </div>
                    </div>
                  </div>

                  <div className="progress-track" style={{ height: '5px' }}>
                    <div className="progress-fill progress-fill-success" style={{ width: `${pct}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{f.studentsPaidCount} Cleared</span>
                    <span style={{ color: f.studentsPendingCount > 0 ? 'var(--color-warning, #f59e0b)' : 'var(--color-success, #10b981)' }}>
                      {f.studentsPendingCount} Pending
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Recent Payment Ledger Entries */}
        <section>
          <SectionHeader
            title="Recent Reconciled Payments"
            subtitle="Latest verified transaction receipts recorded in the treasury daybook"
            actions={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate && onNavigate('payments')}
              >
                Full Ledger <ArrowRight size={13} />
              </button>
            }
          />

          {(paymentHistory || []).length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Recent Payments"
              message="Zero transactions have been recorded in the current billing cycle."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(paymentHistory || []).slice(0, 4).map((pay) => (
                <div
                  key={pay.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {pay.studentName || 'Student Candidate'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {pay.receiptNo} · {pay.paidOn}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      ₹{pay.amount.toLocaleString()}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      Reconciled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 5. Recent Finance Activity Log */}
      <section>
        <SectionHeader
          title="Recent Financial Audit Log"
          subtitle="Tamper-evident record of treasury adjustments, payment reconciliations, and concession sanctions"
        />

        {financeAuditEntries.length === 0 ? (
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No recent financial audit events logged.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {financeAuditEntries.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.action}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.details} · <span style={{ fontFamily: 'var(--font-mono)' }}>{log.actorName}</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
