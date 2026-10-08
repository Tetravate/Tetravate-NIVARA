import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Check,
  Calendar,
  Sparkles,
  ArrowLeft,
  CalendarDays,
  Zap,
  Coffee,
  Sun,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyTodaySchedule({ onBack }) {
  const { timetableEntries, setActiveTab } = useNivara();
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [isHolidayMode, setIsHolidayMode] = useState(false);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const DAY_DATES = {
    Monday: 'Monday · 6 October 2026',
    Tuesday: 'Tuesday · 7 October 2026',
    Wednesday: 'Wednesday · 8 October 2026',
    Thursday: 'Thursday · 9 October 2026',
    Friday: 'Friday · 10 October 2026',
    Saturday: 'Saturday · 11 October 2026',
  };

  const todayDateString = DAY_DATES[selectedDay] || `${selectedDay} · Academic Week`;

  // Filter timetable for faculty (Dr. Priya Raman)
  // On Tuesday and Monday, Dr. Priya Raman has assigned slots in the department
  const facultyEntries = (timetableEntries || []).filter(
    (e) => e.facultyName === 'Dr. Priya Raman' || e.courseCode === 'CS301' || e.courseCode === 'AI302'
  );

  const daySessions = facultyEntries
    .filter((e) => e.dayOfWeek === selectedDay)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Build the chronological teaching stream with research and lunch windows
  const stream = [];

  if (daySessions.length > 0 && !isHolidayMode && selectedDay !== 'Saturday') {
    daySessions.forEach((cls, idx) => {
      let status = 'upcoming';
      if (selectedDay === 'Tuesday') {
        if (cls.startTime < '10:00:00') {
          status = 'conducted';
        } else if (cls.startTime <= '10:30:00' && cls.endTime >= '10:00:00') {
          status = 'in-progress';
        }
      } else if (selectedDay === 'Monday') {
        status = 'conducted';
      }

      stream.push({
        id: cls.id,
        time: cls.timeSlot,
        timeShort: cls.startTime ? cls.startTime.substring(0, 5) : '10:00',
        subject: cls.subjectName,
        code: cls.courseCode,
        section: cls.sectionCode || 'AIDS-A (Sem 5)',
        room: cls.room,
        isLab: cls.isLab,
        status,
      });

      if (idx === 0) {
        stream.push({
          id: 'office-hours',
          isFree: true,
          timeShort: '11:30 AM',
          time: '11:30 AM – 01:00 PM',
          title: 'Department Research Window & Student Academic Advisory',
          duration: '1h 30m',
          notes: 'Open office hours for III Year AI & DS student queries and C++ graph benchmark reviews.',
        });

        stream.push({
          id: 'lunch-break',
          isLunch: true,
          timeShort: '01:00 PM',
          time: '01:00 PM – 02:00 PM',
          title: 'Faculty Commons Dining & Department Colloquium',
          room: 'Faculty Lounge (Block A)',
        });
      }
    });
  }

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={`Teaching Timetable · ${todayDateString}`}
        title="Today's Teaching Schedule"
        description="Daily teaching sessions, laboratory practical blocks, office consultation hours, and session attendance status."
        actions={[
          <button
            key="holiday-toggle"
            type="button"
            className={`btn btn-sm ${isHolidayMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsHolidayMode(!isHolidayMode)}
            title="Toggle Institutional Holiday State"
          >
            <Sun size={13} /> {isHolidayMode ? 'Normal Teaching Day' : 'Declare Holiday State'}
          </button>,
          <button
            key="timetable"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('timetable')}
          >
            <CalendarDays size={13} /> Weekly Matrix
          </button>,
          onBack && (
            <button key="back" type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          ),
        ].filter(Boolean)}
      />

      {/* 2. Day Switcher Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {DAYS.map((day) => {
          const isToday = day === 'Tuesday';
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setSelectedDay(day);
                setIsHolidayMode(false);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  style={{
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--state-success-bg)',
                    color: isSelected ? '#FFFFFF' : 'var(--state-success)',
                  }}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Schedule Content / Empty / Holiday States */}
      {isHolidayMode ? (
        <EmptyState
          icon={Sun}
          title={`Institutional Recess / University Holiday (${selectedDay})`}
          description="Academic lectures and lab sessions suspended for the scheduled university holiday. No classroom attendance required."
          action={
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsHolidayMode(false)}>
              Return to Regular Schedule
            </button>
          }
        />
      ) : selectedDay === 'Saturday' ? (
        <EmptyState
          icon={Calendar}
          title="Weekend · No Formal Teaching Periods"
          description="Saturdays are reserved for faculty research paper publications, departmental curriculum committee reviews, and hackathon mentorship."
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setSelectedDay('Tuesday')}>
              View Active Teaching Tuesday
            </button>
          }
        />
      ) : stream.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No Teaching Periods Scheduled for ${selectedDay}`}
          description="You have no assigned lecture periods or laboratory hours on this day in the departmental master timetable."
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setActiveTab('timetable')}>
              Inspect Full Weekly Matrix
            </button>
          }
        />
      ) : (
        <div className="stream-timeline">
          <div className="stream-spine" />

          {stream.map((item) => {
            if (item.isFree) {
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div className="stream-node" style={{ borderColor: 'var(--brand-primary)', background: 'var(--bg-canvas)' }} />
                  <div className="notion-callout" style={{ flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={14} color="var(--brand-blue)" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                      </div>
                      <span className="badge badge-neutral">{item.duration}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {item.notes}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.isLunch) {
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div className="stream-node" />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Coffee size={14} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>• {item.room}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.timeShort}</span>
                  </div>
                </div>
              );
            }

            const isConducted = item.status === 'conducted';
            const isInProgress = item.status === 'in-progress';

            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <div className={`stream-node ${isInProgress ? 'stream-node-active' : isConducted ? 'stream-node-done' : ''}`} />
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isInProgress ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isInProgress ? 'var(--border-strong)' : 'var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {item.timeShort}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                    </div>

                    <div>
                      {isConducted && (
                        <span className="badge badge-success">
                          <Check size={11} /> Conducted & Synced
                        </span>
                      )}
                      {isInProgress && (
                        <span className="badge badge-info">
                          <span className="pulse-dot" /> In Progress Now
                        </span>
                      )}
                      {!isConducted && !isInProgress && (
                        <span className="badge badge-neutral">Upcoming Session</span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.subject}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} /> {item.room}
                      </span>
                      <span>•</span>
                      <span>Section: {item.section}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                        {item.code} {item.isLab && '· Lab'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveTab('attendance')}
                    >
                      <Zap size={11} /> Roster Attendance
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
