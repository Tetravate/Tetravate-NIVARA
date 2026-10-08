import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  User,
  ArrowRight,
  Calendar,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementApplications({ onNavigate }) {
  const {
    studentPlacementApplications,
    placementDrives,
    students,
    advancePlacementCandidate,
    showToast,
  } = useNivara();

  const [search, setSearch] = useState('');
  const [driveFilter, setDriveFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const PIPELINE_STAGES = [
    'Application Received & Screening',
    'Shortlisted for Online Assessment',
    'Technical Interview (Round 1)',
    'Technical Interview (Round 2)',
    'Final HR Evaluation',
    'Offer Extended (Selected)',
    'Placed',
    'Application Not Selected',
  ];

  // Join application data with student academic profiles
  const enrichedApplications = useMemo(() => {
    return (studentPlacementApplications || []).map((app) => {
      const student = (students || []).find(
        (s) => s.id === app.studentId || s.name === app.studentName
      ) || {};
      const drive = (placementDrives || []).find((d) => d.id === app.driveId) || {};

      return {
        ...app,
        studentCgpa: student.cgpa || 8.0,
        studentBacklogs: student.backlogs || 0,
        studentDept: student.department || student.deptCode || 'AIDS',
        studentRollNo: student.rollNo || '22AIDS042',
        drivePackage: drive.packageLpa || app.packageLpa || '20+ LPA',
        driveRole: drive.role || app.role,
      };
    });
  }, [studentPlacementApplications, students, placementDrives]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return enrichedApplications.filter((app) => {
      const matchesSearch =
        (app.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.company || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.studentRollNo || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.role || '').toLowerCase().includes(search.toLowerCase());

      const matchesDrive =
        driveFilter === 'all'
          ? true
          : app.driveId === driveFilter || app.company === driveFilter;

      const matchesStage =
        stageFilter === 'all'
          ? true
          : app.stage?.toLowerCase() === stageFilter.toLowerCase();

      const matchesDept =
        deptFilter === 'all'
          ? true
          : (app.studentDept || '').toLowerCase().includes(deptFilter.toLowerCase());

      return matchesSearch && matchesDrive && matchesStage && matchesDept;
    });
  }, [enrichedApplications, search, driveFilter, stageFilter, deptFilter]);

  // Metrics
  const totalApps = enrichedApplications.length;
  const inScreening = enrichedApplications.filter((a) =>
    a.stage?.toLowerCase().includes('screening') || a.stage?.toLowerCase().includes('received')
  ).length;
  const inInterviews = enrichedApplications.filter((a) =>
    a.stage?.toLowerCase().includes('interview') || a.stage?.toLowerCase().includes('assessment')
  ).length;
  const offersCount = enrichedApplications.filter((a) =>
    a.stage?.toLowerCase().includes('offer') ||
    a.stage?.toLowerCase().includes('selected') ||
    a.stage?.toLowerCase().includes('placed')
  ).length;

  const metrics = [
    {
      label: 'Total Candidate Submissions',
      value: `${totalApps} Applications`,
      subtext: 'Cumulative student applications',
      state: 'info',
    },
    {
      label: 'Initial Screening Pool',
      value: `${inScreening} Applications`,
      subtext: 'Pending profile & CGPA triage',
      state: inScreening > 0 ? 'urgent' : 'neutral',
    },
    {
      label: 'Active Evaluation Rounds',
      value: `${inInterviews} Candidates`,
      subtext: 'Assessments and interview stages',
      state: 'neutral',
    },
    {
      label: 'Extended Offers',
      value: `${offersCount} Selected`,
      subtext: 'Advanced to formal offer stage',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Candidate Pipelines"
        title="Student Placement Applications & Screening"
        description="Review candidate applications submitted via the 1-click student portal, verify academic eligibility, manage pipeline stages from online assessment through final corporate offers."
        actions={[
          <button
            key="schedule-round"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('interviews')}
          >
            <Calendar size={13} /> Selection Schedules
          </button>,
        ]}
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={metrics} />

      {/* 3. Applications Table */}
      <section>
        <SectionHeader
          title="Candidate Recruitment Pipeline"
          subtitle="Stage progression directly updates student notifications and interview schedule access"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter candidate, roll no, drive..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem 0.25rem 1.65rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    width: '100%',
                  }}
                />
              </div>

              <select
                value={driveFilter}
                onChange={(e) => setDriveFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter by target drive"
              >
                <option value="all">All Drives</option>
                {(placementDrives || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.company}
                  </option>
                ))}
              </select>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter by stage"
              >
                <option value="all">All Stages</option>
                {PIPELINE_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'studentName',
              label: 'Candidate & Academic Profile',
              render: (app) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {app.studentName}
                    </strong>
                    <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                      {app.studentRollNo}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {app.studentDept} · CGPA: <strong style={{ color: 'var(--text-primary)' }}>{app.studentCgpa}</strong> · Backlogs: {app.studentBacklogs}
                  </div>
                </div>
              ),
            },
            {
              key: 'company',
              label: 'Target Recruitment Drive',
              render: (app) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.8125rem' }}>{app.company}</strong>
                    <span className="badge badge-info">{app.drivePackage}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {app.role || app.driveRole} · Applied {app.appliedAt}
                  </div>
                </div>
              ),
            },
            {
              key: 'stage',
              label: 'Current Pipeline Stage',
              width: '180px',
              render: (app) => {
                const isOffer = app.stage?.toLowerCase().includes('offer') || app.stage?.toLowerCase().includes('selected') || app.stage?.toLowerCase().includes('placed');
                const isRejected = app.stage?.toLowerCase().includes('reject') || app.stage?.toLowerCase().includes('not selected');
                return (
                  <span className={`badge ${isOffer ? 'badge-success' : isRejected ? 'badge-urgent' : 'badge-info'}`}>
                    {app.stage}
                  </span>
                );
              },
            },
            {
              key: 'actions',
              label: 'Stage Progression Action',
              align: 'right',
              width: '310px',
              render: (app) => {
                const isOffer = app.stage?.toLowerCase().includes('offer') || app.stage?.toLowerCase().includes('selected') || app.stage?.toLowerCase().includes('placed');
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <select
                      value={app.stage}
                      onChange={(e) => advancePlacementCandidate(app.driveId, app.studentId, e.target.value)}
                      style={{
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.71875rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-canvas)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        maxWidth: '150px',
                      }}
                      aria-label="Update candidate stage dropdown"
                    >
                      {PIPELINE_STAGES.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.71875rem' }}
                      onClick={() => advancePlacementCandidate(app.driveId, app.studentId, 'Technical Interview (Round 1)')}
                      disabled={app.stage?.includes('Technical Interview')}
                    >
                      Interview
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.71875rem' }}
                      onClick={() => advancePlacementCandidate(app.driveId, app.studentId, 'Offer Extended (Selected)')}
                      disabled={isOffer}
                    >
                      Offer
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={filteredApps}
          keyField="driveId"
          emptyMessage="No applications currently match the active filters."
        />
      </section>
    </div>
  );
}
