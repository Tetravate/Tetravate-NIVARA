import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  CheckCircle,
  Users,
  Award,
  AlertTriangle,
  Edit2,
  Archive,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable } from '../../workspace';

export default function AdminDepartments() {
  const { departments, createDepartment, updateDepartment, deleteDepartment, showToast } = useNivara();

  const [addDeptModal, setAddDeptModal] = useState(false);
  const [editDeptModal, setEditDeptModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [deptFormData, setDeptFormData] = useState({
    code: '',
    name: '',
    hod: '',
    studentCount: 120,
    facultyCount: 12,
  });

  const [editFormData, setEditFormData] = useState({
    code: '',
    name: '',
    hod: '',
    studentCount: 120,
    facultyCount: 12,
  });

  const filteredDepts = (departments || []).filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.hod.toLowerCase().includes(q)
    );
  });

  const handleCreateDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptFormData.name.trim() || !deptFormData.code.trim()) {
      showToast('Please provide department name and unique code', 'error');
      return;
    }

    createDepartment(deptFormData);
    showToast(`Academic Department ${deptFormData.name} (${deptFormData.code}) chartered ✓`, 'success');
    setAddDeptModal(false);
    setDeptFormData({
      code: '',
      name: '',
      hod: '',
      studentCount: 120,
      facultyCount: 12,
    });
  };

  const handleOpenEditModal = (dept) => {
    setEditFormData({
      code: dept.code,
      name: dept.name,
      hod: dept.hod || '',
      studentCount: dept.studentCount || 120,
      facultyCount: dept.facultyCount || 12,
    });
    setEditDeptModal(true);
  };

  const handleEditDeptSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      showToast('Department name is required', 'error');
      return;
    }
    await updateDepartment(editFormData.code, editFormData);
    setEditDeptModal(false);
  };

  const handleArchiveDept = async (dept) => {
    if (window.confirm(`Are you sure you want to archive Department ${dept.name} (${dept.code})? Historical records remain preserved.`)) {
      await deleteDepartment(dept.code);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Academic Affairs · University Master Divisions"
        title="Departments & Academic Division Master"
        description="Establish university departments, appoint academic HOD leadership, and allocate student and faculty baseline intake capacities."
        actions={[
          <button
            key="add-dept"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddDeptModal(true)}
          >
            <Plus size={13} /> Add Academic Department
          </button>,
        ]}
      />

      {/* 2. Search & Stats Bar */}
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
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search department, code, or HOD..."
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

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredDepts.length}</strong> of <strong>{(departments || []).length}</strong> accredited divisions
        </div>
      </div>

      {/* 3. Department DataTable */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Academic Department',
            render: (dept) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOD: <strong>{dept.hod}</strong></div>
              </div>
            ),
          },
          {
            key: 'code',
            label: 'Division Code',
            width: '120px',
            render: (dept) => <span className="badge badge-info">{dept.code}</span>,
          },
          {
            key: 'studentCount',
            label: 'Enrolled Intake',
            align: 'right',
            render: (dept) => `${dept.studentCount} Students`,
          },
          {
            key: 'facultyCount',
            label: 'Appointed Faculty',
            align: 'right',
            render: (dept) => `${dept.facultyCount} Faculty`,
          },
          {
            key: 'attendancePct',
            label: 'Live Attendance',
            align: 'right',
            render: (dept) => (
              <span style={{ fontWeight: 700, color: dept.attendancePct >= 85 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                {dept.attendancePct}%
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Charter Status',
            render: () => <span className="badge badge-success">Active Division</span>,
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (dept) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEditModal(dept)}
                  title="Edit Department"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-danger"
                  onClick={() => handleArchiveDept(dept)}
                  title="Archive Department"
                >
                  <Archive size={12} /> Archive
                </button>
              </div>
            ),
          },
        ]}
        data={filteredDepts}
        keyField="code"
      />

      {/* 4. Add Department Modal */}
      {addDeptModal && (
        <div className="modal-backdrop" onClick={() => setAddDeptModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="var(--brand-primary)" />
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
                  Division Code (e.g. AIDS, EEE)
                </label>
                <input
                  type="text"
                  placeholder="e.g. EEE"
                  value={deptFormData.code}
                  onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Department Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical & Electronics Engineering"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. M. Jayashree"
                  value={deptFormData.hod}
                  onChange={(e) => setDeptFormData({ ...deptFormData, hod: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Approved Intake</label>
                  <input
                    type="number"
                    value={deptFormData.studentCount}
                    onChange={(e) => setDeptFormData({ ...deptFormData, studentCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Faculty Sanction</label>
                  <input
                    type="number"
                    value={deptFormData.facultyCount}
                    onChange={(e) => setDeptFormData({ ...deptFormData, facultyCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddDeptModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Charter Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Department Modal */}
      {editDeptModal && (
        <div className="modal-backdrop" onClick={() => setEditDeptModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Department ({editFormData.code})
                </h3>
              </div>
              <button type="button" onClick={() => setEditDeptModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditDeptSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Department Title
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  value={editFormData.hod}
                  onChange={(e) => setEditFormData({ ...editFormData, hod: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Approved Intake</label>
                  <input
                    type="number"
                    value={editFormData.studentCount}
                    onChange={(e) => setEditFormData({ ...editFormData, studentCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Faculty Sanction</label>
                  <input
                    type="number"
                    value={editFormData.facultyCount}
                    onChange={(e) => setEditFormData({ ...editFormData, facultyCount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditDeptModal(false)}>
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
