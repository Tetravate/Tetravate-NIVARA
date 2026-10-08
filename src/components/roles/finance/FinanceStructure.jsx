import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function FinanceStructure() {
  const {
    feeStructures,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
  } = useNivara();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    department: 'All Departments',
    academicYear: '2026-2027',
    category: 'Tuition & Academic',
    semester: 'Semester 5',
    amount: 5000,
    dueDate: '2026-10-31',
  });

  const openCreateModal = () => {
    setEditingFee(null);
    setFormData({
      name: '',
      department: 'All Departments',
      academicYear: '2026-2027',
      category: 'Tuition & Academic',
      semester: 'Semester 5',
      amount: 5000,
      dueDate: '2026-10-31',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (fee) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name || '',
      department: fee.department || 'All Departments',
      academicYear: fee.academicYear || '2026-2027',
      category: fee.category || 'Tuition & Academic',
      semester: fee.semester || 'Semester 5',
      amount: fee.amount || 5000,
      dueDate: fee.dueDate || '2026-10-31',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Fee obligation title is required.');
      return;
    }

    if (Number(formData.amount) <= 0) {
      setFormError('Fee amount must be greater than zero.');
      return;
    }

    // Duplicate detection
    const isDuplicate = (feeStructures || []).some(
      (f) =>
        (!editingFee || f.id !== editingFee.id) &&
        f.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        f.department === formData.department
    );

    if (isDuplicate) {
      setFormError('A fee structure with the identical name and department mapping already exists.');
      return;
    }

    if (editingFee) {
      updateFeeStructure(editingFee.id, {
        ...formData,
        amount: Number(formData.amount),
      });
    } else {
      createFeeStructure(formData);
    }

    setModalOpen(false);
  };

  const handleDelete = (fee) => {
    if (window.confirm(`Are you sure you want to retire the fee schedule "${fee.name}"? Historical ledger records will remain intact.`)) {
      deleteFeeStructure(fee.id);
    }
  };

  const filteredStructures = (feeStructures || []).filter((f) =>
    !searchQuery ||
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBilled = (feeStructures || []).reduce((acc, f) => acc + (f.totalBilled || 0), 0);
  const totalCollected = (feeStructures || []).reduce((acc, f) => acc + (f.totalCollected || 0), 0);
  const avgRealization = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const structureMetrics = [
    {
      label: 'Configured Schedules',
      value: `${(feeStructures || []).length} Tariffs`,
      subtext: 'Autumn 2026 Assessment Series',
      state: 'info',
    },
    {
      label: 'Institutional Target',
      value: `₹${(totalBilled / 10000000).toFixed(2)} Cr`,
      subtext: 'Statutory assessed dues',
      state: 'neutral',
    },
    {
      label: 'Realized Collections',
      value: `₹${(totalCollected / 10000000).toFixed(2)} Cr`,
      subtext: 'Reconciled in institutional treasury',
      state: 'success',
    },
    {
      label: 'Average Recovery',
      value: `${avgRealization}%`,
      subtext: 'Across all tariff schedules',
      state: avgRealization >= 85 ? 'success' : 'warning',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Statutory Tuition, Laboratory & Amenities Tariffs"
        title="Fee Structure Administration"
        description="Establish and govern institutional billing schedules, tariff categorizations, statutory due dates, and department-level realization tracking."
        actions={[
          <button
            key="create-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openCreateModal}
          >
            <Plus size={13} /> Add Fee Structure
          </button>,
        ]}
      />

      <MetricStrip metrics={structureMetrics} />

      {/* Filter and Search Bar */}
      <section style={{
        padding: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search fee structures by title, department, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', height: '36px' }}
          />
        </div>
      </section>

      {/* Fee Structures Table */}
      <section>
        <SectionHeader
          title="Active Tariff & Billing Schedules"
          subtitle={`Displaying ${filteredStructures.length} tariff schedules`}
        />

        {filteredStructures.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Fee Structures Found"
            message="No billing schedules match your search parameters. Click 'Add Fee Structure' to register a tariff."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Fee Obligation Title',
                render: (f) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Category: <strong>{f.category || 'Tuition & Academic'}</strong> · AY: {f.academicYear || '2026-2027'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'department',
                label: 'Department & Scope',
                render: (f) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>{f.department}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {f.semester || 'All Semesters'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'amount',
                label: 'Unit Tariff (₹)',
                align: 'right',
                width: '130px',
                render: (f) => (
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ₹{f.amount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'dueDate',
                label: 'Statutory Due Date',
                render: (f) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{f.dueDate}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cut-off Deadline</div>
                  </div>
                ),
              },
              {
                key: 'realization',
                label: 'Collections Progress',
                width: '200px',
                render: (f) => {
                  const pct = f.totalBilled > 0 ? Math.round((f.totalCollected / f.totalBilled) * 100) : 0;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>₹{(f.totalCollected / 100000).toFixed(1)}L</span>
                        <strong style={{ color: 'var(--color-success, #10b981)' }}>{pct}%</strong>
                      </div>
                      <div className="progress-track" style={{ height: '4px' }}>
                        <div className="progress-fill progress-fill-success" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {f.studentsPaidCount || 0} paid · {f.studentsPendingCount || 0} pending
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'right',
                width: '140px',
                render: (f) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(f)}
                      title="Edit Schedule"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger, #ef4444)' }}
                      onClick={() => handleDelete(f)}
                      title="Retire Schedule"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredStructures}
            keyField="id"
          />
        )}
      </section>

      {/* CREATE / EDIT FEE STRUCTURE MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editingFee ? `Edit Fee Schedule: ${editingFee.name}` : 'Create Institutional Fee Structure'}
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              {formError && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--border-danger, #ef4444)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--color-danger, #ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <AlertTriangle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Fee Obligation Title *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Autumn 2026 Semester 5 Tuition & Lab Dues"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Department Scope
                  </label>
                  <select
                    className="input-field"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Tuition & Academic">Tuition & Academic</option>
                    <option value="Laboratory & Systems">Laboratory & Systems</option>
                    <option value="Examination Assessment">Examination Assessment</option>
                    <option value="Hostel & Amenities">Hostel & Amenities</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Tariff Amount (₹) *
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min="100"
                    step="100"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Due Date *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingFee ? 'Update Tariff Schedule' : 'Publish Fee Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
