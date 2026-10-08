import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminPrograms() {
  const { departments, showToast } = useNivara();

  const [addProgramModal, setAddProgramModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial canonical programs across academic branches
  const [programsList, setProgramsList] = useState([
    { id: 'PRG-BTECH-AIDS', code: 'BTECH-AIDS', name: 'B.Tech in Artificial Intelligence & Data Science', deptCode: 'AIDS', deptName: 'AI & Data Science', duration: '4 Years (8 Semesters)', degree: 'Undergraduate', intake: 120, status: 'active' },
    { id: 'PRG-MTECH-AIDS', code: 'MTECH-AIDS', name: 'M.Tech in Computational Neural Systems', deptCode: 'AIDS', deptName: 'AI & Data Science', duration: '2 Years (4 Semesters)', degree: 'Postgraduate', intake: 30, status: 'active' },
    { id: 'PRG-BTECH-CSE', code: 'BTECH-CSE', name: 'B.Tech in Computer Science & Engineering', deptCode: 'CSE', deptName: 'Computer Science & Engg', duration: '4 Years (8 Semesters)', degree: 'Undergraduate', intake: 180, status: 'active' },
    { id: 'PRG-BTECH-ECE', code: 'BTECH-ECE', name: 'B.Tech in Electronics & Communication Engg', deptCode: 'ECE', deptName: 'Electronics & Comm', duration: '4 Years (8 Semesters)', degree: 'Undergraduate', intake: 120, status: 'active' },
    { id: 'PRG-BTECH-MECH', code: 'BTECH-MECH', name: 'B.Tech in Mechanical Engineering', deptCode: 'MECH', deptName: 'Mechanical Engineering', duration: '4 Years (8 Semesters)', degree: 'Undergraduate', intake: 90, status: 'active' },
    { id: 'PRG-BTECH-CIVIL', code: 'BTECH-CIVIL', name: 'B.Tech in Civil Engineering', deptCode: 'CIVIL', deptName: 'Civil Engineering', duration: '4 Years (8 Semesters)', degree: 'Undergraduate', intake: 60, status: 'active' },
  ]);

  const [programForm, setProgramForm] = useState({
    code: '',
    name: '',
    deptCode: 'AIDS',
    duration: '4 Years (8 Semesters)',
    degree: 'Undergraduate',
    intake: 60,
  });

  const filteredPrograms = programsList.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.deptName.toLowerCase().includes(q)
    );
  });

  const handleAddProgram = (e) => {
    e.preventDefault();
    if (!programForm.name.trim() || !programForm.code.trim()) {
      showToast('Please provide program title and code', 'error');
      return;
    }

    const d = (departments || []).find((dept) => dept.code === programForm.deptCode);
    const newProg = {
      id: `PRG-${programForm.code}`,
      ...programForm,
      deptName: d ? d.name : 'Engineering',
      status: 'active',
    };

    setProgramsList([newProg, ...programsList]);
    showToast(`Degree Program ${programForm.name} instituted successfully ✓`, 'success');
    setAddProgramModal(false);
    setProgramForm({
      code: '',
      name: '',
      deptCode: 'AIDS',
      duration: '4 Years (8 Semesters)',
      degree: 'Undergraduate',
      intake: 60,
    });
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Academic Governance · Degree Program Hierarchy"
        title="Programs & Curricular Degrees"
        description="Administer institutional degree programs, graduation requirements, academic duration, and department associations."
        actions={[
          <button
            key="add-prg"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddProgramModal(true)}
          >
            <Plus size={13} /> Institute Degree Program
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
            placeholder="Search programs, code, or degree..."
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
          Showing <strong>{filteredPrograms.length}</strong> accredited degree programs
        </div>
      </div>

      {/* 3. DataTable */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Degree Program',
            render: (p) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Affiliation: {p.deptName}</div>
              </div>
            ),
          },
          {
            key: 'code',
            label: 'Program Code',
            width: '140px',
            render: (p) => <span className="badge badge-info">{p.code}</span>,
          },
          {
            key: 'degree',
            label: 'Degree Level',
            width: '130px',
            render: (p) => <span className="badge badge-neutral">{p.degree}</span>,
          },
          {
            key: 'duration',
            label: 'Curricular Duration',
            render: (p) => <span>{p.duration}</span>,
          },
          {
            key: 'intake',
            label: 'Approved Intake',
            align: 'right',
            render: (p) => `${p.intake} Students`,
          },
          {
            key: 'status',
            label: 'Regulatory Standing',
            render: () => <span className="badge badge-success">Accredited</span>,
          },
        ]}
        data={filteredPrograms}
        keyField="id"
      />

      {/* 4. Add Program Modal */}
      {addProgramModal && (
        <div className="modal-backdrop" onClick={() => setAddProgramModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Institute Academic Degree Program
                </h3>
              </div>
              <button type="button" onClick={() => setAddProgramModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddProgram} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Program Code (e.g. BTECH-AIDS, MTECH-VLSI)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BTECH-AIDS"
                  value={programForm.code}
                  onChange={(e) => setProgramForm({ ...programForm, code: e.target.value.toUpperCase() })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Degree Program Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech in Artificial Intelligence & Data Science"
                  value={programForm.name}
                  onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Degree Level</label>
                  <select
                    value={programForm.degree}
                    onChange={(e) => setProgramForm({ ...programForm, degree: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Undergraduate">Undergraduate (UG)</option>
                    <option value="Postgraduate">Postgraduate (PG)</option>
                    <option value="Doctoral">Doctoral (Ph.D)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Annual Intake</label>
                  <input
                    type="number"
                    value={programForm.intake}
                    onChange={(e) => setProgramForm({ ...programForm, intake: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Governing Department
                </label>
                <select
                  value={programForm.deptCode}
                  onChange={(e) => setProgramForm({ ...programForm, deptCode: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  {(departments || []).map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddProgramModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Institute Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
