import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  User,
  X,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODStudents() {
  const {
    students,
    coursesAttendance,
    leaveRequests,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedStanding, setSelectedStanding] = useState('ALL');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Scoped strictly to Department of AI & Data Science
  const deptStudents = useMemo(() => {
    return (students || []).filter((s) => s.deptCode === 'AIDS' || s.department?.includes('AI & Data Science'));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return deptStudents.filter((st) => {
      if (selectedYear !== 'ALL' && st.year !== selectedYear) return false;
      if (selectedSection !== 'ALL' && st.section !== selectedSection) return false;
      if (selectedStanding !== 'ALL' && st.standing !== selectedStanding) return false;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        st.name.toLowerCase().includes(q) ||
        (st.id || '').toLowerCase().includes(q) ||
        (st.rollNo || '').toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [deptStudents, selectedYear, selectedSection, selectedStanding, searchQuery]);

  const totalCount = deptStudents.length;
  const avgAttendance = totalCount > 0
    ? Math.round(deptStudents.reduce((acc, s) => acc + (s.attendancePct || 0), 0) / totalCount)
    : 0;
  const atRiskCount = deptStudents.filter((s) => (s.attendancePct || 0) < 75 || (s.backlogs || 0) > 0).length;
  const deansCount = deptStudents.filter((s) => s.standing === 'Dean List' || (s.cgpa || 0) >= 9.0).length;

  const metrics = [
    {
      label: 'Department Students',
      value: `${totalCount} Registered`,
      subtext: 'B.Tech AI & Data Science',
      state: 'info',
    },
    {
      label: 'Average Attendance',
      value: `${avgAttendance}%`,
      subtext: 'Across all lecture sessions',
      state: avgAttendance >= 80 ? 'success' : 'warning',
    },
    {
      label: 'At-Risk Attention',
      value: `${atRiskCount} Students`,
      subtext: atRiskCount > 0 ? 'Below 75% cutoff threshold' : 'All in good standing',
      state: atRiskCount > 0 ? 'urgent' : 'success',
    },
    {
      label: "Dean's List Honors",
      value: `${deansCount} Students`,
      subtext: 'CGPA >= 9.0 Benchmark',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Student Registry & Dossier Directory"
        title="Department Students"
        description="Search and inspect all undergraduate and postgraduate students enrolled in the Department of Artificial Intelligence & Data Science."
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
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Academic Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Sections</option>
            <option value="AIDS-A">Section AIDS-A</option>
            <option value="AIDS-B">Section AIDS-B</option>
          </select>

          <select
            value={selectedStanding}
            onChange={(e) => setSelectedStanding(e.target.value)}
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

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students match the criteria"
          description="Adjust your search query or standing filter to view students."
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
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Year / Section</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Faculty Advisor</th>
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
                      {st.rollNo || st.id}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {st.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {st.year || 'N/A'}{st.section ? ` · ${st.section}` : ''}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                      {st.advisor || 'Not Assigned'}
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
                        Academic Dossier
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
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
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
                    {selectedStudentDetail.rollNo || selectedStudentDetail.id} · {selectedStudentDetail.section || 'AIDS-A'} (Sem 5)
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedStudentDetail(null)} className="btn btn-ghost btn-sm">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Vitals */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Attendance Rate</div>
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
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Standing</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                    {selectedStudentDetail.standing || 'Good Standing'}
                  </div>
                </div>
              </div>

              {/* Course-Wise Attendance Breakdown */}
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Semester 5 Course Attendance
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {(coursesAttendance || []).map((c) => (
                    <div
                      key={c.code}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {c.code}: {c.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Instructor: {c.faculty} · {c.attended} / {c.total} attended
                        </div>
                      </div>
                      <span className={`badge ${c.percentage >= 80 ? 'badge-success' : 'badge-warning'}`}>
                        {c.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advisor Notes & Intervention History */}
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  Faculty Advisorship & Mentoring Notes
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  Assigned Advisor: <strong>{selectedStudentDetail.advisor || 'Not Assigned'}</strong>.<br />
                  {selectedStudentDetail.attendancePct < 75
                    ? 'Student is flagged on the At-Risk Radar. Mandatory counseling directive issued to parent and advisor.'
                    : 'Regular academic performance. Zero critical disciplinary or academic holds on file.'}
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
