import React, { useState } from 'react';
import {
  Send,
  Bell,
  CheckCircle2,
  Users,
  Shield,
  Layers,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState } from '../../workspace';

export default function AdminAnnouncements() {
  const { announcements, sendAnnouncement, showToast } = useNivara();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both notice title and message content', 'error');
      return;
    }

    sendAnnouncement(`ERP Operations: ${title}`, content, targetAudience);
    showToast(`System Administrative Notice dispatched to ${targetAudience.toUpperCase()} ✓`, 'success');
    setTitle('');
    setContent('');
  };

  const adminAnnouncements = (announcements || []).filter(
    (a) => a.title?.includes('ERP') || a.title?.includes('Admin') || a.scope === 'all'
  );

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="System Administration · Campus Notifications Engine"
        title="Administrative Notices & System Bulletins"
        description="Broadcast maintenance schedules, enrollment deadlines, and system downtime alerts across campus roles."
      />

      {/* 2. Composer */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Compose Operational System Announcement"
          subtitle="Bulletins published here appear on active student, faculty, and administrative dashboards"
        />

        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Target Recipient Audience
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
              <option value="all">Entire Institution (All Users)</option>
              <option value="student">Student Body Only</option>
              <option value="faculty">Faculty & Department Staff Only</option>
              <option value="admin">Administrators & Operational Officers Only</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Announcement Subject Line
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled ERP Server Maintenance Window (Sunday 02:00 – 04:00 AM)..."
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
              Bulletin Content
            </label>
            <textarea
              rows={4}
              placeholder="Type instructions, impacted portals, alternative workflows, or helpdesk contacts..."
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
              <Send size={13} /> Dispatch Operational Notice
            </button>
          </div>
        </form>
      </div>

      {/* 3. Archive Feed */}
      <section>
        <SectionHeader
          title="Published Operational Bulletins Archive"
          subtitle="Historical record of administrative announcements"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {adminAnnouncements.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Prior Administrative Notices Recorded"
              description="Announcements published by ERP Operations will appear in this log."
            />
          ) : (
            adminAnnouncements.map((a, i) => (
              <div
                key={a.id || i}
                style={{
                  padding: '1.15rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{a.title}</strong>
                    <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                      Scope: {a.scope || 'All'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {a.date || new Date().toISOString().split('T')[0]}
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {a.message || a.content}
                </p>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Dispatched by: <strong>ERP Operations Administration</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
