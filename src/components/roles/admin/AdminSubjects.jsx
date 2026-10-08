import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  BookOpen,
  Award,
  CheckCircle,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, DataTable } from '../../workspace';

export default function AdminSubjects() {
  const { departments, coursesAttendance, showToast } = useNivara();

  const [addSubjectModal, setAddSubjectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  // Master subjects catalog seeded from live courses
  const [subjectsList, setSubjectsList] = useState(() => {
    return (coursesAttendance || []).map((c) => ({
      code: c.code,
      name: c.name,
      deptCode: c.deptCode || 'AIDS',
      deptName: c.deptName || 'AI & Data Science',
      semester: c.semester || 5,
      credits: c.credits || 4,
      ltp: c.ltp || '3-0-2',
      type: c.type || 'Professional Core',
    }));
  });

  const [subjectForm, setSubjectForm] = useState({
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

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.code.trim() || !subjectForm.name.trim()) {
      showToast('Please enter subject title and course code', 'error');
      return;
    }

    const d = (departments || []).find((dept) => dept.code === subjectForm.deptCode);
    const newSub = {
      ...subjectForm,
      deptName: d ? d.name : 'Engineering',
    };

    setSubjectsList([newSub, ...subjectsList]);
    showToast(`Subject ${subjectForm.name} (${subjectForm.code}) added to Curriculum Master ✓`, 'success');
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
            <Plus size={13} /> Add Curriculum Subject
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
              placeholder="Search course code or subject title..."
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
          Showing <strong>{filteredSubjects.length}</strong> active course subjects
        </div>
      </div>

      {/* 3. Subject DataTable */}
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
                  Full Subject Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Natural Language Processing & Large Models"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    Department
                  </label>
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
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    L-T-P Distribution
                  </label>
                  <input
                    type="text"
                    placeholder="3-0-2"
                    value={subjectForm.ltp}
                    onChange={(e) => setSubjectForm({ ...subjectForm, ltp: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddSubjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
