import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Archive,
  AlertCircle,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable } from '../../workspace';

export default function AdminAcademicYears() {
  const { showToast } = useNivara();

  const [addYearModal, setAddYearModal] = useState(false);

  const [academicYears, setAcademicYears] = useState([
    { id: 'AY-2026-2027', code: '2026–2027', name: 'Academic Year 2026–2027', startDate: '2026-07-01', endDate: '2027-05-31', activeTerm: 'Autumn 2026', status: 'active', isCurrent: true },
    { id: 'AY-2025-2026', code: '2025–2026', name: 'Academic Year 2025–2026', startDate: '2025-07-01', endDate: '2026-05-31', activeTerm: 'Completed', status: 'archived', isCurrent: false },
    { id: 'AY-2024-2025', code: '2024–2025', name: 'Academic Year 2024–2025', startDate: '2024-07-01', endDate: '2025-05-31', activeTerm: 'Completed', status: 'archived', isCurrent: false },
  ]);

  const [yearForm, setYearForm] = useState({
    code: '2027–2028',
    name: 'Academic Year 2027–2028',
    startDate: '2027-07-01',
    endDate: '2028-05-31',
    activeTerm: 'Autumn 2027',
  });

  const handleAddYear = (e) => {
    e.preventDefault();
    const newYear = {
      id: `AY-${yearForm.code}`,
      ...yearForm,
      status: 'upcoming',
      isCurrent: false,
    };

    setAcademicYears([...academicYears, newYear]);
    showToast(`Chartered ${yearForm.name} in Academic Calendar Master ✓`, 'success');
    setAddYearModal(false);
  };

  const handleMakeActive = (id) => {
    setAcademicYears(
      academicYears.map((ay) => ({
        ...ay,
        isCurrent: ay.id === id,
        status: ay.id === id ? 'active' : 'archived',
      }))
    );
    showToast(`Active Institutional Term switched to ${id} ✓`, 'success');
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
            render: (ay) => <span>{ay.activeTerm}</span>,
          },
          {
            key: 'duration',
            label: 'Statutory Dates',
            render: (ay) => (
              <span style={{ fontSize: '0.78125rem' }}>
                {ay.startDate} to {ay.endDate}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Session State',
            width: '130px',
            render: (ay) => (
              <span className={`badge ${ay.isCurrent ? 'badge-success' : 'badge-neutral'}`}>
                {ay.isCurrent ? 'Current Active' : ay.status === 'upcoming' ? 'Upcoming' : 'Archived'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Action',
            align: 'right',
            width: '130px',
            render: (ay) =>
              ay.isCurrent ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--state-success)', fontWeight: 700 }}>
                  Active ✓
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleMakeActive(ay.id)}
                >
                  Set Active
                </button>
              ),
          },
        ]}
        data={academicYears}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddYearModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Charter Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
