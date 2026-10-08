import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Briefcase,
  User,
  Calendar,
  FileText,
  DollarSign,
  Download,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementOffers({ onNavigate }) {
  const {
    placementOffers,
    createPlacementOffer,
    updatePlacementOfferStatus,
    studentPlacementApplications,
    students,
    placementDrives,
    showToast,
  } = useNivara();

  const [search, setSearch] = useState('');
  const [offerStatusFilter, setOfferStatusFilter] = useState('all');
  const [placementStatusFilter, setPlacementStatusFilter] = useState('all');
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [selectedOfferDetail, setSelectedOfferDetail] = useState(null);

  // Form state
  const [offerForm, setOfferForm] = useState({
    candidateAppIndex: 0,
    company: '',
    role: '',
    packageLpa: '22 LPA',
    offerDate: '2026-10-10',
    joiningDate: '2027-07-01',
    offerStatus: 'extended',
    placementStatus: 'pending_acceptance',
    letterUrl: 'NIVARA-OFFER-NEW.pdf',
  });

  // Shortlisted/offered applicants who can be issued offers
  const eligibleApplicants = useMemo(() => {
    return (studentPlacementApplications || []).filter(
      (a) =>
        !a.stage?.toLowerCase().includes('reject') &&
        !a.stage?.toLowerCase().includes('not selected')
    );
  }, [studentPlacementApplications]);

  const handleOpenAdd = () => {
    const first = eligibleApplicants[0] || {};
    setOfferForm({
      candidateAppIndex: 0,
      company: first.company || 'Tetravate Engineering Labs',
      role: first.role || 'Product Systems Architect',
      packageLpa: '22 LPA',
      offerDate: '2026-10-10',
      joiningDate: '2027-07-01',
      offerStatus: 'extended',
      placementStatus: 'pending_acceptance',
      letterUrl: `NIVARA-OFFER-2026-${Date.now().toString().slice(-4)}.pdf`,
    });
    setShowAddOfferModal(true);
  };

  const handleCandidateSelectChange = (idx) => {
    const selected = eligibleApplicants[idx];
    if (selected) {
      setOfferForm({
        ...offerForm,
        candidateAppIndex: idx,
        company: selected.company,
        role: selected.role || 'Software Development Engineer',
      });
    }
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const candidate = eligibleApplicants[offerForm.candidateAppIndex];
    if (!candidate) {
      showToast('Please select a valid candidate applicant', 'warning');
      return;
    }

    createPlacementOffer({
      driveId: candidate.driveId,
      studentId: candidate.studentId,
      studentName: candidate.studentName,
      company: offerForm.company,
      role: offerForm.role,
      packageLpa: offerForm.packageLpa,
      offerDate: offerForm.offerDate,
      joiningDate: offerForm.joiningDate,
      offerStatus: offerForm.offerStatus,
      placementStatus: offerForm.placementStatus,
      letterUrl: offerForm.letterUrl,
    });

    setShowAddOfferModal(false);
  };

  const handleAcceptOffer = (offerId) => {
    updatePlacementOfferStatus(offerId, 'accepted', 'placed');
    showToast('Offer accepted and candidate officially confirmed as PLACED ✓', 'success');
  };

  const handleDeclineOffer = (offerId) => {
    updatePlacementOfferStatus(offerId, 'declined', 'declined');
    showToast('Offer marked as declined by candidate', 'info');
  };

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return (placementOffers || []).filter((off) => {
      const matchesSearch =
        off.studentName.toLowerCase().includes(search.toLowerCase()) ||
        off.company.toLowerCase().includes(search.toLowerCase()) ||
        off.role.toLowerCase().includes(search.toLowerCase()) ||
        off.packageLpa.toLowerCase().includes(search.toLowerCase());

      const matchesOfferStatus =
        offerStatusFilter === 'all' ? true : off.offerStatus === offerStatusFilter;

      const matchesPlacementStatus =
        placementStatusFilter === 'all'
          ? true
          : off.placementStatus === placementStatusFilter;

      return matchesSearch && matchesOfferStatus && matchesPlacementStatus;
    });
  }, [placementOffers, search, offerStatusFilter, placementStatusFilter]);

  // Metrics
  const totalOffers = (placementOffers || []).length;
  const placedCount = (placementOffers || []).filter(
    (o) => o.placementStatus === 'placed' || o.offerStatus === 'accepted'
  ).length;
  const pendingCount = (placementOffers || []).filter(
    (o) => o.offerStatus === 'extended' || o.placementStatus === 'pending_acceptance'
  ).length;

  // Compute highest & average CTC from LPA strings
  const ctcValues = (placementOffers || [])
    .map((o) => parseFloat(o.packageLpa) || 0)
    .filter((v) => v > 0);

  const highestCtc = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
  const avgCtc =
    ctcValues.length > 0
      ? (ctcValues.reduce((a, b) => a + b, 0) / ctcValues.length).toFixed(1)
      : 0;

  const metrics = [
    {
      label: 'Corporate Offers Extended',
      value: `${totalOffers} Offers`,
      subtext: 'Documented recruitment offers',
      state: 'info',
    },
    {
      label: 'Confirmed Placed Students',
      value: `${placedCount} Candidates`,
      subtext: 'Accepted offers & cleared CDC',
      state: 'success',
    },
    {
      label: 'Pending Candidate Acceptance',
      value: `${pendingCount} Letters`,
      subtext: 'Awaiting student confirmation',
      state: pendingCount > 0 ? 'neutral' : 'success',
    },
    {
      label: 'Compensation Spectrum',
      value: `Max ${highestCtc} LPA`,
      subtext: `Cohort Average: ${avgCtc} LPA`,
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Placement Outcomes"
        title="Corporate Offers & Final Placements"
        description="Verify institutional offer letters, track compensation packages, manage candidate acceptance states, and certify students as placed upon formal acceptance."
        actions={[
          <button
            key="record-offer"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
          >
            <Plus size={13} /> Register Placement Offer
          </button>,
        ]}
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={metrics} />

      {/* 3. Offers Table */}
      <section>
        <SectionHeader
          title="Campus Recruitment Offers Dossier"
          subtitle="Verifiable placement outcomes with packages and acceptance timestamps"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter candidate, company, package..."
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
                value={offerStatusFilter}
                onChange={(e) => setOfferStatusFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter by offer status"
              >
                <option value="all">All Offer Statuses</option>
                <option value="extended">Extended (Pending)</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>

              <select
                value={placementStatusFilter}
                onChange={(e) => setPlacementStatusFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter by placement status"
              >
                <option value="all">All Placement Statuses</option>
                <option value="placed">Placed (Confirmed)</option>
                <option value="pending_acceptance">Pending Acceptance</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'studentName',
              label: 'Candidate & Department',
              render: (off) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {off.studentName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Student ID: {off.studentId} · {off.deptCode || 'AIDS'}
                  </div>
                </div>
              ),
            },
            {
              key: 'company',
              label: 'Employer & Designation',
              render: (off) => (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{off.company}</strong>
                    <span className="badge badge-success">{off.packageLpa}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {off.role}
                  </div>
                </div>
              ),
            },
            {
              key: 'dates',
              label: 'Offer & Joining Timelines',
              render: (off) => (
                <div style={{ fontSize: '0.75rem' }}>
                  <div>Offered: {off.offerDate}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Joining: {off.joiningDate || 'TBD'}</div>
                </div>
              ),
            },
            {
              key: 'placementStatus',
              label: 'Placement Status',
              width: '140px',
              render: (off) => {
                const isPlaced = off.placementStatus === 'placed' || off.offerStatus === 'accepted';
                const isDeclined = off.placementStatus === 'declined' || off.offerStatus === 'declined';
                return (
                  <span className={`badge ${isPlaced ? 'badge-success' : isDeclined ? 'badge-urgent' : 'badge-neutral'}`}>
                    {isPlaced ? (
                      <>
                        <CheckCircle2 size={11} /> Placed
                      </>
                    ) : isDeclined ? (
                      'Declined'
                    ) : (
                      'Pending Acceptance'
                    )}
                  </span>
                );
              },
            },
            {
              key: 'letterUrl',
              label: 'Offer Letter',
              render: (off) => (
                <div style={{ fontSize: '0.71875rem', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FileText size={11} /> {off.letterUrl || 'Official Voucher.pdf'}
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'right',
              width: '210px',
              render: (off) => {
                const isPlaced = off.placementStatus === 'placed' || off.offerStatus === 'accepted';
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.71875rem' }}
                      onClick={() => setSelectedOfferDetail(off)}
                    >
                      Dossier
                    </button>

                    {!isPlaced ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.71875rem' }}
                          onClick={() => handleAcceptOffer(off.id)}
                        >
                          Confirm Placed
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.71875rem' }}
                          onClick={() => handleDeclineOffer(off.id)}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                        ✓ Certified
                      </span>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={filteredOffers}
          keyField="id"
          emptyMessage="No placement offers found matching the chosen filters."
        />
      </section>

      {/* 4. MODAL: Register Placement Offer */}
      {showAddOfferModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAddOfferModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Register Corporate Placement Offer
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAddOfferModal(false)}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Candidate Applicant
                </label>
                <select
                  value={offerForm.candidateAppIndex}
                  onChange={(e) => handleCandidateSelectChange(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  required
                >
                  {eligibleApplicants.map((app, idx) => (
                    <option key={idx} value={idx}>
                      {app.studentName} ({app.studentId || 'ID'}) — {app.company}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Offering Company</label>
                  <input
                    type="text"
                    value={offerForm.company}
                    onChange={(e) => setOfferForm({ ...offerForm, company: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Offered Designation / Role</label>
                  <input
                    type="text"
                    value={offerForm.role}
                    onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Compensation (LPA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 LPA"
                    value={offerForm.packageLpa}
                    onChange={(e) => setOfferForm({ ...offerForm, packageLpa: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Official Offer Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Oct 2026"
                    value={offerForm.offerDate}
                    onChange={(e) => setOfferForm({ ...offerForm, offerDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Tentative Joining Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 01 Jul 2027"
                    value={offerForm.joiningDate}
                    onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Candidate Acceptance</label>
                  <select
                    value={offerForm.placementStatus}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        placementStatus: e.target.value,
                        offerStatus: e.target.value === 'placed' ? 'accepted' : 'extended',
                      })
                    }
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="pending_acceptance">Pending Candidate Acceptance</option>
                    <option value="placed">Accepted & Placed</option>
                    <option value="declined">Declined by Candidate</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Offer Letter File Reference</label>
                <input
                  type="text"
                  placeholder="e.g. NIVARA-OFFER-TEL-088.pdf"
                  value={offerForm.letterUrl}
                  onChange={(e) => setOfferForm({ ...offerForm, letterUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddOfferModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Register Offer Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: View Offer Detail Sheet */}
      {selectedOfferDetail && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedOfferDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Placement Offer Certificate
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Institutional CDC Record · {selectedOfferDetail.company}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedOfferDetail(null)}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Candidate Information
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {selectedOfferDetail.studentName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Roll: {selectedOfferDetail.studentId} · Dept: {selectedOfferDetail.deptCode || 'AIDS'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Designation</div>
                  <strong style={{ fontSize: '0.9375rem' }}>{selectedOfferDetail.role}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Package CTC</div>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--state-success)' }}>{selectedOfferDetail.packageLpa}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Offer Extended</div>
                  <div style={{ fontSize: '0.8125rem' }}>{selectedOfferDetail.offerDate}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tentative Joining</div>
                  <div style={{ fontSize: '0.8125rem' }}>{selectedOfferDetail.joiningDate || 'TBD'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                {selectedOfferDetail.placementStatus !== 'placed' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleAcceptOffer(selectedOfferDetail.id);
                      setSelectedOfferDetail(null);
                    }}
                  >
                    Confirm Candidate Acceptance
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedOfferDetail(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
