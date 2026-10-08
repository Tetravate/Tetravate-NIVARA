import React, { useState, useMemo } from 'react';
import {
  Send,
  Building,
  Check,
  Download,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalHome({ onNavigate }) {
  const {
    departments,
    feeStructures,
    placementDrives,
    publishedResults,
    examSessions,
    leaveRequests,
    sendAnnouncement,
    showToast,
  } = useNivara();

  const [announcementText, setAnnouncementText] = useState('');
  const [selectedDeptDetail, setSelectedDeptDetail] = useState(null);

  // Aggregated college statistics derived from live state
  const totalStudents = useMemo(() => {
    return (departments || []).reduce((acc, d) => acc + (d.studentCount || 0), 0);
  }, [departments]);

  const totalFaculty = useMemo(() => {
    return (departments || []).reduce((acc, d) => acc + (d.facultyCount || 0), 0);
  }, [departments]);

  const collegeAttendance = useMemo(() => {
    if (!departments || departments.length === 0) return 85.0;
    const sum = departments.reduce((acc, d) => acc + (d.attendancePct || 0), 0);
    return Number((sum / departments.length).toFixed(1));
  }, [departments]);

  const totalAtRisk = useMemo(() => {
    return (departments || []).reduce((acc, d) => acc + (d.atRiskCount || 0), 0);
  }, [departments]);

  // Financial summary derived from live state
  const totalBilled = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.totalBilled || 0), 0);
  }, [feeStructures]);

  const totalCollected = useMemo(() => {
    return (feeStructures || []).reduce((acc, f) => acc + (f.totalCollected || 0), 0);
  }, [feeStructures]);

  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 87;

  // Pending institutional approvals
  const pendingApprovalsCount = useMemo(() => {
    return (leaveRequests || []).filter((l) => l.status === 'pending').length;
  }, [leaveRequests]);

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
      subtext: `${departments.length} Engineering Divisions`,
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
      {/* 1. Executive Header */}
      <PageHeader
        eyebrow="Executive Oversight · Office of the Principal & Academic Dean"
        title="Institutional Performance Radar"
        description="Synthesized executive analytics across academic attendance, departmental benchmarks, financial recovery, and corporate placements."
        actions={[
          <button
            key="summary"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate ? onNavigate('reports') : null}
          >
            <Download size={13} /> Executive Reports
          </button>,
          <button
            key="approvals"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate ? onNavigate('approvals') : null}
          >
            <Check size={13} /> Pending Approvals ({pendingApprovalsCount})
          </button>,
        ]}
      />

      {/* 2. Key Performance Indicators */}
      <MetricStrip metrics={principalMetrics} />

      {/* 3. Institutional Milestone Banner */}
      <div className="notion-callout notion-callout-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} color="var(--state-success)" />
          <div>
            <strong style={{ fontSize: '0.875rem' }}>Semester 4 Results Published & Verified</strong>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Institutional pass percentage: <strong>{publishedResults?.departmentPassPct || 88.4}%</strong> across all evaluated engineering departments.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate && onNavigate('departments')}
        >
          Inspect Department Slates <ArrowRight size={12} />
        </button>
      </div>

      {/* 4. Department Performance Matrix */}
      <section>
        <SectionHeader
          title="Department Performance Matrix"
          subtitle="Real-time comparative vital statistics across academic divisions"
          action={
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('departments')}
              className="btn btn-ghost btn-sm"
            >
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

      {/* 5. Split Panel: Institutional Fee Recovery & Corporate Placement Radar */}
      <div className="split-panel" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Financial Health Summary */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <SectionHeader
            title="Institutional Fee Recovery"
            subtitle="Autumn 2026 Term collections summary"
            action={
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('finance')}
                className="btn btn-ghost btn-sm"
              >
                Details
              </button>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            {(feeStructures || []).slice(0, 2).map((f) => {
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
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('placements')}
                className="btn btn-ghost btn-sm"
              >
                Details
              </button>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {(placementDrives || []).slice(0, 3).map((d) => (
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

      {/* 6. Needs Attention & Upcoming Academic Milestones */}
      <div className="split-panel" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        {/* Needs Attention Queue */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <SectionHeader
            title="Institutional Items Requiring Attention"
            subtitle="Flags derived from live department attendance and student progress"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {departments.filter(d => d.attendancePct < 85).map(d => (
              <div
                key={d.code}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--state-warning-bg)',
                  border: '1px solid var(--state-warning-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {d.name} ({d.code}) Attendance Warning
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Department attendance is at {d.attendancePct}%, below the 85% distinction norm. {d.atRiskCount} at-risk students.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate && onNavigate('attendance')}
                >
                  Review
                </button>
              </div>
            ))}

            {pendingApprovalsCount > 0 && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {pendingApprovalsCount} Institutional Requests Awaiting Concurrence
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Special duty leave, medical waivers, and faculty event approvals.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onNavigate && onNavigate('approvals')}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Examinations & Academic Sessions */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <SectionHeader
            title="Upcoming Examinations & Key Milestones"
            subtitle="Central Examination Cell synchronized schedule"
            action={
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('exams_results')}
                className="btn btn-ghost btn-sm"
              >
                Full Calendar
              </button>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {(examSessions || []).slice(0, 3).map((ex) => (
              <div
                key={ex.id}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ex.subjectName} ({ex.subjectCode})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ex.date} · {ex.session} · Venues: {ex.halls?.join(', ') || 'Main Exam Hall'}
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                  {ex.status === 'scheduled' ? 'Scheduled' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. College Directive Broadcast (Preserved Capability) */}
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

      {/* 8. Department Detail Drill-Down Modal (Preserved Capability) */}
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
                  <div style={{ fontWeight: 800, color: selectedDeptDetail.attendancePct >= 90 ? 'var(--state-success)' : 'var(--text-primary)' }}>
                    {selectedDeptDetail.attendancePct}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Placement Rate:</span>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {selectedDeptDetail.placedPct}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Instructional Faculty:</span>
                  <div style={{ fontWeight: 700 }}>{selectedDeptDetail.facultyCount} Faculty</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Average CGPA:</span>
                  <div style={{ fontWeight: 700 }}>{selectedDeptDetail.avgCgpa} / 10.0</div>
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
