import React, { useState } from 'react';
import {
  Building,
  AlertTriangle,
  CheckCircle,
  FileText,
  Plus,
  Search,
} from 'lucide-react';
import { useNivara } from '../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from '../workspace';

export default function AdminDashboard() {
  const {
    activeTab,
    departments,
    createDepartment,
    systemUsers,
    createUser,
    toggleUserStatus,
    roomConflicts,
    resolveConflict,
    systemSettings,
    setSystemSettings,
    auditLogs,
    setAuditLogOpen,
    showToast,
  } = useNivara();

  // Modals
  const [addUserModal, setAddUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    dept: 'AI & Data Science',
  });

  const [addDeptModal, setAddDeptModal] = useState(false);
  const [deptFormData, setDeptFormData] = useState({
    code: '',
    name: '',
    hod: '',
    studentCount: 120,
    facultyCount: 12,
  });

  const [resolveModal, setResolveModal] = useState(null); // conflict item
  const [reallocationRoom, setReallocationRoom] = useState('Seminar Hall 2');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(systemSettings);

  const filteredUsers = systemUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) return;
    createUser(userFormData);
    setAddUserModal(false);
    setUserFormData({
      name: '',
      email: '',
      role: 'student',
      dept: 'AI & Data Science',
    });
  };

  const handleCreateDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptFormData.name.trim() || !deptFormData.code.trim()) return;
    createDepartment(deptFormData);
    setAddDeptModal(false);
    setDeptFormData({
      code: '',
      name: '',
      hod: '',
      studentCount: 120,
      facultyCount: 12,
    });
  };

  const handleResolveConflictSubmit = (e) => {
    e.preventDefault();
    if (!resolveModal) return;
    resolveConflict(
      resolveModal.id,
      `Reallocated from ${resolveModal.venue} to ${reallocationRoom} and dispatched timetable notice to students.`
    );
    setResolveModal(null);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSystemSettings(settingsForm);
    showToast('ERP system settings and attendance policies updated successfully ✓', 'success');
  };

  const adminMetrics = [
    {
      label: 'System Users',
      value: `${systemUsers.length} Identities`,
      subtext: 'Role-Based Access Control',
      state: 'neutral',
    },
    {
      label: 'Active Divisions',
      value: `${departments.length} Departments`,
      subtext: 'Master academic divisions',
      state: 'info',
    },
    {
      label: 'Schedule Collisions',
      value: `${roomConflicts.length} Conflicts`,
      subtext: roomConflicts.length === 0 ? 'Zero collisions' : 'Action required',
      state: roomConflicts.length > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Audit Events',
      value: `${auditLogs.length} Records`,
      subtext: 'Tamper-evident log ledger',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header (ERP Administrator Persona) */}
      <PageHeader
        eyebrow="System Administration & Master Data Infrastructure"
        title="ERP System Controller"
        description="Manage master university entities, role permissions, infrastructure schedules, and system configurations."
        actions={[
          <button
            key="audit"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setAuditLogOpen(true)}
          >
            <FileText size={13} /> System Audit Trail
          </button>,
          <button
            key="add-user"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddUserModal(true)}
          >
            <Plus size={13} /> Add New User
          </button>,
        ]}
      />

      {/* 2. System Vital Signs */}
      <MetricStrip metrics={adminMetrics} />

      {/* VIEW: MASTER STRUCTURE & DEPARTMENTS (Default on home or related modules) */}
      {(!['users', 'students', 'faculty', 'conflicts', 'rooms', 'settings', 'configuration'].includes(activeTab)) && (
        <section>
          <SectionHeader
            title="Institutional Divisions & Master Data"
            subtitle="Academic units, appointed heads, and student/faculty capacity allocations"
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setAddDeptModal(true)}
              >
                <Plus size={12} /> Add Department
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
                    onClick={() => showToast(`Department configuration sheet opened for ${dept.code}`, 'info')}
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
      )}

      {/* VIEW: ROOM CONFLICTS */}
      {(activeTab === 'conflicts' || activeTab === 'rooms') && (
        <section>
          <SectionHeader
            title="Classroom Double-Booking & Infrastructure Collisions"
            subtitle="Automated space collision detection across lecture halls and laboratories"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
            {roomConflicts.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="Zero Schedule Collisions"
                description="All classroom bookings, lab slots, and guest lectures are collision-free."
              />
            ) : (
              roomConflicts.map((conf) => (
                <div
                  key={conf.id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: conf.severity === 'urgent' ? 'var(--state-urgent-bg)' : 'var(--state-warning-bg)',
                    border: `1px solid ${conf.severity === 'urgent' ? 'var(--state-urgent-border)' : 'var(--state-warning-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <AlertTriangle size={15} color={conf.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)'} />
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {conf.title}
                      </strong>
                      <span className={`badge ${conf.severity === 'urgent' ? 'badge-urgent' : 'badge-warning'}`}>
                        {conf.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {conf.detail}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setResolveModal(conf)}
                  >
                    Resolve & Reallocate
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* VIEW: USER ROLES & RBAC */}
      {(activeTab === 'users' || activeTab === 'students' || activeTab === 'faculty') && (
        <section>
          <SectionHeader
            title="Identity Directory & Role-Based Access Control"
            subtitle="Manage authorized users, security roles, and active authentication statuses"
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setAddUserModal(true)}
              >
                <Plus size={12} /> Add New User
              </button>
            }
          />

          {/* Filter & Search Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.4rem 0.75rem' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
              {['all', 'student', 'faculty', 'hod', 'admin', 'finance'].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`btn btn-sm ${userRoleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserRoleFilter(role)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: 'name',
                label: 'User Name',
                render: (u) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                ),
              },
              {
                key: 'dept',
                label: 'Department',
                render: (u) => u.dept || '—',
              },
              {
                key: 'role',
                label: 'Role',
                width: '110px',
                render: (u) => (
                  <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.625rem' }}>
                    {u.role}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '100px',
                render: (u) => (
                  <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-urgent'}`}>
                    {u.status}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Action',
                align: 'right',
                width: '120px',
                render: (u) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleUserStatus(u.id)}
                  >
                    {u.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                ),
              },
            ]}
            data={filteredUsers}
            keyField="id"
          />
        </section>
      )}

      {/* VIEW: SETTINGS & CONFIGURATION */}
      {(activeTab === 'settings' || activeTab === 'configuration') && (
        <section>
          <SectionHeader
            title="Institutional Policies & Operational Configuration"
            subtitle="Global system settings, academic calendar terms, and attendance cutoff rules"
          />

          <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem' }}>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '640px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Current Academic Term
                </label>
                <input
                  type="text"
                  value={settingsForm.academicTerm || 'Autumn 2026 (Semester 5)'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, academicTerm: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Mandatory Attendance Cutoff (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={settingsForm.attendanceThreshold || 75}
                  onChange={(e) => setSettingsForm({ ...settingsForm, attendanceThreshold: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Students falling below this threshold are automatically flagged for HOD academic counseling.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button type="submit" className="btn btn-primary">
                  Save ERP Configuration
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* MODAL: ADD USER */}
      {addUserModal && (
        <div className="modal-backdrop" onClick={() => setAddUserModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Enroll System Identity
                </h3>
              </div>
              <button type="button" onClick={() => setAddUserModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sundaram"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajesh.s@nivara.edu"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Assigned Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="exam_cell">Exam Cell</option>
                    <option value="finance">Finance</option>
                    <option value="placement">Placement</option>
                    <option value="principal">Principal</option>
                    <option value="admin">ERP Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Department</label>
                  <input
                    type="text"
                    value={userFormData.dept}
                    onChange={(e) => setUserFormData({ ...userFormData, dept: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DEPARTMENT */}
      {addDeptModal && (
        <div className="modal-backdrop" onClick={() => setAddDeptModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Add Academic Department
                </h3>
              </div>
              <button type="button" onClick={() => setAddDeptModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDeptSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Department Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biomedical Engineering"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BME"
                    value={deptFormData.code}
                    onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Appointed HOD</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. S. Malathi"
                    value={deptFormData.hod}
                    onChange={(e) => setDeptFormData({ ...deptFormData, hod: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE CONFLICT MODAL */}
      {resolveModal && (
        <div className="modal-backdrop" onClick={() => setResolveModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="var(--state-urgent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Resolve Schedule Collision
                </h3>
              </div>
              <button type="button" onClick={() => setResolveModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleResolveConflictSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Conflicting Venue: <strong>{resolveModal.venue}</strong><br />
                {resolveModal.detail}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Reallocate to Alternate Venue
                </label>
                <select
                  value={reallocationRoom}
                  onChange={(e) => setReallocationRoom(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="Seminar Hall 2">Seminar Hall 2 (Available · Cap: 120)</option>
                  <option value="Computing Lab 4">Computing Lab 4 (Available · Cap: 60)</option>
                  <option value="Lecture Theatre 1">Lecture Theatre 1 (Available · Cap: 90)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResolveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Reallocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
