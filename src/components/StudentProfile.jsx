import React, { useState } from 'react';
import { User, Mail, GraduationCap, Award, Shield, Check, Edit2 } from 'lucide-react';
import { useNivara } from '../context/NivaraContext';

export default function StudentProfile({ onBack }) {
  const { students, currentUser, updateUserProfile } = useNivara();
  const activeStudentId = currentUser?.studentId || currentUser?.id || '2024-AIDS-042';
  const student = (students || []).find((s) => s.id === activeStudentId || s.email === currentUser?.email) || (students || [])[0] || {};

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof updateUserProfile === 'function') {
      updateUserProfile(formData);
    }
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div className="student-greeting-date">
          <User size={13} color="var(--brand-blue)" />
          <span>Student Credentials & Identity Registry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 className="student-greeting-name" style={{ fontSize: '1.85rem' }}>
              Student Profile
            </h1>
            <p className="student-greeting-sub">
              Verified university registration records and continuous evaluation standing.
            </p>
          </div>
          {onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              Back to Home
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
          <img
            src={student.avatar}
            alt={student.name}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--border-card)',
            }}
          />

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {student.name}
              </h2>
              <span className="badge badge-success">Active Enrolled</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditing(!isEditing)}
                style={{ padding: '0.2rem 0.4rem', color: 'var(--brand-blue)' }}
              >
                <Edit2 size={12} /> {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  required
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  required
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <Check size={12} /> Save
                </button>
              </form>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                B.Tech in {student.department} · {student.year} ({student.email})
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>ID: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{student.id}</code></span>
              <span>•</span>
              <span>Roll: {student.rollNo || '22AIDS042'}</span>
              <span>•</span>
              <span>Academic Advisor: <strong>{student.advisor || 'Dr. Priya Raman'}</strong></span>
            </div>
          </div>
        </div>

        {/* 4 Vitals Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Cumulative CGPA
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {student.cgpa}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--state-success)', fontWeight: 600 }}>
              Top 5% Department Rank
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Attendance
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: student.attendancePct >= 75 ? 'var(--state-success)' : 'var(--state-urgent)', marginTop: '0.2rem' }}>
              {student.attendancePct}%
            </div>
            <div style={{ fontSize: '0.6875rem', color: student.attendancePct >= 75 ? 'var(--state-success)' : 'var(--state-urgent)' }}>
              {student.attendancePct >= 75 ? 'Above 75% cutoff' : 'Attendance Warning'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Semester
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Semester {student.semester}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Autumn Term 2026
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Fee Account Status
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: student.feeStatus === 'paid' ? 'var(--state-success)' : 'var(--state-warning)', marginTop: '0.2rem' }}>
              {student.feeStatus === 'paid' ? 'Cleared' : 'Pending'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {student.feeStatus === 'paid' ? 'No outstanding dues' : `₹${student.feePendingAmount.toLocaleString()} due`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
