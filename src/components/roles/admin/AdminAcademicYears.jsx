import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminAcademicYears() {
  const { academicYears, createAcademicYear, updateAcademicYear, setCurrentAcademicYear, showToast } = useNivara();

  const [addYearModal, setAddYearModal] = useState(false);
  const [editYearModal, setEditYearModal] = useState(false);

  const displayYears = academicYears && academicYears.length > 0 ? academicYears : [
    { id: 'AY-2026-2027', code: '2026–2027', name: 'Academic Year 2026–2027', startDate: '2026-07-01', endDate: '2027-05-31', activeTerm: 'Autumn 2026', status: 'active', isCurrent: true },
    { id: 'AY-2025-2026', code: '2025–2026', name: 'Academic Year 2025–2026', startDate: '2025-07-01', endDate: '2026-05-31', activeTerm: 'Completed', status: 'archived', isCurrent: false },
    { id: 'AY-2024-2025', code: '2024–2025', name: 'Academic Year 2024–2025', startDate: '2024-07-01', endDate: '2025-05-31', activeTerm: 'Completed', status: 'archived', isCurrent: false },
  ];

  const [yearForm, setYearForm] = useState({
    code: '2027–2028',
    name: 'Academic Year 2027–2028',
    startDate: '2027-07-01',
    endDate: '2028-05-31',
    activeTerm: 'Autumn 2027',
  });

  const [editYearForm, setEditYearForm] = useState({
    id: '',
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    activeTerm: '',
  });

  const handleAddYear = async (e) => {
    e.preventDefault();
    const newYear = {
      code: yearForm.code,
      name: yearForm.name,
      start_date: yearForm.startDate,
      end_date: yearForm.endDate,
      active_term: yearForm.activeTerm,
      status: 'upcoming',
      is_current: false,
    };

    await createAcademicYear(newYear);
    setAddYearModal(false);
  };

  const handleOpenEdit = (ay) => {
    setEditYearForm({
      id: ay.id,
      code: ay.code,
      name: ay.name,
      startDate: ay.startDate || ay.start_date || '',
      endDate: ay.endDate || ay.end_date || '',
      activeTerm: ay.activeTerm || ay.active_term || '',
    });
    setEditYearModal(true);
  };

  const handleEditYearSubmit = async (e) => {
    e.preventDefault();
    await updateAcademicYear(editYearForm.id, {
      name: editYearForm.name,
      start_date: editYearForm.startDate,
      end_date: editYearForm.endDate,
      active_term: editYearForm.activeTerm,
    });
    setEditYearModal(false);
  };

  const handleMakeActive = async (id) => {
    await setCurrentAcademicYear(id);
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institutional Calendar · Academic Session Governance"
        title="Academic Years & Calendar Sessions Master"
        description="Configure institutional academic years, term boundary dates, and govern single-active-term operational rules."
        actions={[
          <button
            key="add-ay"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddYearModal(true)}
          >
            <Plus size={13} /> Institute Academic Year
          </button>,
        ]}
      />

      {/* 2. Notice Callout */}
      <div className="notion-callout notion-callout-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle2 size={18} color="var(--state-success)" />
        <div style={{ flex: 1, fontSize: '0.8125rem' }}>
          <strong>Single Active Year Regulation:</strong> Only one academic year may remain in <code>active</code> status simultaneously to preserve relational integrity across attendance registers, CIA marks, and fee billing schedules.
        </div>
      </div>

      {/* 3. DataTable */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Academic Year Title',
            render: (ay) => (
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{ay.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {ay.code}</div>
              </div>
            ),
          },
          {
            key: 'activeTerm',
            label: 'Current Academic Term',
            render: (ay) => <span>{ay.activeTerm || ay.active_term || 'Standard Term'}</span>,
          },
          {
            key: 'duration',
            label: 'Statutory Dates',
            render: (ay) => (
              <span style={{ fontSize: '0.78125rem' }}>
                {ay.startDate || ay.start_date} to {ay.endDate || ay.end_date}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Session State',
            width: '130px',
            render: (ay) => (
              <span className={`badge ${ay.isCurrent || ay.is_current ? 'badge-success' : 'badge-neutral'}`}>
                {ay.isCurrent || ay.is_current ? 'Current Active' : ay.status === 'upcoming' ? 'Upcoming' : 'Archived'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            width: '180px',
            render: (ay) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEdit(ay)}
                  title="Edit Term"
                >
                  <Edit2 size={12} /> Edit
                </button>
                {ay.isCurrent || ay.is_current ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--state-success)', fontWeight: 700 }}>
                    Active ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={() => handleMakeActive(ay.id)}
                  >
                    Set Active
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={displayYears}
        keyField="id"
      />

      {/* 4. Add Year Modal */}
      {addYearModal && (
        <div className="modal-backdrop" onClick={() => setAddYearModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Institute Academic Year
                </h3>
              </div>
              <button type="button" onClick={() => setAddYearModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddYear} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Academic Year Code (e.g. 2027–2028)
                </label>
                <input
                  type="text"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Academic Year Title
                </label>
                <input
                  type="text"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Term Start Date</label>
                  <input
                    type="date"
                    value={yearForm.startDate}
                    onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Term End Date</label>
                  <input
                    type="date"
                    value={yearForm.endDate}
                    onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Active Academic Term
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autumn 2027"
                  value={yearForm.activeTerm}
                  onChange={(e) => setYearForm({ ...yearForm, activeTerm: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddYearModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Institute Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Year Modal */}
      {editYearModal && (
        <div className="modal-backdrop" onClick={() => setEditYearModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Academic Year ({editYearForm.code})
                </h3>
              </div>
              <button type="button" onClick={() => setEditYearModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditYearSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Academic Year Title
                </label>
                <input
                  type="text"
                  value={editYearForm.name}
                  onChange={(e) => setEditYearForm({ ...editYearForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Term Start Date</label>
                  <input
                    type="date"
                    value={editYearForm.startDate}
                    onChange={(e) => setEditYearForm({ ...editYearForm, startDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Term End Date</label>
                  <input
                    type="date"
                    value={editYearForm.endDate}
                    onChange={(e) => setEditYearForm({ ...editYearForm, endDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Active Academic Term
                </label>
                <input
                  type="text"
                  value={editYearForm.activeTerm}
                  onChange={(e) => setEditYearForm({ ...editYearForm, activeTerm: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditYearModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
