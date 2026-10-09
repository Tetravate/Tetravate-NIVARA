import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Check,
  Coffee,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowLeft,
  CalendarDays,
  AlertCircle,
  Sun,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState } from './workspace';

export default function TodayTimeline({ onBack }) {
  const { timetableEntries, setActiveTab } = useNivara();
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [isHolidayMode, setIsHolidayMode] = useState(false);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Current semester academic week date mapping
  const DAY_DATES = {
    Monday: 'Monday · 6 October 2026',
    Tuesday: 'Tuesday · 7 October 2026',
    Wednesday: 'Wednesday · 8 October 2026',
    Thursday: 'Thursday · 9 October 2026',
    Friday: 'Friday · 10 October 2026',
    Saturday: 'Saturday · 11 October 2026',
  };

  const todayDateString = DAY_DATES[selectedDay] || `${selectedDay} · Semester 5`;

  // Loading & Error States
  if (timetableEntries === undefined) {
    return (
      <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <PageHeader eyebrow="Academic Timetable Stream" title="Today's Schedule" description="Loading timetable entries..." />
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={24} className="pulse-dot" style={{ margin: '0 auto 0.75rem' }} />
          <div>Synchronizing academic schedule from registry...</div>
        </div>
      </div>
    );
  }

  if (timetableEntries === null) {
    return (
      <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <PageHeader eyebrow="Academic Timetable Stream" title="Today's Schedule" description="Schedule unavailable" />
        <EmptyState
          icon={AlertCircle}
          title="Timetable Data Unavailable"
          description="Could not load the institutional timetable service. Please verify network connectivity or check back shortly."
          action={
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          }
        />
      </div>
    );
  }

  // Filter entries for the selected day and sort chronologically by startTime
  const dayClasses = (timetableEntries || [])
    .filter((entry) => (entry.dayOfWeek || entry.day_of_week) === selectedDay)
    .sort((a, b) => ((a.startTime || a.start_time) || '').localeCompare((b.startTime || b.start_time) || ''));

  // Build the chronological schedule stream with lunch and free intervals
  const enrichedStream = [];

  if (dayClasses.length > 0 && !isHolidayMode && selectedDay !== 'Saturday') {
    dayClasses.forEach((cls, idx) => {
      // Determine session state relative to current simulated time (10:15 AM on Tuesday)
      let status = 'upcoming';
      if (selectedDay === 'Tuesday') {
        if (cls.startTime < '10:00:00') {
          status = 'attended';
        } else if (cls.startTime <= '10:30:00' && cls.endTime >= '10:00:00') {
          status = 'in-progress';
        }
      } else if (selectedDay === 'Monday') {
        status = 'attended';
      }

      enrichedStream.push({
        id: cls.id,
        time: cls.timeSlot,
        timeShort: cls.startTime ? cls.startTime.substring(0, 5) : '10:00',
        subject: cls.subjectName,
        code: cls.courseCode,
        room: cls.room,
        instructor: cls.facultyName,
        isLab: cls.isLab,
        status,
      });

      // Insert free study window or lunch break if gap exists
      if (idx === 0) {
        enrichedStream.push({
          id: 'free-study-1',
          isFree: true,
          timeShort: '11:30 AM',
          time: '11:30 AM – 01:00 PM',
          title: 'Study Window & Library Resource Access',
          duration: '1h 30m',
          suggestions: [
            { icon: BookOpen, text: 'Campus Library & Resource Center open for quiet study' },
            { icon: Coffee, text: 'Central Campus Canteen & Cafeteria (Student Center Block)' },
          ],
        });

        enrichedStream.push({
          id: 'lunch-break',
          isLunch: true,
          timeShort: '01:00 PM',
          time: '01:00 PM – 02:00 PM',
          subject: 'University Midday Break & Dining',
          room: 'Central Dining Hall',
        });
      }
    });
  }

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={`Academic Timetable Stream · ${todayDateString}`}
        title="Today's Schedule"
        description="A calm chronological stream of your day across lectures, laboratory sessions, and study windows."
        actions={[
          <button
            key="holiday-toggle"
            type="button"
            className={`btn btn-sm ${isHolidayMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsHolidayMode(!isHolidayMode)}
            title="Toggle Institutional Holiday State"
          >
            <Sun size={13} /> {isHolidayMode ? 'Normal Day View' : 'Holiday State'}
          </button>,
          <button
            key="timetable"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('timetable')}
          >
            <CalendarDays size={13} /> Full Weekly Matrix
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

      {/* 2. Day Selector */}
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

      {/* 3. Schedule Stream Timeline / Holiday / Empty State */}
      {isHolidayMode ? (
        <EmptyState
          icon={Sun}
          title={`Institutional Recess / University Holiday (${selectedDay})`}
          description="Campus academic operations are suspended. Lecture halls and laboratory complexes are closed for the declared institutional holiday."
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsHolidayMode(false)}
            >
              Return to Regular Schedule
            </button>
          }
        />
      ) : selectedDay === 'Saturday' ? (
        <EmptyState
          icon={Calendar}
          title="Weekend · No Scheduled Lectures"
          description="Saturday is designated for student co-curricular activities, hackathons, and self-directed study."
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedDay('Tuesday')}
            >
              View Today's Academic Schedule
            </button>
          }
        />
      ) : enrichedStream.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No Lectures Scheduled for ${selectedDay}`}
          description="You have no formal classes or laboratory periods scheduled on this date in the department timetable."
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('timetable')}
            >
              Inspect Weekly Timetable Matrix
            </button>
          }
        />
      ) : (
        <div className="stream-timeline">
          <div className="stream-spine" />

          {enrichedStream.map((item) => {
            const isAttended = item.status === 'attended';
            const isActive = item.status === 'in-progress';
            const isFree = item.isFree;
            const isLunch = item.isLunch;

            // Free Window Insight Callout
            if (isFree) {
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div className="stream-node" style={{ borderColor: 'var(--brand-primary)', background: 'var(--bg-canvas)' }} />
                  <div className="notion-callout" style={{ flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={15} color="var(--brand-blue)" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                      </div>
                      <span className="badge badge-neutral">{item.duration}</span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Available preparation window between morning lectures and afternoon laboratory sessions:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                      {item.suggestions.map((sug, idx) => {
                        const IconComponent = sug.icon;
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.8125rem',
                              color: 'var(--text-secondary)',
                              padding: '0.45rem 0.65rem',
                              borderRadius: 'var(--radius-xs)',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <IconComponent size={13} color="var(--brand-blue)" />
                            <span>{sug.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Lunch Break Row
            if (isLunch) {
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
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.subject}</span>
                      <span style={{ color: 'var(--text-muted)' }}>• {item.room}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.timeShort}</span>
                  </div>
                </div>
              );
            }

            // Standard Class / Lab Slot
            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <div className={`stream-node ${isActive ? 'stream-node-active' : isAttended ? 'stream-node-done' : ''}`} />
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--bg-hover)' : 'var(--bg-surface)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-strong)' : 'var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {item.timeShort}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.time}
                      </span>
                    </div>

                    <div>
                      {isAttended && (
                        <span className="badge badge-success">
                          <Check size={11} /> Attended
                        </span>
                      )}
                      {isActive && (
                        <span className="badge badge-info">
                          <span className="pulse-dot" /> In Session
                        </span>
                      )}
                      {!isAttended && !isActive && (
                        <span className="badge badge-neutral">Upcoming</span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.subject}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} /> {item.room}
                    </span>
                    <span>•</span>
                    <span>{item.instructor}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                      {item.code} {item.isLab && '· Lab'}
                    </span>
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
