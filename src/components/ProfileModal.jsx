import React, { useState } from 'react';
import { User, Check, X } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';

export default function ProfileModal() {
  const {
    profileModalOpen,
    setProfileModalOpen,
    currentUser,
    currentRole,
    students,
    updateUserProfile,
    showToast,
  } = useNivara();

  const activeStudentId = currentUser?.studentId || currentUser?.id || '';
  const currentStudent = (students || []).find((s) => (activeStudentId && s.id === activeStudentId) || (currentUser?.email && s.email === currentUser?.email)) || null;
  const isStudent = currentRole === 'student';

  const [name, setName] = useState(() => (isStudent ? currentStudent?.name || '' : currentUser?.userName || ''));
  const [email, setEmail] = useState(() => (isStudent ? currentStudent?.email || '' : currentUser?.email || ''));
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    if (!profileModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setProfileModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileModalOpen, setProfileModalOpen]);

  if (!profileModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email });
    setIsEditing(false);
    showToast('Profile credentials updated successfully ✓', 'success');
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setProfileModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className="modal-sheet"
        style={{
          maxWidth: '520px',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} color="var(--brand-blue)" />
            <h3 id="profile-modal-title" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Verified Profile & Credentials
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setProfileModalOpen(false)}
            style={{ padding: '0.3rem' }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Profile Header Block */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
          }}
        >
          <img
            src={currentUser.avatar}
            alt=""
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--border-subtle)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {isStudent ? currentStudent.name : currentUser.userName}
              </strong>
              <span className="badge badge-info">{currentUser.label}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {isStudent ? currentStudent.email : currentUser.email}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Dept: {currentUser.dept} · Title: {currentUser.title}
            </div>
          </div>
        </div>

        {/* Editable Form */}
        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={12} /> Save Credentials
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              Update Credentials
            </button>
          </div>
        )}

        {/* Credential Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.65rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>System Identifier</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {isStudent ? currentStudent.id : `FAC-ENG-${currentUser.label.slice(0, 3).toUpperCase()}`}
            </div>
          </div>

          <div style={{ padding: '0.65rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Security Clearance</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--state-success)', marginTop: '0.15rem' }}>
              Level 4 · Verified SSO
            </div>
          </div>
        </div>

        {/* Academic Standings for Student */}
        {isStudent && (
          <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Enrolled Program Details
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Bachelor of Technology in Artificial Intelligence & Data Science (Batch 2024–2028).
              Current CGPA: <strong>{currentStudent.cgpa}</strong> · Attendance: <strong>{currentStudent.attendancePct}%</strong>.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setProfileModalOpen(false)}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
