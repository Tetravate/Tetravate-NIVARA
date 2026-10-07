import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
} from 'lucide-react';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../workspace';

export default function PlacementDashboard() {
  const {
    activeTab,
    setActiveTab,
    placementDrives,
    studentPlacementApplications,
    createPlacementDrive,
    advancePlacementCandidate,
    showToast,
  } = useNivara();

  const currentTab = activeTab === 'applications' ? 'applications' : activeTab === 'stats' ? 'stats' : 'home';

  const [showNewDriveModal, setShowNewDriveModal] = useState(false);
  const [appSearch, setAppSearch] = useState('');
  const [driveSearch, setDriveSearch] = useState('');

  // Form state for creating new placement drive
  const [driveForm, setDriveForm] = useState({
    company: '',
    role: '',
    packageLpa: '',
    minCgpa: '7.5',
    location: '',
    deadline: '',
    description: '',
  });

  const handleCreateDriveSubmit = (e) => {
    e.preventDefault();
    if (!driveForm.company || !driveForm.role || !driveForm.packageLpa) {
      showToast('Please fill in company name, role, and compensation package', 'warning');
      return;
    }

    createPlacementDrive({
      company: driveForm.company,
      role: driveForm.role,
      packageLpa: driveForm.packageLpa.endsWith('LPA') ? driveForm.packageLpa : `${driveForm.packageLpa} LPA`,
      minCgpa: parseFloat(driveForm.minCgpa) || 7.0,
      location: driveForm.location || 'Bengaluru, Tech Park',
      deadline: driveForm.deadline || '2026-11-15',
      description: driveForm.description || 'Core engineering recruitment drive with accelerated onboarding.',
    });

    setShowNewDriveModal(false);
    setDriveForm({
      company: '',
      role: '',
      packageLpa: '',
      minCgpa: '7.5',
      location: '',
      deadline: '',
      description: '',
    });
  };

  const PIPELINE_STAGES = [
    'Application Received & Screening',
    'Shortlisted for Online Assessment',
    'Technical Interview (Round 1)',
    'Technical Interview (Round 2)',
    'Final HR Evaluation',
    'Offer Extended (Selected)',
    'Application Not Selected',
  ];

  const filteredDrives = placementDrives.filter((d) =>
    d.company.toLowerCase().includes(driveSearch.toLowerCase()) ||
    d.role.toLowerCase().includes(driveSearch.toLowerCase())
  );

  const filteredApps = studentPlacementApplications.filter((a) =>
    a.company.toLowerCase().includes(appSearch.toLowerCase()) ||
    (a.studentName || '').toLowerCase().includes(appSearch.toLowerCase()) ||
    a.stage.toLowerCase().includes(appSearch.toLowerCase())
  );

  // Computed metrics
  const totalOffers = studentPlacementApplications.filter(
    (a) => a.stage.toLowerCase().includes('offer') || a.stage.toLowerCase().includes('selected')
  ).length;

  const placementMetrics = [
    {
      label: 'Open Drives',
      value: `${placementDrives.length} Companies`,
      subtext: 'Tier-1 & Super Dream',
      state: 'info',
    },
    {
      label: 'Active Candidates',
      value: `${studentPlacementApplications.length} Applicants`,
      subtext: 'In review & interviews',
      state: 'neutral',
    },
    {
      label: 'Offers Dispatched',
      value: `${418 + totalOffers} Offers`,
      subtext: 'Highest: 34 LPA (DeepMind)',
      state: 'success',
    },
    {
      label: 'Placement Conversion',
      value: '74.2%',
      subtext: 'Target: 85% by December',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Placement Officer Persona) */}
      <PageHeader
        eyebrow="Career Development Center · Corporate Relations Office"
        title="Campus Recruitment & Placement Pipeline"
        description="Coordinate industry hiring drives, configure CGPA eligibility benchmarks, and track candidate interview pipelines."
        actions={[
          <button
            key="new-drive"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewDriveModal(true)}
          >
            <Plus size={13} /> Post New Drive
          </button>,
        ]}
      />

      {/* 2. Key Recruitment Metrics */}
      <MetricStrip metrics={placementMetrics} />

      {/* VIEW: ACTIVE PLACEMENT DRIVES (Default on home or related modules) */}
      {(!['applications', 'interviews', 'offers', 'stats', 'reports'].includes(currentTab)) && (
        <section>
          <SectionHeader
            title="Corporate Recruitment Opportunities"
            subtitle="Campus recruitment drives open for undergraduate applications"
            action={
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter drives..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
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
            }
          />

          <DataTable
            columns={[
              {
                key: 'company',
                label: 'Company & Role',
                render: (drive) => (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{drive.company}</strong>
                      <span className="badge badge-info">{drive.packageLpa}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {drive.role} · {drive.location}
                    </div>
                  </div>
                ),
              },
              {
                key: 'minCgpa',
                label: 'Benchmark',
                width: '110px',
                render: (drive) => <span className="badge badge-neutral">Min {drive.minCgpa} CGPA</span>,
              },
              {
                key: 'eligibleCount',
                label: 'Eligible',
                align: 'right',
                render: (drive) => `${drive.eligibleCount}`,
              },
              {
                key: 'appliedCount',
                label: 'Applied',
                align: 'right',
                render: (drive) => <span style={{ fontWeight: 700 }}>{drive.appliedCount}</span>,
              },
              {
                key: 'deadline',
                label: 'Deadline',
                render: (drive) => drive.deadline,
              },
              {
                key: 'actions',
                label: 'Action',
                align: 'right',
                width: '150px',
                render: (drive) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('applications')}
                  >
                    View Applicants ({drive.appliedCount})
                  </button>
                ),
              },
            ]}
            data={filteredDrives}
            keyField="id"
          />
        </section>
      )}

      {/* VIEW: STUDENT APPLICATIONS PIPELINE */}
      {(currentTab === 'applications' || currentTab === 'interviews' || currentTab === 'offers') && (
        <section>
          <SectionHeader
            title="Candidate Screening & Interview Stages"
            subtitle="Pipeline progression automatically updates student notifications and offer letters"
            action={
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter candidate or company..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
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
            }
          />

          <DataTable
            columns={[
              {
                key: 'studentName',
                label: 'Candidate',
                render: (app) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {app.studentName || 'Aadhi Narayanan'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Applied {app.appliedAt}
                    </div>
                  </div>
                ),
              },
              {
                key: 'company',
                label: 'Target Drive',
                render: (app) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{app.company}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.role}</div>
                  </div>
                ),
              },
              {
                key: 'stage',
                label: 'Pipeline Stage',
                render: (app) => {
                  const isOffer = app.stage.toLowerCase().includes('offer') || app.stage.toLowerCase().includes('selected');
                  const isRejected = app.stage.toLowerCase().includes('reject');
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
                width: '320px',
                render: (app) => {
                  const isOffer = app.stage.toLowerCase().includes('offer') || app.stage.toLowerCase().includes('selected');
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <select
                        value={app.stage}
                        onChange={(e) => advancePlacementCandidate(app.driveId, app.studentId, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-subtle)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          maxWidth: '160px',
                        }}
                        aria-label="Update candidate stage"
                      >
                        {PIPELINE_STAGES.map((stg) => (
                          <option key={stg} value={stg}>
                            {stg}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => advancePlacementCandidate(app.driveId, app.studentId, 'Technical Interview (Round 1)')}
                        disabled={app.stage.includes('Technical')}
                      >
                        Interview
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
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
          />
        </section>
      )}

      {/* VIEW: METRICS */}
      {(currentTab === 'stats' || currentTab === 'reports') && (
        <section>
          <SectionHeader
            title="Class of 2026 Campus Placement Analytics"
            subtitle="Executive recruitment statistics synchronized across HOD and Principal"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.75rem',
          }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Open Drives</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{placementDrives.length} Drives</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Tier-1 & Super Dream</div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Candidates</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-blue)', margin: '0.2rem 0' }}>{studentPlacementApplications.length} Applicants</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>In review pipelines</div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Offers Dispatched</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--state-success)', margin: '0.2rem 0' }}>{418 + totalOffers} Offers</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--state-success)' }}>Highest: 34 LPA (DeepMind)</div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Overall Placement Rate</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--state-success)', margin: '0.2rem 0' }}>74.2%</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Target: 85% by December</div>
            </div>
          </div>
        </section>
      )}

      {/* POST NEW DRIVE MODAL */}
      {showNewDriveModal && (
        <div className="modal-backdrop" onClick={() => setShowNewDriveModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Post Placement Drive
                </h3>
              </div>
              <button type="button" onClick={() => setShowNewDriveModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDriveSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google Cloud"
                  value={driveForm.company}
                  onChange={(e) => setDriveForm({ ...driveForm, company: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Designation / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. SDE-1 (Systems)"
                    value={driveForm.role}
                    onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Compensation (LPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 LPA"
                    value={driveForm.packageLpa}
                    onChange={(e) => setDriveForm({ ...driveForm, packageLpa: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Minimum CGPA Benchmark</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Application Deadline</label>
                  <input
                    type="date"
                    value={driveForm.deadline}
                    onChange={(e) => setDriveForm({ ...driveForm, deadline: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Office Location</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad / Bengaluru"
                  value={driveForm.location}
                  onChange={(e) => setDriveForm({ ...driveForm, location: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Description / Eligibility Notes</label>
                <textarea
                  rows="3"
                  placeholder="Eligibility criteria, technical screening rounds, and job requirements..."
                  value={driveForm.description}
                  onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewDriveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
