import React, { useState, useMemo } from 'react';
import {
  MapPin,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyTimetable() {
  const {
    timetableEntries,
    currentUser,
  } = useNivara();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedMobileDay, setSelectedMobileDay] = useState('Thursday');

  // Time slots for the weekly grid
  const timeSlots = [
    { id: 'slot-1', label: '08:30 AM – 10:00 AM' },
    { id: 'slot-2', label: '10:15 AM – 11:45 AM' },
    { id: 'slot-3', label: '12:00 PM – 01:00 PM', isBreak: true },
    { id: 'slot-4', label: '01:00 PM – 02:30 PM' },
    { id: 'slot-5', label: '02:45 PM – 04:30 PM' },
  ];

  // Faculty's weekly schedule matrix derived dynamically from timetableEntries
  const facultyName = currentUser?.userName || '';
  const facultySchedule = useMemo(() => {
    return (timetableEntries || [])
      .filter((e) => (facultyName && (e.facultyName === facultyName || e.faculty === facultyName)) || !facultyName)
      .map((e) => ({
        id: e.id,
        day: e.dayOfWeek || e.day,
        timeSlot: e.timeSlot || `${e.startTime || ''} – ${e.endTime || ''}`,
        courseCode: e.courseCode,
        subjectName: e.subjectName || e.subject,
        section: e.section || 'General',
        room: e.room,
        type: e.sessionType || e.type || 'Lecture',
        enrolled: e.enrolled || 0,
      }));
  }, [timetableEntries, facultyName]);

  const lectureSessions = facultySchedule.filter((s) => s.type === 'Lecture' || s.type === 'Elective').length;
  const labSessions = facultySchedule.filter((s) => s.type === 'Laboratory').length;
  const totalTeachingHours = (lectureSessions * 1.5) + (labSessions * 2);

  const metrics = [
    {
      label: 'Weekly Workload',
      value: `${totalTeachingHours} Hours`,
      subtext: totalTeachingHours <= 18 ? 'Within 18 hrs max workload policy' : 'Workload exceeds policy',
      state: totalTeachingHours <= 18 ? 'success' : 'warning',
    },
    {
      label: 'Lecture Sessions',
      value: `${lectureSessions} Slots`,
      subtext: 'Scheduled theory sessions',
      state: 'info',
    },
    {
      label: 'Practical Lab Hours',
      value: `${labSessions} Sessions`,
      subtext: 'Scheduled lab practical blocks',
      state: 'info',
    },
    {
      label: 'Total Sessions',
      value: `${facultySchedule.length} Slots`,
      subtext: 'Weekly scheduled blocks',
      state: 'neutral',
    },
  ];

  const getSessionForSlot = (day, slotLabel) => {
    return facultySchedule.find((s) => s.day === day && s.timeSlot === slotLabel);
  };

  const mobileDaySessions = facultySchedule.filter((s) => s.day === selectedMobileDay);

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Teaching Allocation & Master Matrix"
        title="Weekly Teaching Timetable"
        description={facultyName ? `Official weekly schedule for ${facultyName} across lecture cohorts and practical laboratories.` : "Official weekly schedule across lecture cohorts and practical laboratories."}
      />

      <MetricStrip metrics={metrics} />

      {/* Desktop Weekly Matrix View */}
      <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SectionHeader
          title="Master Teaching Matrix (Monday – Saturday)"
          subtitle="Autonomous Timetable Cell Allocation · Autumn Semester 2026"
        />

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', width: '120px' }}>
                  Day
                </th>
                {timeSlots.map((slot) => (
                  <th
                    key={slot.id}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: slot.isBreak ? 'var(--text-muted)' : 'var(--text-primary)',
                      background: slot.isBreak ? 'var(--bg-canvas)' : 'inherit',
                      minWidth: slot.isBreak ? '100px' : '170px',
                    }}
                  >
                    {slot.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => (
                <tr key={day} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      color: day === 'Thursday' ? 'var(--brand-blue)' : 'var(--text-primary)',
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    {day}
                    {day === 'Thursday' && (
                      <span className="badge badge-info" style={{ display: 'block', width: 'fit-content', marginTop: '3px', fontSize: '0.625rem' }}>
                        Today
                      </span>
                    )}
                  </td>

                  {timeSlots.map((slot) => {
                    if (slot.isBreak) {
                      return (
                        <td
                          key={slot.id}
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            background: 'var(--bg-canvas)',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                          }}
                        >
                          Lunch Break
                        </td>
                      );
                    }

                    const session = getSessionForSlot(day, slot.label);

                    if (!session) {
                      return (
                        <td
                          key={slot.id}
                          style={{
                            padding: '0.5rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                          }}
                        >
                          —
                        </td>
                      );
                    }

                    const isLab = session.type === 'Laboratory';
                    const isOffice = session.type === 'Office Hours';

                    return (
                      <td
                        key={slot.id}
                        style={{
                          padding: '0.65rem 0.75rem',
                          background: isLab
                            ? 'var(--state-info-bg)'
                            : isOffice
                            ? 'var(--bg-subtle)'
                            : 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                            <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                              {session.courseCode}
                            </strong>
                            <span className={`badge ${isLab ? 'badge-info' : 'badge-neutral'}`} style={{ fontSize: '0.625rem', padding: '1px 4px' }}>
                              {session.type}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.25 }}>
                            {session.subjectName}
                          </div>

                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                            {session.room} · {session.section}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Day-Based Card Layout */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SectionHeader
          title="Daily Schedule"
          subtitle="Day-by-day teaching roster"
        />

        {/* Day Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {daysOfWeek.map((d) => (
            <button
              key={d}
              type="button"
              className={`btn btn-sm ${selectedMobileDay === d ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', whiteSpace: 'nowrap' }}
              onClick={() => setSelectedMobileDay(d)}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Sessions for selected day */}
        {mobileDaySessions.length === 0 ? (
          <EmptyState
            title={`No classes on ${selectedMobileDay}`}
            description="No lecture or laboratory sessions scheduled for this day."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {mobileDaySessions.map((sess) => (
              <div
                key={sess.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-info">{sess.timeSlot}</span>
                  <span className="badge badge-neutral">{sess.type}</span>
                </div>

                <div>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {sess.courseCode} — {sess.subjectName}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {sess.room} · {sess.section} ({sess.enrolled} Students)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
