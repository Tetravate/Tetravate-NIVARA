import React, { useMemo } from 'react';
import {
  Briefcase,
  Building,
  Users,
  Award,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalPlacements() {
  const { placementDrives, departments, showToast } = useNivara();

  const totalDrives = (placementDrives || []).length;
  const totalOffers = (placementDrives || []).reduce((acc, d) => acc + (d.selectedCount || 0), 0);
  const totalApplications = (placementDrives || []).reduce((acc, d) => acc + (d.appliedCount || 0), 0);

  const avgPlacedPct = useMemo(() => {
    if (!departments || departments.length === 0) return 82;
    const sum = departments.reduce((acc, d) => acc + (d.placedPct || 0), 0);
    return Math.round(sum / departments.length);
  }, [departments]);

  const placementMetrics = [
    {
      label: 'Campus Conversion Rate',
      value: `${avgPlacedPct}%`,
      subtext: 'Institutional Target 85.0%',
      state: 'info',
    },
    {
      label: 'Corporate Offers Released',
      value: `${totalOffers} Offers`,
      subtext: 'Tier-1 & Core Industry Partners',
      state: 'success',
    },
    {
      label: 'Active Recruitment Drives',
      value: `${totalDrives} Companies`,
      subtext: 'Autumn 2026 Placement Season',
      state: 'neutral',
    },
    {
      label: 'Candidate Applications',
      value: `${totalApplications} Submissions`,
      subtext: 'CDC Verified Eligibility',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Career Development Center · Corporate Relations"
        title="Institutional Placement Radar & Industry Partners"
        description="Executive monitoring of corporate campus recruitment drives, branch conversion milestones, and salary compensation packages."
        actions={[
          <button
            key="export-placement"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Annual Institutional Placement Report exported ✓', 'success')}
          >
            <Download size={13} /> Export Placement Dossier
          </button>,
        ]}
      />

      {/* 2. Metrics */}
      <MetricStrip metrics={placementMetrics} />

      {/* 3. Branch-Wise Placement Comparison */}
      <section>
        <SectionHeader
          title="Department-Wise Placement Conversion Rates"
          subtitle="Real-time placement milestones tracked by Career Development Center"
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Academic Branch',
              render: (d) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {d.code}</div>
                </div>
              ),
            },
            {
              key: 'studentCount',
              label: 'Final-Year Batch',
              align: 'right',
              render: (d) => `${d.studentCount} Students`,
            },
            {
              key: 'placedPct',
              label: 'Placement Conversion',
              align: 'right',
              render: (d) => (
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--brand-primary)' }}>
                  {d.placedPct}%
                </span>
              ),
            },
            {
              key: 'progress',
              label: 'Target Benchmark (85%)',
              render: (d) => {
                const pct = Math.min(d.placedPct, 100);
                return (
                  <div style={{ width: '140px' }}>
                    <div className="progress-track" style={{ height: '6px' }}>
                      <div className="progress-fill progress-fill-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'status',
              label: 'CDC Status',
              render: (d) => (
                <span className={`badge ${d.placedPct >= 80 ? 'badge-success' : 'badge-neutral'}`}>
                  {d.placedPct >= 80 ? 'Target Achieved' : 'Active Sourcing'}
                </span>
              ),
            },
          ]}
          data={departments || []}
          keyField="code"
        />
      </section>

      {/* 4. Active Placement Drives Table */}
      <section>
        <SectionHeader
          title="Active Corporate Recruitment Drives"
          subtitle="Autonomous campus recruitment pipelines managed by Placement Directorate"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {(placementDrives || []).map((d) => (
            <div
              key={d.id}
              style={{
                padding: '1.15rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.85rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{d.company}</strong>
                  <span className="badge badge-info">{d.packageLpa}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {d.role} · {d.location} · Registration Deadline: <strong>{d.deadline}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {d.appliedCount} Candidates Screened
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, marginTop: '0.15rem' }}>
                  {d.selectedCount} Offers Released
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
