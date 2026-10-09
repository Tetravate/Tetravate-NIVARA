import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Archive,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminSections() {
  const { departments, classSections, createClassSection, updateClassSection, deleteClassSection, showToast } = useNivara();

  const [addSectionModal, setAddSectionModal] = useState(false);
  const [editSectionModal, setEditSectionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sectionsList = useMemo(() => {
    if (classSections && classSections.length > 0) {
      return classSections.map((s) => {
        const d = (departments || []).find((dept) => dept.code === s.dept_code || dept.code === s.deptCode);
        return {
          id: s.id || `SEC-${s.code}`,
          code: s.code,
          name: s.name || s.code,
          deptCode: s.dept_code || s.deptCode || (d ? d.code : 'GEN'),
          deptName: d ? d.name : (s.dept_name || 'Engineering'),
          semester: s.semester || 1,
          section: s.section || 'A',
          room: s.room || 'Lecture Hall',
          capacity: s.capacity || 60,
          enrolled: s.enrolled || 0,
          classAdvisor: s.class_advisor || s.classAdvisor || 'Faculty Mentor',
        };
      });
    }
    return (departments || []).map((d) => ({
      id: `SEC-${d.code}-A`,
      code: `${d.code}-A`,
      name: `${d.code} Section A`,
      deptCode: d.code,
      deptName: d.name,
      semester: 1,
      section: 'A',
      room: 'Lecture Hall',
      capacity: 60,
      enrolled: d.studentCount || 0,
      classAdvisor: 'Department Faculty',
    }));
  }, [departments, classSections]);

  const [sectionForm, setSectionForm] = useState({
    code: '',
    deptCode: 'AIDS',
    semester: 5,
    section: 'A',
    room: 'Room 405',
    capacity: 60,
    classAdvisor: '',
  });

  const [editSectionForm, setEditSectionForm] = useState({
    code: '',
    name: '',
    deptCode: 'AIDS',
    semester: 5,
    section: 'A',
    room: 'Room 405',
    capacity: 60,
    classAdvisor: '',
  });

  const filteredSections = sectionsList.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.deptName.toLowerCase().includes(q) ||
      s.classAdvisor.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q)
    );
  });

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.code.trim()) {
      showToast('Please provide a section code identifier', 'error');
      return;
    }

    const d = (departments || []).find((dept) => dept.code === sectionForm.deptCode);
    const newSec = {
      code: sectionForm.code.toUpperCase(),
      name: `${sectionForm.deptCode} Section ${sectionForm.section} (Sem ${sectionForm.semester})`,
      dept_code: sectionForm.deptCode,
      semester: Number(sectionForm.semester) || 1,
      section: sectionForm.section,
      room: sectionForm.room,
      capacity: Number(sectionForm.capacity) || 60,
      class_advisor: sectionForm.classAdvisor || 'Faculty Mentor',
      deptName: d ? d.name : 'Engineering',
      enrolled: 0,
    };

    await createClassSection(newSec);
    setAddSectionModal(false);
    setSectionForm({
      code: '',
      deptCode: 'AIDS',
      semester: 5,
      section: 'A',
      room: 'Room 405',
      capacity: 60,
      classAdvisor: '',
    });
  };

  const handleOpenEdit = (s) => {
    setEditSectionForm({
      code: s.code,
      name: s.name,
      deptCode: s.deptCode || 'AIDS',
      semester: s.semester || 1,
      section: s.section || 'A',
      room: s.room || 'Room 405',
      capacity: s.capacity || 60,
      classAdvisor: s.classAdvisor || '',
    });
    setEditSectionModal(true);
  };

  const handleEditSectionSubmit = async (e) => {
    e.preventDefault();
    await updateClassSection(editSectionForm.code, {
      name: editSectionForm.name,
      dept_code: editSectionForm.deptCode,
      semester: Number(editSectionForm.semester),
      section: editSectionForm.section,
      room: editSectionForm.room,
      capacity: Number(editSectionForm.capacity),
      class_advisor: editSectionForm.classAdvisor,
    });
    setEditSectionModal(false);
  };

  const handleArchiveSection = async (s) => {
    if (window.confirm(`Are you sure you want to archive Section ${s.code}? Historical records remain preserved.`)) {
      await deleteClassSection(s.code);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Academic Operations · Class & Cohort Administration"
        title="Classes & Academic Sections Master"
        description="Configure teaching sections, room allocations, student capacity ceilings, and designated faculty mentors."
        actions={[
          <button
            key="add-sec"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddSectionModal(true)}
          >
            <Plus size={13} /> Add Class Section
          </button>,
        ]}
      />

      {/* 2. Search Bar */}
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
            placeholder="Search section, code, or advisor..."
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
          Showing <strong>{filteredSections.length}</strong> active class cohorts
        </div>
      </div>

      {/* 3. DataTable */}
      <DataTable
        columns={[
          {
            key: 'code',
            label: 'Section Code',
            render: (s) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.code}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept: {s.deptName}</div>
              </div>
            ),
          },
          {
            key: 'semester',
            label: 'Term',
            width: '80px',
            render: (s) => <span>Sem {s.semester}</span>,
          },
          {
            key: 'room',
            label: 'Assigned Classroom',
            width: '130px',
            render: (s) => <span className="badge badge-neutral">{s.room}</span>,
          },
          {
            key: 'enrolled',
            label: 'Enrollment',
            align: 'right',
            render: (s) => `${s.enrolled} / ${s.capacity} Students`,
          },
          {
            key: 'classAdvisor',
            label: 'Class Advisor',
            render: (s) => <span>{s.classAdvisor}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            render: () => <span className="badge badge-success">Active Cohort</span>,
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
                  title="Edit Section"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-danger"
                  onClick={() => handleArchiveSection(s)}
                  title="Archive Section"
                >
                  <Archive size={12} /> Archive
                </button>
              </div>
            ),
          },
        ]}
        data={filteredSections}
        keyField="id"
      />

      {/* 4. Add Section Modal */}
      {addSectionModal && (
        <div className="modal-backdrop" onClick={() => setAddSectionModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Configure Teaching Section
                </h3>
              </div>
              <button type="button" onClick={() => setAddSectionModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSection} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Section Identifier Code (e.g. AIDS-C-SEM5)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AIDS-C-SEM5"
                  value={sectionForm.code}
                  onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Department</label>
                  <select
                    value={sectionForm.deptCode}
                    onChange={(e) => setSectionForm({ ...sectionForm, deptCode: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Assigned Classroom</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 405"
                    value={sectionForm.room}
                    onChange={(e) => setSectionForm({ ...sectionForm, room: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={sectionForm.semester}
                    onChange={(e) => setSectionForm({ ...sectionForm, semester: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Capacity</label>
                  <input
                    type="number"
                    value={sectionForm.capacity}
                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Class Advisor / Faculty Mentor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya Raman"
                  value={sectionForm.classAdvisor}
                  onChange={(e) => setSectionForm({ ...sectionForm, classAdvisor: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddSectionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Charter Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Section Modal */}
      {editSectionModal && (
        <div className="modal-backdrop" onClick={() => setEditSectionModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Section ({editSectionForm.code})
                </h3>
              </div>
              <button type="button" onClick={() => setEditSectionModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditSectionSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Department</label>
                  <select
                    value={editSectionForm.deptCode}
                    onChange={(e) => setEditSectionForm({ ...editSectionForm, deptCode: e.target.value })}
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
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Assigned Classroom</label>
                  <input
                    type="text"
                    value={editSectionForm.room}
                    onChange={(e) => setEditSectionForm({ ...editSectionForm, room: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={editSectionForm.semester}
                    onChange={(e) => setEditSectionForm({ ...editSectionForm, semester: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Capacity</label>
                  <input
                    type="number"
                    value={editSectionForm.capacity}
                    onChange={(e) => setEditSectionForm({ ...editSectionForm, capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Class Advisor / Faculty Mentor
                </label>
                <input
                  type="text"
                  value={editSectionForm.classAdvisor}
                  onChange={(e) => setEditSectionForm({ ...editSectionForm, classAdvisor: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditSectionModal(false)}>
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
