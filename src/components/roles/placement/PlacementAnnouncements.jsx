import React, { useState } from 'react';
import {
  Send,
  Plus,
  Bookmark,
  Bell,
  Calendar,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable } from '../../workspace';

export default function PlacementAnnouncements() {
  const {
    announcements,
    publishAnnouncement,
    showToast,
  } = useNivara();

  const [composerModal, setComposerModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scope: 'institutional',
    priority: 'high',
    targetDept: 'ALL',
    targetRole: 'student',
  });

  // Filter placement-relevant notices or show all institutional notices
  const placementCirculars = (announcements || []).filter(
    (a) =>
      a.scope === 'institutional' ||
      a.publishedRole === 'placement' ||
      (a.title && (
        a.title.toLowerCase().includes('placement') ||
        a.title.toLowerCase().includes('drive') ||
        a.title.toLowerCase().includes('recruitment') ||
        a.title.toLowerCase().includes('interview') ||
        a.title.toLowerCase().includes('offer') ||
        a.title.toLowerCase().includes('cdc')
      ))
  );

  const templates = [
    {
      title: 'Tier-1 Campus Recruitment Drive: Google DeepMind & Systems',
      content: 'Eligible 3rd & 4th Year AIDS and CSE students (CGPA >= 8.5, 0 active backlogs) are notified that applications for Research Software Engineer roles close on 16 October 2026. Verify resume links before applying.',
      priority: 'urgent',
      targetDept: 'ALL',
    },
    {
      title: 'Online Technical Assessment Schedule & Lab Guidelines',
      content: 'Proctored coding assessments for shortlisted candidates will take place in Computing Lab 3 (Block B) this Saturday. Candidates must bring institutional identity badges and report 15 minutes before the session window.',
      priority: 'important',
      targetDept: 'ALL',
    },
    {
      title: 'Technical Round Shortlist & Interview Schedule Released',
      content: 'Candidate progression results for Tetravate Engineering Labs have been verified. Shortlisted applicants must check their candidate dossiers for interview suite room allocations and panel slots.',
      priority: 'normal',
      targetDept: 'AIDS',
    },
    {
      title: 'Final Campus Placement Offer Results & Congratulatory Advisory',
      content: 'The Career Development Center congratulates all candidates who secured offers during the Autumn 2026 drive. Candidates must submit signed offer acceptance vouchers at the CDC counter within 5 working days.',
      priority: 'high',
      targetDept: 'ALL',
    },
    {
      title: 'CDC Mandatory Guidelines: Professional Attire & Document Dossiers',
      content: 'All candidates appearing for on-campus corporate interview panels are reminded to adhere to institutional formal dress guidelines and carry 3 copies of their updated, verified CV along with academic transcripts.',
      priority: 'normal',
      targetDept: 'ALL',
    },
  ];

  const handleApplyTemplate = (tmpl) => {
    setFormData({
      ...formData,
      title: tmpl.title,
      content: tmpl.content,
      priority: tmpl.priority,
      targetDept: tmpl.targetDept,
    });
    setComposerModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please provide both an announcement title and content.', 'warning');
      return;
    }

    publishAnnouncement({
      title: formData.title.trim(),
      content: formData.content.trim(),
      scope: formData.scope,
      priority: formData.priority,
      targetDept: formData.targetDept,
      targetRole: formData.targetRole,
    });

    setComposerModal(false);
    setFormData({
      title: '',
      content: '',
      scope: 'institutional',
      priority: 'high',
      targetDept: 'ALL',
      targetRole: 'student',
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Communications"
        title="Placement Notices & Circular Broadcasts"
        description="Broadcast official campus placement notices, drive deadlines, assessment schedules, interview shortlists, and CDC policy instructions directly to student and department dashboards."
        actions={[
          <button
            key="compose"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setComposerModal(true)}
          >
            <Plus size={13} /> Compose Circular
          </button>,
        ]}
      />

      {/* 2. Official Circular Templates */}
      <section>
        <SectionHeader
          title="Placement Notice Templates"
          subtitle="Pre-structured notices for instant verification and publication"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {templates.map((tmpl, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span className={`badge ${tmpl.priority === 'urgent' ? 'badge-urgent' : tmpl.priority === 'important' ? 'badge-info' : 'badge-neutral'}`}>
                    {tmpl.priority.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>CDC Circular</span>
                </div>
                <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>
                  {tmpl.title}
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {tmpl.content.slice(0, 120)}...
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.71875rem' }}
                  onClick={() => handleApplyTemplate(tmpl)}
                >
                  <Bookmark size={11} /> Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Published Placement Circulars Table */}
      <section>
        <SectionHeader
          title="Published Placement Notices"
          subtitle="Active notices visible in student and department notification feeds"
        />

        <DataTable
          columns={[
            {
              key: 'title',
              label: 'Circular & Summary',
              render: (anc) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{anc.title}</strong>
                    <span className={`badge ${anc.priority === 'urgent' || anc.priority === 'high' ? 'badge-urgent' : 'badge-info'}`}>
                      {anc.priority || 'Normal'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0', lineHeight: 1.45 }}>
                    {anc.content}
                  </p>
                </div>
              ),
            },
            {
              key: 'scope',
              label: 'Target Scope',
              width: '150px',
              render: (anc) => (
                <div style={{ fontSize: '0.75rem' }}>
                  <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                    {anc.scope || 'Institutional'}
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Cohort: {anc.targetDept || 'ALL'}
                  </div>
                </div>
              ),
            },
            {
              key: 'publishedBy',
              label: 'Publisher',
              width: '160px',
              render: (anc) => (
                <div style={{ fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 600 }}>{anc.publishedBy || 'Career Development Center'}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{anc.publishedAt || 'Today'}</div>
                </div>
              ),
            },
          ]}
          data={placementCirculars}
          keyField="id"
          emptyMessage="No placement notices published yet."
        />
      </section>

      {/* 4. MODAL: Compose Circular */}
      {composerModal && (
        <div
          className="modal-backdrop"
          onClick={() => setComposerModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Broadcast Placement Circular
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setComposerModal(false)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Circular Headline / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Campus Recruitment: Google Cloud Solutions Engineer Drive"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Target Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="institutional">Institution-wide</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Target Department</label>
                  <select
                    value={formData.targetDept}
                    onChange={(e) => setFormData({ ...formData, targetDept: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="ALL">All Eligible Cohorts</option>
                    <option value="AIDS">AI & Data Science (AIDS)</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Notification Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="urgent">Urgent Alert (Banner Broadcast)</option>
                  <option value="high">Important (Standard Notification)</option>
                  <option value="normal">Normal (Feed Update)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Notice Content & Detailed Instructions</label>
                <textarea
                  rows="4"
                  placeholder="Detailed guidelines, reporting timings, required documentation, test links, or dress code guidelines..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setComposerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish to Portals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
