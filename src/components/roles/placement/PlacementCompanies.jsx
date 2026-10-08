import React, { useState, useMemo } from 'react';
import {
  Building,
  Plus,
  Search,
  ExternalLink,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Briefcase,
  Edit2,
  Lock,
  Filter,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementCompanies({ onNavigate }) {
  const {
    companies,
    createCompany,
    updateCompany,
    toggleCompanyStatus,
    placementDrives,
    placementOffers,
    showToast,
  } = useNivara();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewCompanyDetails, setViewCompanyDetails] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    website: '',
    hrContact: '',
    hrEmail: '',
    hrPhone: '',
    activeStatus: 'active',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      website: '',
      hrContact: '',
      hrEmail: '',
      hrPhone: '',
      activeStatus: 'active',
      notes: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      category: company.category || '',
      website: company.website || '',
      hrContact: company.hrContact || '',
      hrEmail: company.hrEmail || '',
      hrPhone: company.hrPhone || '',
      activeStatus: company.activeStatus || 'active',
      notes: company.notes || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please specify the company name', 'warning');
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, formData);
      setEditingCompany(null);
    } else {
      createCompany(formData);
      setShowAddModal(false);
    }
    resetForm();
  };

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return (companies || []).filter((comp) => {
      const matchesSearch =
        comp.name.toLowerCase().includes(search.toLowerCase()) ||
        (comp.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (comp.hrContact || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : comp.activeStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  // Compute metrics
  const activeCount = useMemo(
    () => (companies || []).filter((c) => c.activeStatus === 'active').length,
    [companies]
  );

  const metrics = [
    {
      label: 'Corporate Hiring Partners',
      value: `${(companies || []).length} Companies`,
      subtext: 'Institutional recruitment roster',
      state: 'info',
    },
    {
      label: 'Active Recruitment Status',
      value: `${activeCount} Active`,
      subtext: 'Currently eligible for campus drives',
      state: 'success',
    },
    {
      label: 'Corporate Drives Linked',
      value: `${(placementDrives || []).length} Drives`,
      subtext: 'Conducted across all departments',
      state: 'neutral',
    },
    {
      label: 'Offers Generated',
      value: `${(placementOffers || []).length} Offers`,
      subtext: 'From verified partner drives',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Corporate Alliances"
        title="Corporate Recruitment Partners"
        description="Maintain accredited corporate relations, manage confidential university HR points of contact, and link employers directly with campus placement drives."
        actions={[
          <button
            key="add-company"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
          >
            <Plus size={13} /> Add Hiring Partner
          </button>,
        ]}
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={metrics} />

      {/* 3. Companies Table */}
      <section>
        <SectionHeader
          title="Industry Partner Registry"
          subtitle="Corporate accounts with confidential talent acquisition contacts"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter company or domain..."
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
                aria-label="Filter company status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Company & Domain',
              render: (comp) => {
                const linkedDrives = (placementDrives || []).filter(
                  (d) => d.company.toLowerCase() === comp.name.toLowerCase()
                );
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{comp.name}</strong>
                      {comp.website && (
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          title="Open official site"
                          style={{ color: 'var(--brand-blue)', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {comp.category} · {linkedDrives.length} drives hosted
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'hrContact',
              label: 'CDC HR Point of Contact',
              render: (comp) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Lock size={10} color="var(--brand-blue)" title="CDC Confidential" />
                    <span>{comp.hrContact || 'Talent Acquisition Team'}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {comp.hrEmail || comp.hrPhone || 'Contact details in file'}
                  </div>
                </div>
              ),
            },
            {
              key: 'activeStatus',
              label: 'Status',
              width: '110px',
              render: (comp) => (
                <span className={`badge ${comp.activeStatus === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                  {comp.activeStatus === 'active' ? 'Active Partner' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'right',
              width: '200px',
              render: (comp) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setViewCompanyDetails(comp)}
                  >
                    Dossier
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleOpenEdit(comp)}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${comp.activeStatus === 'active' ? 'btn-ghost' : 'btn-primary'}`}
                    style={{ fontSize: '0.71875rem' }}
                    onClick={() => toggleCompanyStatus(comp.id)}
                  >
                    {comp.activeStatus === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredCompanies}
          keyField="id"
          emptyMessage="No partner companies match the active search criteria."
        />
      </section>

      {/* 4. MODAL: Add / Edit Partner Company */}
      {(showAddModal || editingCompany) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowAddModal(false);
            setEditingCompany(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {editingCompany ? 'Edit Partner Company Dossier' : 'Register Corporate Partner'}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCompany(null);
                }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cisco Systems India Pvt Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Industry Domain / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Tier-1 Software / Cloud"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Official Website URL</label>
                  <input
                    type="text"
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Confidential HR Contact Box */}
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px dashed var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-blue)', textTransform: 'uppercase' }}>
                  <Lock size={11} /> CDC Internal Point of Contact (Confidential)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>HR / Recruiter Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ms. Radhika Sharma (University Hiring Head)"
                      value={formData.hrContact}
                      onChange={(e) => setFormData({ ...formData, hrContact: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="campus.recruiter@company.com"
                        value={formData.hrEmail}
                        onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Direct Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.hrPhone}
                        onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Operating Status</label>
                <select
                  value={formData.activeStatus}
                  onChange={(e) => setFormData({ ...formData, activeStatus: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="active">Active (Eligible to Post Placement Drives)</option>
                  <option value="inactive">Inactive (Archived Partner)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>CDC Internal Notes</label>
                <textarea
                  rows="2"
                  placeholder="Hiring patterns, eligibility criteria history, campus visit protocols..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCompany(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingCompany ? 'Save Changes' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: View Company Dossier */}
      {viewCompanyDetails && (
        <div
          className="modal-backdrop"
          onClick={() => setViewCompanyDetails(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {viewCompanyDetails.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {viewCompanyDetails.category}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setViewCompanyDetails(null)}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span className={`badge ${viewCompanyDetails.activeStatus === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                      {viewCompanyDetails.activeStatus === 'active' ? 'Active Partner' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Website</div>
                  <div style={{ marginTop: '0.2rem', fontSize: '0.8125rem' }}>
                    {viewCompanyDetails.website ? (
                      <a href={viewCompanyDetails.website} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-blue)' }}>
                        {viewCompanyDetails.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </div>
                </div>
              </div>

              {/* Confidential HR Point of Contact */}
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                  <Lock size={12} /> CDC Confidential HR Contact
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {viewCompanyDetails.hrContact || 'Not recorded'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Email: {viewCompanyDetails.hrEmail || 'N/A'} · Phone: {viewCompanyDetails.hrPhone || 'N/A'}
                </div>
              </div>

              {/* Associated Drives */}
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Associated Placement Drives
                </h4>
                {(() => {
                  const companyDrives = (placementDrives || []).filter(
                    (d) => d.company.toLowerCase() === viewCompanyDetails.name.toLowerCase()
                  );
                  if (companyDrives.length === 0) {
                    return <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No campus drives posted yet for this partner.</div>;
                  }
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {companyDrives.map((d) => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                          <div>
                            <strong style={{ fontSize: '0.8125rem' }}>{d.role}</strong>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{d.packageLpa} · Min {d.minCgpa} CGPA</div>
                          </div>
                          <span className="badge badge-info">{d.appliedCount || 0} Applied</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {viewCompanyDetails.notes && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: 'var(--radius-xs)' }}>
                  Note: {viewCompanyDetails.notes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const comp = viewCompanyDetails;
                    setViewCompanyDetails(null);
                    handleOpenEdit(comp);
                  }}
                >
                  Edit Dossier
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setViewCompanyDetails(null);
                    if (onNavigate) onNavigate('drives');
                  }}
                >
                  Post Drive for {viewCompanyDetails.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
