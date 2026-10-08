import React, { useState } from 'react';
import {
  Send,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState } from '../../workspace';

export default function ExamCellAnnouncements() {
  const { announcements, sendAnnouncement, showToast } = useNivara();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');

  const templates = [
    {
      label: 'Timetable Released',
      title: 'Examination Timetable Released: Autumn 2026 Internal II',
      content: 'The official timetable for Mid-Semester Internal Assessment II has been published. Hall allocations and seating maps are accessible under your Examination tab.',
      audience: 'all',
    },
    {
      label: 'Hall Tickets Available',
      title: 'Admit Cards & Hall Tickets Available for Download',
      content: 'All candidates with >= 75% attendance clearance can now download their verified hall tickets. Please verify your designated room desk numbers before arriving at the exam venue.',
      audience: 'student',
    },
    {
      label: 'CIA Marks Entry Deadline',
      title: 'Urgent: CIA Assessment Lock Deadline for Course Instructors',
      content: 'All faculty members must finalize and submit continuous assessment mark sheets for all courses before the official semester tabulation cutoff date.',
      audience: 'faculty',
    },
    {
      label: 'Official Results Published',
      title: 'Formal Semester 4 Examination Results Gazette Released',
      content: 'The Office of the Controller of Examinations has officially released the moderated Semester 4 results. Grade sheets and updated cumulative CGPAs are live on student portals.',
      audience: 'all',
    },
    {
      label: 'Revaluation Circular',
      title: 'Revaluation & Answer Script Grievance Window Now Open',
      content: 'Students wishing to apply for answer script re-totaling or second examiner evaluation may submit formal petitions through the Revaluation module within 10 calendar days.',
      audience: 'student',
    },
  ];

  const applyTemplate = (tmpl) => {
    setTitle(tmpl.title);
    setContent(tmpl.content);
    setTargetAudience(tmpl.audience);
    showToast(`Template applied: ${tmpl.label}`, 'info');
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both notice title and message content', 'error');
      return;
    }

    sendAnnouncement(`Exam Cell: ${title}`, content, targetAudience);
    showToast(`Examination bulletin dispatched to ${targetAudience.toUpperCase()} ✓`, 'success');
    setTitle('');
    setContent('');
  };

  const examBulletins = (announcements || []).filter(
    (a) =>
      a.title?.toLowerCase().includes('exam') ||
      a.title?.toLowerCase().includes('result') ||
      a.title?.toLowerCase().includes('timetable') ||
      a.title?.toLowerCase().includes('revaluation') ||
      a.title?.toLowerCase().includes('hall ticket') ||
      a.scope === 'all'
  );

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Office of the Controller of Examinations · Notice Dispatch"
        title="Examination Bulletins & Announcements"
        description="Broadcast official examination timetables, admit card releases, continuous assessment deadlines, and semester result gazettes to students and faculty."
      />

      {/* Preset Quick Templates */}
      <section style={{
        padding: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} color="var(--brand-primary)" /> Quick Announcement Templates
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {templates.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => applyTemplate(tmpl)}
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </section>

      {/* Announcement Composer */}
      <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Compose Official Examination Notice"
          subtitle="Bulletins published here appear on student and faculty communication feeds"
        />

        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="input-field"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="all">Institution-Wide (All Campus Portals)</option>
              <option value="student">Student Body Only</option>
              <option value="faculty">Faculty & Department Instructors Only</option>
              <option value="hod">Department Heads (HODs) Only</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Notice Subject / Headline *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Schedule Publication for Autumn Semester 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', height: '36px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Notice Content & Detailed Instructions *
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="State the full notification body, instructions, dates, and compliance requirements..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={13} /> Dispatch Official Notice
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Archive */}
      <section>
        <SectionHeader
          title="Recent Examination Bulletins"
          subtitle="Chronological feed of notices issued by the Office of the Controller of Examinations"
        />

        {examBulletins.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Active Examination Bulletins"
            message="No exam-related announcements have been broadcast recently."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {examBulletins.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                    {item.scope || 'All Campus'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.content || item.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Published: {item.date || item.publishedAt || 'Today'} · Office of the COE
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
