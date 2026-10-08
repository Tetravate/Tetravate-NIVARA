import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function FinanceScholarships() {
  const {
    feeConcessions,
    students,
    grantFeeConcession,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [grantModal, setGrantModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    category: 'Merit Academic Dean Scholarship (Top 1% Department Rank)',
    amount: '15000',
    academicYear: '2026-2027',
    remarks: 'Approved by Institutional Academic & Welfare Board.',
  });

  const filteredConcessions = useMemo(() => {
    return (feeConcessions || []).filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.studentId && c.studentId.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.sanctionedBy && c.sanctionedBy.toLowerCase().includes(q))
      );
    });
  }, [feeConcessions, searchQuery]);

  const totalSanctionedValue = (feeConcessions || []).reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalBeneficiaries = (feeConcessions || []).length;
  const avgConcession = totalBeneficiaries > 0 ? Math.round(totalSanctionedValue / totalBeneficiaries) : 0;

  const metrics = [
    {
      label: 'Total Waivers Granted',
      value: `₹${(totalSanctionedValue / 100000).toFixed(2)} Lakhs`,
      subtext: 'Autumn 2026 Institutional Endowment',
      state: 'success',
    },
    {
      label: 'Active Scholars & Beneficiaries',
      value: totalBeneficiaries.toString(),
      subtext: 'Tuition Accounts Subsidized',
      state: 'neutral',
    },
    {
      label: 'Average Grant Value',
      value: `₹${avgConcession.toLocaleString()}`,
      subtext: 'Per Awardee Recipient',
      state: 'info',
    },
    {
      label: 'Disbursement Policy',
      value: 'Direct Ledger Credit',
      subtext: 'Automated Dues Deduction',
      state: 'neutral',
    },
  ];

  const handleGrantSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      showToast('Please select a student recipient.', 'error');
      return;
    }
    const amt = Number(formData.amount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid concession amount.', 'error');
      return;
    }

    const targetStudent = (students || []).find((s) => s.id === formData.studentId);
    if (!targetStudent) {
      showToast('Selected student was not found.', 'error');
      return;
    }

    grantFeeConcession({
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      category: formData.category,
      amount: amt,
      academicYear: formData.academicYear,
      remarks: formData.remarks,
    });

    setGrantModal(false);
    setFormData({
      studentId: '',
      category: 'Merit Academic Dean Scholarship (Top 1% Department Rank)',
      amount: '15000',
      academicYear: '2026-2027',
      remarks: 'Approved by Institutional Academic & Welfare Board.',
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Welfare & Endowment"
        title="Scholarships & Fee Concessions"
        description="Administer institutional merit endowments, social welfare fee waivers, and sports concessions. Sanctioned awards credit directly against student dues."
        actions={[
          <button
            key="grant"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setGrantModal(true)}
          >
            <Plus size={13} /> Grant Concession / Award
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Search Bar */}
      <section style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.45rem 0.75rem' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by student, roll number, scholarship scheme, or sanctioning officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
          />
        </div>
      </section>

      {/* Concessions Table */}
      <section>
        <SectionHeader
          title={`Active Concession & Scholarship Awards (${filteredConcessions.length})`}
          subtitle="All credits are applied directly to the student's assessed tuition obligation"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <DataTable
            columns={[
              {
                header: 'Award Ref & Year',
                accessor: 'id',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{row.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.academicYear || '2026-2027'}</div>
                  </div>
                ),
              },
              {
                header: 'Student Recipient',
                accessor: 'studentName',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.studentId}</div>
                  </div>
                ),
              },
              {
                header: 'Concession Scheme / Category',
                accessor: 'category',
                cell: (row) => (
                  <div style={{ fontSize: '0.8125rem' }}>{row.category}</div>
                ),
              },
              {
                header: 'Sanctioned By',
                accessor: 'sanctionedBy',
                cell: (row) => (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {row.sanctionedBy}
                  </div>
                ),
              },
              {
                header: 'Waiver Amount',
                accessor: 'amount',
                cell: (row) => (
                  <div style={{ fontWeight: 700, color: 'var(--brand-blue)', textAlign: 'right' }}>
                    ₹{row.amount.toLocaleString()}
                  </div>
                ),
              },
              {
                header: 'Status',
                cell: () => (
                  <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                    Sanctioned ✓
                  </span>
                ),
              },
            ]}
            data={filteredConcessions}
            emptyMessage="No fee concessions match your search query."
          />
        </div>
      </section>

      {/* GRANT CONCESSION MODAL */}
      {grantModal && (
        <div className="modal-backdrop" onClick={() => setGrantModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Sanction Scholarship or Fee Concession
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Directly credits against outstanding tuition fee obligations
                </div>
              </div>
              <button type="button" onClick={() => setGrantModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Select Awardee Student *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="">-- Choose student from roster --</option>
                  {(students || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo || s.id}) · {s.department} · Current Due: ₹{(s.feePendingAmount || 45000).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Concession Scheme / Endowment Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="Merit Academic Dean Scholarship (Top 1% Department Rank)">Merit Academic Dean Scholarship (Top 1% Department Rank)</option>
                  <option value="Merit-Cum-Means Tuition Assistance">Merit-Cum-Means Tuition Assistance</option>
                  <option value="State Sports & Technical Hackathon Excellence Concession">State Sports & Technical Hackathon Excellence Concession</option>
                  <option value="Staff Ward Institutional Tuition Waiver">Staff Ward Institutional Tuition Waiver</option>
                  <option value="First Generation Graduate State Assistance Waiver">First Generation Graduate State Assistance Waiver</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Concession Credit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    placeholder="15000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Sanction Authority Remarks
                </label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setGrantModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Sanction & Credit Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
