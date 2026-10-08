import React, { useState } from 'react';
import {
  Send,
  Bell,
  Calendar,
  Users,
  Building,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState } from '../../workspace';

export default function PrincipalAnnouncements() {
  const { announcements, departments, sendAnnouncement, showToast } = useNivara();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all'); // 'all' | 'students' | 'faculty' | 'hods'
  const [selectedDept, setSelectedDept] = useState('all');

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both directive title and body content', 'error');
      return;
    }

    sendAnnouncement(`Office of the Principal: ${title}`, content, targetAudience);
    showToast(`Institutional Directive Published to ${targetAudience.toUpperCase()} ✓`, 'success');
    setTitle('');
    setContent('');
  };

  const institutionalAnnouncements = (announcements || []).filter(
    (a) => a.title?.includes('Principal') || a.scope === 'all' || !a.scope || a.title?.includes('Directive')
  );

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Executive Secretariat · Public Relations Directorate"
        title="Institutional Directives & Campus Announcements"
        description="Broadcast official college directives, statutory academic calendars, and administrative notifications across all campus stakeholders."
      />

      {/* 2. Directive Composer */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Compose Official Administrative Directive"
          subtitle="Directives published here surface immediately on all connected student, faculty, and administrative dashboards"
        />

        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Target Recipient Group
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              >
                <option value="all">Entire Institution (All Students & All Staff)</option>
                <option value="student">All Enrolled Students Only</option>
                <option value="faculty">Instructional Faculty & Teaching Staff Only</option>
                <option value="hod">Department Heads (HODs Council)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Academic Division Scope
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                }}
              >
                <option value="all">Institution-Wide (All 5 Engineering Branches)</option>
                {(departments || []).map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Directive Title
            </label>
            <input
              type="text"
              placeholder="e.g. Autonomous Examination Board Schedule & Convocation Guidelines..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Directive Body & Administrative Terms
            </label>
            <textarea
              rows={4}
              placeholder="Type the full institutional text, statutory regulations, deadlines, or committee instructions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={13} /> Broadcast Institutional Directive
            </button>
          </div>
        </form>
      </div>

      {/* 3. Published Directives History */}
      <section>
        <SectionHeader
          title="Published Institutional Directives Archive"
          subtitle="Historical record of campus-wide directives issued by Office of the Principal"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {institutionalAnnouncements.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Prior Directives Recorded"
              description="Directives published by the Principal will appear in this official archive."
            />
          ) : (
            institutionalAnnouncements.map((a, i) => (
              <div
                key={a.id || i}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{a.title}</strong>
                    <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                      Audience: {a.scope || 'Institution'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {a.date || new Date().toISOString().split('T')[0]}
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {a.message || a.content}
                </p>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                  <span>Sender: <strong>Office of the Principal & Academic Dean</strong></span>
                  <span>Dispatch: Verified Institutional Feed</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
