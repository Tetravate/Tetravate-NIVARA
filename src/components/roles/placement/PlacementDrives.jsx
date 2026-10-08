import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Edit2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementDrives({ onNavigate }) {
  const {
    placementDrives,
    createPlacementDrive,
    updatePlacementDrive,
    studentPlacementApplications,
    companies,
    showToast,
  } = useNivara();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showNewDriveModal, setShowNewDriveModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [selectedDriveDetail, setSelectedDriveDetail] = useState(null);

  // Form state for creating/editing placement drive
  const [driveForm, setDriveForm] = useState({
    company: '',
    role: '',
    packageLpa: '',
    minCgpa: '7.5',
    allowedBacklogs: '0',
    location: '',
    deadline: '',
    driveDate: '',
    status: 'active',
    departmentTarget: ['AIDS', 'CSE'],
    description: '',
  });

  const resetDriveForm = () => {
    setDriveForm({
      company: '',
      role: '',
      packageLpa: '',
      minCgpa: '7.5',
      allowedBacklogs: '0',
      location: '',
      deadline: '',
      driveDate: '',
      status: 'active',
      departmentTarget: ['AIDS', 'CSE'],
      description: '',
    });
  };

  const handleOpenAdd = () => {
    resetDriveForm();
    setShowNewDriveModal(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setDriveForm({
      company: drive.company,
      role: drive.role,
      packageLpa: drive.packageLpa,
      minCgpa: String(drive.minCgpa || 7.5),
      allowedBacklogs: String(drive.allowedBacklogs || 0),
      location: drive.location || '',
      deadline: drive.deadline || '',
      driveDate: drive.driveDate || '',
      status: drive.status || 'active',
      departmentTarget: drive.departmentTarget || ['AIDS', 'CSE'],
      description: drive.description || '',
    });
  };

  const handleToggleDept = (deptCode) => {
    const current = driveForm.departmentTarget || [];
    if (current.includes(deptCode)) {
      setDriveForm({
        ...driveForm,
        departmentTarget: current.filter((d) => d !== deptCode),
      });
    } else {
      setDriveForm({
        ...driveForm,
        departmentTarget: [...current, deptCode],
      });
    }
  };

  const handleDriveFormSubmit = (e) => {
    e.preventDefault();
    if (!driveForm.company || !driveForm.role || !driveForm.packageLpa) {
      showToast('Please fill in company name, designation, and compensation package', 'warning');
      return;
    }

    const payload = {
      company: driveForm.company,
      role: driveForm.role,
      packageLpa: driveForm.packageLpa.endsWith('LPA') ? driveForm.packageLpa : `${driveForm.packageLpa} LPA`,
      minCgpa: parseFloat(driveForm.minCgpa) || 7.0,
      allowedBacklogs: parseInt(driveForm.allowedBacklogs, 10) || 0,
      location: driveForm.location || 'Bengaluru / Hybrid',
      deadline: driveForm.deadline || '2026-11-15',
      driveDate: driveForm.driveDate || '2026-11-20',
      status: driveForm.status || 'active',
      departmentTarget: driveForm.departmentTarget.length > 0 ? driveForm.departmentTarget : ['AIDS', 'CSE'],
      description: driveForm.description || 'Core campus recruitment opportunity.',
      selectionStages: [
        'Application Screening',
        'Online Assessment',
        'Technical Interview (Round 1)',
        'Technical Interview (Round 2)',
        'Final HR Evaluation',
        'Offer Extended (Selected)',
      ],
    };

    if (editingDrive) {
      updatePlacementDrive(editingDrive.id, payload);
      setEditingDrive(null);
    } else {
      createPlacementDrive(payload);
      setShowNewDriveModal(false);
    }
    resetDriveForm();
  };

  const handleStatusChange = (driveId, newStatus) => {
    updatePlacementDrive(driveId, { status: newStatus });
  };

  // Filtered drives
  const filteredDrives = useMemo(() => {
    return (placementDrives || []).filter((drive) => {
      const matchesSearch =
        drive.company.toLowerCase().includes(search.toLowerCase()) ||
        drive.role.toLowerCase().includes(search.toLowerCase()) ||
        (drive.location || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : (drive.status || 'active') === statusFilter;

      const matchesDept =
        deptFilter === 'all'
          ? true
          : (drive.departmentTarget || []).includes(deptFilter);

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [placementDrives, search, statusFilter, deptFilter]);

  // Metrics
  const activeCount = useMemo(
    () => (placementDrives || []).filter((d) => d.status === 'active' || !d.status).length,
    [placementDrives]
  );
  const totalApplied = useMemo(
    () => (placementDrives || []).reduce((acc, d) => acc + (d.appliedCount || 0), 0),
    [placementDrives]
  );
  const totalOffers = useMemo(
    () => (placementDrives || []).reduce((acc, d) => acc + (d.selectedCount || 0), 0),
    [placementDrives]
  );

  const driveMetrics = [
    {
      label: 'Total Campus Drives',
      value: `${(placementDrives || []).length} Drives`,
      subtext: 'Current placement calendar',
      state: 'info',
    },
    {
      label: 'Open & Active Drives',
      value: `${activeCount} Accepting`,
      subtext: 'Visible to eligible students',
      state: 'success',
    },
    {
      label: 'Candidate Applications',
      value: `${totalApplied} Submissions`,
      subtext: 'Across all active drives',
      state: 'neutral',
    },
    {
      label: 'Confirmed Selections',
      value: `${totalOffers} Offers`,
      subtext: 'Selected candidates to date',
      state: 'success',
    },
  ];

  const DEPT_OPTIONS = ['AIDS', 'CSE', 'ECE', 'MECH', 'CIVIL'];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Recruitment Drives"
        title="Campus Placement Drives & Lifecycles"
        description="Publish institutional hiring opportunities, configure academic eligibility benchmarks (CGPA & backlogs), target specific departments, and track candidate pipeline progression."
        actions={[
          <button
            key="post-drive"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
          >
            <Plus size={13} /> Post New Placement Drive
          </button>,
        ]}
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={driveMetrics} />

      {/* 3. Drives Registry Section */}
      <section>
        <SectionHeader
          title="Campus Recruitment Drives"
          subtitle="Corporate hiring drives scheduled for undergraduate & postgraduate cohorts"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter company, role, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem 0.25rem 1.65rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    width: '100%',
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter drive status"
              >
                <option value="all">All Lifecycles</option>
                <option value="active">Active (Open)</option>
                <option value="selection">Selection in Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter target department"
              >
                <option value="all">All Departments</option>
                {DEPT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'company',
              label: 'Company & Designation',
              render: (d) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{d.company}</strong>
                    <span className="badge badge-info">{d.packageLpa}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {d.role} · <MapPin size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {d.location}
                  </div>
                </div>
              ),
            },
            {
              key: 'minCgpa',
              label: 'Eligibility Benchmark',
              width: '160px',
              render: (d) => (
                <div>
                  <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                    Min {d.minCgpa} CGPA
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Max {d.allowedBacklogs || 0} Backlog(s)
                  </div>
                </div>
              ),
            },
            {
              key: 'departmentTarget',
              label: 'Target Cohorts',
              width: '140px',
              render: (d) => (
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {(d.departmentTarget || ['AIDS', 'CSE']).map((dept) => (
                    <span key={dept} className="badge badge-info" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                      {dept}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              key: 'appliedCount',
              label: 'Applied',
              align: 'right',
              width: '80px',
              render: (d) => <strong style={{ color: 'var(--text-primary)' }}>{d.appliedCount || 0}</strong>,
            },
            {
              key: 'selectedCount',
              label: 'Offers',
              align: 'right',
              width: '80px',
              render: (d) => <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{d.selectedCount || 0}</span>,
            },
            {
              key: 'status',
              label: 'Lifecycle Stage',
              width: '150px',
              render: (d) => {
                const currentSts = d.status || 'active';
                return (
                  <select
                    value={currentSts}
                    onChange={(e) => handleStatusChange(d.id, e.target.value)}
                    style={{
                      padding: '0.2rem 0.4rem',
                      fontSize: '0.71875rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      background: currentSts === 'active' ? 'var(--state-success-bg, var(--bg-surface))' : 'var(--bg-canvas)',
                      color: currentSts === 'active' ? 'var(--state-success)' : 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    aria-label="Change drive lifecycle status"
                  >
                    <option value="active">Active (Open)</option>
                    <option value="selection">Selection Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                );
              },
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'right',
              width: '170px',
              render: (d) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.71875rem' }}
                    onClick={() => setSelectedDriveDetail(d)}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.71875rem' }}
                    onClick={() => handleOpenEdit(d)}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.71875rem' }}
                    onClick={() => onNavigate && onNavigate('applications')}
                  >
                    Applicants ({d.appliedCount || 0})
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredDrives}
          keyField="id"
          emptyMessage="No placement drives match the chosen criteria."
        />
      </section>

      {/* 4. POST / EDIT DRIVE MODAL */}
      {(showNewDriveModal || editingDrive) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowNewDriveModal(false);
            setEditingDrive(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {editingDrive ? 'Edit Placement Drive' : 'Post Campus Recruitment Drive'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowNewDriveModal(false);
                  setEditingDrive(null);
                }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleDriveFormSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Hiring Partner Company
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    list="partner-companies-list"
                    placeholder="e.g. Google DeepMind & Systems"
                    value={driveForm.company}
                    onChange={(e) => setDriveForm({ ...driveForm, company: e.target.value })}
                    required
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                  <datalist id="partner-companies-list">
                    {(companies || []).map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Designation / Job Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Systems Engineer (L4)"
                    value={driveForm.role}
                    onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Compensation (CTC in LPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 - 28 LPA"
                    value={driveForm.packageLpa}
                    onChange={(e) => setDriveForm({ ...driveForm, packageLpa: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Max Allowed Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={driveForm.allowedBacklogs}
                    onChange={(e) => setDriveForm({ ...driveForm, allowedBacklogs: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Target Departments */}
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Target Academic Departments
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {DEPT_OPTIONS.map((dept) => {
                    const checked = (driveForm.departmentTarget || []).includes(dept);
                    return (
                      <label
                        key={dept}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.6rem',
                          background: checked ? 'var(--brand-blue-subtle, var(--bg-surface))' : 'var(--bg-canvas)',
                          border: checked ? '1px solid var(--brand-blue)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: checked ? 700 : 400,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDept(dept)}
                          style={{ margin: 0 }}
                        />
                        {dept}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Application Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. 25 Oct 2026"
                    value={driveForm.deadline}
                    onChange={(e) => setDriveForm({ ...driveForm, deadline: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Drive / Assessment Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Oct 2026"
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Work Location / Mode</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore / Hybrid"
                    value={driveForm.location}
                    onChange={(e) => setDriveForm({ ...driveForm, location: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Drive Lifecycle Status</label>
                  <select
                    value={driveForm.status}
                    onChange={(e) => setDriveForm({ ...driveForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="active">Active (Published to Students)</option>
                    <option value="selection">Selection in Progress</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Role Description & Screening Details</label>
                <textarea
                  rows="3"
                  placeholder="Job profile overview, technical screening rounds, mandatory skill sets, and interview instructions..."
                  value={driveForm.description}
                  onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowNewDriveModal(false);
                    setEditingDrive(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingDrive ? 'Save Changes' : 'Publish Drive to Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DRIVE DETAIL MODAL */}
      {selectedDriveDetail && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedDriveDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {selectedDriveDetail.company}
                  </h3>
                  <span className="badge badge-info">{selectedDriveDetail.packageLpa}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {selectedDriveDetail.role} · {selectedDriveDetail.location}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDriveDetail(null)}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min CGPA</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedDriveDetail.minCgpa}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Backlogs</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedDriveDetail.allowedBacklogs || 0}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Applied</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--brand-blue)' }}>{selectedDriveDetail.appliedCount || 0}</strong>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Target Departments
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {(selectedDriveDetail.departmentTarget || ['AIDS', 'CSE']).map((dept) => (
                    <span key={dept} className="badge badge-info">{dept}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Job Description & Criteria
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {selectedDriveDetail.description}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Recruitment Stages
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {(selectedDriveDetail.selectionStages || [
                    'Application Screening',
                    'Technical Assessment',
                    'Technical Interview',
                    'Offer Extended',
                  ]).map((stg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700 }}>
                        {i + 1}
                      </span>
                      <span>{stg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const drv = selectedDriveDetail;
                    setSelectedDriveDetail(null);
                    handleOpenEdit(drv);
                  }}
                >
                  Edit Drive
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelectedDriveDetail(null);
                    if (onNavigate) onNavigate('eligibility');
                  }}
                >
                  Check Candidate Eligibility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
