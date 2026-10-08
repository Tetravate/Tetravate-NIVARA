import React, { useState } from 'react';
import {
  Plus,
  Bookmark,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable } from '../../workspace';

export default function FinanceAnnouncements() {
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
    priority: 'normal',
    targetDept: 'ALL',
  });

  // Filter finance-relevant circulars or show all institutional notices
  const financeCirculars = (announcements || []).filter(
    (a) =>
      a.scope === 'institutional' ||
      (a.title && (a.title.toLowerCase().includes('fee') || a.title.toLowerCase().includes('scholarship') || a.title.toLowerCase().includes('finance') || a.title.toLowerCase().includes('bursar')))
  );

  const templates = [
    {
      title: 'Statutory Autumn 2026 Tuition Due Date Reminder',
      content: 'All undergraduate students are advised that the deadline for clearing Autumn 2026 Tuition and Laboratory dues is 15 October 2026. Payments can be completed online via the student portal or by submitting verified SBI Challan vouchers at the Bursar counter.',
      priority: 'urgent',
    },
    {
      title: 'SBI Campus Branch Challan Verification Counter Timings',
      content: 'To facilitate offline fee reconciliations, the SBI Nivara Campus Branch Bursar counter will remain open between 09:00 AM and 04:30 PM on all working days. Original stamped challans must be presented for immediate clearance.',
      priority: 'normal',
    },
    {
      title: 'Governing Council Merit-Cum-Means Scholarship Application Open',
      content: 'Applications for the Institutional Academic Merit and Need-Based Fee Concession scheme for 2026-27 are now open. Eligible students must submit parent income certificates and marks transcripts before 25 October 2026.',
      priority: 'important',
    },
  ];

  const handleApplyTemplate = (tmpl) => {
    setFormData({
      ...formData,
      title: tmpl.title,
      content: tmpl.content,
      priority: tmpl.priority,
    });
    setComposerModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please provide both an announcement title and content.', 'error');
      return;
    }

    publishAnnouncement({
      title: formData.title.trim(),
      content: formData.content.trim(),
      scope: formData.scope,
      priority: formData.priority,
      targetDept: formData.targetDept,
    });

    setComposerModal(false);
    setFormData({
      title: '',
      content: '',
      scope: 'institutional',
      priority: 'normal',
      targetDept: 'ALL',
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Finance & Accounts · Official Circulars"
        title="Finance Circulars & Announcements"
        description="Publish institutional bursary notifications, payment instructions, fee deadline alerts, and scholarship advisories directly to student and faculty portals."
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

      {/* Quick Templates Strip */}
      <section>
        <SectionHeader
          title="Bursary Notice Templates"
          subtitle="Pre-authorized institutional announcement templates for immediate broadcast"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
          {templates.map((tmpl, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Bookmark size={14} color="var(--brand-blue)" />
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{tmpl.title}</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {tmpl.content.slice(0, 110)}...
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${tmpl.priority === 'urgent' ? 'badge-danger' : 'badge-neutral'}`} style={{ fontSize: '0.625rem' }}>
                  {tmpl.priority.toUpperCase()}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleApplyTemplate(tmpl)}
                >
                  Use Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Published Circulars Table */}
      <section>
        <SectionHeader
          title={`Active Finance Circulars (${financeCirculars.length})`}
          subtitle="Announcements dispatched from the Office of the Bursar"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <DataTable
            columns={[
              {
                header: 'Notice Title',
                accessor: 'title',
                cell: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: {row.targetDept || 'Institutional Wide'}</div>
                  </div>
                ),
              },
              {
                header: 'Content Preview',
                accessor: 'content',
                cell: (row) => (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                    {row.content}
                  </div>
                ),
              },
              {
                header: 'Scope',
                accessor: 'scope',
                cell: (row) => (
                  <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                    {row.scope || 'Institutional'}
                  </span>
                ),
              },
              {
                header: 'Status',
                cell: () => (
                  <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                    Active On Portal ✓
                  </span>
                ),
              },
            ]}
            data={financeCirculars}
            emptyMessage="No finance circulars published."
          />
        </div>
      </section>

      {/* COMPOSER MODAL */}
      {composerModal && (
        <div className="modal-backdrop" onClick={() => setComposerModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Compose Bursary Circular
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Broadcast authorized announcements to student and staff portals
                </div>
              </div>
              <button type="button" onClick={() => setComposerModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Notice Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Statutory Autumn 2026 Tuition Due Date Reminder"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Notice Content & Instructions *
                </label>
                <textarea
                  rows="4"
                  placeholder="Full circular text, payment links, banking account details, or deadline advisories..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Audience Scope
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="institutional">Institution-Wide (All Portals)</option>
                    <option value="department">Single Department Cohort</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Broadcast Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="normal">Normal Information Notice</option>
                    <option value="important">Important Statutory Advisory</option>
                    <option value="urgent">Urgent Deadline Action Required</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setComposerModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
