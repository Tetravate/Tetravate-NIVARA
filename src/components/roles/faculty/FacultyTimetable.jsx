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

  // Faculty's weekly schedule matrix (scoped strictly to Dr. Priya Raman)
  const facultySchedule = useMemo(() => {
    return [
      {
        id: 'tt-fac-1',
        day: 'Monday',
        timeSlot: '08:30 AM – 10:00 AM',
        courseCode: 'CS301',
        subjectName: 'Data Structures & Algorithms',
        section: 'AIDS-A-SEM5',
        room: 'Room A204',
        type: 'Lecture',
        enrolled: 28,
      },
      {
        id: 'tt-fac-2',
        day: 'Monday',
        timeSlot: '01:00 PM – 02:30 PM',
        courseCode: 'Office Hours',
        subjectName: 'Student Research & Project Mentorship',
        section: 'AIDS Dept',
        room: 'Faculty Cabin B-12',
        type: 'Office Hours',
        enrolled: 6,
      },
      {
        id: 'tt-fac-3',
        day: 'Tuesday',
        timeSlot: '02:45 PM – 04:30 PM',
        courseCode: 'CS301-L',
        subjectName: 'Data Structures Lab (Benchmark Suite)',
        section: 'AIDS-A-SEM5',
        room: 'Computing Lab 2',
        type: 'Laboratory',
        enrolled: 28,
      },
      {
        id: 'tt-fac-4',
        day: 'Wednesday',
        timeSlot: '10:15 AM – 11:45 AM',
        courseCode: 'AI302',
        subjectName: 'Machine Learning Foundations Lab',
        section: 'AIDS-A-SEM5',
        room: 'AI Computing Lab 1',
        type: 'Laboratory',
        enrolled: 28,
      },
      {
        id: 'tt-fac-5',
        day: 'Thursday',
        timeSlot: '08:30 AM – 10:00 AM',
        courseCode: 'CS301',
        subjectName: 'Data Structures & Algorithms',
        section: 'AIDS-A-SEM5',
        room: 'Computing Lab 2',
        type: 'Lecture',
        enrolled: 28,
      },
      {
        id: 'tt-fac-6',
        day: 'Thursday',
        timeSlot: '01:00 PM – 02:30 PM',
        courseCode: 'AI308',
        subjectName: 'Deep Learning & Neural Architectures',
        section: 'AIDS-B-SEM5',
        room: 'Hall B204',
        type: 'Elective',
        enrolled: 32,
      },
      {
        id: 'tt-fac-7',
        day: 'Friday',
        timeSlot: '10:15 AM – 11:45 AM',
        courseCode: 'AI308',
        subjectName: 'Deep Learning & Neural Architectures',
        section: 'AIDS-B-SEM5',
        room: 'Hall B204',
        type: 'Elective',
        enrolled: 32,
      },
      {
        id: 'tt-fac-8',
        day: 'Saturday',
        timeSlot: '10:15 AM – 11:45 AM',
        courseCode: 'Colloquium',
        subjectName: 'Departmental Faculty Research Seminar',
        section: 'Faculty Council',
        room: 'Conference Hall A',
        type: 'Seminar',
        enrolled: 18,
      },
    ];
  }, []);

  const totalTeachingHours = 16;
  const lectureSessions = facultySchedule.filter((s) => s.type === 'Lecture' || s.type === 'Elective').length;
  const labSessions = facultySchedule.filter((s) => s.type === 'Laboratory').length;

  const metrics = [
    {
      label: 'Weekly Workload',
      value: `${totalTeachingHours} Hours`,
      subtext: 'Within 18 hrs max workload policy',
      state: 'success',
    },
    {
      label: 'Lecture Sessions',
      value: `${lectureSessions} Slots`,
      subtext: 'Theory cohorts (CS301 & AI308)',
      state: 'info',
    },
    {
      label: 'Practical Lab Hours',
      value: `${labSessions} Sessions`,
      subtext: 'Computing Lab 2 & AI Lab 1',
      state: 'info',
    },
    {
      label: 'Office & Mentorship',
      value: '4 Hours Weekly',
      subtext: 'Faculty Cabin B-12',
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
        description="Official autonomous weekly schedule for Dr. Priya Raman across Department of AI & Data Science lecture cohorts, practical laboratories, and office mentoring hours."
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
