import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  GraduationCap,
  Eye,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function AdminStudents() {
  const { students, departments, createStudent, updateStudent, deleteStudent, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [editStudentModal, setEditStudentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [studentForm, setStudentForm] = useState({
    id: '',
    name: '',
    email: '',
    deptCode: 'AIDS',
    department: 'B.Tech AI & Data Science',
    year: '3rd Year',
    semester: 5,
    section: 'A',
  });

  const [editStudentForm, setEditStudentForm] = useState({
    id: '',
    name: '',
    email: '',
    deptCode: 'AIDS',
    department: 'B.Tech AI & Data Science',
    year: '3rd Year',
    semester: 5,
    section: 'A',
  });

  const filteredStudents = useMemo(() => {
    return (students || []).filter((st) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (st.name || '').toLowerCase().includes(q) ||
        (st.id || '').toLowerCase().includes(q) ||
        (st.department && st.department.toLowerCase().includes(q));

      const matchesDept =
        selectedDeptFilter === 'all' ||
        st.deptCode === selectedDeptFilter ||
        st.dept_code === selectedDeptFilter ||
        (st.department && st.department.includes(selectedDeptFilter));

      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, selectedDeptFilter]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.id.trim() || !studentForm.name.trim() || !studentForm.email.trim()) {
      showToast('Please fill in Roll ID, Name, and Email', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: studentForm.id.trim(),
        name: studentForm.name.trim(),
        email: studentForm.email.trim(),
        dept_code: studentForm.deptCode,
        department: studentForm.department,
        year: studentForm.year,
        semester: Number(studentForm.semester),
        section: studentForm.section,
        attendance_pct: 85,
        cgpa: 7.5,
        status: 'enrolled',
      };

      const res = await createStudent(payload);
      if (res && res.success) {
        showToast(`Student ${payload.name} (${payload.id}) enrolled successfully ✓`, 'success');
        setAddStudentModal(false);
        setStudentForm({
          id: '',
          name: '',
          email: '',
          deptCode: 'AIDS',
          department: 'B.Tech AI & Data Science',
          year: '3rd Year',
          semester: 5,
          section: 'A',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (st) => {
    setEditStudentForm({
      id: st.id,
      name: st.name || '',
      email: st.email || '',
      deptCode: st.dept_code || st.deptCode || 'AIDS',
      department: st.department || 'B.Tech AI & Data Science',
      year: st.year || '3rd Year',
      semester: st.semester || 5,
      section: st.section || 'A',
    });
    setEditStudentModal(true);
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    await updateStudent(editStudentForm.id, {
      name: editStudentForm.name,
      email: editStudentForm.email,
      dept_code: editStudentForm.deptCode,
      department: editStudentForm.department,
      year: editStudentForm.year,
      semester: Number(editStudentForm.semester),
      section: editStudentForm.section,
    });
    setEditStudentModal(false);
  };

  const handleDeleteStudent = async (st) => {
    if (window.confirm(`Are you sure you want to remove student record ${st.name} (${st.id})? Historical audit logs remain preserved.`)) {
      await deleteStudent(st.id);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Student Lifecycle & Admissions Registry"
        title="Student Admissions & Master Roster"
        description="University master student registry. Manage matriculation roll IDs, section allocations, and institutional email credentials."
        actions={[
          <button
            key="add-student"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddStudentModal(true)}
          >
            <Plus size={13} /> Enroll Student
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
              placeholder="Search student name, roll ID..."
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
          Showing <strong>{filteredStudents.length}</strong> master student records
        </div>
      </div>

      {/* 3. Student Master Table */}
      <DataTable
        columns={[
          {
            key: 'id',
            label: 'Roll Identifier',
            width: '130px',
            render: (st) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>
                {st.id}
              </span>
            ),
          },
          {
            key: 'name',
            label: 'Student Name',
            render: (st) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
              </div>
            ),
          },
          {
            key: 'department',
            label: 'Academic Program & Dept',
            render: (st) => <span>{st.department || 'B.Tech AI & Data Science'}</span>,
          },
          {
            key: 'section',
            label: 'Section',
            width: '80px',
            render: (st) => <span className="badge badge-neutral">Sec {st.section || 'A'}</span>,
          },
          {
            key: 'year',
            label: 'Standing',
            width: '100px',
            render: (st) => <span>{st.year || '3rd Year'}</span>,
          },
          {
            key: 'status',
            label: 'Enrollment',
            width: '90px',
            render: () => <span className="badge badge-success">Enrolled</span>,
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            width: '130px',
            render: (st) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEdit(st)}
                  title="Edit Student"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-danger"
                  onClick={() => handleDeleteStudent(st)}
                  title="Remove Student"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ),
          },
        ]}
        data={filteredStudents}
        keyField="id"
      />

      {/* 4. Add Student Modal */}
      {addStudentModal && (
        <div className="modal-backdrop" onClick={() => setAddStudentModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Enroll Student in Master Registry
                </h3>
              </div>
              <button type="button" onClick={() => setAddStudentModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Roll Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024-AIDS-042"
                    value={studentForm.id}
                    onChange={(e) => setStudentForm({ ...studentForm, id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Section
                  </label>
                  <select
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Student Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohith Sundaram"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
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
                  placeholder="e.g. rohith.s@nivara.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Academic Division
                </label>
                <select
                  value={studentForm.deptCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const d = (departments || []).find((dept) => dept.code === code);
                    setStudentForm({
                      ...studentForm,
                      deptCode: code,
                      department: d ? d.name : 'Engineering',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddStudentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Student Modal */}
      {editStudentModal && (
        <div className="modal-backdrop" onClick={() => setEditStudentModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Student ({editStudentForm.id})
                </h3>
              </div>
              <button type="button" onClick={() => setEditStudentModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Student Name
                </label>
                <input
                  type="text"
                  value={editStudentForm.name}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
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
                  value={editStudentForm.email}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Section
                  </label>
                  <select
                    value={editStudentForm.section}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, section: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editStudentForm.semester}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, semester: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Academic Division
                </label>
                <select
                  value={editStudentForm.deptCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const d = (departments || []).find((dept) => dept.code === code);
                    setEditStudentForm({
                      ...editStudentForm,
                      deptCode: code,
                      department: d ? d.name : 'Engineering',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditStudentModal(false)}>
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
