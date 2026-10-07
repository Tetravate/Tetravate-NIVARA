import React from 'react';
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
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState } from './workspace';

export default function TodayTimeline({ onBack }) {
  const { timetableEntries, setActiveTab } = useNivara();

  // Today context (Tuesday in current semester academic week)
  const currentDay = 'Tuesday';
  const todayDateString = 'Tuesday · 7 October 2026';

  // Filter entries for the current day and sort chronologically by startTime
  const todayClasses = (timetableEntries || [])
    .filter((entry) => entry.dayOfWeek === currentDay)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Build the chronological schedule stream with lunch and free intervals
  // 10:00 AM slot is currently in session for demo realism
  const enrichedStream = [];

  if (todayClasses.length > 0) {
    todayClasses.forEach((cls, idx) => {
      // Determine session state relative to current simulated time (10:15 AM)
      let status = 'upcoming';
      if (cls.startTime < '10:00:00') {
        status = 'attended';
      } else if (cls.startTime <= '10:30:00' && cls.endTime >= '10:00:00') {
        status = 'in-progress';
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
            { icon: BookOpen, text: 'Review Chapter 4 Graph Algorithms lecture notes in Course Repository' },
            { icon: Coffee, text: 'Central Campus Canteen & Cafeteria (Student Center Block)' },
            { icon: Check, text: 'Complete Min-Heap Priority Queue deliverables due tomorrow' },
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

      {/* 2. Schedule Stream Timeline */}
      {enrichedStream.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Lectures Scheduled for Today"
          description="You have no formal classes or laboratory periods scheduled on this date."
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('timetable')}
            >
              Inspect Weekly Timetable
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
