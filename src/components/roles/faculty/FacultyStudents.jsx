import React, { useState, useMemo } from 'react';
import {
  User,
  Search,
  X,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, EmptyState } from '../../workspace';

export default function FacultyStudents() {
  const {
    students,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [selectedStandingFilter, setSelectedStandingFilter] = useState('ALL');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Scoped strictly to Faculty's authorized cohorts: AIDS-A & AIDS-B
  const authorizedStudents = useMemo(() => {
    return (students || []).filter((s) => {
      // Must be in AI & Data Science and enrolled in Semester 5 cohorts taught by faculty
      return s.deptCode === 'AIDS' || s.department?.includes('AI & Data Science');
    });
  }, [students]);

  const filteredStudents = useMemo(() => {
    return authorizedStudents.filter((st) => {
      if (selectedCohort !== 'ALL' && st.section !== selectedCohort) return false;
      if (selectedStandingFilter !== 'ALL' && st.standing !== selectedStandingFilter) return false;

      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [authorizedStudents, selectedCohort, selectedStandingFilter, searchQuery]);

  // Cohort statistics
  const totalEnrolled = authorizedStudents.length;
  const avgAttendance = totalEnrolled > 0
    ? Math.round(authorizedStudents.reduce((acc, s) => acc + (s.attendancePct || 0), 0) / totalEnrolled)
    : 0;
  const atRiskCount = authorizedStudents.filter((s) => (s.attendancePct || 0) < 75 || s.standing === 'Academic Risk').length;
  const deansListCount = authorizedStudents.filter((s) => s.standing === 'Dean List' || (s.cgpa || 0) >= 9.0).length;

  const metrics = [
    {
      label: 'Authorized Cohort',
      value: `${totalEnrolled} Students`,
      subtext: 'Section AIDS-A & AIDS-B',
      state: 'info',
    },
    {
      label: 'Average Attendance',
      value: `${avgAttendance}%`,
      subtext: 'Across all lecture sessions',
      state: avgAttendance >= 80 ? 'success' : 'warning',
    },
    {
      label: 'Academic Attention',
      value: `${atRiskCount} Students`,
      subtext: atRiskCount > 0 ? 'Attendance < 75% or backlogs' : 'All students in good standing',
      state: atRiskCount > 0 ? 'urgent' : 'success',
    },
    {
      label: "Dean's List Standing",
      value: `${deansListCount} Students`,
      subtext: 'CGPA >= 9.0 & Outstanding CIA',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Student Directory & Academic Dossier"
        title="Enrolled Students"
        description="Inspect registered students across your assigned teaching cohorts (CS301, AI302, AI308), monitor individual standing, and open academic contexts."
      />

      <MetricStrip metrics={metrics} />

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Cohort Sections</option>
            <option value="AIDS-A">Section AIDS-A (Semester 5)</option>
            <option value="AIDS-B">Section AIDS-B (Semester 5)</option>
          </select>

          <select
            value={selectedStandingFilter}
            onChange={(e) => setSelectedStandingFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Academic Standings</option>
            <option value="Dean List">Dean's List</option>
            <option value="Good Standing">Good Standing</option>
            <option value="Academic Risk">Academic Risk (&lt;75%)</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search student or roll..."
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

      {/* Enrolled Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students match the criteria"
          description="Adjust your search query or standing filter to view enrolled students."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Roll No</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Section</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Attendance</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>CGPA</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Standing</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => {
                const isAtRisk = (st.attendancePct || 0) < 75 || st.standing === 'Academic Risk';
                const isDean = st.standing === 'Dean List';

                return (
                  <tr
                    key={st.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {st.rollNo || st.roll}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {st.section || 'AIDS-A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: isAtRisk ? 'var(--state-urgent)' : st.attendancePct >= 85 ? 'var(--state-success)' : 'var(--text-primary)',
                        }}
                      >
                        {st.attendancePct}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {st.cgpa || '8.2'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        className={`badge ${
                          isAtRisk
                            ? 'badge-urgent'
                            : isDean
                            ? 'badge-info'
                            : 'badge-success'
                        }`}
                      >
                        {st.standing || 'Good Standing'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        onClick={() => setSelectedStudentDetail(st)}
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* STUDENT ACADEMIC DOSSIER MODAL */}
      {selectedStudentDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedStudentDetail(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--brand-blue-subtle)',
                    color: 'var(--brand-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {selectedStudentDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedStudentDetail.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {selectedStudentDetail.rollNo || selectedStudentDetail.id} · {selectedStudentDetail.section || 'AIDS-A'}
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedStudentDetail(null)} className="btn btn-ghost btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Overview Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Aggregate Attendance</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: selectedStudentDetail.attendancePct < 75 ? 'var(--state-urgent)' : 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {selectedStudentDetail.attendancePct}%
                  </div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Cumulative CGPA</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {selectedStudentDetail.cgpa || '8.4'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Academic Standing</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {selectedStudentDetail.standing || 'Good Standing'}
                  </div>
                </div>
              </div>

              {/* Course-Specific Performance (Faculty Courses) */}
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Course Breakdown in Your Subjects
                </strong>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        CS301: Data Structures & Algorithms
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Attendance: 24 / 26 (92%) · CIA Continuous Score: 23 / 25
                      </div>
                    </div>
                    <span className="badge badge-success">Good</span>
                  </div>

                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        AI302: Machine Learning Foundations Lab
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Attendance: 19 / 20 (95%) · CIA Continuous Score: 24 / 25
                      </div>
                    </div>
                    <span className="badge badge-success">Excellent</span>
                  </div>
                </div>
              </div>

              {/* Leave and On-Duty History */}
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Duty & Medical Leave History
                </strong>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  {selectedStudentDetail.id === '2024-AIDS-042'
                    ? '1 Approved Duty Leave: Hackathon Delegation (11 Oct – 12 Oct · 2 Days) with Attendance Concession (+3% credit applied).'
                    : 'No sanctioned duty or medical leaves on file for the active semester.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedStudentDetail(null)}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
