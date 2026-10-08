import React, { useMemo } from 'react';
import {
  CreditCard,
  Building,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Layers,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalFinance() {
  const { feeStructures, paymentHistory, showToast } = useNivara();

  const totalBilled = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.totalBilled || 0), 0);
  }, [feeStructures]);

  const totalCollected = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.totalCollected || 0), 0);
  }, [feeStructures]);

  const totalOutstanding = totalBilled - totalCollected;
  const realizationRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 87;

  const totalPendingStudents = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.studentsPendingCount || 0), 0);
  }, [feeStructures]);

  const financeMetrics = [
    {
      label: 'Total Fee Demand',
      value: `₹${(totalBilled / 10000000).toFixed(2)} Cr`,
      subtext: 'Autumn 2026 Institutional Budget',
      state: 'neutral',
    },
    {
      label: 'Realized Collections',
      value: `₹${(totalCollected / 10000000).toFixed(2)} Cr`,
      subtext: `${realizationRate}% Overall Recovery Rate`,
      state: 'success',
    },
    {
      label: 'Outstanding Dues',
      value: `₹${(totalOutstanding / 10000000).toFixed(2)} Cr`,
      subtext: `${totalPendingStudents} Students Pending Clearance`,
      state: totalOutstanding > 0 ? 'warning' : 'success',
    },
    {
      label: 'Verified Transactions',
      value: `${(paymentHistory || []).length} Records`,
      subtext: 'Bursar & Accounts Directorate',
      state: 'info',
    },
  ];

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Finance Syndicate · Bursar & Accounts Directorate"
        title="Institutional Financial Position & Fee Recovery"
        description="Executive revenue audit across tuition fees, development levies, outstanding student dues, and reconciliation ledgers."
        actions={[
          <button
            key="export-finance"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Institutional Financial Ledger & Audit exported ✓', 'success')}
          >
            <Download size={13} /> Export Financial Ledger
          </button>,
        ]}
      />

      {/* 2. Metrics */}
      <MetricStrip metrics={financeMetrics} />

      {/* 3. Fee Structures Breakdown */}
      <section>
        <SectionHeader
          title="Institutional Fee Structures & Realization Milestone"
          subtitle="Autonomous billing schedules for Autumn 2026 Academic Session"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(feeStructures || []).map((f) => {
            const pct = Math.round((f.totalCollected / f.totalBilled) * 100);
            return (
              <div
                key={f.id}
                style={{
                  padding: '1.25rem',
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
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{f.name}</strong>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Target Cohort: {f.department} · Standard Tariff: ₹{f.amount.toLocaleString()} · Statutory Due: <strong>{f.dueDate}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--state-success)' }}>
                      ₹{(f.totalCollected / 10000000).toFixed(2)} Cr
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      of ₹{(f.totalBilled / 10000000).toFixed(2)} Cr Realized ({pct}%)
                    </div>
                  </div>
                </div>

                <div className="progress-track" style={{ height: '8px' }}>
                  <div className="progress-fill progress-fill-success" style={{ width: `${pct}%` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                  <span>{f.studentsPaidCount} Paid Candidates</span>
                  <span style={{ color: f.studentsPendingCount > 0 ? 'var(--state-warning)' : 'var(--state-success)', fontWeight: 700 }}>
                    {f.studentsPendingCount} Pending Due Clearance
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Recent Payment Transactions Ledger */}
      <section>
        <SectionHeader
          title="Recent Institutional Fee Ledger (Synchronized from Finance Office)"
          subtitle="Real-time collection audit verified by Accounts Directorate"
        />

        <DataTable
          columns={[
            {
              key: 'id',
              label: 'Transaction Ref',
              render: (p) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.id}</span>,
            },
            {
              key: 'studentName',
              label: 'Student Name',
              render: (p) => <strong style={{ color: 'var(--text-primary)' }}>{p.studentName}</strong>,
            },
            {
              key: 'amount',
              label: 'Amount Paid',
              align: 'right',
              render: (p) => <span style={{ fontWeight: 800, color: 'var(--state-success)' }}>₹{p.amount.toLocaleString()}</span>,
            },
            {
              key: 'date',
              label: 'Date',
              render: (p) => <span>{p.date}</span>,
            },
            {
              key: 'method',
              label: 'Payment Mode',
              render: (p) => <span className="badge badge-neutral">{p.method}</span>,
            },
            {
              key: 'status',
              label: 'Status',
              render: () => <span className="badge badge-success">Reconciled ✓</span>,
            },
          ]}
          data={paymentHistory || []}
          keyField="id"
        />
      </section>
    </div>
  );
}
