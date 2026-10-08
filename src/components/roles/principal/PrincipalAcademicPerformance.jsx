import React, { useState, useMemo } from 'react';
import {
  Award,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  BookOpen,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalAcademicPerformance() {
  const { departments, publishedResults, students, showToast } = useNivara();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredDepts = useMemo(() => {
    if (selectedDeptFilter === 'all') return departments || [];
    return (departments || []).filter((d) => d.code === selectedDeptFilter);
  }, [departments, selectedDeptFilter]);

  const institutionalPassPct = publishedResults?.departmentPassPct || 88.4;

  const academicMetrics = [
    {
      label: 'Institutional Pass Rate',
      value: `${institutionalPassPct}%`,
      subtext: 'Autumn 2026 Examination Board',
      state: 'success',
    },
    {
      label: 'Institution Mean CGPA',
      value: '8.34',
      subtext: 'Grading scale 10.0',
      state: 'neutral',
    },
    {
      label: 'First Class Distinction',
      value: '64.2%',
      subtext: 'CGPA ≥ 8.5 threshold',
      state: 'info',
    },
    {
      label: 'Subject Arrears Rate',
      value: `${(100 - institutionalPassPct).toFixed(1)}%`,
      subtext: 'Eligible for remedial supplementary',
      state: 'warning',
    },
  ];

  // Students requiring academic attention derived from real rules (backlogs > 0 or CGPA < 7.0)
  const studentsNeedingAttention = useMemo(() => {
    return (students || []).filter((st) => (st.backlogs || 0) > 0 || (st.cgpa || 8.0) < 7.0);
  }, [students]);

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Examination Board · Academic Standing Directorate"
        title="Institutional Academic Performance & Results"
        description="Verified continuous assessment outcomes, End-Semester valuation board pass statistics, and department grade distributions."
        actions={[
          <button
            key="export-academics"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Academic Standing Ledger exported (CSV) ✓', 'success')}
          >
            <Download size={13} /> Export Results Gazette
          </button>,
        ]}
      />

      {/* 2. Key Metrics */}
      <MetricStrip metrics={academicMetrics} />

      {/* 3. Department Performance Comparison */}
      <section>
        <SectionHeader
          title="Department-Wise Academic Benchmarks"
          subtitle="Continuous assessment and End-Semester valuation across engineering divisions"
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Academic Division',
              render: (d) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOD: {d.hod}</div>
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
              key: 'avgCgpa',
              label: 'Mean CGPA',
              align: 'right',
              render: (d) => <span style={{ fontWeight: 700 }}>{d.avgCgpa} / 10.0</span>,
            },
            {
              key: 'passRate',
              label: 'Pass Rate',
              align: 'right',
              render: (d) => {
                const rate = d.code === 'AIDS' ? 91.2 : d.code === 'CSE' ? 93.4 : d.code === 'ECE' ? 88.0 : d.code === 'MECH' ? 84.5 : 85.0;
                return (
                  <span style={{ fontWeight: 800, color: rate >= 85 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                    {rate}%
                  </span>
                );
              },
            },
            {
              key: 'distinction',
              label: 'Distinction Pct',
              align: 'right',
              render: (d) => {
                const dist = d.code === 'AIDS' ? '68%' : d.code === 'CSE' ? '72%' : d.code === 'ECE' ? '61%' : '54%';
                return <span style={{ fontWeight: 600 }}>{dist}</span>;
              },
            },
            {
              key: 'status',
              label: 'Board Status',
              render: () => <span className="badge badge-success">Moderated & Gazette Published</span>,
            },
          ]}
          data={filteredDepts}
          keyField="code"
        />
      </section>

      {/* 4. Grade Distribution Matrix */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Institutional Letter Grade Distribution"
          subtitle="Relative grade dispersion across all evaluated undergraduate candidates (Autonomous Scheme)"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginTop: '0.75rem' }}>
          {[
            { grade: 'Grade S', range: '90 – 100', count: '412 Students', pct: '28.5%', badge: 'badge-success' },
            { grade: 'Grade A', range: '80 – 89', count: '516 Students', pct: '35.7%', badge: 'badge-info' },
            { grade: 'Grade B', range: '70 – 79', count: '320 Students', pct: '22.1%', badge: 'badge-neutral' },
            { grade: 'Grade C', range: '60 – 69', count: '132 Students', pct: '9.1%', badge: 'badge-warning' },
            { grade: 'Grade U (Arrears)', range: '< 60', count: '66 Students', pct: '4.6%', badge: 'badge-urgent' },
          ].map((g) => (
            <div key={g.grade} style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{g.grade}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>Score: {g.range}</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{g.count}</div>
              <span className={`badge ${g.badge}`} style={{ marginTop: '0.4rem', fontSize: '0.6875rem' }}>
                {g.pct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Deterministic Attention Queue */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Students Requiring Academic Mentoring & Remedial Focus"
          subtitle="Identified deterministically by active course backlogs (>0) or published CGPA < 7.0"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
          {studentsNeedingAttention.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <CheckCircle2 size={24} color="var(--state-success)" style={{ margin: '0 auto 0.5rem' }} />
              All undergraduate students meet the institutional academic performance threshold.
            </div>
          ) : (
            studentsNeedingAttention.map((st) => (
              <div
                key={st.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--state-warning-bg)',
                  border: '1px solid var(--state-warning-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {st.name} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>({st.id})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {st.department || 'AI & Data Science'} · CGPA: <strong>{st.cgpa}</strong> · Active Backlogs: <strong>{st.backlogs || 0}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-warning">Remedial Tutorial Mandated</span>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Mentor: {st.advisor || 'Dr. Priya Raman'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
