import React, { useState, useMemo } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODAttendance({ onNavigate }) {
  const {
    departments,
    coursesAttendance,
    students,
  } = useNivara();

  const [selectedCohortView, setSelectedCohortView] = useState('courses'); // 'courses' | 'years' | 'defaulters'

  const dept = (departments || []).find((d) => d.code === 'AIDS') || {
    code: 'AIDS',
    name: 'Department of AI & Data Science',
    attendancePct: 84.8,
  };

  const deptStudents = useMemo(() => {
    return (students || []).filter((s) => s.deptCode === 'AIDS' || s.department?.includes('AI & Data Science'));
  }, [students]);

  const defaulters = useMemo(() => {
    return deptStudents.filter((s) => (s.attendancePct || 0) < 75);
  }, [deptStudents]);

  const sectionBreakdown = useMemo(() => {
    const groups = {};
    deptStudents.forEach((s) => {
      const sec = s.section ? `AIDS-${s.section} (Sem ${s.semester || 1})` : 'AIDS-A';
      if (!groups[sec]) {
        groups[sec] = { section: sec, advisor: s.advisor || 'Assigned Faculty', totalPct: 0, count: 0 };
      }
      groups[sec].count += 1;
      groups[sec].totalPct += (s.attendancePct || 0);
    });
    return Object.values(groups).map((g) => ({
      section: g.section,
      advisor: g.advisor,
      rate: g.count > 0 ? Number((g.totalPct / g.count).toFixed(1)) : 0,
      present: Math.round((g.count * (g.totalPct / (g.count || 1))) / 100),
      total: g.count,
    }));
  }, [deptStudents]);

  const yearBreakdown = useMemo(() => {
    const groups = {};
    deptStudents.forEach((s) => {
      const y = s.year || (s.semester ? `${Math.ceil(s.semester / 2)} Year` : 'Current Year');
      if (!groups[y]) {
        groups[y] = { year: y, students: 0, totalPct: 0 };
      }
      groups[y].students += 1;
      groups[y].totalPct += (s.attendancePct || 0);
    });
    return Object.values(groups).map((g) => {
      const rate = g.students > 0 ? Number((g.totalPct / g.students).toFixed(1)) : 0;
      return {
        year: g.year,
        students: g.students,
        conducted: 0,
        rate,
        status: rate >= 80 ? 'good' : 'warning',
      };
    });
  }, [deptStudents]);

  const sortedCourses = [...(coursesAttendance || [])].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const highestCourse = sortedCourses.length > 0 ? sortedCourses[0] : null;
  const lowestCourse = sortedCourses.length > 1 ? sortedCourses[sortedCourses.length - 1] : null;

  const metrics = [
    {
      label: 'Department Attendance',
      value: `${dept.attendancePct}%`,
      subtext: 'Synchronized live from faculty roll calls',
      state: dept.attendancePct >= 80 ? 'success' : 'warning',
    },
    {
      label: 'Attendance Defaulters',
      value: `${defaulters.length} Below 75%`,
      subtext: defaulters.length > 0 ? 'Mandatory counseling required' : 'Full compliance',
      state: defaulters.length > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Highest Attended Course',
      value: highestCourse ? `${highestCourse.code} (${highestCourse.percentage}%)` : 'No data',
      subtext: highestCourse ? highestCourse.name : 'No courses recorded',
      state: 'success',
    },
    {
      label: 'Lowest Attended Course',
      value: lowestCourse ? `${lowestCourse.code} (${lowestCourse.percentage}%)` : 'No data',
      subtext: lowestCourse ? lowestCourse.name : 'No courses recorded',
      state: 'warning',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Real-Time Roll Call Intelligence"
        title="Department Attendance Analytics"
        description="Comprehensive attendance tracking across lecture sessions, laboratory practicals, academic year cohorts, and individual student compliance thresholds."
      />

      <MetricStrip metrics={metrics} />

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
        <button
          type="button"
          className={`btn btn-sm ${selectedCohortView === 'courses' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectedCohortView('courses')}
        >
          Subject-Wise Roll Call
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectedCohortView === 'years' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectedCohortView('years')}
        >
          Year & Section Breakdown
        </button>
        <button
          type="button"
          className={`btn btn-sm ${selectedCohortView === 'defaulters' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectedCohortView('defaulters')}
        >
          Defaulters Radar (&lt;75%)
        </button>
      </div>

      {/* VIEW 1: SUBJECT-WISE ATTENDANCE */}
      {selectedCohortView === 'courses' && (
        <div>
          <SectionHeader
            title="Semester 5 Course-Wise Lecture Delivery & Roll Call Rates"
            subtitle="Live synchronized records updated directly as faculty record classroom attendance"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.65rem' }}>
            {(coursesAttendance || []).map((c) => {
              const isGood = c.percentage >= 85;
              const isWarning = c.percentage < 80;

              return (
                <div
                  key={c.code}
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.15rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className="badge badge-info">{c.code}</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {c.name}
                      </strong>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>Faculty: <strong>{c.faculty}</strong></span>
                      <span>•</span>
                      <span>Sessions Delivered: <strong>{c.total} Lectures</strong></span>
                      <span>•</span>
                      <span>Venue: <strong>{c.room}</strong></span>
                      <span>•</span>
                      <span>Enrolled: <strong>60 Students (Batch A)</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          color: isGood ? 'var(--state-success)' : isWarning ? 'var(--state-warning)' : 'var(--text-primary)',
                        }}
                      >
                        {c.percentage}%
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {c.attended} / {c.total} Delivered
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: YEAR & SECTION BREAKDOWN */}
      {selectedCohortView === 'years' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <SectionHeader
              title="Academic Year Attendance Averages"
              subtitle="Aggregated continuous attendance across undergraduate batches"
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.65rem' }}>
              {yearBreakdown.map((y, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem 1.15rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {y.year}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.35rem 0' }}>
                    {y.rate}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {y.students} Students · {y.conducted} Total Sessions
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              title="Section-Level Cohort Breakdown"
              subtitle="Directly managed by designated departmental faculty advisors"
            />

            <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
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
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Section</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Faculty Advisor</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Total Enrolled</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Avg Present</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionBreakdown.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {s.section}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {s.advisor}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {s.total}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {s.present}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: s.rate >= 85 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                        {s.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ATTENDANCE DEFAULTERS RADAR */}
      {selectedCohortView === 'defaulters' && (
        <div>
          <SectionHeader
            title={`Attendance Defaulters List (${defaulters.length})`}
            subtitle="Students falling below the mandatory 75% institutional autonomous cutoff"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.65rem' }}>
            {defaulters.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Zero Attendance Defaulters"
                description="All enrolled students currently maintain attendance above the 75% cutoff threshold."
              />
            ) : (
              defaulters.map((st) => (
                <div
                  key={st.id}
                  style={{
                    background: 'var(--state-urgent-bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--state-urgent-border)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {st.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {st.id} ({st.rollNo || 'Roll'})
                      </span>
                      <span className="badge badge-urgent">{st.attendancePct}%</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Section: {st.section || 'General'} · Assigned Advisor: <strong>{st.advisor || 'Not Assigned'}</strong> · Shortfall: {Math.max(1, Math.ceil((0.75 * 100 - (st.attendancePct || 0))))}%
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigate && onNavigate('at_risk')}
                  >
                    Open Intervention Queue
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
