import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminFaculty() {
  const { facultyMembers, departments, setFacultyMembers, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [addFacultyModal, setAddFacultyModal] = useState(false);

  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    role: 'Assistant Professor',
    dept: 'Department of AI & Data Science',
    deptCode: 'AIDS',
    courses: 'Core Engineering Coursework',
    hours: 14,
  });

  const fallbackFaculty = [
    { name: 'Dr. Priya Raman', role: 'Associate Professor', dept: 'AI & Data Science', deptCode: 'AIDS', courses: 'Machine Learning (AI302)', hours: 16, rating: 4.8 },
    { name: 'Prof. Ananya Sen', role: 'Assistant Professor', dept: 'AI & Data Science', deptCode: 'AIDS', courses: 'Database Management Systems (CS301)', hours: 14, rating: 4.7 },
    { name: 'Prof. S. Venkatesh', role: 'Associate Professor', dept: 'AI & Data Science', deptCode: 'AIDS', courses: 'Data Structures & Algorithms (CS304)', hours: 18, rating: 4.9 },
    { name: 'Dr. Rajesh K', role: 'Professor', dept: 'Computer Science & Engg', deptCode: 'CSE', courses: 'Advanced Operating Systems (CS501)', hours: 12, rating: 4.9 },
    { name: 'Dr. Sunita Sharma', role: 'Professor', dept: 'Electronics & Comm', deptCode: 'ECE', courses: 'VLSI Digital Signal Processing (EC402)', hours: 14, rating: 4.8 },
    { name: 'Prof. R. Balaji', role: 'Associate Professor', dept: 'Mechanical Engineering', deptCode: 'MECH', courses: 'Finite Element Analysis (ME301)', hours: 16, rating: 4.6 },
    { name: 'Dr. M. Gurumurthy', role: 'Professor', dept: 'Civil Engineering', deptCode: 'CIVIL', courses: 'Structural Dynamics (CE401)', hours: 14, rating: 4.7 },
  ];

  const facultyData = (facultyMembers && facultyMembers.length > 0) ? facultyMembers : fallbackFaculty;

  const filteredFaculty = useMemo(() => {
    return facultyData.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        f.name.toLowerCase().includes(q) ||
        (f.role && f.role.toLowerCase().includes(q)) ||
        (f.courses && f.courses.toLowerCase().includes(q));

      const matchesDept =
        selectedDeptFilter === 'all' ||
        f.deptCode === selectedDeptFilter ||
        (f.dept && f.dept.includes(selectedDeptFilter));

      return matchesSearch && matchesDept;
    });
  }, [facultyData, searchQuery, selectedDeptFilter]);

  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!facultyForm.name.trim() || !facultyForm.email.trim()) {
      showToast('Please enter faculty name and email', 'error');
      return;
    }

    const newFaculty = {
      ...facultyForm,
      rating: 4.8,
      status: 'active',
    };

    setFacultyMembers([newFaculty, ...facultyData]);
    showToast(`Enrolled ${facultyForm.name} in Faculty Master Directory ✓`, 'success');
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
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Academic Affairs · Instructional Faculty Master"
        title="Faculty Master Registry"
        description="Maintain university faculty appointments, academic designations, department affiliations, and instructional responsibilities."
        actions={[
          <button
            key="add-faculty"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddFacultyModal(true)}
          >
            <Plus size={13} /> Appoint Faculty Member
          </button>,
        ]}
      />

      {/* 2. Filter Bar */}
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
              placeholder="Search faculty name, courses..."
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.role}</div>
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
                  Full Name with Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. Senthil Kumar"
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
                  placeholder="e.g. senthil.k@nivara.edu"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Designation
                  </label>
                  <select
                    value={facultyForm.role}
                    onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Weekly Teaching Load
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="22"
                    value={facultyForm.hours}
                    onChange={(e) => setFacultyForm({ ...facultyForm, hours: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Affiliated Department
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddFacultyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Appoint Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
