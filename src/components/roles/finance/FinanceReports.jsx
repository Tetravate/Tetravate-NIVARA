import React, { useState, useMemo } from 'react';
import {
  Download,
  Building,
  CreditCard,
  Percent,
  RotateCcw,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function FinanceReports() {
  const {
    feeStructures,
    paymentHistory,
    students,
    departments,
    feeConcessions,
    refundRequests,
    showToast,
  } = useNivara();

  const [reportType, setReportType] = useState('collections');

  // Compute Department-wise collection report
  const deptCollectionRows = useMemo(() => {
    return (departments || []).map((dept) => {
      const deptStudents = (students || []).filter((s) => s.department === dept.name);
      const totalStudents = deptStudents.length || 0;
      const clearedStudents = deptStudents.filter((s) => s.feeStatus === 'paid').length;
      const pendingStudents = deptStudents.filter((s) => s.feeStatus === 'pending').length;
      const outstandingAmt = deptStudents.reduce((acc, s) => acc + (s.feePendingAmount || 0), 0);
      const assessedAmt = totalStudents * 45000;
      const collectedAmt = Math.max(0, assessedAmt - outstandingAmt);
      const recoveryPct = assessedAmt > 0 ? Math.round((collectedAmt / assessedAmt) * 100) : 100;

      return {
        department: dept.name,
        code: dept.code,
        totalStudents,
        clearedStudents,
        pendingStudents,
        assessedAmt,
        collectedAmt,
        outstandingAmt,
        recoveryPct,
      };
    });
  }, [departments, students]);

  // Overall sums
  const totalAssessed = (feeStructures || []).reduce((acc, f) => acc + (f.totalBilled || 0), 0);
  const totalCollected = (feeStructures || []).reduce((acc, f) => acc + (f.totalCollected || 0), 0);
  const totalOutstanding = Math.max(0, totalAssessed - totalCollected);
  const totalRefunded = (refundRequests || [])
    .filter((r) => r.status === 'processed')
    .reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalConcessions = (feeConcessions || []).reduce((acc, c) => acc + (c.amount || 0), 0);

  const metrics = [
    {
      label: 'Gross Fee Assessed',
      value: `₹${(totalAssessed / 10000000).toFixed(2)} Cr`,
      subtext: 'Autumn 2026 Statutory Billing',
      state: 'neutral',
    },
    {
      label: 'Net Realized Collections',
      value: `₹${(totalCollected / 10000000).toFixed(2)} Cr`,
      subtext: `${totalAssessed > 0 ? Math.round((totalCollected / totalAssessed) * 100) : 0}% Realization Yield`,
      state: 'success',
    },
    {
      label: 'Gross Arrears',
      value: `₹${(totalOutstanding / 100000).toFixed(1)} Lakhs`,
      subtext: 'Uncollected Student Balances',
      state: 'warning',
    },
    {
      label: 'Endowments & Reversals',
      value: `₹${((totalConcessions + totalRefunded) / 100000).toFixed(2)} L`,
      subtext: `₹${(totalConcessions / 1000).toFixed(0)}K Waivers · ₹${(totalRefunded / 1000).toFixed(0)}K Refunds`,
      state: 'info',
    },
  ];

  // Export CSV handler
  const handleExportReportCsv = () => {
    let csvContent = '';
    let filename = `nivara_finance_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'collections') {
      csvContent = 'Department,Total Students,Cleared,Pending,Assessed (INR),Collected (INR),Outstanding (INR),Recovery Pct\n';
      deptCollectionRows.forEach((r) => {
        csvContent += `"${r.department}",${r.totalStudents},${r.clearedStudents},${r.pendingStudents},${r.assessedAmt},${r.collectedAmt},${r.outstandingAmt},${r.recoveryPct}%\n`;
      });
    } else if (reportType === 'payments') {
      csvContent = 'Receipt No,Student Name,Roll No,Description,Amount,Paid On,Channel,Status\n';
      (paymentHistory || []).forEach((p) => {
        csvContent += `"${p.receiptNo}","${p.studentName}","${p.rollNo || p.studentId}","${p.description}",${p.amount},"${p.paidOn}","${p.mode}","${p.status}"\n`;
      });
    } else if (reportType === 'concessions') {
      csvContent = 'Award ID,Student Name,Roll No,Category,Amount,Sanctioned By,Academic Year\n';
      (feeConcessions || []).forEach((c) => {
        csvContent += `"${c.id}","${c.studentName}","${c.studentId}","${c.category}",${c.amount},"${c.sanctionedBy}","${c.academicYear}"\n`;
      });
    } else if (reportType === 'refunds') {
      csvContent = 'Refund ID,Student Name,Roll No,Original Receipt,Amount,Reason,Status,Date,Mode\n';
      (refundRequests || []).forEach((r) => {
        csvContent += `"${r.id}","${r.studentName}","${r.rollNo || r.studentId}","${r.receiptNo || 'N/A'}",${r.amount},"${r.reason}","${r.status}","${r.requestedDate}","${r.mode}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${reportType.toUpperCase()} report as CSV ✓`, 'success');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Analytics & Regulatory Submissions"
        title="Statutory Financial Reports"
        description="Comprehensive treasury analytics derived from real ledgers. Generate department-wise collection digests, arrears aging, endowment breakdowns, and regulatory CSV exports."
        actions={[
          <button
            key="export-csv"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportReportCsv}
          >
            <Download size={13} /> Export Report (CSV)
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Report Selection Switcher */}
      <section style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${reportType === 'collections' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setReportType('collections')}
            >
              <Building size={13} /> Department Collections
            </button>
            <button
              type="button"
              className={`btn btn-sm ${reportType === 'payments' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setReportType('payments')}
            >
              <CreditCard size={13} /> Payment Ledgers
            </button>
            <button
              type="button"
              className={`btn btn-sm ${reportType === 'concessions' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setReportType('concessions')}
            >
              <Percent size={13} /> Scholarships & Waivers
            </button>
            <button
              type="button"
              className={`btn btn-sm ${reportType === 'refunds' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setReportType('refunds')}
            >
              <RotateCcw size={13} /> Reversals & Refunds
            </button>
          </div>
        </div>
      </section>

      {/* REPORT CONTENT: COLLECTIONS */}
      {reportType === 'collections' && (
        <section>
          <SectionHeader
            title="Department-Wise Collection Summary"
            subtitle="Realized fee revenue versus statutory assessed targets"
          />

          <div style={{ marginTop: '0.75rem' }}>
            <DataTable
              columns={[
                {
                  header: 'Academic Department',
                  accessor: 'department',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {row.code}</div>
                    </div>
                  ),
                },
                {
                  header: 'Students (Total / Cleared)',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {row.clearedStudents} / {row.totalStudents} cleared
                      </div>
                      <div style={{ fontSize: '0.75rem', color: row.pendingStudents > 0 ? 'var(--state-warning)' : 'var(--state-success)' }}>
                        {row.pendingStudents} with pending dues
                      </div>
                    </div>
                  ),
                },
                {
                  header: 'Billed Assessment',
                  accessor: 'assessedAmt',
                  cell: (row) => (
                    <div style={{ color: 'var(--text-muted)' }}>
                      ₹{(row.assessedAmt / 100000).toFixed(2)} Lakhs
                    </div>
                  ),
                },
                {
                  header: 'Realized Collections',
                  accessor: 'collectedAmt',
                  cell: (row) => (
                    <div style={{ fontWeight: 700, color: 'var(--state-success)' }}>
                      ₹{(row.collectedAmt / 100000).toFixed(2)} Lakhs
                    </div>
                  ),
                },
                {
                  header: 'Outstanding Arrears',
                  accessor: 'outstandingAmt',
                  cell: (row) => (
                    <div style={{ fontWeight: 700, color: row.outstandingAmt > 0 ? 'var(--state-warning)' : 'var(--text-muted)' }}>
                      ₹{(row.outstandingAmt / 100000).toFixed(2)} Lakhs
                    </div>
                  ),
                },
                {
                  header: 'Recovery Yield',
                  accessor: 'recoveryPct',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 700, color: row.recoveryPct >= 80 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                        {row.recoveryPct}%
                      </div>
                      <div className="progress-track" style={{ height: '4px', width: '80px', marginTop: '0.2rem' }}>
                        <div
                          className={`progress-fill ${row.recoveryPct >= 80 ? 'progress-fill-success' : 'progress-fill-warning'}`}
                          style={{ width: `${row.recoveryPct}%` }}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
              data={deptCollectionRows}
              emptyMessage="No department records found."
            />
          </div>
        </section>
      )}

      {/* REPORT CONTENT: PAYMENTS */}
      {reportType === 'payments' && (
        <section>
          <SectionHeader
            title="Institutional Payment Ledger Digest"
            subtitle="Itemized record of all reconciled payment vouchers"
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
                  header: 'Student',
                  accessor: 'studentName',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.rollNo || row.studentId}</div>
                    </div>
                  ),
                },
                {
                  header: 'Description',
                  accessor: 'description',
                  cell: (row) => <div style={{ fontSize: '0.8125rem' }}>{row.description}</div>,
                },
                {
                  header: 'Channel',
                  accessor: 'mode',
                  cell: (row) => <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.mode}</div>,
                },
                {
                  header: 'Amount (INR)',
                  accessor: 'amount',
                  cell: (row) => (
                    <div style={{ fontWeight: 700, color: 'var(--state-success)', textAlign: 'right' }}>
                      ₹{row.amount.toLocaleString()}
                    </div>
                  ),
                },
              ]}
              data={paymentHistory || []}
              emptyMessage="No payment records in ledger."
            />
          </div>
        </section>
      )}

      {/* REPORT CONTENT: CONCESSIONS */}
      {reportType === 'concessions' && (
        <section>
          <SectionHeader
            title="Scholarship & Endowment Concession Breakdown"
            subtitle="Approved tuition subsidies and institutional fee waivers"
          />

          <div style={{ marginTop: '0.75rem' }}>
            <DataTable
              columns={[
                {
                  header: 'Award ID',
                  accessor: 'id',
                  cell: (row) => <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{row.id}</span>,
                },
                {
                  header: 'Beneficiary Student',
                  accessor: 'studentName',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.studentId}</div>
                    </div>
                  ),
                },
                {
                  header: 'Scheme / Category',
                  accessor: 'category',
                  cell: (row) => <div style={{ fontSize: '0.8125rem' }}>{row.category}</div>,
                },
                {
                  header: 'Sanctioning Authority',
                  accessor: 'sanctionedBy',
                  cell: (row) => <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.sanctionedBy}</div>,
                },
                {
                  header: 'Sanctioned Value',
                  accessor: 'amount',
                  cell: (row) => (
                    <div style={{ fontWeight: 700, color: 'var(--brand-blue)', textAlign: 'right' }}>
                      ₹{row.amount.toLocaleString()}
                    </div>
                  ),
                },
              ]}
              data={feeConcessions || []}
              emptyMessage="No concession awards in ledger."
            />
          </div>
        </section>
      )}

      {/* REPORT CONTENT: REFUNDS */}
      {reportType === 'refunds' && (
        <section>
          <SectionHeader
            title="Reversal & Refund Disbursements"
            subtitle="Historical ledger of audited fee refunds and deposit returns"
          />

          <div style={{ marginTop: '0.75rem' }}>
            <DataTable
              columns={[
                {
                  header: 'Refund Ref',
                  accessor: 'id',
                  cell: (row) => <span style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{row.id}</span>,
                },
                {
                  header: 'Student',
                  accessor: 'studentName',
                  cell: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.rollNo || row.studentId}</div>
                    </div>
                  ),
                },
                {
                  header: 'Original Receipt',
                  accessor: 'receiptNo',
                  cell: (row) => <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.receiptNo || 'N/A'}</div>,
                },
                {
                  header: 'Amount',
                  accessor: 'amount',
                  cell: (row) => (
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{row.amount.toLocaleString()}
                    </div>
                  ),
                },
                {
                  header: 'Standing',
                  accessor: 'status',
                  cell: (row) => <span className="badge badge-neutral">{row.status}</span>,
                },
                {
                  header: 'Reversal Mode',
                  accessor: 'mode',
                  cell: (row) => <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.mode}</div>,
                },
              ]}
              data={refundRequests || []}
              emptyMessage="No refund petitions recorded."
            />
          </div>
        </section>
      )}
    </div>
  );
}
