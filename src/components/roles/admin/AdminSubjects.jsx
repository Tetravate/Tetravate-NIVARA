import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  BookOpen,
  Award,
  CheckCircle,
  Edit2,
  Archive,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable } from '../../workspace';

export default function AdminSubjects() {
  const { departments, coursesAttendance, coursesMaster, createCourse, updateCourse, deleteCourse, showToast } = useNivara();

  const [addSubjectModal, setAddSubjectModal] = useState(false);
  const [editSubjectModal, setEditSubjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  const subjectsList = useMemo(() => {
    if (coursesMaster && coursesMaster.length > 0) {
      return coursesMaster.map((c) => {
        const d = (departments || []).find((dept) => dept.code === c.dept_code || dept.code === c.deptCode);
        return {
          id: c.id || `CRS-${c.code}`,
          code: c.code,
          name: c.name,
          deptCode: c.dept_code || c.deptCode || (d ? d.code : 'GEN'),
          deptName: d ? d.name : (c.dept_name || 'Engineering'),
          semester: c.semester || 5,
          credits: c.credits || 4,
          ltp: c.ltp || '3-0-2',
          type: c.type || 'Professional Core',
        };
      });
    }
    // Fallback to coursesAttendance
    return (coursesAttendance || []).map((c) => ({
      id: `CRS-${c.code}`,
      code: c.code,
      name: c.name,
      deptCode: c.deptCode || 'AIDS',
      deptName: c.deptName || 'AI & Data Science',
      semester: c.semester || 5,
      credits: c.credits || 4,
      ltp: c.ltp || '3-0-2',
      type: c.type || 'Professional Core',
    }));
  }, [coursesAttendance, coursesMaster, departments]);

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    deptCode: 'AIDS',
    semester: 5,
    credits: 4,
    ltp: '3-0-2',
    type: 'Professional Core',
  });

  const [editSubjectForm, setEditSubjectForm] = useState({
    code: '',
    name: '',
    deptCode: 'AIDS',
    semester: 5,
    credits: 4,
    ltp: '3-0-2',
    type: 'Professional Core',
  });

  const filteredSubjects = useMemo(() => {
    return subjectsList.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.deptName.toLowerCase().includes(q);

      const matchesDept = selectedDeptFilter === 'all' || s.deptCode === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [subjectsList, searchQuery, selectedDeptFilter]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.code.trim() || !subjectForm.name.trim()) {
      showToast('Please enter subject title and course code', 'error');
      return;
    }

    const d = (departments || []).find((dept) => dept.code === subjectForm.deptCode);
    const newSub = {
      code: subjectForm.code.toUpperCase(),
      name: subjectForm.name,
      dept_code: subjectForm.deptCode,
      semester: Number(subjectForm.semester) || 1,
      credits: Number(subjectForm.credits) || 3,
      ltp: subjectForm.ltp,
      type: subjectForm.type,
      deptName: d ? d.name : 'Engineering',
    };

    await createCourse(newSub);
    setAddSubjectModal(false);
    setSubjectForm({
      code: '',
      name: '',
      deptCode: 'AIDS',
      semester: 5,
      credits: 4,
      ltp: '3-0-2',
      type: 'Professional Core',
    });
  };

  const handleOpenEdit = (s) => {
    setEditSubjectForm({
      code: s.code,
      name: s.name,
      deptCode: s.deptCode || 'AIDS',
      semester: s.semester || 5,
      credits: s.credits || 4,
      ltp: s.ltp || '3-0-2',
      type: s.type || 'Professional Core',
    });
    setEditSubjectModal(true);
  };

  const handleEditSubjectSubmit = async (e) => {
    e.preventDefault();
    await updateCourse(editSubjectForm.code, {
      name: editSubjectForm.name,
      dept_code: editSubjectForm.deptCode,
      semester: Number(editSubjectForm.semester),
      credits: Number(editSubjectForm.credits),
      ltp: editSubjectForm.ltp,
      type: editSubjectForm.type,
    });
    setEditSubjectModal(false);
  };

  const handleArchiveSubject = async (s) => {
    if (window.confirm(`Are you sure you want to archive Subject ${s.name} (${s.code})? Historical records remain preserved.`)) {
      await deleteCourse(s.code);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Academic Curriculum · Course & Subject Registry"
        title="Curriculum Subjects Master"
        description="Centralized catalog of degree course codes, semester credit schemes, and Lecture-Tutorial-Practical (L-T-P) allocations."
        actions={[
          <button
            key="add-sub"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddSubjectModal(true)}
          >
            <Plus size={13} /> Add Subject to Master
          </button>,
        ]}
      />

      {/* 2. Filters Bar */}
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
              placeholder="Search code, title, or department..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={13} color="var(--text-muted)" />
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
              <option value="all">All Departments</option>
              {(departments || []).map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredSubjects.length}</strong> curriculum subjects
        </div>
      </div>

      {/* 3. DataTable */}
      <DataTable
        columns={[
          {
            key: 'code',
            label: 'Course Code',
            width: '120px',
            render: (s) => <span className="badge badge-info">{s.code}</span>,
          },
          {
            key: 'name',
            label: 'Subject Title',
            render: (s) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department: {s.deptName}</div>
              </div>
            ),
          },
          {
            key: 'semester',
            label: 'Semester',
            width: '90px',
            render: (s) => <span>Sem {s.semester}</span>,
          },
          {
            key: 'credits',
            label: 'Credits',
            align: 'right',
            width: '80px',
            render: (s) => <span style={{ fontWeight: 700 }}>{s.credits}</span>,
          },
          {
            key: 'ltp',
            label: 'L-T-P Scheme',
            width: '110px',
            render: (s) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{s.ltp}</span>,
          },
          {
            key: 'type',
            label: 'Course Classification',
            render: (s) => <span className="badge badge-neutral">{s.type}</span>,
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (s) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEdit(s)}
                  title="Edit Subject"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-danger"
                  onClick={() => handleArchiveSubject(s)}
                  title="Archive Subject"
                >
                  <Archive size={12} /> Archive
                </button>
              </div>
            ),
          },
        ]}
        data={filteredSubjects}
        keyField="code"
      />

      {/* 4. Add Subject Modal */}
      {addSubjectModal && (
        <div className="modal-backdrop" onClick={() => setAddSubjectModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Add Subject to Curriculum
                </h3>
              </div>
              <button type="button" onClick={() => setAddSubjectModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSubject} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Course Code (e.g. AI308)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI308"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Cloud Computing Systems"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Department</label>
                  <select
                    value={subjectForm.deptCode}
                    onChange={(e) => setSubjectForm({ ...subjectForm, deptCode: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    {(departments || []).map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={subjectForm.semester}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>L-T-P Scheme</label>
                  <input
                    type="text"
                    placeholder="3-0-2"
                    value={subjectForm.ltp}
                    onChange={(e) => setSubjectForm({ ...subjectForm, ltp: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Classification</label>
                  <select
                    value={subjectForm.type}
                    onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Professional Core">Professional Core</option>
                    <option value="Professional Elective">Professional Elective</option>
                    <option value="Open Elective">Open Elective</option>
                    <option value="Humanities & Science">Humanities & Science</option>
                    <option value="Laboratory Core">Laboratory Core</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddSubjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add to Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Subject Modal */}
      {editSubjectModal && (
        <div className="modal-backdrop" onClick={() => setEditSubjectModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Subject ({editSubjectForm.code})
                </h3>
              </div>
              <button type="button" onClick={() => setEditSubjectModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditSubjectSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={editSubjectForm.name}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Department</label>
                  <select
                    value={editSubjectForm.deptCode}
                    onChange={(e) => setEditSubjectForm({ ...editSubjectForm, deptCode: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    {(departments || []).map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editSubjectForm.semester}
                    onChange={(e) => setEditSubjectForm({ ...editSubjectForm, semester: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editSubjectForm.credits}
                    onChange={(e) => setEditSubjectForm({ ...editSubjectForm, credits: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>L-T-P Scheme</label>
                  <input
                    type="text"
                    value={editSubjectForm.ltp}
                    onChange={(e) => setEditSubjectForm({ ...editSubjectForm, ltp: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Classification</label>
                <select
                  value={editSubjectForm.type}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, type: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="Professional Core">Professional Core</option>
                  <option value="Professional Elective">Professional Elective</option>
                  <option value="Open Elective">Open Elective</option>
                  <option value="Humanities & Science">Humanities & Science</option>
                  <option value="Laboratory Core">Laboratory Core</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditSubjectModal(false)}>
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
