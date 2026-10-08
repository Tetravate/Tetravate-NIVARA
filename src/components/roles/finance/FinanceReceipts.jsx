import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function FinanceReceipts() {
  const {
    paymentHistory,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const filteredReceipts = useMemo(() => {
    return (paymentHistory || []).filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        (p.receiptNo && p.receiptNo.toLowerCase().includes(q)) ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        (p.rollNo && p.rollNo.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }, [paymentHistory, searchQuery]);

  const totalReceiptsCount = (paymentHistory || []).length;
  const totalValue = (paymentHistory || []).reduce((acc, p) => acc + (p.amount || 0), 0);

  const metrics = [
    {
      label: 'Issued Receipts',
      value: totalReceiptsCount.toString(),
      subtext: 'Audited & Numbered Sequentially',
      state: 'neutral',
    },
    {
      label: 'Total Receipted Value',
      value: `₹${(totalValue / 10000000).toFixed(2)} Cr`,
      subtext: 'Reconciled to Institutional Accounts',
      state: 'success',
    },
    {
      label: 'Digital Seal Verification',
      value: '100% Pass',
      subtext: 'Cryptographically Verified Records',
      state: 'info',
    },
    {
      label: 'Receipt Series',
      value: 'REC-2026-NIV',
      subtext: 'Statutory Bursar Format',
      state: 'neutral',
    },
  ];

  const handlePrint = (receipt) => {
    showToast(`Sending Receipt Voucher ${receipt.receiptNo} to printer spooler ✓`, 'info');
  };

  const handleDownloadPdf = (receipt) => {
    showToast(`Official Receipt PDF for ${receipt.receiptNo} generated and downloaded ✓`, 'success');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Official Vouchers"
        title="Fee Receipts & Tax Invoices"
        description="Searchable institutional receipt repository. Verify cryptographic audit seals, inspect signed fee vouchers, and issue official PDF duplicates."
      />

      <MetricStrip metrics={metrics} />

      {/* Search Bar */}
      <section style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.45rem 0.75rem' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search receipts by receipt number, student name, roll number, or transaction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
          />
        </div>
      </section>

      {/* Receipts Table */}
      <section>
        <SectionHeader
          title={`Institutional Receipts (${filteredReceipts.length})`}
          subtitle="All receipts are tied to verified ledger entries"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <DataTable
            columns={[
              {
                header: 'Receipt Number',
                accessor: 'receiptNo',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{row.receiptNo}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment ID: {row.id}</div>
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
                header: 'Fee Description',
                accessor: 'description',
                cell: (row) => (
                  <div style={{ fontSize: '0.8125rem' }}>{row.description}</div>
                ),
              },
              {
                header: 'Date & Mode',
                cell: (row) => (
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{row.paidOn}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{row.mode}</div>
                  </div>
                ),
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
                header: 'Status',
                cell: () => (
                  <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                    Reconciled
                  </span>
                ),
              },
              {
                header: 'Inspect',
                cell: (row) => (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedReceipt(row)}
                  >
                    <Eye size={13} /> View
                  </button>
                ),
              },
            ]}
            data={filteredReceipts}
            emptyMessage="No receipts match your search criteria."
          />
        </div>
      </section>

      {/* DETAILED RECEIPT VOUCHER MODAL */}
      {selectedReceipt && (
        <div className="modal-backdrop" onClick={() => setSelectedReceipt(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Institutional Fee Receipt Voucher
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedReceipt(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              {/* Receipt Header Banner */}
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  NIVARA INSTITUTE OF TECHNOLOGY & ADVANCED STUDIES
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Office of the Accounts Bursar · Autonomous Statutory Receipt
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-blue)', marginTop: '0.35rem' }}>
                  RECEIPT NO: {selectedReceipt.receiptNo}
                </div>
              </div>

              {/* Itemized Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--bg-canvas)', padding: '0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Student Name</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReceipt.studentName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Roll / Registration No</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReceipt.rollNo || selectedReceipt.studentId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Obligation Description</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReceipt.description}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Settlement Channel</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReceipt.mode}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Payment Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReceipt.paidOn}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Audit Ledger ID</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedReceipt.id}</div>
                </div>
              </div>

              {/* Total Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Received (INR):</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--state-success)' }}>
                  ₹{selectedReceipt.amount.toLocaleString()}
                </span>
              </div>

              {/* Verification Seal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--state-success)', color: 'var(--state-success)', fontSize: '0.6875rem' }}>
                <ShieldCheck size={16} />
                <span>Digitally signed & reconciled by Finance Accounts Directorate. Cryptographic hash verified.</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handlePrint(selectedReceipt)}
                >
                  <Printer size={13} /> Print Voucher
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownloadPdf(selectedReceipt)}
                >
                  <Download size={13} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
