import React, { useState } from 'react';
import { Shield, AlertTriangle, Check, X } from 'lucide-react';
import { ADMIN_OVERVIEW } from '../data/mockData';
import confetti from 'canvas-confetti';

export default function AdminView({ onShowToast }) {
  const [needsAttention, setNeedsAttention] = useState(ADMIN_OVERVIEW.needsAttention);
  const [safetyModal, setSafetyModal] = useState(null);

  const handleTriggerAction = (item) => {
    if (item.type === 'conflict') {
      setSafetyModal({
        title: 'Resolve Room Conflict?',
        detail:
          'Room B204 is booked by both AI Lab and ECE Guest Lecture for Thursday 11:30 AM. Auto-reassign ECE Guest Lecture to Seminar Hall 2 and notify 65 affected students?',
        confirmLabel: 'Confirm Reallocation',
        onConfirm: () => {
          setNeedsAttention((prev) => prev.filter((a) => a.id !== item.id));
          setSafetyModal(null);
          onShowToast?.('Resolved room conflict: Reallocated to Seminar Hall 2 ✓', 'success');
        },
      });
    } else if (item.type === 'results') {
      setSafetyModal({
        title: 'Publish Official Semester Results?',
        detail:
          'This will publish final moderated grade sheets for 490 students across Mechanical and Civil departments. Notification broadcasts will be dispatched immediately.',
        confirmLabel: 'Publish Results',
        onConfirm: () => {
          setNeedsAttention((prev) => prev.filter((a) => a.id !== item.id));
          setSafetyModal(null);
          confetti({ particleCount: 30, spread: 60 });
          onShowToast?.('Published Semester Results officially ✓', 'success');
        },
      });
    } else {
      setSafetyModal({
        title: 'Approve 7 Academic Requests?',
        detail:
          'Approve 3 medical duty leaves with attendance waivers and 4 elective course transfers concurred by department heads.',
        confirmLabel: 'Approve All',
        onConfirm: () => {
          setNeedsAttention((prev) => prev.filter((a) => a.id !== item.id));
          setSafetyModal(null);
          onShowToast?.('Approved 7 pending academic requests ✓', 'success');
        },
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header (Prompt Section 21 Standard) */}
      <div>
        <div className="student-greeting-date">
          <Shield size={13} color="var(--brand-blue)" />
          <span>Institutional Administration Radar</span>
        </div>
        <h1 className="student-greeting-name">
          Dean's Academic Overview
        </h1>
        <p className="student-greeting-sub">
          Prioritizing actions over database tables.
        </p>
      </div>

      {/* Vital Metrics Grid (Prompt Section 21) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
      }}>
        <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Students</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>2,482</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--state-success)' }}>14 Departments</div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Faculty</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>148</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Full Deployment</div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attendance</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--state-success)', margin: '0.2rem 0' }}>91.4%</div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--state-success)' }}>Above standard</div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pending Tasks</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: needsAttention.length > 0 ? 'var(--state-urgent)' : 'var(--state-success)', margin: '0.2rem 0' }}>
            {needsAttention.length}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Requires Sign-off</div>
        </div>
      </div>

      {/* Needs Attention Queue (Prompt Section 21) */}
      <section className="prompt-section">
        <div className="prompt-section-header">
          <span>Needs Attention</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Action-first queue</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {needsAttention.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                  <span className="badge badge-urgent">{item.type.toUpperCase()}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {item.detail}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => handleTriggerAction(item)}
              >
                {item.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Department Attendance Health */}
      <section className="prompt-section">
        <div className="prompt-section-header">
          <span>Department Attendance Health</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Today's Aggregate</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {ADMIN_OVERVIEW.departmentAttendance.map((dept) => (
            <div
              key={dept.dept}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {dept.dept}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {dept.students} Enrolled Students
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: dept.pct >= 90 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                  {dept.pct}%
                </span>
                <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>{dept.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Confirmation Modal (Prompt Section 39) */}
      {safetyModal && (
        <div className="modal-backdrop" onClick={() => setSafetyModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} color="var(--state-urgent)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {safetyModal.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {safetyModal.detail}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSafetyModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={safetyModal.onConfirm}
                style={{ background: 'var(--state-urgent)', borderColor: 'var(--state-urgent)' }}
              >
                {safetyModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
