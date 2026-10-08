import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  Award,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementStudents({ onNavigate }) {
  const {
    students,
    studentPlacementApplications,
    placementInterviews,
    placementOffers,
    placementDrives,
  } = useNivara();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cgpaCutoff, setCgpaCutoff] = useState('all');
  const [selectedStudentDossier, setSelectedStudentDossier] = useState(null);

  // Enrich each student with their placement dossier
  const studentsWithPlacement = useMemo(() => {
    return (students || []).map((student) => {
      const studentApps = (studentPlacementApplications || []).filter(
        (a) => a.studentId === student.id || a.studentName === student.name
      );

      const studentInterviews = (placementInterviews || []).filter(
        (i) => i.studentId === student.id || i.studentName === student.name
      );

      const studentOffers = (placementOffers || []).filter(
        (o) => o.studentId === student.id || o.studentName === student.name
      );

      const isPlaced = studentOffers.some(
        (o) => o.placementStatus === 'placed' || o.offerStatus === 'accepted'
      );

      const hasActiveOffers = studentOffers.length > 0;
      const inProcess = studentApps.some(
        (a) =>
          !a.stage?.toLowerCase().includes('reject') &&
          !a.stage?.toLowerCase().includes('not selected') &&
          !a.stage?.toLowerCase().includes('placed')
      );

      let placementStatus = 'unplaced';
      if (isPlaced) {
        placementStatus = 'placed';
      } else if (hasActiveOffers) {
        placementStatus = 'offered';
      } else if (inProcess) {
        placementStatus = 'in_process';
      } else if (studentApps.length > 0) {
        placementStatus = 'applied';
      }

      return {
        ...student,
        applications: studentApps,
        interviews: studentInterviews,
        offers: studentOffers,
        placementStatus,
        isPlaced,
      };
    });
  }, [students, studentPlacementApplications, placementInterviews, placementOffers]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return studentsWithPlacement.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase());

      const matchesDept = deptFilter === 'all' ? true : s.deptCode === deptFilter;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'placed'
          ? s.isPlaced
          : statusFilter === 'in_process'
          ? s.placementStatus === 'in_process' || s.placementStatus === 'offered'
          : statusFilter === 'unplaced'
          ? !s.isPlaced
          : true;

      const matchesCgpa =
        cgpaCutoff === 'all'
          ? true
          : (s.cgpa || 0) >= parseFloat(cgpaCutoff);

      return matchesSearch && matchesDept && matchesStatus && matchesCgpa;
    });
  }, [studentsWithPlacement, search, deptFilter, statusFilter, cgpaCutoff]);

  // Metrics
  const totalStudents = studentsWithPlacement.length;
  const placedTotal = studentsWithPlacement.filter((s) => s.isPlaced).length;
  const inProcessTotal = studentsWithPlacement.filter(
    (s) => s.placementStatus === 'in_process' || s.placementStatus === 'offered'
  ).length;
  const eligiblePool = studentsWithPlacement.filter(
    (s) => (s.cgpa || 0) >= 7.0 && (s.backlogs || 0) === 0
  ).length;

  const metrics = [
    {
      label: 'Institution Candidate Roster',
      value: `${totalStudents} Candidates`,
      subtext: 'Class of 2026/27 eligible pool',
      state: 'info',
    },
    {
      label: 'CDC Eligible Benchmark',
      value: `${eligiblePool} Students`,
      subtext: 'CGPA ≥ 7.0 & zero backlogs',
      state: 'neutral',
    },
    {
      label: 'Actively in Selection Rounds',
      value: `${inProcessTotal} In Process`,
      subtext: 'Screening, assessments, interviews',
      state: 'neutral',
    },
    {
      label: 'Confirmed Placements',
      value: `${placedTotal} Placed`,
      subtext: `${totalStudents > 0 ? Math.round((placedTotal / totalStudents) * 100) : 0}% of cohort placed`,
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Student Intelligence"
        title="Candidate Placement Directory & Dossiers"
        description="Search institution-wide student profiles for recruitment opportunities. Review academic eligibility benchmarks, submitted drive applications, scheduled interviews, and verified offers without exposing private fee or mark records."
        actions={[
          <button
            key="view-reports"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('reports')}
          >
            Placement Analytics
          </button>,
        ]}
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={metrics} />

      {/* 3. Students Table */}
      <section>
        <SectionHeader
          title="Student Placement Registry"
          subtitle="Cross-department candidate standings, current pipeline stages, and certified outcomes"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter student or roll no..."
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
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter student department"
              >
                <option value="all">All Departments</option>
                <option value="AIDS">AIDS</option>
                <option value="CSE">CSE</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter placement status"
              >
                <option value="all">All Statuses</option>
                <option value="placed">Placed (Confirmed)</option>
                <option value="in_process">In Selection Process</option>
                <option value="unplaced">Unplaced</option>
              </select>

              <select
                value={cgpaCutoff}
                onChange={(e) => setCgpaCutoff(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter by minimum CGPA"
              >
                <option value="all">All CGPA</option>
                <option value="8.5">≥ 8.5 CGPA (Tier-1)</option>
                <option value="8.0">≥ 8.0 CGPA (Super Dream)</option>
                <option value="7.5">≥ 7.5 CGPA (Dream)</option>
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Student Candidate',
              render: (s) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {s.rollNo} · {s.department} (Sem {s.semester || 5})
                  </div>
                </div>
              ),
            },
            {
              key: 'cgpa',
              label: 'Academic Standing',
              width: '150px',
              render: (s) => (
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    CGPA: {s.cgpa}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: (s.backlogs || 0) > 0 ? 'var(--state-danger)' : 'var(--state-success)' }}>
                    {s.backlogs || 0} Backlog(s) · {s.standing || 'Good Standing'}
                  </div>
                </div>
              ),
            },
            {
              key: 'applications',
              label: 'Drive Pipeline',
              render: (s) => {
                if (s.applications.length === 0) {
                  return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No active applications</span>;
                }
                const latest = s.applications[0];
                return (
                  <div>
                    <strong style={{ fontSize: '0.8125rem' }}>{latest.company}</strong>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Stage: <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>{latest.stage}</span>
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'placementStatus',
              label: 'Placement Status',
              width: '160px',
              render: (s) => {
                if (s.isPlaced) {
                  const offer = s.offers[0] || {};
                  return (
                    <div>
                      <span className="badge badge-success">
                        <CheckCircle2 size={11} /> Placed
                      </span>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {offer.company} ({offer.packageLpa})
                      </div>
                    </div>
                  );
                }
                if (s.placementStatus === 'offered') {
                  return <span className="badge badge-info">Offer Extended</span>;
                }
                if (s.placementStatus === 'in_process') {
                  return <span className="badge badge-neutral">In Selection</span>;
                }
                return <span className="badge badge-neutral" style={{ opacity: 0.7 }}>Unplaced</span>;
              },
            },
            {
              key: 'actions',
              label: 'Action',
              align: 'right',
              width: '140px',
              render: (s) => (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setSelectedStudentDossier(s)}
                >
                  View Dossier
                </button>
              ),
            },
          ]}
          data={filteredStudents}
          keyField="id"
          emptyMessage="No students match the selected filter criteria."
        />
      </section>

      {/* 4. MODAL: Candidate Placement Dossier */}
      {selectedStudentDossier && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedStudentDossier(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {selectedStudentDossier.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedStudentDossier.rollNo} · {selectedStudentDossier.department}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedStudentDossier(null)}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Academic Verified Credentials */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CGPA</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedStudentDossier.cgpa}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Backlogs</div>
                  <strong style={{ fontSize: '1.1rem', color: (selectedStudentDossier.backlogs || 0) > 0 ? 'var(--state-danger)' : 'var(--state-success)' }}>
                    {selectedStudentDossier.backlogs || 0}
                  </strong>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Standing</div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{selectedStudentDossier.standing || 'Good Standing'}</strong>
                </div>
              </div>

              {/* Placement Applications History */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Drive Applications ({selectedStudentDossier.applications.length})
                </div>
                {selectedStudentDossier.applications.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No placement applications submitted yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedStudentDossier.applications.map((app, i) => (
                      <div key={i} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.8125rem' }}>{app.company}</strong>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{app.role} · Applied {app.appliedAt}</div>
                        </div>
                        <span className="badge badge-info">{app.stage}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Offers */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Offers Extended ({selectedStudentDossier.offers.length})
                </div>
                {selectedStudentDossier.offers.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No placement offers recorded for this candidate.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedStudentDossier.offers.map((off, i) => (
                      <div key={i} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{off.company}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--state-success)', fontWeight: 700 }}>{off.packageLpa}</div>
                        </div>
                        <span className={`badge ${off.placementStatus === 'placed' ? 'badge-success' : 'badge-info'}`}>
                          {off.placementStatus === 'placed' ? 'Accepted & Placed' : 'Pending Acceptance'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedStudentDossier(null)}
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
