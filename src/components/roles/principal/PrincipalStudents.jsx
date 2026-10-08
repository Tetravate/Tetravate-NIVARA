import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Award,
  Zap,
  CreditCard,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Download,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function PrincipalStudents() {
  const { students, departments, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedStandingFilter, setSelectedStandingFilter] = useState('all');
  const [inspectedStudent, setInspectedStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return (students || []).filter((st) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        st.name.toLowerCase().includes(q) ||
        st.id.toLowerCase().includes(q) ||
        (st.department && st.department.toLowerCase().includes(q));

      const matchesDept =
        selectedDeptFilter === 'all' ||
        st.deptCode === selectedDeptFilter ||
        (st.department && st.department.includes(selectedDeptFilter));

      const matchesStanding =
        selectedStandingFilter === 'all' ||
        (selectedStandingFilter === 'good' && (st.attendancePct || 85) >= 75 && (st.backlogs || 0) === 0) ||
        (selectedStandingFilter === 'risk' && ((st.attendancePct || 85) < 75 || (st.backlogs || 0) > 0)) ||
        (selectedStandingFilter === 'distinction' && (st.cgpa || 8.0) >= 8.5);

      return matchesSearch && matchesDept && matchesStanding;
    });
  }, [students, searchQuery, selectedDeptFilter, selectedStandingFilter]);

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Academic Registry · Student Directorate"
        title="College Student Directory & Standings"
        description="Comprehensive read-only registry of all enrolled undergraduate students across college academic divisions."
        actions={[
          <button
            key="export-roster"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Student Standing Register exported (CSV) ✓', 'success')}
          >
            <Download size={13} /> Export Roster (CSV)
          </button>,
        ]}
      />

      {/* 2. Filters & Search Bar */}
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
              placeholder="Search by student name or roll ID..."
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
            <option value="all">All Academic Divisions</option>
            {(departments || []).map((d) => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedStandingFilter}
            onChange={(e) => setSelectedStandingFilter(e.target.value)}
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
            <option value="all">All Academic Standings</option>
            <option value="good">Good Standing</option>
            <option value="risk">Academic Risk (&lt;75% Attendance or Backlogs)</option>
            <option value="distinction">First Class Distinction (CGPA ≥ 8.5)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredStudents.length}</strong> enrolled records
        </div>
      </div>

      {/* 3. Student DataTable */}
      <DataTable
        columns={[
          {
            key: 'id',
            label: 'Roll Identifier',
            width: '130px',
            render: (st) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>
                {st.id}
              </span>
            ),
          },
          {
            key: 'name',
            label: 'Student Name',
            render: (st) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {st.department || 'B.Tech AI & Data Science'} · {st.section || 'Sec A'}
                </div>
              </div>
            ),
          },
          {
            key: 'deptCode',
            label: 'Dept',
            width: '80px',
            render: (st) => <span className="badge badge-neutral">{st.deptCode || 'AIDS'}</span>,
          },
          {
            key: 'cgpa',
            label: 'CGPA',
            align: 'right',
            render: (st) => <span style={{ fontWeight: 700 }}>{st.cgpa || 8.2}</span>,
          },
          {
            key: 'attendancePct',
            label: 'Attendance',
            align: 'right',
            render: (st) => (
              <span style={{ fontWeight: 700, color: (st.attendancePct || 85) >= 75 ? 'var(--state-success)' : 'var(--state-urgent)' }}>
                {st.attendancePct}%
              </span>
            ),
          },
          {
            key: 'standing',
            label: 'Standing',
            render: (st) => {
              const isRisk = (st.attendancePct || 85) < 75 || (st.backlogs || 0) > 0;
              return (
                <span className={`badge ${isRisk ? 'badge-urgent' : 'badge-neutral'}`}>
                  {isRisk ? 'Academic Risk' : 'Good Standing'}
                </span>
              );
            },
          },
          {
            key: 'actions',
            label: 'Action',
            align: 'right',
            width: '90px',
            render: (st) => (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectedStudent(st);
                }}
              >
                <Eye size={12} /> Dossier
              </button>
            ),
          },
        ]}
        data={filteredStudents}
        keyField="id"
        onRowClick={(st) => setInspectedStudent(st)}
      />

      {/* 4. Student Academic Dossier Modal (Read-Only) */}
      {inspectedStudent && (
        <div className="modal-backdrop" onClick={() => setInspectedStudent(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {inspectedStudent.name}
                </h3>
              </div>
              <button type="button" onClick={() => setInspectedStudent(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Roll / Register ID:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inspectedStudent.id}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Academic Division:</span>
                  <div style={{ fontWeight: 600 }}>{inspectedStudent.department || 'B.Tech AI & Data Science'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Cumulative GPA:</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{inspectedStudent.cgpa} / 10.0</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Attendance Rate:</span>
                  <div style={{ fontWeight: 800, color: (inspectedStudent.attendancePct || 85) >= 75 ? 'var(--state-success)' : 'var(--state-urgent)' }}>
                    {inspectedStudent.attendancePct}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Active Backlogs:</span>
                  <div style={{ fontWeight: 600 }}>{inspectedStudent.backlogs || 0} Subjects</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Faculty Mentor:</span>
                  <div style={{ fontWeight: 600 }}>{inspectedStudent.advisor || 'Dr. Priya Raman'}</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Institutional Read-Only Directive:</strong> Profile records are managed by Department HOD and Academic Registrar. Grade amendments require Exam Cell verification.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setInspectedStudent(null)}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Official Transcript Dossier exported for ${inspectedStudent.id} ✓`, 'success');
                    setInspectedStudent(null);
                  }}
                >
                  <Download size={12} /> Export Academic Transcript
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
