import React, { useState } from 'react';
import { User, Clock, MapPin, Check, X, Users, Zap } from 'lucide-react';
import { FACULTY_PROFILE } from '../data/mockData';
import confetti from 'canvas-confetti';

export default function FacultyView({ onShowToast }) {
  const [roster, setRoster] = useState(FACULTY_PROFILE.roster);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const presentCount = roster.filter((s) => s.status === 'present').length;
  const absentCount = roster.filter((s) => s.status === 'absent').length;

  const handleMarkAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    onShowToast?.('Marked all 28 students as Present', 'info');
  };

  const handleToggleStudent = (id) => {
    setRoster((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'present' ? 'absent' : 'present' }
          : s
      )
    );
  };

  const handleSaveAttendance = () => {
    setAttendanceSaved(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    onShowToast?.(
      `Attendance Saved ✓ Data Structures (${presentCount} Present, ${absentCount} Absent)`,
      'success'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header (Prompt Section 19 Standard) */}
      <div>
        <div className="student-greeting-date">
          <User size={13} color="var(--brand-blue)" />
          <span>Faculty Operating Workspace</span>
        </div>
        <h1 className="student-greeting-name">
          Good Morning, Dr. Priya
        </h1>
        <p className="student-greeting-sub">
          Today: <strong>3 Classes</strong> · <strong>2 Assignments</strong> pending review ·{' '}
          <strong style={{ color: 'var(--state-warning)' }}>1 Attendance Pending</strong>
        </p>
      </div>

      {/* Active Class Action Banner (Prompt Section 19) */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-info">
              <span className="pulse-dot" /> Next Class · 10:00 AM
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {FACULTY_PROFILE.activeClass.batch}
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {FACULTY_PROFILE.activeClass.subject} ({FACULTY_PROFILE.activeClass.courseCode})
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
            <span>Room: <strong>{FACULTY_PROFILE.activeClass.room}</strong></span>
            <span>•</span>
            <span>{FACULTY_PROFILE.activeClass.enrolledCount} Students</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            document.getElementById('roster-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Zap size={14} />
          <span>Take Attendance</span>
        </button>
      </div>

      {/* Rapid Attendance Workflow (Prompt Section 20) */}
      <section id="roster-section" className="prompt-section">
        <div className="prompt-section-header">
          <span>Data Structures · III AI & DS (28 Students)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--state-success)', fontWeight: 600 }}>
              {presentCount} Present
            </span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--state-urgent)', fontWeight: 600 }}>
              {absentCount} Absent
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Single tap toggles attendance. 15-second classroom workflow.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllPresent}
            >
              <Check size={12} color="var(--state-success)" /> Mark All Present
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveAttendance}
            >
              {attendanceSaved ? 'Saved ✓' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Roster list */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.4rem',
        }}>
          {roster.map((student) => {
            const isPresent = student.status === 'present';
            return (
              <div
                key={student.id}
                onClick={() => handleToggleStudent(student.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: isPresent ? 'var(--bg-surface)' : 'var(--state-urgent-bg)',
                  border: '1px solid',
                  borderColor: isPresent ? 'var(--border-subtle)' : 'var(--state-urgent-border)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {student.roll}
                  </div>
                </div>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isPresent ? 'var(--state-success-bg)' : 'var(--state-urgent)',
                  color: isPresent ? 'var(--state-success)' : '#FFFFFF',
                }}>
                  {isPresent ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
