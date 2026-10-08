import React, { useState } from 'react';
import {
  Building2,
  Users,
  Award,
  Zap,
  Briefcase,
  AlertTriangle,
  Download,
  Search,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function PrincipalDepartments() {
  const { departments, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);

  const filteredDepts = (departments || []).filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.hod.toLowerCase().includes(q)
    );
  });

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Academic Council · Department Management"
        title="Department Strategic Matrix"
        description="Comprehensive comparative matrix of academic branches, faculty strength, student density, and departmental performance benchmarks."
        actions={[
          <button
            key="export-all"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Institution-wide departmental comparative audit exported ✓', 'success')}
          >
            <Download size={13} /> Export All Branches (CSV)
          </button>,
        ]}
      />

      {/* 2. Search & Overview Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          padding: '0.85rem 1.15rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by division name, code, or HOD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredDepts.length}</strong> of <strong>{(departments || []).length}</strong> accredited academic branches
        </div>
      </div>

      {/* 3. Department Comparison Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Academic Branch',
            render: (d) => (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>{d.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Head: <strong>{d.hod}</strong></div>
              </div>
            ),
          },
          {
            key: 'code',
            label: 'Code',
            width: '90px',
            render: (d) => <span className="badge badge-info">{d.code}</span>,
          },
          {
            key: 'studentCount',
            label: 'Students',
            align: 'right',
            render: (d) => `${d.studentCount}`,
          },
          {
            key: 'facultyCount',
            label: 'Faculty',
            align: 'right',
            render: (d) => `${d.facultyCount}`,
          },
          {
            key: 'avgCgpa',
            label: 'Mean CGPA',
            align: 'right',
            render: (d) => <span style={{ fontWeight: 600 }}>{d.avgCgpa}</span>,
          },
          {
            key: 'attendancePct',
            label: 'Attendance',
            align: 'right',
            render: (d) => (
              <span style={{ fontWeight: 700, color: d.attendancePct >= 85 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                {d.attendancePct}%
              </span>
            ),
          },
          {
            key: 'placedPct',
            label: 'Placement',
            align: 'right',
            render: (d) => (
              <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                {d.placedPct}%
              </span>
            ),
          },
          {
            key: 'atRiskCount',
            label: 'At-Risk',
            align: 'right',
            render: (d) => (
              <span className={`badge ${d.atRiskCount > 10 ? 'badge-urgent' : 'badge-neutral'}`}>
                {d.atRiskCount}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Action',
            align: 'right',
            width: '100px',
            render: (d) => (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDept(d);
                }}
              >
                <Eye size={12} /> Inspect
              </button>
            ),
          },
        ]}
        data={filteredDepts}
        keyField="code"
        onRowClick={(d) => setSelectedDept(d)}
      />

      {/* 4. Detailed Department Inspector Modal (Read-Only) */}
      {selectedDept && (
        <div className="modal-backdrop" onClick={() => setSelectedDept(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedDept.name} ({selectedDept.code})
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedDept(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.15rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Head of Department:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{selectedDept.hod}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Enrolled Undergraduates:</span>
                  <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{selectedDept.studentCount} Students</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Core Teaching Faculty:</span>
                  <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{selectedDept.facultyCount} Instructional Staff</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Attendance Rate:</span>
                  <div style={{ fontWeight: 800, color: selectedDept.attendancePct >= 85 ? 'var(--state-success)' : 'var(--state-warning)', marginTop: '0.2rem' }}>
                    {selectedDept.attendancePct}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Class Average CGPA:</span>
                  <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{selectedDept.avgCgpa} / 10.0</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Career Placement Rate:</span>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                    {selectedDept.placedPct}%
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  Accredited Laboratory Facilities & Research Centers:
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {selectedDept.code === 'AIDS' && 'AI & Machine Learning Research Center · Cognitive Neural Computing Hub · Data Engineering Lab 2.'}
                  {selectedDept.code === 'CSE' && 'High Performance Computing Cluster · Systems & Cloud Infrastructure Lab · Advanced Algorithms Studio.'}
                  {selectedDept.code === 'ECE' && 'VLSI Design & Embedded Systems Suite · RF & Wireless Microwave Lab · DSP & Signals Studio.'}
                  {selectedDept.code === 'MECH' && 'Robotics & Automation Center · Mechatronics & CAD Modeling Lab · Thermal Dynamics Studio.'}
                  {selectedDept.code === 'CIVIL' && 'Structural Dynamics Lab · Environmental & Hydrology Center · Geotechnical Testing Ground.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedDept(null)}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Official Department Dossier exported for ${selectedDept.code} ✓`, 'success');
                    setSelectedDept(null);
                  }}
                >
                  <Download size={12} /> Export Branch Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
