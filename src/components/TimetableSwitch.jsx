import React, { useState } from 'react';
import {
  CalendarDays,
  MapPin,
  List,
  Grid,
  ArrowLeft,
  Clock,
  User,
  Coffee,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import TodayTimeline from './TodayTimeline';
import { PageHeader, SectionHeader, EmptyState } from './workspace';

export default function TimetableSwitch({ onBack }) {
  const { timetableEntries } = useNivara();
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'today'
  const [selectedDay, setSelectedDay] = useState('Tuesday');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Extract courses for selected day directly from live context timetableEntries
  const getDaySchedule = (day) => {
    const contextEntries = (timetableEntries || []).filter((e) => (e.dayOfWeek || e.day_of_week) === day);

    return contextEntries.map((e) => ({
      time: e.timeSlot || e.time || '09:00 - 10:00',
      subject: e.subjectName || e.subject || 'Academic Session',
      code: e.courseCode || e.code || '',
      faculty: e.facultyName || e.faculty || 'Faculty Member',
      room: e.room || 'TBA',
      isLab: Boolean(e.isLab || (e.subjectName || e.subject || '').toLowerCase().includes('lab')),
    }));
  };

  const currentSchedule = getDaySchedule(selectedDay);

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header with Switcher */}
      <PageHeader
        eyebrow="Academic Affairs · Department of AI & Data Science · Semester 5"
        title="Weekly Academic Timetable"
        description="Structured lecture timetable, laboratory time blocks, faculty allocations, and venue charts."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'today' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('today')}
              >
                <List size={13} /> Today (Timeline)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('week')}
              >
                <Grid size={13} /> Week (Matrix)
              </button>
            </div>

            {onBack && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
                <ArrowLeft size={13} /> Back to Home
              </button>
            )}
          </div>
        }
      />

      {viewMode === 'today' ? (
        <TodayTimeline onBack={() => setViewMode('week')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Day Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {DAYS.map((day) => {
              const isToday = day === 'Tuesday';
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedDay(day)}
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

          {/* Matrix Grid (Responsive: transforms into structured card list on mobile and grid on desktop) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {currentSchedule.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={`No sessions scheduled for ${selectedDay}`}
                description="This day is designated for institutional recess, self-paced projects, or university holidays."
              />
            ) : (
              currentSchedule.map((slot, idx) => {
                const isFree = slot.subject.includes('Free') || slot.subject.includes('Study') || slot.subject.includes('Project');
                const isLunch = slot.subject.includes('Break') || slot.subject.includes('Dining');
                const isActiveSlot = selectedDay === 'Tuesday' && slot.time.startsWith('10:00');

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '1.15rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isActiveSlot
                        ? 'var(--bg-hover)'
                        : isFree || isLunch
                        ? 'var(--bg-subtle)'
                        : 'var(--bg-surface)',
                      border: '1px solid',
                      borderColor: isActiveSlot
                        ? 'var(--brand-primary)'
                        : isFree || isLunch
                        ? 'var(--border-subtle)'
                        : 'var(--border-subtle)',
                      borderStyle: isFree || isLunch ? 'dashed' : 'solid',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78125rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Clock size={12} color="var(--text-muted)" /> {slot.time}
                      </span>

                      {isActiveSlot ? (
                        <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>
                          <span className="pulse-dot" /> In Session Now
                        </span>
                      ) : slot.isLab ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>
                          Laboratory
                        </span>
                      ) : isFree || isLunch ? (
                        <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                          {isLunch ? 'Midday Dining' : 'Self-Guided'}
                        </span>
                      ) : slot.code ? (
                        <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>
                          {slot.code}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {slot.subject}
                    </div>

                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} /> {slot.room}
                      </span>
                      {slot.faculty && (
                        <>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={12} /> {slot.faculty}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
