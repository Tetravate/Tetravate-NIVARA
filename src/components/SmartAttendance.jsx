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

  // Attendance History State
  const [historySubject, setHistorySubject] = useState('ALL');
  const [historyStatus, setHistoryStatus] = useState('ALL');

  // Chronological attendance roster records for the active student
  const attendanceHistoryRecords = [
    { id: 'att-log-1', date: '07 Oct 2026', time: '10:00 AM – 11:30 AM', code: 'CS301', subject: 'Data Structures & Algorithms', faculty: 'Dr. Priya Raman', room: 'Computing Lab 2', status: 'present' },
    { id: 'att-log-2', date: '06 Oct 2026', time: '02:00 PM – 03:30 PM', code: 'CS304', subject: 'Database Management Systems', faculty: 'Dr. K. Mohan', room: 'Room B104', status: 'present' },
    { id: 'att-log-3', date: '06 Oct 2026', time: '10:30 AM – 12:00 PM', code: 'CS302', subject: 'Object-Oriented Programming', faculty: 'Prof. Ananya Sen', room: 'Room C302', status: 'absent' },
    { id: 'att-log-4', date: '05 Oct 2026', time: '08:30 AM – 10:00 AM', code: 'MA301', subject: 'Discrete Structures', faculty: 'Prof. S. Venkatesh', room: 'Room A204', status: 'present' },
    { id: 'att-log-5', date: '03 Oct 2026', time: '02:00 PM – 04:00 PM', code: 'AI302', subject: 'Machine Learning Foundations Lab', faculty: 'Dr. Rajesh K.', room: 'AI Lab 1', status: 'present' },
    { id: 'att-log-6', date: '02 Oct 2026', time: '10:30 AM – 12:00 PM', code: 'CS302', subject: 'Object-Oriented Programming', faculty: 'Prof. Ananya Sen', room: 'Room C302', status: 'on_duty' },
    { id: 'att-log-7', date: '01 Oct 2026', time: '10:00 AM – 11:30 AM', code: 'CS301', subject: 'Data Structures & Algorithms', faculty: 'Dr. Priya Raman', room: 'Computing Lab 2', status: 'present' },
    { id: 'att-log-8', date: '30 Sep 2026', time: '02:00 PM – 03:30 PM', code: 'CS304', subject: 'Database Management Systems', faculty: 'Dr. K. Mohan', room: 'Room B104', status: 'present' },
    { id: 'att-log-9', date: '29 Sep 2026', time: '08:30 AM – 10:00 AM', code: 'MA301', subject: 'Discrete Structures', faculty: 'Prof. S. Venkatesh', room: 'Room A204', status: 'present' },
    { id: 'att-log-10', date: '26 Sep 2026', time: '02:00 PM – 04:00 PM', code: 'AI302', subject: 'Machine Learning Foundations Lab', faculty: 'Dr. Rajesh K.', room: 'AI Lab 1', status: 'present' },
    { id: 'att-log-11', date: '25 Sep 2026', time: '10:30 AM – 12:00 PM', code: 'CS302', subject: 'Object-Oriented Programming', faculty: 'Prof. Ananya Sen', room: 'Room C302', status: 'absent' },
    { id: 'att-log-12', date: '24 Sep 2026', time: '10:00 AM – 11:30 AM', code: 'CS301', subject: 'Data Structures & Algorithms', faculty: 'Dr. Priya Raman', room: 'Computing Lab 2', status: 'present' },
  ];

  const filteredHistory = attendanceHistoryRecords.filter((rec) => {
    if (historySubject !== 'ALL' && rec.code !== historySubject) return false;
    if (historyStatus !== 'ALL' && rec.status !== historyStatus) return false;
    return true;
  });

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

      {/* 5. Chronological Attendance History Log (Read-Only) */}
      <section>
        <SectionHeader
          title="Attendance History Ledger"
          subtitle="Chronological roster logs verified by faculty · Student Read-Only"
          action={
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <select
                className="input input-sm"
                value={historySubject}
                onChange={(e) => setHistorySubject(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '30px' }}
                aria-label="Filter attendance history by subject"
              >
                <option value="ALL">All Subjects</option>
                {coursesAttendance.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                ))}
              </select>

              <select
                className="input input-sm"
                value={historyStatus}
                onChange={(e) => setHistoryStatus(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '30px' }}
                aria-label="Filter attendance history by status"
              >
                <option value="ALL">All Statuses</option>
                <option value="present">Present Only</option>
                <option value="absent">Absences Only</option>
                <option value="on_duty">On-Duty Leaves</option>
              </select>
            </div>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredHistory.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No attendance entries match filter"
              description="No classroom attendance records found for the selected subject and status filter."
            />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'date',
                  label: 'Date & Time Slot',
                  width: '180px',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.date}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{row.time}</div>
                    </div>
                  ),
                },
                {
                  key: 'subject',
                  label: 'Subject & Course Code',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.subject}</div>
                      <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
                        <code style={{ fontFamily: 'var(--font-mono)' }}>{row.code}</code> · Venue: {row.room}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'faculty',
                  label: 'Faculty Evaluator',
                  render: (row) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{row.faculty}</span>,
                },
                {
                  key: 'status',
                  label: 'Roster Standing',
                  align: 'right',
                  width: '140px',
                  render: (row) => {
                    if (row.status === 'present') {
                      return (
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} /> Present
                        </span>
                      );
                    }
                    if (row.status === 'on_duty') {
                      return (
                        <span className="badge badge-info" title="Official duty leave attendance concession credited">
                          <ShieldCheck size={11} /> On-Duty Credit
                        </span>
                      );
                    }
                    return (
                      <span className="badge badge-urgent">
                        <AlertCircle size={11} /> Absent
                      </span>
                    );
                  },
                },
              ]}
              data={filteredHistory}
              keyField="id"
            />
          )}
        </div>
      </section>
    </div>
  );
}
