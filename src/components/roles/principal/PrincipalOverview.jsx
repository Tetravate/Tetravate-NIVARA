import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  Zap,
  CreditCard,
  Briefcase,
  Layers,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalOverview({ onNavigate }) {
  const {
    departments,
    students,
    facultyMembers,
    feeStructures,
    placementDrives,
    publishedResults,
  } = useNivara();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('all');

  const filteredDepts = useMemo(() => {
    if (selectedDeptFilter === 'all') return departments || [];
    return (departments || []).filter((d) => d.code === selectedDeptFilter);
  }, [departments, selectedDeptFilter]);

  // Aggregate stats across selected departments
  const totalStudents = useMemo(() => {
    return filteredDepts.reduce((acc, d) => acc + (d.studentCount || 0), 0);
  }, [filteredDepts]);

  const totalFaculty = useMemo(() => {
    return filteredDepts.reduce((acc, d) => acc + (d.facultyCount || 0), 0);
  }, [filteredDepts]);

  const avgAttendance = useMemo(() => {
    if (filteredDepts.length === 0) return 85.0;
    const sum = filteredDepts.reduce((acc, d) => acc + (d.attendancePct || 0), 0);
    return Number((sum / filteredDepts.length).toFixed(1));
  }, [filteredDepts]);

  const avgCgpa = useMemo(() => {
    if (filteredDepts.length === 0) return 8.2;
    const sum = filteredDepts.reduce((acc, d) => acc + (d.avgCgpa || 0), 0);
    return Number((sum / filteredDepts.length).toFixed(2));
  }, [filteredDepts]);

  const avgPlacement = useMemo(() => {
    if (filteredDepts.length === 0) return 80;
    const sum = filteredDepts.reduce((acc, d) => acc + (d.placedPct || 0), 0);
    return Math.round(sum / filteredDepts.length);
  }, [filteredDepts]);

  // Total finances
  const totalBilled = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.totalBilled || 0), 0);
  }, [feeStructures]);

  const totalCollected = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.totalCollected || 0), 0);
  }, [feeStructures]);

  const realizationRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 87;

  const overviewMetrics = [
    {
      label: 'Institution Enrollment',
      value: totalStudents.toLocaleString(),
      subtext: `${filteredDepts.length} Engineering Branches`,
      state: 'neutral',
    },
    {
      label: 'Academic Staff Ratio',
      value: `1 : ${Math.round(totalStudents / (totalFaculty || 1))}`,
      subtext: `${totalFaculty} Instructional Faculty`,
      state: 'info',
    },
    {
      label: 'Attendance Benchmark',
      value: `${avgAttendance}%`,
      subtext: 'Mandatory 75% Statutory Cutoff',
      state: avgAttendance >= 80 ? 'success' : 'warning',
    },
    {
      label: 'Mean Grade Point',
      value: `${avgCgpa} / 10`,
      subtext: 'Autonomous Standard',
      state: 'neutral',
    },
    {
      label: 'Career Placements',
      value: `${avgPlacement}%`,
      subtext: 'Tier-1 & Core Recruiters',
      state: 'info',
    },
    {
      label: 'Tuition Fee Recovery',
      value: `${realizationRate}%`,
      subtext: `₹${(totalCollected / 10000000).toFixed(2)} Cr Realized`,
      state: 'success',
    },
  ];

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Strategic Governance · Academic Year 2026-2027"
        title="College Comprehensive Overview"
        description="Autonomous institutional standing, accredited engineering degree divisions, student-faculty ratios, and regulatory compliance benchmarks."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <Filter size={14} /> Scope Filters:
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="all">All Academic Departments (5 Divisions)</option>
            {(departments || []).map((d) => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>

          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="all">All Degree Programs (B.Tech & M.Tech)</option>
            <option value="btech">Undergraduate — B.Tech (4-Year)</option>
            <option value="mtech">Postgraduate — M.Tech (2-Year)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Accreditation: <strong>NBA Tier-1 Accredited · NAAC A++ (3.71 CGPA)</strong>
        </div>
      </div>

      {/* 3. Metric Strip */}
      <MetricStrip metrics={overviewMetrics} />

      {/* 4. Division Breakdown Table */}
      <section>
        <SectionHeader
          title="Constituent Engineering Divisions"
          subtitle="Real-time division audit across active enrollment, faculty strength, and attendance health"
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
              render: (d) => <span className="badge badge-neutral">{d.code}</span>,
            },
            {
              key: 'studentCount',
              label: 'Enrollment',
              align: 'right',
              render: (d) => `${d.studentCount} Students`,
            },
            {
              key: 'facultyCount',
              label: 'Faculty',
              align: 'right',
              render: (d) => `${d.facultyCount} Staff`,
            },
            {
              key: 'ratio',
              label: 'F-S Ratio',
              align: 'right',
              render: (d) => `1:${Math.round(d.studentCount / (d.facultyCount || 1))}`,
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
              key: 'avgCgpa',
              label: 'Mean CGPA',
              align: 'right',
              render: (d) => <span style={{ fontWeight: 600 }}>{d.avgCgpa}</span>,
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
          ]}
          data={filteredDepts}
          keyField="code"
        />
      </section>

      {/* 5. Institutional Accreditation and Governance Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Award size={16} color="var(--brand-primary)" />
            <strong style={{ fontSize: '0.875rem' }}>Autonomous Governance & Curricular Framework</strong>
          </div>
          <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Operating under UGC Autonomy Regulation 2023 with Outcome-Based Education (OBE) curriculum aligned to Washington Accord standards. Semester credit audit cycles conducted bi-annually.
          </p>
        </div>

        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--state-success)" />
            <strong style={{ fontSize: '0.875rem' }}>Central Examination Cell Moderation Status</strong>
          </div>
          <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            End-Semester valuation board completed for Autumn Term. Continuous Internal Assessment (CIA) 100% synchronized across all departments with zero pending tabulations.
          </p>
        </div>

        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Briefcase size={16} color="var(--brand-blue)" />
            <strong style={{ fontSize: '0.875rem' }}>Career Development & Corporate Engagement</strong>
          </div>
          <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {(placementDrives || []).length} Tier-1 corporate drives conducted to date. Campus hiring conversion is pacing at {avgPlacement}% toward the institutional milestone of 85%.
          </p>
        </div>
      </div>
    </div>
  );
}
