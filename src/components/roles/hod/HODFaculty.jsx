import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  BookOpen,
  Clock,
  Star,
  CheckCircle2,
  X,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODFaculty() {
  const {
    facultyMembers,
    timetableEntries,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyDetail, setSelectedFacultyDetail] = useState(null);

  // Scoped strictly to Department of AI & Data Science
  const deptFaculty = useMemo(() => {
    return (facultyMembers || []).filter(
      (f) => f.dept === 'AI & Data Science' || f.dept === 'AIDS' || !f.dept
    );
  }, [facultyMembers]);

  const filteredFaculty = useMemo(() => {
    return deptFaculty.filter((f) => {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        (f.designation || '').toLowerCase().includes(q) ||
        (f.courses || []).some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [deptFaculty, searchQuery]);

  const totalTeachingHours = deptFaculty.reduce((acc, f) => acc + (f.workloadHours || 0), 0);
  const avgWorkload = deptFaculty.length > 0 ? (totalTeachingHours / deptFaculty.length).toFixed(1) : 0;
  const maxCapFaculty = deptFaculty.filter((f) => f.workloadHours >= 18).length;

  const metrics = [
    {
      label: 'Department Faculty',
      value: `${deptFaculty.length} Professors`,
      subtext: 'Teaching & Research Staff',
      state: 'info',
    },
    {
      label: 'Total Teaching Hours',
      value: `${totalTeachingHours} Hours/Wk`,
      subtext: `Avg: ${avgWorkload} hrs per faculty`,
      state: 'neutral',
    },
    {
      label: 'Max Workload Ceiling',
      value: `${maxCapFaculty} at Cap (18h)`,
      subtext: maxCapFaculty > 0 ? 'Within statutory guidelines' : 'Balanced distribution',
      state: maxCapFaculty > 0 ? 'warning' : 'success',
    },
    {
      label: 'Student Rating Index',
      value: '4.75 ★ Average',
      subtext: 'Departmental feedback benchmark',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Faculty Roster & Instructional Context"
        title="Department Faculty"
        description="Inspect instructional allocations, subject assignments, student ratings, and teaching schedules for faculty members in the Department of AI & Data Science."
      />

      <MetricStrip metrics={metrics} />

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {filteredFaculty.length} Instructional Staff Assigned to AI & Data Science
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search faculty name or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem 0.4rem 2rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {filteredFaculty.length === 0 ? (
        <EmptyState
          title="No faculty members found"
          description="Adjust your search criteria to view faculty members."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredFaculty.map((f) => {
            const isAtCap = f.workloadHours >= 18;

            return (
              <div
                key={f.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--brand-blue-subtle)',
                        color: 'var(--brand-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                      }}
                    >
                      {f.name.replace('Dr. ', '').replace('Prof. ', '').charAt(0)}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {f.name}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {f.designation} · {f.dept || 'AI & Data Science'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${isAtCap ? 'badge-warning' : 'badge-neutral'}`}>
                    {f.workloadHours} / {f.maxHours} hrs/wk
                  </span>
                </div>

                {/* Assigned Courses */}
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Teaching Assignments:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(f.courses || []).map((c, i) => (
                      <span key={i} className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating & Compliance */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.65rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Star size={13} fill="var(--state-warning)" color="var(--state-warning)" />
                    <strong style={{ color: 'var(--text-primary)' }}>{f.rating}</strong> (Student Evaluation)
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} color="var(--state-success)" />
                    <span>Compliance: <strong>{f.compliancePct}%</strong></span>
                  </div>
                </div>

                {/* Context Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setSelectedFacultyDetail(f)}
                  >
                    Inspect Teaching Context
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TEACHING CONTEXT MODAL */}
      {selectedFacultyDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedFacultyDetail(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedFacultyDetail.name}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedFacultyDetail.designation} · Instructional Dossier
                </div>
              </div>
              <button type="button" onClick={() => setSelectedFacultyDetail(null)} className="btn btn-ghost btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Weekly Workload</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {selectedFacultyDetail.workloadHours} / {selectedFacultyDetail.maxHours} Hours
                  </strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Syllabus Compliance</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--state-success)' }}>
                    {selectedFacultyDetail.compliancePct}% on schedule
                  </strong>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Assigned Lecture & Lab Sessions:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(selectedFacultyDetail.courses || []).map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c}</span>
                      <span className="badge badge-neutral">Batch AIDS-A</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Role & Identity Governance:</strong> User credentials, password resets, and role assignments are managed by the ERP Administrator. HOD retains academic allocation oversight.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedFacultyDetail(null)}
                >
                  Close Context
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
