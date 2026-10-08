import React, { useState, useMemo } from 'react';
import {
  Check,
  X,
  Calendar,
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyAttendance() {
  const {
    facultyRoster,
    markAttendance,
    showToast,
  } = useNivara();

  const [selectedCourse, setSelectedCourse] = useState('CS301');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('09:00 AM - 10:30 AM (Lecture 1)');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'present' | 'absent' | 'at-risk'

  // Local working copy of the roster for the active session
  const [localRoster, setLocalRoster] = useState(facultyRoster || []);

  // History log of recorded attendance sessions
  const [sessionHistory, setSessionHistory] = useState([
    {
      id: 'sess-1',
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      date: '2026-10-07',
      sessionSlot: '09:00 AM - 10:30 AM',
      presentCount: 25,
      absentCount: 3,
      recordedAt: '07 Oct 2026, 09:35 AM',
      synced: true,
    },
    {
      id: 'sess-2',
      courseCode: 'AI302',
      courseName: 'Machine Learning Foundations Lab',
      date: '2026-10-06',
      sessionSlot: '02:00 PM - 04:30 PM',
      presentCount: 27,
      absentCount: 1,
      recordedAt: '06 Oct 2026, 02:20 PM',
      synced: true,
    },
    {
      id: 'sess-3',
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      date: '2026-10-05',
      sessionSlot: '09:00 AM - 10:30 AM',
      presentCount: 26,
      absentCount: 2,
      recordedAt: '05 Oct 2026, 09:40 AM',
      synced: true,
    },
  ]);

  const courses = [
    { code: 'CS301', name: 'Data Structures & Algorithms', section: 'AIDS-A-SEM5', room: 'Computing Lab 2', count: 28 },
    { code: 'AI302', name: 'Machine Learning Foundations Lab', section: 'AIDS-A-SEM5', room: 'AI Computing Lab 1', count: 28 },
    { code: 'AI308', name: 'Deep Learning & Neural Architectures', section: 'AIDS-B-SEM5', room: 'Hall B204', count: 32 },
  ];

  const currentCourseMeta = courses.find((c) => c.code === selectedCourse) || courses[0];

  // Check for duplicate session record
  const existingRecord = useMemo(() => {
    return sessionHistory.find(
      (s) => s.courseCode === selectedCourse && s.date === selectedDate && s.sessionSlot.includes(selectedSession.split(' ')[0])
    );
  }, [sessionHistory, selectedCourse, selectedDate, selectedSession]);

  // Derived counts
  const presentCount = localRoster.filter((s) => s.status === 'present').length;
  const absentCount = localRoster.filter((s) => s.status === 'absent').length;
  const totalCount = localRoster.length;
  const sessionPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Filter roster
  const filteredRoster = useMemo(() => {
    return localRoster.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.roll.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'present') return st.status === 'present';
      if (statusFilter === 'absent') return st.status === 'absent';
      if (statusFilter === 'at-risk') {
        // Students with known low attendance (e.g. absent currently or flagged)
        return st.status === 'absent' || st.roll === '22AIDS014' || st.roll === '22AIDS027';
      }
      return true;
    });
  }, [localRoster, searchQuery, statusFilter]);

  const handleToggle = (id) => {
    setLocalRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s))
    );
  };

  const handleMarkAll = (status) => {
    setLocalRoster((prev) => prev.map((s) => ({ ...s, status })));
    showToast(`Marked all ${localRoster.length} students as ${status === 'present' ? 'Present' : 'Absent'}`, 'info');
  };

  const handleSaveAttendance = () => {
    markAttendance(selectedCourse, localRoster);

    // Update session history
    const newSessionEntry = {
      id: `sess-${Date.now()}`,
      courseCode: selectedCourse,
      courseName: currentCourseMeta.name,
      date: selectedDate,
      sessionSlot: selectedSession,
      presentCount,
      absentCount,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
      synced: true,
    };

    setSessionHistory((prev) => [
      newSessionEntry,
      ...prev.filter((p) => !(p.courseCode === selectedCourse && p.date === selectedDate)),
    ]);
  };

  const metrics = [
    {
      label: 'Session Present',
      value: `${presentCount} / ${totalCount}`,
      subtext: `${sessionPct}% Roll Call Attendance`,
      state: sessionPct >= 85 ? 'success' : sessionPct >= 75 ? 'info' : 'warning',
    },
    {
      label: 'Absentee Count',
      value: `${absentCount} Students`,
      subtext: absentCount > 0 ? 'Sync will alert student portals' : 'Full attendance today',
      state: absentCount > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Selected Cohort',
      value: selectedCourse,
      subtext: `${currentCourseMeta.section} · ${currentCourseMeta.room}`,
      state: 'info',
    },
    {
      label: 'Session Status',
      value: existingRecord ? 'Overwriting' : 'New Session',
      subtext: existingRecord ? `Previous log at ${existingRecord.recordedAt}` : 'Ready to synchronize',
      state: existingRecord ? 'warning' : 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Attendance & Roll Call Workspace"
        title="Attendance Management"
        description="Verify assigned lecture cohorts, record rapid roll call, review past registers, and synchronize student standing across institutional portals."
        actions={[
          <button
            key="all-p"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll('present')}
          >
            <Check size={13} color="var(--state-success)" /> Mark All Present
          </button>,
          <button
            key="all-a"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll('absent')}
          >
            <X size={13} color="var(--state-urgent)" /> Mark All Absent
          </button>,
          <button
            key="save"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveAttendance}
          >
            <RefreshCw size={13} /> Save & Synchronize
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Cohort & Session Filter Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'end',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Assigned Course & Cohort
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
            }}
          >
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Attendance Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Lecture / Slot Timing
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
            }}
          >
            <option value="08:30 AM - 10:00 AM (Slot 1)">08:30 AM – 10:00 AM (Slot 1)</option>
            <option value="10:15 AM - 11:45 AM (Slot 2)">10:15 AM – 11:45 AM (Slot 2)</option>
            <option value="12:00 PM - 01:30 PM (Slot 3)">12:00 PM – 01:30 PM (Slot 3)</option>
            <option value="02:00 PM - 04:30 PM (Lab Session)">02:00 PM – 04:30 PM (Lab Session)</option>
          </select>
        </div>
      </div>

      {/* Duplicate Prevention Alert Banner */}
      {existingRecord && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--state-warning-bg)',
            border: '1px solid var(--state-warning-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={16} color="var(--state-warning)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            <strong>Session register already recorded for this date:</strong> A record was saved at{' '}
            <em>{existingRecord.recordedAt}</em> ({existingRecord.presentCount} present, {existingRecord.absentCount} absent).
            Submitting again will update the existing session attendance without creating duplicate entries.
          </div>
        </div>
      )}

      {/* Roster Controls & Grid */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '0.85rem',
          }}
        >
          <SectionHeader
            title={`Active Roster · ${currentCourseMeta.name} (${selectedCourse})`}
            subtitle={`${filteredRoster.length} Students Listed · Click student tile to toggle Present / Absent`}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search
                size={13}
                style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search student or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem 0.4rem 2rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setStatusFilter('all')}
              >
                All ({localRoster.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'present' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setStatusFilter('present')}
              >
                Present ({presentCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${statusFilter === 'absent' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setStatusFilter('absent')}
              >
                Absent ({absentCount})
              </button>
            </div>
          </div>
        </div>

        {filteredRoster.length === 0 ? (
          <EmptyState
            title="No students match the criteria"
            description="Clear search or adjust filters to view students in this cohort."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '0.55rem',
            }}
          >
            {filteredRoster.map((st) => {
              const isPresent = st.status === 'present';
              const isAtRisk = st.roll === '22AIDS014' || st.roll === '22AIDS027';

              return (
                <div
                  key={st.id}
                  onClick={() => handleToggle(st.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isPresent ? 'var(--bg-surface)' : 'var(--state-urgent-bg)',
                    border: '1px solid',
                    borderColor: isPresent ? 'var(--border-subtle)' : 'var(--state-urgent-border)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {st.name}
                      </span>
                      {isAtRisk && (
                        <span
                          title="Attendance < 75% Alert"
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            background: 'var(--state-warning-bg)',
                            color: 'var(--state-warning)',
                            fontWeight: 700,
                          }}
                        >
                          &lt;75%
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: '0.15rem',
                      }}
                    >
                      {st.roll} · {isPresent ? 'Present' : 'Absent'}
                    </div>
                  </div>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isPresent ? 'var(--state-success-bg)' : 'var(--state-urgent)',
                      color: isPresent ? 'var(--state-success)' : '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    {isPresent ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Register Sessions Log */}
      <div style={{ marginTop: '0.5rem' }}>
        <SectionHeader
          title="Past Attendance Sessions Log"
          subtitle="Audit log of attendance records submitted for this cohort"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.65rem' }}>
          {sessionHistory.map((sess) => (
            <div
              key={sess.id}
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {sess.courseCode} — {sess.courseName}
                  </span>
                  <span className="badge badge-neutral">{sess.sessionSlot}</span>
                  <span className="badge badge-success">
                    <CheckCircle2 size={10} style={{ marginRight: '3px' }} /> Synced
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Date: <strong>{sess.date}</strong> · Recorded: {sess.recordedAt}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sess.presentCount} / {sess.presentCount + sess.absentCount}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {Math.round((sess.presentCount / (sess.presentCount + sess.absentCount)) * 100)}% Present (
                    {sess.absentCount} Absent)
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedCourse(sess.courseCode);
                    setSelectedDate(sess.date);
                    showToast(`Loaded register for ${sess.courseCode} on ${sess.date}`, 'info');
                  }}
                >
                  Review Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
