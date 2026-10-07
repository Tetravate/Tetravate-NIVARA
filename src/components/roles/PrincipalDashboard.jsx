import React, { useState } from 'react';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Send,
  Building,
  GraduationCap,
  Users,
  CreditCard,
  Briefcase,
  Check,
  Award,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from '../workspace';

export default function PrincipalDashboard() {
  const {
    activeTab,
    setActiveTab,
    departments,
    feeStructures,
    placementDrives,
    publishedResults,
    sendAnnouncement,
    showToast,
  } = useNivara();

  const [announcementText, setAnnouncementText] = useState('');
  const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);

  // Aggregated college statistics derived from live state
  const totalStudents = departments.reduce((acc, d) => acc + d.studentCount, 0);
  const totalFaculty = departments.reduce((acc, d) => acc + d.facultyCount, 0);
  const collegeAttendance = Number(
    (departments.reduce((acc, d) => acc + d.attendancePct, 0) / departments.length).toFixed(1)
  );
  const totalAtRisk = departments.reduce((acc, d) => acc + d.atRiskCount, 0);

  // Financial summary derived from live state
  const totalBilled = feeStructures.reduce((acc, f) => acc + f.totalBilled, 0);
  const totalCollected = feeStructures.reduce((acc, f) => acc + f.totalCollected, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 87;

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    sendAnnouncement(
      'Office of the Principal: Academic Directive',
      announcementText,
      'all'
    );
    showToast(`College-Wide Directive Broadcasted to ${totalStudents.toLocaleString()} students & ${totalFaculty} faculty ✓`, 'success');
    setAnnouncementText('');
  };

  const principalMetrics = [
    {
      label: 'Enrolled Students',
      value: totalStudents.toLocaleString(),
      subtext: '5 Engineering Divisions',
      state: 'neutral',
    },
    {
      label: 'College Attendance',
      value: `${collegeAttendance}%`,
      subtext: 'Above institutional 75% cutoff',
      state: collegeAttendance >= 80 ? 'success' : 'warning',
    },
    {
      label: 'Fee Recovery',
      value: `${collectionRate}%`,
      subtext: `₹${(totalCollected / 10000000).toFixed(2)} Cr of ₹${(totalBilled / 10000000).toFixed(2)} Cr`,
      state: 'info',
    },
    {
      label: 'Academic Risk Alert',
      value: `${totalAtRisk} Students`,
      subtext: 'Across all departments',
      state: totalAtRisk > 10 ? 'warning' : 'neutral',
    },
  ];

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (Principal / Dean Oversight Persona) */}
      <PageHeader
        eyebrow="Executive Oversight · Office of the Principal & Academic Dean"
        title="Institutional Performance Radar"
        description="Synthesized executive analytics across academic attendance, departmental comparison, financial recovery, and corporate placements."
        actions={[
          <button
            key="summary"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Downloading institutional accreditation executive report', 'info')}
          >
            <Download size={13} /> Executive Summary Report
          </button>,
        ]}
      />

      {/* 2. Executive Key Performance Indicators */}
      <MetricStrip metrics={principalMetrics} />

      {/* VIEW: COLLEGE OVERVIEW (Default on home or institutional modules) */}
      {(!['departments', 'financials', 'finance', 'placements'].includes(activeTab)) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Institutional Alert */}
          <div className="notion-callout notion-callout-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--state-success)" />
              <div>
                <strong style={{ fontSize: '0.875rem' }}>Semester 4 Results Published & Verified</strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Institutional pass percentage: <strong>{publishedResults.departmentPassPct}%</strong> across all evaluated engineering departments.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('departments')}
            >
              Inspect Department Slates
            </button>
          </div>

          {/* Department Comparison Matrix Table */}
          <section>
            <SectionHeader
              title="Department Performance Matrix"
              subtitle="Real-time comparative vital statistics across academic divisions"
              action={
                <button type="button" onClick={() => setActiveTab('departments')} className="btn btn-ghost btn-sm">
                  Full Matrix View
                </button>
              }
            />

            <DataTable
              columns={[
                {
                  key: 'name',
                  label: 'Department',
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
                  label: 'Students',
                  align: 'right',
                  render: (d) => `${d.studentCount}`,
                },
                {
                  key: 'avgCgpa',
                  label: 'Avg CGPA',
                  align: 'right',
                  render: (d) => <span style={{ fontWeight: 600 }}>{d.avgCgpa}</span>,
                },
                {
                  key: 'attendancePct',
                  label: 'Attendance',
                  align: 'right',
                  render: (d) => (
                    <span style={{ fontWeight: 700, color: d.attendancePct >= 90 ? 'var(--state-success)' : 'var(--text-primary)' }}>
                      {d.attendancePct}%
                    </span>
                  ),
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
                {
                  key: 'actions',
                  label: 'Action',
                  align: 'right',
                  width: '100px',
                  render: (d) => (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeptDetail(d);
                      }}
                    >
                      Inspect
                    </button>
                  ),
                },
              ]}
              data={departments}
              keyField="code"
              onRowClick={(d) => setSelectedDeptDetail(d)}
            />
          </section>

          {/* Side-by-side Institutional Finance and Placement Summaries */}
          <div className="split-panel" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Financial Health Summary */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <SectionHeader
                title="Institutional Fee Recovery"
                subtitle="Autumn 2026 Term collections summary"
                action={
                  <button type="button" onClick={() => setActiveTab('financials')} className="btn btn-ghost btn-sm">
                    Details
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                {feeStructures.slice(0, 2).map((f) => {
                  const pct = Math.round((f.totalCollected / f.totalBilled) * 100);
                  return (
                    <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</span>
                        <span style={{ fontWeight: 700, color: 'var(--state-success)' }}>{pct}% Realized</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div className="progress-fill progress-fill-success" style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        <span>₹{(f.totalCollected / 10000000).toFixed(2)} Cr of ₹{(f.totalBilled / 10000000).toFixed(2)} Cr</span>
                        <span>{f.studentsPendingCount} pending</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Corporate Placement Radar */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <SectionHeader
                title="Active Corporate Recruitment"
                subtitle="Tier-1 placement drives currently active"
                action={
                  <button type="button" onClick={() => setActiveTab('placements')} className="btn btn-ghost btn-sm">
                    Details
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
                {placementDrives.slice(0, 3).map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{d.company}</strong>
                      <span className="badge badge-info" style={{ marginLeft: '0.5rem' }}>{d.packageLpa}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.role} · Deadline: {d.deadline}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{d.appliedCount} Applied</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{d.selectedCount} Offers</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* College Directive Broadcast */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Publish College-Wide Administrative Directive
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Official administrative notices published here appear across all student, faculty, and administrative dashboards.
            </p>
            <form onSubmit={handleBroadcast} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Schedule for University Annual Convocation and Examination Board moderation..."
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Send size={13} /> Broadcast Directive
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: DEPARTMENT MATRIX FULL VIEW */}
      {activeTab === 'departments' && (
        <section>
          <SectionHeader
            title="Institutional Department Matrix"
            subtitle="Select any branch to inspect granular academic, faculty, and placement data"
          />

          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Department',
                render: (dept) => (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{dept.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOD: {dept.hod}</div>
                  </div>
                ),
              },
              {
                key: 'code',
                label: 'Code',
                width: '90px',
                render: (dept) => <span className="badge badge-info">{dept.code}</span>,
              },
              {
                key: 'studentCount',
                label: 'Students',
                align: 'right',
                render: (dept) => `${dept.studentCount}`,
              },
              {
                key: 'facultyCount',
                label: 'Faculty',
                align: 'right',
                render: (dept) => `${dept.facultyCount}`,
              },
              {
                key: 'avgCgpa',
                label: 'Avg CGPA',
                align: 'right',
                render: (dept) => <span style={{ fontWeight: 600 }}>{dept.avgCgpa}</span>,
              },
              {
                key: 'attendancePct',
                label: 'Attendance',
                align: 'right',
                render: (dept) => (
                  <span style={{ fontWeight: 700, color: dept.attendancePct >= 90 ? 'var(--state-success)' : 'var(--text-primary)' }}>
                    {dept.attendancePct}%
                  </span>
                ),
              },
              {
                key: 'placedPct',
                label: 'Placement',
                align: 'right',
                render: (dept) => (
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {dept.placedPct}%
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Action',
                align: 'right',
                width: '100px',
                render: (dept) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeptDetail(dept);
                    }}
                  >
                    Inspect
                  </button>
                ),
              },
            ]}
            data={departments}
            keyField="code"
            onRowClick={(dept) => setSelectedDeptDetail(dept)}
          />
        </section>
      )}

      {/* VIEW: FINANCIAL HEALTH */}
      {(activeTab === 'financials' || activeTab === 'finance') && (
        <section>
          <SectionHeader
            title="Institutional Financial Summaries & Fee Recoveries"
            subtitle="Autumn 2026 Term fee schedules and collection milestones"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {feeStructures.map((f) => {
              const pct = Math.round((f.totalCollected / f.totalBilled) * 100);
              return (
                <div
                  key={f.id}
                  style={{
                    padding: '1.15rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{f.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Target: {f.department} · Standard Tariff: ₹{f.amount.toLocaleString()} · Due: {f.dueDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--state-success)' }}>
                        ₹{(f.totalCollected / 10000000).toFixed(2)} Cr
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        of ₹{(f.totalBilled / 10000000).toFixed(2)} Cr Realized
                      </div>
                    </div>
                  </div>

                  <div className="progress-track" style={{ height: '6px' }}>
                    <div className="progress-fill progress-fill-success" style={{ width: `${pct}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{f.studentsPaidCount} Paid Students</span>
                    <span style={{ color: f.studentsPendingCount > 0 ? 'var(--state-warning)' : 'var(--state-success)', fontWeight: 600 }}>
                      {f.studentsPendingCount} Pending
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW: PLACEMENT RADAR */}
      {activeTab === 'placements' && (
        <section>
          <SectionHeader
            title="Executive Placement Radar & Industry Partners"
            subtitle="Recruitment drive monitoring and corporate selection outcomes"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {placementDrives.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{d.company}</strong>
                    <span className="badge badge-info">{d.packageLpa}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {d.role} · {d.location} · Deadline: {d.deadline}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {d.appliedCount} Candidates Applied
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                    {d.selectedCount} Offers Released
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DRILL DOWN MODAL FOR DEPARTMENT */}
      {selectedDeptDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedDeptDetail(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedDeptDetail.name} ({selectedDeptDetail.code})
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedDeptDetail(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Head of Department:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedDeptDetail.hod}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Enrolled Students:</span>
                  <div style={{ fontWeight: 700 }}>{selectedDeptDetail.studentCount} Students</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Attendance Rate:</span>
                  <div style={{ fontWeight: 800, color: selectedDeptDetail.attendancePct >= 90 ? 'var(--state-success)' : 'var(--text-primary)' }}>{selectedDeptDetail.attendancePct}%</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Placement Rate:</span>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{selectedDeptDetail.placedPct}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Department Audit Report exported for ${selectedDeptDetail.code} ✓`, 'success');
                    setSelectedDeptDetail(null);
                  }}
                >
                  <Download size={12} /> Export Official Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
