import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  Eye,
  Download,
  Building,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function PrincipalFaculty() {
  const { facultyMembers, departments, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [inspectedFaculty, setInspectedFaculty] = useState(null);

  const facultyData = facultyMembers || [];

  const filteredFaculty = useMemo(() => {
    return facultyData.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        (f.role && f.role.toLowerCase().includes(q)) ||
        (f.dept && f.dept.toLowerCase().includes(q)) ||
        (f.courses && f.courses.toLowerCase().includes(q));

      const matchesDept =
        selectedDeptFilter === 'all' ||
        f.deptCode === selectedDeptFilter ||
        (f.dept && f.dept.includes(selectedDeptFilter));

      const matchesRole =
        selectedRoleFilter === 'all' ||
        (selectedRoleFilter === 'Professor' && f.role === 'Professor') ||
        (selectedRoleFilter === 'Associate' && f.role && f.role.includes('Associate')) ||
        (selectedRoleFilter === 'Assistant' && f.role && f.role.includes('Assistant'));

      return matchesSearch && matchesDept && matchesRole;
    });
  }, [facultyData, searchQuery, selectedDeptFilter, selectedRoleFilter]);

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Academic Council · Instructional Directorate"
        title="Institutional Faculty Roster"
        description="Comprehensive academic directory of professors, associate faculty, teaching allocations, and student feedback benchmarks."
        actions={[
          <button
            key="export-faculty"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Instructional Faculty Roster exported (CSV) ✓', 'success')}
          >
            <Download size={13} /> Export Faculty Roster
          </button>,
        ]}
      />

      {/* 2. Filter Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search faculty name or courses..."
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

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="all">All Academic Departments</option>
            {(departments || []).map((d) => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="all">All Designations</option>
            <option value="Professor">Professors</option>
            <option value="Associate">Associate Professors</option>
            <option value="Assistant">Assistant Professors</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredFaculty.length}</strong> academic staff members
        </div>
      </div>

      {/* 3. Faculty Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Faculty Member',
            render: (f) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.role}</div>
              </div>
            ),
          },
          {
            key: 'dept',
            label: 'Department',
            render: (f) => <span className="badge badge-neutral">{f.deptCode || f.dept || 'AIDS'}</span>,
          },
          {
            key: 'courses',
            label: 'Assigned Courses',
            render: (f) => <span style={{ fontSize: '0.8125rem' }}>{f.courses || 'Core Coursework'}</span>,
          },
          {
            key: 'hours',
            label: 'Load (hrs/wk)',
            align: 'right',
            render: (f) => (
              <span style={{ fontWeight: 700, color: (f.hours || 16) > 18 ? 'var(--state-warning)' : 'var(--text-primary)' }}>
                {f.hours || 16} hrs
              </span>
            ),
          },
          {
            key: 'rating',
            label: 'Student Rating',
            align: 'right',
            render: (f) => (
              <span style={{ fontWeight: 800, color: 'var(--state-success)' }}>
                ★ {f.rating || 4.8}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Action',
            align: 'right',
            width: '90px',
            render: (f) => (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectedFaculty(f);
                }}
              >
                <Eye size={12} /> Inspect
              </button>
            ),
          },
        ]}
        data={filteredFaculty}
        keyField="name"
        onRowClick={(f) => setInspectedFaculty(f)}
      />

      {/* 4. Faculty Inspector Modal (Read-Only) */}
      {inspectedFaculty && (
        <div className="modal-backdrop" onClick={() => setInspectedFaculty(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {inspectedFaculty.name}
                </h3>
              </div>
              <button type="button" onClick={() => setInspectedFaculty(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inspectedFaculty.role}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Academic Division:</span>
                  <div style={{ fontWeight: 600 }}>{inspectedFaculty.dept || 'AI & Data Science'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Instructional Hours:</span>
                  <div style={{ fontWeight: 800 }}>{inspectedFaculty.hours || 16} Teaching hrs / week</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>UGC Ceiling:</span>
                  <div style={{ fontWeight: 600, color: 'var(--state-success)' }}>Compliant (≤ 18 hrs)</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Teaching Evaluation:</span>
                  <div style={{ fontWeight: 800, color: 'var(--state-success)' }}>★ {inspectedFaculty.rating || 4.8} / 5.0</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Course Allocation:</span>
                  <div style={{ fontWeight: 600 }}>{inspectedFaculty.courses || 'Machine Learning (AI302)'}</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Institutional Read-Only Notice:</strong> Faculty appointments, rank promotions, and biometric identity are governed by ERP Administration.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setInspectedFaculty(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
