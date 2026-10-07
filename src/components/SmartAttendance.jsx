import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Calendar,
  X,
  TrendingUp,
  Info,
  ArrowRight,
  ArrowLeft,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from './workspace';

export default function SmartAttendance({ onBack }) {
  const { coursesAttendance, students, currentUser, setActiveTab } = useNivara();

  const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId) || (students || [])[0] || {};

  const [courseFilter, setCourseFilter] = useState('all'); // 'all' | 'warning' | 'safe'
  const [selectedCourseCode, setSelectedCourseCode] = useState(
    coursesAttendance[2]?.code || coursesAttendance[0]?.code
  );
  const [missCount, setMissCount] = useState(1);
  const [attendCount, setAttendCount] = useState(0);

  const selectedSubject =
    coursesAttendance.find((c) => c.code === selectedCourseCode) || coursesAttendance[0];

  // Aggregate attendance math derived directly from live course logs
  const totalAttended = coursesAttendance.reduce((acc, c) => acc + c.attended, 0);
  const totalConducted = coursesAttendance.reduce((acc, c) => acc + c.total, 0);
  const totalAbsent = totalConducted - totalAttended;
  const overallPercentage = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : (student.attendancePct || 87);
  const safeBuffer = overallPercentage - 75;

  // Selected subject simulator math
  const currentAttended = selectedSubject?.attended || 0;
  const currentTotal = selectedSubject?.total || 1;
  const projectedAttended = currentAttended + attendCount;
  const projectedTotal = currentTotal + missCount + attendCount;
  const projectedPct = projectedTotal > 0 ? Math.round((projectedAttended / projectedTotal) * 100) : 0;
  const isSafe = projectedPct >= 75;

  // Filtered courses
  const filteredCourses = coursesAttendance.filter((c) => {
    if (courseFilter === 'warning') return c.percentage < 80;
    if (courseFilter === 'safe') return c.percentage >= 80;
    return true;
  });

  const attendanceMetrics = [
    {
      label: 'Continuous Overall',
      value: `${overallPercentage}%`,
      subtext: overallPercentage >= 75 ? `+${safeBuffer}% above 75% cutoff` : `${safeBuffer}% below 75% cutoff`,
      state: overallPercentage >= 75 ? 'success' : 'urgent',
    },
    {
      label: 'Attended Lectures',
      value: `${totalAttended} Sessions`,
      subtext: `Across ${coursesAttendance.length} registered subjects`,
      state: 'info',
    },
    {
      label: 'Absences Recorded',
      value: `${totalAbsent} Sessions`,
      subtext: 'Includes duty leave credits',
      state: totalAbsent > 10 ? 'warning' : 'neutral',
    },
    {
      label: 'Standing Benchmark',
      value: overallPercentage >= 75 ? 'Eligible' : 'At-Risk',
      subtext: 'Internal semester examinations',
      state: overallPercentage >= 75 ? 'success' : 'urgent',
    },
  ];

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Academic Consistency · Semester 5 · Week 7"
        title="Attendance & Eligibility Standing"
        description="Live continuous attendance calculated directly from verified faculty lecture rosters."
        actions={[
          <button
            key="leave"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('leaves')}
          >
            <Plus size={13} /> Request Duty Leave Waiver
          </button>,
          onBack && (
            <button
              key="back"
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBack}
            >
              <ArrowLeft size={13} /> Back to Home
            </button>
          ),
        ].filter(Boolean)}
      />

      {/* 2. Key Standing KPIs */}
      <MetricStrip metrics={attendanceMetrics} />

      {/* 3. Subject-wise Attendance Table */}
      <section>
        <SectionHeader
          title="Registered Course Breakdown"
          subtitle="Continuous attendance tracked per subject"
          action={
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${courseFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCourseFilter('all')}
              >
                All Courses ({coursesAttendance.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${courseFilter === 'warning' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCourseFilter('warning')}
              >
                Caution (&lt;80%)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${courseFilter === 'safe' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCourseFilter('safe')}
              >
                Cleared (≥80%)
              </button>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Subject & Instructor',
              render: (c) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Instructor: <strong>{c.faculty}</strong> · Venue: {c.room}
                  </div>
                </div>
              ),
            },
            {
              key: 'code',
              label: 'Code',
              width: '90px',
              render: (c) => <span className="badge badge-neutral">{c.code}</span>,
            },
            {
              key: 'attended',
              label: 'Attended / Total',
              align: 'right',
              render: (c) => `${c.attended} / ${c.total}`,
            },
            {
              key: 'absent',
              label: 'Missed',
              align: 'right',
              render: (c) => c.total - c.attended,
            },
            {
              key: 'percentage',
              label: 'Standing',
              align: 'right',
              render: (c) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: c.percentage >= 80 ? 'var(--state-success)' : c.percentage >= 75 ? 'var(--state-warning)' : 'var(--state-urgent)' }}>
                    {c.percentage}%
                  </span>
                  <span className={`badge ${c.percentage >= 80 ? 'badge-success' : c.percentage >= 75 ? 'badge-warning' : 'badge-urgent'}`}>
                    {c.percentage >= 80 ? 'Good' : c.percentage >= 75 ? 'Caution' : 'Critical'}
                  </span>
                </div>
              ),
            },
            {
              key: 'safeToMiss',
              label: 'Buffer',
              align: 'right',
              render: (c) => (
                <span style={{ fontSize: '0.75rem', color: c.safeToMiss > 0 ? 'var(--text-muted)' : 'var(--state-urgent)', fontWeight: 600 }}>
                  {c.safeToMiss > 0 ? `${c.safeToMiss} classes safe` : '0 classes safe'}
                </span>
              ),
            },
            {
              key: 'action',
              label: 'Simulate',
              align: 'right',
              width: '95px',
              render: (c) => (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedCourseCode(c.code)}
                >
                  Project
                </button>
              ),
            },
          ]}
          data={filteredCourses}
          keyField="code"
        />
      </section>

      {/* 4. Interactive "What-If" Simulator */}
      {selectedSubject && (
        <section style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={16} color="var(--brand-blue)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Projection Calculator: {selectedSubject.name} ({selectedSubject.code})
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Current: <strong>{selectedSubject.attended}/{selectedSubject.total} ({selectedSubject.percentage}%)</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>If I attend upcoming lectures:</span>
                  <strong>+{attendCount} sessions</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[0, 1, 2, 3, 5, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`btn btn-sm ${attendCount === n ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setAttendCount(n)}
                      style={{ flex: 1, padding: '0.3rem' }}
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <span>If I miss upcoming lectures:</span>
                  <strong style={{ color: 'var(--state-urgent)' }}>+{missCount} absences</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[0, 1, 2, 3, 4, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`btn btn-sm ${missCount === n ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setMissCount(n)}
                      style={{ flex: 1, padding: '0.3rem' }}
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Projected Resulting Standing</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isSafe ? 'var(--state-success)' : 'var(--state-urgent)', margin: '0.25rem 0' }}>
                {projectedPct}%
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSafe ? 'var(--state-success)' : 'var(--state-urgent)' }}>
                {isSafe ? 'Eligible for Examination Clearance' : 'Mandatory Counseling Risk (<75%)'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {projectedAttended} attended out of {projectedTotal} total scheduled
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
