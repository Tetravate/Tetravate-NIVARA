import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminFaculty() {
  const { facultyMembers, departments, createFacultyMember, updateFacultyMember, deleteFacultyMember, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [addFacultyModal, setAddFacultyModal] = useState(false);
  const [editFacultyModal, setEditFacultyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    role: 'Assistant Professor',
    dept: 'Department of AI & Data Science',
    deptCode: 'AIDS',
    courses: 'Core Engineering Coursework',
    hours: 14,
  });

  const [editFacultyForm, setEditFacultyForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Assistant Professor',
    dept: 'Department of AI & Data Science',
    deptCode: 'AIDS',
    courses: 'Core Engineering Coursework',
    hours: 14,
  });

  const facultyData = facultyMembers || [];

  const filteredFaculty = useMemo(() => {
    return facultyData.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (f.name || '').toLowerCase().includes(q) ||
        (f.role && f.role.toLowerCase().includes(q)) ||
        (f.courses && f.courses.toLowerCase().includes(q));

      const matchesDept =
        selectedDeptFilter === 'all' ||
        f.deptCode === selectedDeptFilter ||
        f.dept_code === selectedDeptFilter ||
        (f.dept && f.dept.includes(selectedDeptFilter));

      return matchesSearch && matchesDept;
    });
  }, [facultyData, searchQuery, selectedDeptFilter]);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!facultyForm.name.trim() || !facultyForm.email.trim()) {
      showToast('Please enter faculty name and email', 'error');
      return;
    }

    setIsSubmitting(true);
    const newFaculty = {
      ...facultyForm,
      rating: 4.8,
      status: 'active',
    };

    const res = await createFacultyMember(newFaculty);
    setIsSubmitting(false);

    if (res && res.success) {
      setAddFacultyModal(false);
      setFacultyForm({
        name: '',
        email: '',
        role: 'Assistant Professor',
        dept: 'Department of AI & Data Science',
        deptCode: 'AIDS',
        courses: 'Core Engineering Coursework',
        hours: 14,
      });
    }
  };

  const handleOpenEdit = (f) => {
    setEditFacultyForm({
      id: f.id || f.name,
      name: f.name || '',
      email: f.email || '',
      role: f.role || 'Assistant Professor',
      dept: f.dept || 'Department of AI & Data Science',
      deptCode: f.deptCode || f.dept_code || 'AIDS',
      courses: f.courses || 'Core Engineering Coursework',
      hours: f.hours || 14,
    });
    setEditFacultyModal(true);
  };

  const handleEditFacultySubmit = async (e) => {
    e.preventDefault();
    await updateFacultyMember(editFacultyForm.id, {
      name: editFacultyForm.name,
      email: editFacultyForm.email,
      role: editFacultyForm.role,
      dept: editFacultyForm.dept,
      dept_code: editFacultyForm.deptCode,
      courses: editFacultyForm.courses,
      hours: Number(editFacultyForm.hours),
    });
    setEditFacultyModal(false);
  };

  const handleDeleteFaculty = async (f) => {
    if (window.confirm(`Are you sure you want to remove faculty record for ${f.name}?`)) {
      await deleteFacultyMember(f.id || f.name);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Academic Affairs · Faculty Directorate"
        title="Faculty Appointments & Academic Directorate"
        description="University master faculty register. Manage professorial designations, departmental affiliations, and teaching workload sanctions."
        actions={[
          <button
            key="add-fac"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddFacultyModal(true)}
          >
            <Plus size={13} /> Appoint Faculty Member
          </button>,
        ]}
      />

      {/* 2. Filters & Count Bar */}
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
              placeholder="Search faculty name, role..."
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
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
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
            <option value="all">All Academic Departments</option>
            {(departments || []).map((d) => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredFaculty.length}</strong> master faculty appointments
        </div>
      </div>

      {/* 3. Faculty Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Faculty Member',
            render: (f) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.role} · {f.email}</div>
              </div>
            ),
          },
          {
            key: 'dept',
            label: 'Department',
            render: (f) => <span className="badge badge-neutral">{f.deptCode || f.dept || 'AIDS'}</span>,
          },
          {
            key: 'courses',
            label: 'Assigned Curriculum',
            render: (f) => <span>{f.courses || 'Core Coursework'}</span>,
          },
          {
            key: 'hours',
            label: 'Weekly Load',
            align: 'right',
            render: (f) => (
              <span style={{ fontWeight: 700, color: (f.hours || 14) > 18 ? 'var(--state-warning)' : 'var(--text-primary)' }}>
                {f.hours || 14} hrs/wk
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: () => <span className="badge badge-success">Active Faculty</span>,
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            width: '130px',
            render: (f) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEdit(f)}
                  title="Edit Faculty"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-danger"
                  onClick={() => handleDeleteFaculty(f)}
                  title="Remove Faculty"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ),
          },
        ]}
        data={filteredFaculty}
        keyField="name"
      />

      {/* 4. Add Faculty Modal */}
      {addFacultyModal && (
        <div className="modal-backdrop" onClick={() => setAddFacultyModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Appoint Faculty Member
                </h3>
              </div>
              <button type="button" onClick={() => setAddFacultyModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddFaculty} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Faculty Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. Anand"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. anand.k@nivara.edu"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Academic Rank
                  </label>
                  <select
                    value={facultyForm.role}
                    onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Weekly Teaching Load
                  </label>
                  <input
                    type="number"
                    value={facultyForm.hours}
                    onChange={(e) => setFacultyForm({ ...facultyForm, hours: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Appointed Department
                </label>
                <select
                  value={facultyForm.deptCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const d = (departments || []).find((dept) => dept.code === code);
                    setFacultyForm({
                      ...facultyForm,
                      deptCode: code,
                      dept: d ? d.name : 'Engineering',
                    });
                  }}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  {(departments || []).map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Assigned Teaching Courses
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS301 Data Structures, CS304 Operating Systems"
                  value={facultyForm.courses}
                  onChange={(e) => setFacultyForm({ ...facultyForm, courses: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddFacultyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Sanctioning...' : 'Appoint Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Faculty Modal */}
      {editFacultyModal && (
        <div className="modal-backdrop" onClick={() => setEditFacultyModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Faculty ({editFacultyForm.name})
                </h3>
              </div>
              <button type="button" onClick={() => setEditFacultyModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditFacultySubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Faculty Full Name
                </label>
                <input
                  type="text"
                  value={editFacultyForm.name}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={editFacultyForm.email}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Academic Rank
                  </label>
                  <select
                    value={editFacultyForm.role}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, role: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Weekly Teaching Load
                  </label>
                  <input
                    type="number"
                    value={editFacultyForm.hours}
                    onChange={(e) => setEditFacultyForm({ ...editFacultyForm, hours: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Appointed Department
                </label>
                <select
                  value={editFacultyForm.deptCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const d = (departments || []).find((dept) => dept.code === code);
                    setEditFacultyForm({
                      ...editFacultyForm,
                      deptCode: code,
                      dept: d ? d.name : 'Engineering',
                    });
                  }}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  {(departments || []).map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Assigned Teaching Courses
                </label>
                <input
                  type="text"
                  value={editFacultyForm.courses}
                  onChange={(e) => setEditFacultyForm({ ...editFacultyForm, courses: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditFacultyModal(false)}>
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
