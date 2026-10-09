import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Mail,
  Building,
  Edit2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function AdminUsers() {
  const {
    systemUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    showToast,
  } = useNivara();

  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    dept: 'AI & Data Science',
  });

  const [editUserFormData, setEditUserFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'student',
    dept: 'AI & Data Science',
  });

  const validRoles = [
    'student',
    'faculty',
    'hod',
    'principal',
    'admin',
    'exam_cell',
    'finance',
    'placement',
  ];

  const filteredUsers = useMemo(() => {
    return (systemUsers || []).filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [systemUsers, userSearch, userRoleFilter, userStatusFilter]);

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      showToast('Please provide user name and institutional email', 'error');
      return;
    }

    createUser(userFormData);
    setAddUserModal(false);
    setUserFormData({
      name: '',
      email: '',
      role: 'student',
      dept: 'AI & Data Science',
    });
  };

  const handleOpenEdit = (u) => {
    setEditUserFormData({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      dept: u.dept || 'General Administration',
    });
    setEditUserModal(true);
  };

  const handleEditUserSubmit = (e) => {
    e.preventDefault();
    updateUser(editUserFormData.id, {
      name: editUserFormData.name,
      email: editUserFormData.email,
      role: editUserFormData.role,
      dept: editUserFormData.dept,
    });
    setEditUserModal(false);
  };

  const handleToggle = (id, currentStatus, name) => {
    toggleUserStatus(id);
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Identity & Access Governance · Multi-Role Security Directory"
        title="Institutional Users & Role Matrix"
        description="Comprehensive directory of institutional users across all 8 canonical personas. Govern active access permissions and account states."
        actions={[
          <button
            key="add-user"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddUserModal(true)}
          >
            <Plus size={13} /> Enroll User Identity
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
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
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
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
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
            <option value="all">All Roles (8 Canonical Personas)</option>
            {validRoles.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
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
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive / Suspended</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredUsers.length}</strong> of <strong>{(systemUsers || []).length}</strong> registered identities
        </div>
      </div>

      {/* 3. User DataTable */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Full Identity',
            render: (u) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={11} /> {u.email}
                </div>
              </div>
            ),
          },
          {
            key: 'dept',
            label: 'Academic Division',
            render: (u) => u.dept || 'General Administration',
          },
          {
            key: 'role',
            label: 'Canonical Role',
            width: '120px',
            render: (u) => (
              <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                {u.role}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Account Status',
            width: '110px',
            render: (u) => (
              <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-urgent'}`}>
                {u.status === 'active' ? 'Active' : 'Suspended'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            width: '170px',
            render: (u) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEdit(u)}
                  title="Edit User"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  className={`btn ${u.status === 'active' ? 'btn-ghost' : 'btn-primary'} btn-xs`}
                  onClick={() => handleToggle(u.id, u.status, u.name)}
                >
                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </div>
            ),
          },
        ]}
        data={filteredUsers}
        keyField="id"
      />

      {/* 4. Enroll User Modal */}
      {addUserModal && (
        <div className="modal-backdrop" onClick={() => setAddUserModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--brand-primary)" />
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
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajesh.s@nivara.edu"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Assigned Canonical Role
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    {validRoles.map((r) => (
                      <option key={r} value={r}>
                        {r.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Department Division
                  </label>
                  <input
                    type="text"
                    value={userFormData.dept}
                    onChange={(e) => setUserFormData({ ...userFormData, dept: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong>Security Notice:</strong> Passwords are never displayed or transmitted in cleartext. New users receive an institutional onboarding invitation to set their credential securely.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Enroll Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit User Modal */}
      {editUserModal && (
        <div className="modal-backdrop" onClick={() => setEditUserModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit User Identity
                </h3>
              </div>
              <button type="button" onClick={() => setEditUserModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editUserFormData.name}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editUserFormData.email}
                  onChange={(e) => setEditUserFormData({ ...editUserFormData, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Assigned Canonical Role
                  </label>
                  <select
                    value={editUserFormData.role}
                    onChange={(e) => setEditUserFormData({ ...editUserFormData, role: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    {validRoles.map((r) => (
                      <option key={r} value={r}>
                        {r.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Department Division
                  </label>
                  <input
                    type="text"
                    value={editUserFormData.dept}
                    onChange={(e) => setEditUserFormData({ ...editUserFormData, dept: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
