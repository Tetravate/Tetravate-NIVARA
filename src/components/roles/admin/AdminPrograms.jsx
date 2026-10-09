import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Archive,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, DataTable } from '../../workspace';

export default function AdminPrograms() {
  const { departments, programs, createProgram, updateProgram, deleteProgram, showToast } = useNivara();

  const [addProgramModal, setAddProgramModal] = useState(false);
  const [editProgramModal, setEditProgramModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const programsList = useMemo(() => {
    if (programs && programs.length > 0) {
      return programs.map((p) => {
        const d = (departments || []).find((dept) => dept.code === p.dept_code || dept.code === p.deptCode);
        return {
          id: p.id || `PRG-${p.code}`,
          code: p.code,
          name: p.name,
          deptCode: p.dept_code || p.deptCode || (d ? d.code : 'GEN'),
          deptName: d ? d.name : (p.dept_name || 'Engineering'),
          duration: p.duration || '4 Years (8 Semesters)',
          degree: p.degree || 'Undergraduate',
          intake: p.intake || 60,
          status: p.status || 'active',
        };
      });
    }
    // Fallback if no database programs exist yet
    return (departments || []).map((d) => ({
      id: `PRG-BTECH-${d.code}`,
      code: `BTECH-${d.code}`,
      name: `B.Tech in ${d.name}`,
      deptCode: d.code,
      deptName: d.name,
      duration: '4 Years (8 Semesters)',
      degree: 'Undergraduate',
      intake: d.studentCount || 60,
      status: 'active',
    }));
  }, [departments, programs]);

  const [programForm, setProgramForm] = useState({
    code: '',
    name: '',
    deptCode: 'AIDS',
    duration: '4 Years (8 Semesters)',
    degree: 'Undergraduate',
    intake: 60,
  });

  const [editProgramForm, setEditProgramForm] = useState({
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

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!programForm.name.trim() || !programForm.code.trim()) {
      showToast('Please provide program title and code', 'error');
      return;
    }

    const d = (departments || []).find((dept) => dept.code === programForm.deptCode);
    const newProg = {
      code: programForm.code.toUpperCase(),
      name: programForm.name,
      dept_code: programForm.deptCode,
      degree: programForm.degree,
      duration: programForm.duration,
      intake: Number(programForm.intake) || 60,
      deptName: d ? d.name : 'Engineering',
      status: 'active',
    };

    await createProgram(newProg);
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

  const handleOpenEdit = (p) => {
    setEditProgramForm({
      code: p.code,
      name: p.name,
      deptCode: p.deptCode || 'AIDS',
      duration: p.duration || '4 Years (8 Semesters)',
      degree: p.degree || 'Undergraduate',
      intake: p.intake || 60,
    });
    setEditProgramModal(true);
  };

  const handleEditProgramSubmit = async (e) => {
    e.preventDefault();
    if (!editProgramForm.name.trim()) {
      showToast('Program title is required', 'error');
      return;
    }

    await updateProgram(editProgramForm.code, {
      name: editProgramForm.name,
      dept_code: editProgramForm.deptCode,
      degree: editProgramForm.degree,
      duration: editProgramForm.duration,
      intake: Number(editProgramForm.intake) || 60,
    });
    setEditProgramModal(false);
  };

  const handleArchiveProgram = async (p) => {
    if (window.confirm(`Are you sure you want to archive Program ${p.name} (${p.code})? Historical records remain preserved.`)) {
      await deleteProgram(p.code);
    }
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
            placeholder="Search program, code, or department..."
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
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (p) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleOpenEdit(p)}
                  title="Edit Program"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-danger"
                  onClick={() => handleArchiveProgram(p)}
                  title="Archive Program"
                >
                  <Archive size={12} /> Archive
                </button>
              </div>
            ),
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

      {/* 5. Edit Program Modal */}
      {editProgramModal && (
        <div className="modal-backdrop" onClick={() => setEditProgramModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Degree Program ({editProgramForm.code})
                </h3>
              </div>
              <button type="button" onClick={() => setEditProgramModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditProgramSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Full Degree Program Title
                </label>
                <input
                  type="text"
                  value={editProgramForm.name}
                  onChange={(e) => setEditProgramForm({ ...editProgramForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Degree Level</label>
                  <select
                    value={editProgramForm.degree}
                    onChange={(e) => setEditProgramForm({ ...editProgramForm, degree: e.target.value })}
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
                    value={editProgramForm.intake}
                    onChange={(e) => setEditProgramForm({ ...editProgramForm, intake: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Governing Department
                </label>
                <select
                  value={editProgramForm.deptCode}
                  onChange={(e) => setEditProgramForm({ ...editProgramForm, deptCode: e.target.value })}
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
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditProgramModal(false)}>
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
