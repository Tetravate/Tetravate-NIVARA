import React, { useMemo } from 'react';
import {
  Briefcase,
  Users,
  Calendar,
  Award,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Building,
  CheckCircle2,
  ChevronRight,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function PlacementHome({ onNavigate }) {
  const {
    placementDrives,
    studentPlacementApplications,
    companies,
    placementInterviews,
    placementOffers,
    students,
    auditLogs,
  } = useNivara();

  // 1. Calculated Metrics from Genuine Data
  const activeDrives = useMemo(
    () => (placementDrives || []).filter((d) => d.status === 'active' || !d.status),
    [placementDrives]
  );

  const eligibleCandidatesCount = useMemo(() => {
    // Distinct students meeting benchmark for at least one active drive
    const minBenchmark = Math.min(
      ...(placementDrives || []).map((d) => d.minCgpa || 7.0),
      7.0
    );
    return (students || []).filter(
      (s) => (s.cgpa || 0) >= minBenchmark && (s.backlogs || 0) === 0
    ).length;
  }, [students, placementDrives]);

  const candidatesInProcess = useMemo(() => {
    return (studentPlacementApplications || []).filter(
      (a) =>
        !a.stage?.toLowerCase().includes('offer') &&
        !a.stage?.toLowerCase().includes('reject') &&
        !a.stage?.toLowerCase().includes('placed')
    ).length;
  }, [studentPlacementApplications]);

  const scheduledInterviewsCount = useMemo(() => {
    return (placementInterviews || []).filter((i) => i.status === 'scheduled').length;
  }, [placementInterviews]);

  const placedStudentsCount = useMemo(() => {
    return (placementOffers || []).filter(
      (o) => o.placementStatus === 'placed' || o.offerStatus === 'accepted'
    ).length;
  }, [placementOffers]);

  const placementMetrics = [
    {
      label: 'Active Recruitment Drives',
      value: `${activeDrives.length} Drives`,
      subtext: `${(placementDrives || []).length} total on record`,
      state: 'info',
    },
    {
      label: 'Eligible Candidate Pool',
      value: `${eligibleCandidatesCount} Students`,
      subtext: 'Meets CGPA benchmark with 0 backlogs',
      state: 'neutral',
    },
    {
      label: 'Active Pipeline Applicants',
      value: `${studentPlacementApplications.length} Candidates`,
      subtext: `${candidatesInProcess} currently in review/rounds`,
      state: 'neutral',
    },
    {
      label: 'Assessments & Interviews',
      value: `${scheduledInterviewsCount} Scheduled`,
      subtext: `${(placementInterviews || []).length} total rounds tracked`,
      state: 'info',
    },
    {
      label: 'Corporate Offers',
      value: `${(placementOffers || []).length} Extended`,
      subtext: `${placedStudentsCount} accepted & confirmed placed`,
      state: 'success',
    },
  ];

  // 2. Needs Attention items from actual system state
  const needsAttentionItems = useMemo(() => {
    const items = [];

    // Pending applications needing stage screening
    const pendingScreening = (studentPlacementApplications || []).filter(
      (a) => a.stage === 'Application Received & Screening'
    );
    if (pendingScreening.length > 0) {
      items.push({
        id: 'screening',
        type: 'warning',
        title: `${pendingScreening.length} Applications Awaiting Initial Screening`,
        desc: `Candidates have applied and are waiting to be shortlisted or scheduled for initial assessments.`,
        actionLabel: 'Screen Applications',
        actionTab: 'applications',
      });
    }

    // Scheduled interviews awaiting feedback or outcome
    const pendingInterviews = (placementInterviews || []).filter(
      (i) => i.status === 'scheduled'
    );
    if (pendingInterviews.length > 0) {
      items.push({
        id: 'interviews',
        type: 'info',
        title: `${pendingInterviews.length} Scheduled Selection Rounds / Interviews`,
        desc: `Upcoming candidate evaluations requiring attendance and outcome recording.`,
        actionLabel: 'Review Schedule',
        actionTab: 'interviews',
      });
    }

    // Offers awaiting candidate acceptance
    const pendingOffers = (placementOffers || []).filter(
      (o) => o.offerStatus === 'extended' || o.placementStatus === 'pending_acceptance'
    );
    if (pendingOffers.length > 0) {
      items.push({
        id: 'offers',
        type: 'important',
        title: `${pendingOffers.length} Offers Pending Candidate Confirmation`,
        desc: `Corporate offer letters extended; awaiting official acceptance from candidates.`,
        actionLabel: 'View Offers',
        actionTab: 'offers',
      });
    }

    // Drives closing soon
    const openDrives = (placementDrives || []).filter((d) => d.status === 'active');
    if (openDrives.length > 0) {
      items.push({
        id: 'drives',
        type: 'neutral',
        title: `${openDrives.length} Open Campus Drives Accepting Submissions`,
        desc: `Active corporate recruitment drives open for student registrations.`,
        actionLabel: 'Manage Drives',
        actionTab: 'drives',
      });
    }

    return items;
  }, [studentPlacementApplications, placementInterviews, placementOffers, placementDrives]);

  // Recent placement audit activity
  const recentPlacementActivity = useMemo(() => {
    return (auditLogs || [])
      .filter(
        (log) =>
          log.actorRole?.toLowerCase().includes('placement') ||
          log.details?.toLowerCase().includes('placement') ||
          log.action?.toLowerCase().includes('drive') ||
          log.action?.toLowerCase().includes('candidate') ||
          log.action?.toLowerCase().includes('interview') ||
          log.action?.toLowerCase().includes('offer')
      )
      .slice(0, 5);
  }, [auditLogs]);

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Corporate Relations Office"
        title="Placement Operations & Recruitment Radar"
        description="Operational recruitment workspace for tracking industry partners, candidate screening pipelines, assessment schedules, and verified institutional offers."
        actions={[
          <button
            key="post-drive"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('drives')}
          >
            <Plus size={13} /> Manage Drives
          </button>,
          <button
            key="view-pipeline"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('applications')}
          >
            <Users size={13} /> Candidate Pipeline
          </button>,
        ]}
      />

      {/* 2. Key Recruitment Metrics */}
      <MetricStrip metrics={placementMetrics} />

      {/* 3. Operational "Needs Attention" Section (Only Genuine Data) */}
      <section>
        <SectionHeader
          title="Recruitment Needs Attention"
          subtitle="Operational items derived directly from active candidate stages and drives"
        />

        {needsAttentionItems.length === 0 ? (
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            ✓ No urgent blockers. All candidates and drives are fully up to date.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {needsAttentionItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem 1.15rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                    <AlertCircle size={14} color="var(--brand-blue)" />
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.title}
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {item.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => onNavigate && onNavigate(item.actionTab)}
                  >
                    {item.actionLabel} <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Active Placement Drives Table */}
      <section>
        <SectionHeader
          title="Active Corporate Hiring Drives"
          subtitle="Campus drives accepting or processing student applications"
          action={
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate && onNavigate('drives')}
            >
              View All Drives ({placementDrives.length}) <ChevronRight size={13} />
            </button>
          }
        />

        <DataTable
          columns={[
            {
              key: 'company',
              label: 'Company & Role',
              render: (d) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{d.company}</strong>
                    <span className="badge badge-info">{d.packageLpa}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {d.role} · {d.location}
                  </div>
                </div>
              ),
            },
            {
              key: 'minCgpa',
              label: 'Benchmark',
              width: '120px',
              render: (d) => <span className="badge badge-neutral">Min {d.minCgpa} CGPA</span>,
            },
            {
              key: 'appliedCount',
              label: 'Applied',
              align: 'right',
              width: '90px',
              render: (d) => <strong style={{ color: 'var(--text-primary)' }}>{d.appliedCount || 0}</strong>,
            },
            {
              key: 'selectedCount',
              label: 'Offers',
              align: 'right',
              width: '90px',
              render: (d) => <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{d.selectedCount || 0}</span>,
            },
            {
              key: 'deadline',
              label: 'Deadline',
              width: '120px',
              render: (d) => d.deadline,
            },
            {
              key: 'actions',
              label: 'Action',
              align: 'right',
              width: '130px',
              render: () => (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate && onNavigate('applications')}
                >
                  Applicants
                </button>
              ),
            },
          ]}
          data={activeDrives}
          keyField="id"
          emptyMessage="No active drives currently scheduled."
        />
      </section>

      {/* 5. Two-column Layout: Active Pipeline Snapshot & Recent Placement Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        {/* Left: Application Pipeline Snapshot */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Candidate Pipeline Snapshot
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Latest applicant progression stages
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate && onNavigate('applications')}
            >
              All ({studentPlacementApplications.length})
            </button>
          </div>

          {(studentPlacementApplications || []).length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No candidate applications registered yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(studentPlacementApplications || []).slice(0, 4).map((app, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {app.studentName}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {app.company} · {app.role}
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                    {app.stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Recent Placement Audit Activity */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Recent Placement Operations Log
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Audited timeline of drives, schedules, and stages
              </p>
            </div>
            <Activity size={15} color="var(--text-muted)" />
          </div>

          {recentPlacementActivity.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No recent placement actions logged.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentPlacementActivity.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
