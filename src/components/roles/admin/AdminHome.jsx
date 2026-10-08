import React from 'react';
import {
  Users,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function AdminHome({ onNavigate }) {
  const {
    systemUsers,
    departments,
    students,
    facultyMembers,
    roomConflicts,
    auditLogs,
    systemSettings,
  } = useNivara();

  const totalUsers = (systemUsers || []).length;
  const activeUsers = (systemUsers || []).filter((u) => u.status === 'active').length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalDepts = (departments || []).length;
  const totalStudents = (students || []).length;
  const totalFaculty = (facultyMembers || []).length;
  const activeConflicts = (roomConflicts || []).length;

  const adminMetrics = [
    {
      label: 'System Identities',
      value: `${totalUsers} Users`,
      subtext: `${activeUsers} Active · ${inactiveUsers} Suspended`,
      state: 'neutral',
    },
    {
      label: 'Academic Branches',
      value: `${totalDepts} Departments`,
      subtext: 'Accredited Engineering Divisions',
      state: 'info',
    },
    {
      label: 'Schedule Collisions',
      value: `${activeConflicts} Conflicts`,
      subtext: activeConflicts === 0 ? 'Zero collisions detected' : 'Room overlap resolution required',
      state: activeConflicts > 0 ? 'urgent' : 'success',
    },
    {
      label: 'System Audit Ledger',
      value: `${(auditLogs || []).length} Events`,
      subtext: 'Tamper-evident log ledger',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="System Administration & Master Data Infrastructure"
        title="ERP System Controller"
        description="Master university entity management, role-based access control, infrastructure schedule arbitration, and institutional configuration."
        actions={[
          <button
            key="audit"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('audit_logs')}
          >
            <FileText size={13} /> Audit Logs
          </button>,
          <button
            key="users"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('users')}
          >
            <Users size={13} /> Manage Users ({totalUsers})
          </button>,
        ]}
      />

      {/* 2. System Vital Signs */}
      <MetricStrip metrics={adminMetrics} />

      {/* 3. Needs Attention & System Alerts */}
      <div className="split-panel" style={{ gridTemplateColumns: '1.3fr 1.1fr', gap: '1.25rem' }}>
        {/* Needs Attention Queue */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <SectionHeader
            title="System Items Requiring Administrative Attention"
            subtitle="Operational flags, classroom double-bookings, and account suspensions"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
            {activeConflicts > 0 ? (
              roomConflicts.map((conf) => (
                <div
                  key={conf.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-xs)',
                    background: conf.severity === 'urgent' ? 'var(--state-urgent-bg)' : 'var(--state-warning-bg)',
                    border: `1px solid ${conf.severity === 'urgent' ? 'var(--state-urgent-border)' : 'var(--state-warning-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <AlertTriangle size={14} color={conf.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)'} />
                      <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {conf.title}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {conf.detail}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigate && onNavigate('conflicts')}
                  >
                    Resolve
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <CheckCircle2 size={20} color="var(--state-success)" style={{ margin: '0 auto 0.35rem' }} />
                Zero timetable or room collisions detected across university venues.
              </div>
            )}

            {inactiveUsers > 0 && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {inactiveUsers} Suspended User Account{inactiveUsers > 1 ? 's' : ''}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Accounts deactivated from institutional authentication.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate && onNavigate('users')}
                >
                  Review Users
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Settings & Term Info */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <SectionHeader
            title="Active Academic Configuration"
            subtitle="Global policy parameters applied across student and faculty modules"
            action={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate && onNavigate('settings')}
              >
                Edit Policies
              </button>
            }
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Academic Term:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {systemSettings?.academicTerm || 'Autumn 2026 (Semester 5)'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Attendance Cutoff:</span>
                <div style={{ fontWeight: 800, color: 'var(--state-success)' }}>
                  {systemSettings?.attendanceThreshold || 75}% Minimum
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Active Year:</span>
                <div style={{ fontWeight: 600 }}>AY 2026–2027</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Autonomy Status:</span>
                <div style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>UGC Autonomy 2023</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Operational Master Data:</strong> Managing 5 departments, 8 undergraduate degree cohorts, and 24 master lecture halls.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Master Departments Summary */}
      <section>
        <SectionHeader
          title="Institutional Divisions & Academic Master Data"
          subtitle="Academic units, appointed heads, and student/faculty capacity allocations"
          action={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate && onNavigate('departments')}
            >
              All Departments <ArrowRight size={12} />
            </button>
          }
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Department Name',
              render: (dept) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOD: {dept.hod}</div>
                </div>
              ),
            },
            {
              key: 'code',
              label: 'Code',
              width: '90px',
              render: (dept) => <span className="badge badge-info">{dept.code}</span>,
            },
            {
              key: 'studentCount',
              label: 'Enrolled Students',
              align: 'right',
              render: (dept) => `${dept.studentCount}`,
            },
            {
              key: 'facultyCount',
              label: 'Teaching Faculty',
              align: 'right',
              render: (dept) => `${dept.facultyCount}`,
            },
            {
              key: 'attendancePct',
              label: 'Live Attendance',
              align: 'right',
              render: (dept) => `${dept.attendancePct}%`,
            },
            {
              key: 'actions',
              label: 'Action',
              align: 'right',
              width: '100px',
              render: (dept) => (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate && onNavigate('departments')}
                >
                  Manage
                </button>
              ),
            },
          ]}
          data={departments}
          keyField="code"
        />
      </section>

      {/* 5. Recent System Activity Timeline */}
      <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <SectionHeader
          title="Recent System Audit Activity"
          subtitle="Real-time chronological events recorded in tamper-evident ledger"
          action={
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate && onNavigate('audit_logs')}
            >
              Full Audit Trail
            </button>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {(auditLogs || []).slice(0, 4).map((log, i) => (
            <div
              key={log.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                  {log.action}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.details || log.description}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {log.timestamp || 'Just now'} · Actor: <strong>{log.user || 'Admin'}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
