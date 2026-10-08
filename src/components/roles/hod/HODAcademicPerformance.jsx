import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Filter,
  Search,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODAcademicPerformance() {
  const {
    departments,
    internalMarks,
    publishedResults,
    students,
  } = useNivara();

  const [selectedSemester, setSelectedSemester] = useState('5');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  const dept = (departments || []).find((d) => d.code === 'AIDS') || {
    code: 'AIDS',
    name: 'Department of AI & Data Science',
    avgCgpa: 8.42,
    placedPct: 82,
  };

  // Department Semester 5 Subjects with CIA marks and moderation telemetry
  const subjectPerformance = [
    {
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      faculty: 'Dr. Priya Raman',
      credits: 4,
      avgCia: '22.8 / 25',
      passPct: 96.7,
      status: 'locked',
      gradeDist: { S: 18, A: 24, B: 12, C: 4, U: 2 },
    },
    {
      code: 'AI302',
      name: 'Machine Learning Foundations Lab',
      faculty: 'Dr. Rajesh K.',
      credits: 2,
      avgCia: '23.5 / 25',
      passPct: 98.3,
      status: 'draft',
      gradeDist: { S: 22, A: 26, B: 10, C: 2, U: 0 },
    },
    {
      code: 'CS304',
      name: 'Database Management Systems',
      faculty: 'Dr. K. Mohan',
      credits: 3,
      avgCia: '21.4 / 25',
      passPct: 95.0,
      status: 'locked',
      gradeDist: { S: 14, A: 28, B: 14, C: 2, U: 2 },
    },
    {
      code: 'MA301',
      name: 'Discrete Mathematics & Graph Theory',
      faculty: 'Prof. S. Venkatesh',
      credits: 4,
      avgCia: '19.8 / 25',
      passPct: 91.5,
      status: 'locked',
      gradeDist: { S: 10, A: 20, B: 20, C: 6, U: 4 },
    },
    {
      code: 'CS302',
      name: 'Object Oriented Programming with Java',
      faculty: 'Prof. Ananya Sen',
      credits: 3,
      avgCia: '20.6 / 25',
      passPct: 93.3,
      status: 'locked',
      gradeDist: { S: 12, A: 22, B: 18, C: 5, U: 3 },
    },
  ];

  const filteredSubjects = useMemo(() => {
    return subjectPerformance.filter((s) => {
      if (selectedSubjectFilter !== 'ALL' && s.code !== selectedSubjectFilter) return false;
      return true;
    });
  }, [selectedSubjectFilter]);

  const lockedCount = subjectPerformance.filter((s) => s.status === 'locked').length;
  const draftCount = subjectPerformance.filter((s) => s.status === 'draft').length;

  const metrics = [
    {
      label: 'Department Pass Rate',
      value: '94.2%',
      subtext: 'Semester examinations benchmark',
      state: 'success',
    },
    {
      label: 'Department Average CGPA',
      value: `${dept.avgCgpa}`,
      subtext: 'Scale of 10.0 (Autonomous)',
      state: 'success',
    },
    {
      label: 'CIA Moderation Pipeline',
      value: `${lockedCount} Locked / ${draftCount} Draft`,
      subtext: draftCount > 0 ? 'AI302 pending faculty sign-off' : 'All submitted to Exam Cell',
      state: draftCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Dean’s List Distinction',
      value: '38 Students (Top 10%)',
      subtext: 'CGPA >= 9.0 in Autumn Term',
      state: 'info',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Academic Standards & CIA Tabulation"
        title="Department Academic Performance"
        description="Comprehensive review of continuous internal assessment moderation, semester examination pass percentages, and subject grade distributions across department courses."
      />

      <MetricStrip metrics={metrics} />

      {/* Filter Bar */}
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
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="5">Semester 5 (Autumn 2026 Active)</option>
            <option value="4">Semester 4 (Spring 2026 Published)</option>
          </select>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Department Courses</option>
            <option value="CS301">CS301 — Data Structures</option>
            <option value="AI302">AI302 — ML Foundations Lab</option>
            <option value="CS304">CS304 — Database Systems</option>
            <option value="MA301">MA301 — Discrete Math</option>
            <option value="CS302">CS302 — OOP Java</option>
          </select>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Autonomous Regulation 2024 · Letter Grade Scale: S (10), A (9), B (8), C (7), U (0)
        </span>
      </div>

      {/* Subject Performance & CIA Moderation Table */}
      <div>
        <SectionHeader
          title="Course CIA Moderation & Historical Grade Distribution"
          subtitle="Continuous assessment collections submitted by teaching faculty for autonomous tabulation"
        />

        <div style={{ overflowX: 'auto', marginTop: '0.65rem' }}>
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
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Course Code</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject Title</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Instructor</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Avg CIA (/25)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Pass Rate</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Grade Breakdown (S / A / B / C / U)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>CIA Sheet Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((s) => {
                const isLocked = s.status === 'locked';

                return (
                  <tr key={s.code} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {s.code}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {s.faculty}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {s.avgCia}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: s.passPct >= 95 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                      {s.passPct}%
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{s.gradeDist.S}S</span>
                        <span>/</span>
                        <span>{s.gradeDist.A}A</span>
                        <span>/</span>
                        <span>{s.gradeDist.B}B</span>
                        <span>/</span>
                        <span>{s.gradeDist.C}C</span>
                        {s.gradeDist.U > 0 && (
                          <>
                            <span>/</span>
                            <span style={{ color: 'var(--state-urgent)', fontWeight: 700 }}>{s.gradeDist.U}U</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span className={`badge ${isLocked ? 'badge-success' : 'badge-warning'}`}>
                        {isLocked ? 'Locked & Verified' : 'Draft Assessment'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
