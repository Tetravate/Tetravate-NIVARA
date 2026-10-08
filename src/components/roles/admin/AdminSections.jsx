import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminSections() {
  const { departments, showToast } = useNivara();

  const [addSectionModal, setAddSectionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [sectionsList, setSectionsList] = useState(() => {
    return (departments || []).map((d) => ({
      id: `SEC-${d.code}-A`,
      code: `${d.code}-A`,
      deptCode: d.code,
      deptName: d.name,
      semester: 1,
      section: 'A',
      room: 'Lecture Hall',
      capacity: 60,
      enrolled: d.studentCount || 0,
      classAdvisor: 'Department Faculty',
    }));
  });

  const [sectionForm, setSectionForm] = useState({
    code: '',
    deptCode: 'AIDS',
    semester: 5,
    section: 'A',
    room: '',
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

  const handleAddSection = (e) => {
    e.preventDefault();
    if (!sectionForm.code.trim()) {
      showToast('Please provide a section code identifier', 'error');
      return;
    }

    const d = (departments || []).find((dept) => dept.code === sectionForm.deptCode);
    const newSec = {
      id: `SEC-${sectionForm.code}`,
      ...sectionForm,
      deptName: d ? d.name : 'Engineering',
      enrolled: 0,
    };

    setSectionsList([newSec, ...sectionsList]);
    showToast(`Section ${sectionForm.code} created and assigned to ${sectionForm.room} ✓`, 'success');
    setAddSectionModal(false);
    setSectionForm({
      code: '',
      deptCode: 'AIDS',
      semester: 5,
      section: 'A',
      room: 'Room 405',
      capacity: 60,
      classAdvisor: 'Dr. Priya Raman',
    });
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
            placeholder="Search section code, advisor, room..."
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
          Showing <strong>{filteredSections.length}</strong> active teaching sections
        </div>
      </div>

      {/* 3. DataTable */}
      <DataTable
        columns={[
          {
            key: 'code',
            label: 'Section Identifier',
            render: (s) => (
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{s.code}</strong>
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
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
