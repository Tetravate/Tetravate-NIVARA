import React, { useState, useMemo } from 'react';
import {
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  BookOpen,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalAttendance() {
  const { departments, coursesAttendance, students, showToast } = useNivara();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const filteredDepts = useMemo(() => {
    if (selectedDeptFilter === 'all') return departments || [];
    return (departments || []).filter((d) => d.code === selectedDeptFilter);
  }, [departments, selectedDeptFilter]);

  const overallAttendance = useMemo(() => {
    if (!departments || departments.length === 0) return 85.0;
    const sum = departments.reduce((acc, d) => acc + (d.attendancePct || 0), 0);
    return Number((sum / departments.length).toFixed(1));
  }, [departments]);

  // Defaulters list across departments (< 75%)
  const defaultersList = useMemo(() => {
    return (students || []).filter((st) => (st.attendancePct || 85) < 75);
  }, [students]);

  const attendanceMetrics = [
    {
      label: 'Institution Attendance',
      value: `${overallAttendance}%`,
      subtext: 'Mandatory statutory cutoff 75.0%',
      state: overallAttendance >= 80 ? 'success' : 'warning',
    },
    {
      label: 'Autonomous Compliance',
      value: '93.2%',
      subtext: 'Students meeting 75% threshold',
      state: 'success',
    },
    {
      label: 'Condonation Defaulters',
      value: `${defaultersList.length} Students`,
      subtext: 'Below 75% attendance threshold',
      state: defaultersList.length > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Class Sessions Tracked',
      value: '240 Sessions',
      subtext: 'Autumn 2026 roll call logs',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Academic Registry · Biometric & Roll Call Oversight"
        title="College Attendance Analytics & Regulatory Standing"
        description="Synchronized attendance analytics aggregated directly from instructional faculty roll calls across all engineering departments."
        actions={[
          <button
            key="export-attendance"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Institution Attendance Condonation Ledger exported (CSV) ✓', 'success')}
          >
            <Download size={13} /> Export Condonation Docket
          </button>,
        ]}
      />

      {/* 2. Metrics */}
      <MetricStrip metrics={attendanceMetrics} />

      {/* 3. Department Attendance Table */}
      <section>
        <SectionHeader
          title="Department Attendance Comparison"
          subtitle="Real-time roll call aggregations across engineering divisions"
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
              key: 'attendancePct',
              label: 'Attendance Rate',
              align: 'right',
              render: (d) => (
                <span style={{ fontWeight: 800, fontSize: '1rem', color: d.attendancePct >= 85 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                  {d.attendancePct}%
                </span>
              ),
            },
            {
              key: 'compliance',
              label: 'Statutory Standing',
              render: (d) => (
                <span className={`badge ${d.attendancePct >= 80 ? 'badge-success' : 'badge-warning'}`}>
                  {d.attendancePct >= 80 ? 'Fully Compliant' : 'Requires Academic Advisory'}
                </span>
              ),
            },
            {
              key: 'atRiskCount',
              label: 'Defaulters (&lt;75%)',
              align: 'right',
              render: (d) => (
                <span className={`badge ${d.atRiskCount > 10 ? 'badge-urgent' : 'badge-neutral'}`}>
                  {d.atRiskCount} Students
                </span>
              ),
            },
          ]}
          data={filteredDepts}
          keyField="code"
        />
      </section>

      {/* 4. Active Course Roll Calls */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Sample Subject Roll Call Log (Live Faculty Synchronizations)"
          subtitle="Real-time session attendance recorded by core teaching professors"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', marginTop: '0.75rem' }}>
          {(coursesAttendance || []).map((c) => (
            <div
              key={c.code}
              style={{
                padding: '1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>{c.code}</span>
                <span style={{ fontWeight: 800, color: c.percentage >= 80 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                  {c.percentage}%
                </span>
              </div>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.name}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Faculty: <strong>{c.faculty}</strong> · {c.attended} of {c.total} sessions conducted
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Institutional Condonation Defaulter List */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Students Falling Below the Mandatory 75% Attendance Norm"
          subtitle="Condonation review required by Academic Regulations prior to End-Semester Hall Ticket generation"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
          {defaultersList.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <CheckCircle2 size={24} color="var(--state-success)" style={{ margin: '0 auto 0.5rem' }} />
              Zero students currently below the 75% mandatory cutoff threshold.
            </div>
          ) : (
            defaultersList.map((st) => (
              <div
                key={st.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--state-urgent-bg)',
                  border: '1px solid var(--state-urgent-border)',
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
                    {st.department || 'B.Tech AI & Data Science'} · Section: {st.section || 'A'} · Mentor: {st.advisor || 'Dr. Priya Raman'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-urgent" style={{ fontWeight: 800 }}>
                    {st.attendancePct}% Attendance
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Condonation Petition Pending
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
