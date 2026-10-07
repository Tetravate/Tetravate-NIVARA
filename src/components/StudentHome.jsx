import React from 'react';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  ChevronRight,
  Flame,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  STUDENT_PROFILE,
  TODAY_TIMELINE,
  ATTENDANCE_DATA,
  ASSIGNMENTS_DATA,
  EXAMS_TIMELINE,
} from '../data/mockData';

export default function StudentHome({ onNavigate, onAssignmentToggle }) {
  const activeClass = TODAY_TIMELINE.find((c) => c.status === 'in-progress');
  const nextClass = TODAY_TIMELINE.find((c) => c.status === 'upcoming') || TODAY_TIMELINE[1];
  const urgentAssignment = ASSIGNMENTS_DATA.find((a) => a.urgency === 'urgent' && !a.completed);
  const nextExam = EXAMS_TIMELINE[0];
  const oopSubject = ATTENDANCE_DATA.subjects.find((s) => s.percentage < 80);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 1. Master Greeting (Prompt Section 4 Standard) */}
      <div>
        <div className="student-greeting-date">
          <span>Tuesday · 7 October 2026</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span>Semester 5</span>
        </div>
        <h1 className="student-greeting-name">
          Good Morning, {STUDENT_PROFILE.name.split(' ')[0]}
        </h1>
        <p className="student-greeting-sub">
          Here is what matters for your day.
        </p>
      </div>

      {/* 2. NEXT (Prompt Section 4) */}
      <section className="prompt-section">
        <div className="prompt-section-header">
          <span>Next</span>
          <button
            type="button"
            onClick={() => onNavigate('today')}
            className="prompt-section-link"
          >
            Today's Timeline <ArrowRight size={13} />
          </button>
        </div>

        <div
          className="prompt-item-block"
          onClick={() => onNavigate('today')}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="prompt-time-label">10:00 AM</span>
              {activeClass && (
                <span className="badge badge-info">
                  <span className="pulse-dot" /> In Session
                </span>
              )}
            </div>
            <div className="prompt-title-large">
              {activeClass ? activeClass.subject : nextClass.subject}
            </div>
            <div className="prompt-meta-text">
              <MapPin size={13} />
              <span>{activeClass ? activeClass.room : nextClass.room}</span>
              <span>•</span>
              <span>{activeClass ? activeClass.instructor : nextClass.instructor}</span>
            </div>
          </div>

          <ChevronRight size={18} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
        </div>
      </section>

      {/* 3. ATTENDANCE (Prompt Section 4 & 7) */}
      <section className="prompt-section">
        <div className="prompt-section-header">
          <span>Attendance</span>
          <button
            type="button"
            onClick={() => onNavigate('attendance')}
            className="prompt-section-link"
          >
            Full Breakdown & Insights <ArrowRight size={13} />
          </button>
        </div>

        <div
          className="prompt-item-block"
          onClick={() => onNavigate('attendance')}
          style={{ cursor: 'pointer', padding: '1.25rem 1.25rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem' }}>
            <div className="attendance-big-num">
              {ATTENDANCE_DATA.overallPercentage}%
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--state-success)', marginBottom: '0.2rem' }}>
                You're on track
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                95 of 109 lectures attended across 5 courses
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', alignSelf: 'center' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
              Cutoff: 75%
            </span>
          </div>
        </div>

        {/* Quiet warning if any course is near cutoff */}
        {oopSubject && (
          <div
            className="notion-callout notion-callout-warning"
            onClick={() => onNavigate('attendance')}
            style={{ cursor: 'pointer', marginTop: '0.25rem' }}
          >
            <AlertCircle size={16} color="var(--state-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, fontSize: '0.8125rem' }}>
              <strong>{oopSubject.name}</strong> is at <strong>{oopSubject.percentage}%</strong>. You can safely miss only <strong>1 more class</strong>.
            </div>
            <ArrowRight size={14} color="var(--state-warning)" style={{ alignSelf: 'center' }} />
          </div>
        )}
      </section>

      {/* 4. DUE SOON (Prompt Section 4 & 9) */}
      <section className="prompt-section">
        <div className="prompt-section-header">
          <span>Due Soon</span>
          <button
            type="button"
            onClick={() => onNavigate('assignments')}
            className="prompt-section-link"
          >
            All Assignments <ArrowRight size={13} />
          </button>
        </div>

        {urgentAssignment ? (
          <div className="prompt-item-block">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-urgent">Tomorrow · 11:59 PM</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>80% done</span>
              </div>
              <div className="prompt-title-large">
                {urgentAssignment.title}
              </div>
              <div className="prompt-meta-text">
                <span>{urgentAssignment.subject}</span>
                <span>•</span>
                <span>{urgentAssignment.faculty}</span>
              </div>
            </div>

            <div style={{ alignSelf: 'center', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => onAssignmentToggle(urgentAssignment.id)}
              >
                <Check size={13} />
                <span>Mark Done</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No pressing assignments due within 48 hours. You are caught up.
          </div>
        )}
      </section>

      {/* 5. UPCOMING (Prompt Section 4 & 10) */}
      <section className="prompt-section">
        <div className="prompt-section-header">
          <span>Upcoming</span>
          <button
            type="button"
            onClick={() => onNavigate('exams')}
            className="prompt-section-link"
          >
            Exam Timeline <ArrowRight size={13} />
          </button>
        </div>

        {nextExam && (
          <div
            className="prompt-item-block"
            onClick={() => onNavigate('exams')}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-neutral">{nextExam.dateFormatted}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {nextExam.daysRemaining} days away
                </span>
              </div>
              <div className="prompt-title-large">
                {nextExam.subject}
              </div>
              <div className="prompt-meta-text">
                <span>{nextExam.examType}</span>
                <span>•</span>
                <span>{nextExam.venue}</span>
              </div>
            </div>

            <ChevronRight size={18} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
          </div>
        )}
      </section>
    </div>
  );
}
