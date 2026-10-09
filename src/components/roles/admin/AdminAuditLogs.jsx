import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Shield,
  Clock,
  User,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function AdminAuditLogs() {
  const { auditLogs, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter((log) => {
      const q = searchQuery.toLowerCase();
      const actor = (log.actorName || log.user || '').toLowerCase();
      const role = (log.actorRole || log.role || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const details = (log.details || log.description || '').toLowerCase();

      const matchesSearch =
        details.includes(q) ||
        actor.includes(q) ||
        action.includes(q);

      const matchesRole = roleFilter === 'all' || role === roleFilter.toLowerCase();
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;

      return matchesSearch && matchesRole && matchesAction;
    });
  }, [auditLogs, searchQuery, roleFilter, actionFilter]);

  const handleExportAudit = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `NIVARA_AUDIT_LOG_LEDGER_${timestamp}.csv`;

    const headers = ['Event ID', 'Timestamp', 'Actor Identity', 'Role Scope', 'Action Type', 'Event Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp || 'N/A'}"`,
      `"${l.actorName || l.user || 'System'}"`,
      `"${l.actorRole || l.role || 'system'}"`,
      `"${l.action || 'TRANSACTION'}"`,
      `"${(l.details || l.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Audit Ledger exported successfully as ${filename} ✓`, 'success');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Security & Governance · Tamper-Evident Ledger"
        title="Institutional System Audit Trail"
        description="Immutable, append-oriented log ledger tracking administrative mutations, authentication events, grade locks, and permission updates."
        actions={[
          <button
            key="export-audit"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportAudit}
          >
            <Download size={13} /> Export Audit Ledger (CSV)
          </button>,
        ]}
      />

      {/* 2. Search & Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          padding: '0.85rem 1.15rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search event details, actor, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none',
            }}
          >
            <option value="all">All Actor Roles</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
            <option value="principal">Principal</option>
            <option value="student">Student</option>
            <option value="exam_cell">Exam Cell</option>
            <option value="finance">Finance</option>
            <option value="placement">Placement</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredLogs.length}</strong> of <strong>{(auditLogs || []).length}</strong> chronological audit events
        </div>
      </div>

      {/* 3. Audit DataTable */}
      <DataTable
        columns={[
          {
            key: 'timestamp',
            label: 'Timestamp',
            width: '170px',
            render: (l) => (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {l.timestamp || '2026-10-08 10:30'}
              </span>
            ),
          },
          {
            key: 'action',
            label: 'Action Code',
            width: '140px',
            render: (l) => (
              <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                {l.action}
              </span>
            ),
          },
          {
            key: 'user',
            label: 'Actor Identity',
            width: '160px',
            render: (l) => (
              <div>
                <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{l.actorName || l.user || 'System'}</strong>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {l.actorRole || l.role || 'System'}
                </div>
              </div>
            ),
          },
          {
            key: 'details',
            label: 'Event Details & Payload Summary',
            render: (l) => (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                {l.details || l.description}
              </span>
            ),
          },
        ]}
        data={filteredLogs}
        keyField="id"
      />
    </div>
  );
}
