import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function ExamCellRevaluation({ onNavigate }) {
  const {
    revaluationRequests,
    updateRevaluationStatus,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);

  // Review modal form state
  const [reviewData, setReviewData] = useState({
    status: 'completed',
    updatedMarks: '',
    updatedGrade: '',
    remarks: '',
    reviewer: 'Dr. K. Anand (Controller of Examinations)',
  });

  const openReviewModal = (req) => {
    setReviewModal(req);
    setReviewData({
      status: req.status === 'submitted' ? 'under_review' : 'completed',
      updatedMarks: req.updatedMarks !== null ? String(req.updatedMarks) : String(req.originalMarks),
      updatedGrade: req.updatedGrade || req.originalGrade || 'B',
      remarks: 'Part B Question valuation verified against master solution key.',
      reviewer: 'Dr. K. Anand (Controller of Examinations)',
    });
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!reviewModal) return;

    updateRevaluationStatus(
      reviewModal.id,
      reviewData.status,
      Number(reviewData.updatedMarks),
      reviewData.updatedGrade,
      reviewData.reviewer
    );

    setReviewModal(null);
  };

  const filteredRequests = (revaluationRequests || []).filter((r) => {
    const matchSearch =
      !searchQuery ||
      r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (r.status || '').toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchStatus;
  });

  const totalReqs = (revaluationRequests || []).length;
  const pendingCount = (revaluationRequests || []).filter(
    (r) => r.status === 'submitted' || r.status === 'requested'
  ).length;
  const underReviewCount = (revaluationRequests || []).filter((r) => r.status === 'under_review').length;
  const completedCount = (revaluationRequests || []).filter(
    (r) => r.status === 'completed' || r.status === 'approved' || r.status === 'rejected'
  ).length;

  const revalMetrics = [
    {
      label: 'Total Revaluation Appeals',
      value: `${totalReqs} Requests`,
      subtext: 'Semester 4 formal appeals',
      state: 'info',
    },
    {
      label: 'Awaiting Assignment',
      value: `${pendingCount} Petitions`,
      subtext: pendingCount === 0 ? 'All petitions processed' : 'Pending second examiner allotment',
      state: pendingCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Under Re-Evaluation',
      value: `${underReviewCount} Under Review`,
      subtext: 'Assigned to senior evaluators',
      state: 'neutral',
    },
    {
      label: 'Completed / Closed',
      value: `${completedCount} Concluded`,
      subtext: 'Marks gazette amendments issued',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Answer Script Re-totaling & Second-Examiner Grievance Redressal"
        title="Revaluation Operations Pipeline"
        description="Administer formal answer script revaluation petitions, assign independent examiners, record amended marks, and update student academic portfolios."
        actions={[
          <button
            key="results"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('results')}
          >
            Published Results
          </button>,
        ]}
      />

      <MetricStrip metrics={revalMetrics} />

      {/* Filter and Search Bar */}
      <section style={{
        padding: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by student roll no, name, or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', height: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ height: '36px', minWidth: '160px' }}
          >
            <option value="all">All Petition Statuses</option>
            <option value="submitted">Submitted / Awaiting</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed / Amended</option>
            <option value="rejected">Rejected (No Change)</option>
          </select>
        </div>
      </section>

      {/* Revaluation Queue Table */}
      <section>
        <SectionHeader
          title="Active Revaluation Petition Queue"
          subtitle={`Displaying ${filteredRequests.length} candidate petitions`}
        />

        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No Revaluation Requests Found"
            message="No petitions match your active search or filter selection."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'rollNo',
                label: 'Student & Roll No',
                render: (r) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {r.rollNo}
                    </div>
                  </div>
                ),
              },
              {
                key: 'courseCode',
                label: 'Course & Subject',
                render: (r) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{r.subjectName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {r.courseCode} · Sem {r.semester || 4}
                    </div>
                  </div>
                ),
              },
              {
                key: 'originalMarks',
                label: 'Original Result',
                render: (r) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 700 }}>{r.originalMarks} Marks</span>
                    <span className="badge badge-neutral" style={{ marginLeft: '6px' }}>{r.originalGrade}</span>
                  </div>
                ),
              },
              {
                key: 'reason',
                label: 'Grievance Rationale',
                render: (r) => (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.4 }}>
                    {r.reason}
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '140px',
                render: (r) => {
                  const st = r.status || 'submitted';
                  const badgeClass =
                    st === 'completed' || st === 'approved'
                      ? 'badge-success'
                      : st === 'under_review'
                      ? 'badge-warning'
                      : st === 'rejected'
                      ? 'badge-danger'
                      : 'badge-info';
                  return <span className={`badge ${badgeClass}`}>{st.replace('_', ' ')}</span>;
                },
              },
              {
                key: 'actions',
                label: 'COE Review',
                align: 'right',
                width: '140px',
                render: (r) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openReviewModal(r)}
                  >
                    <Edit3 size={12} /> Process
                  </button>
                ),
              },
            ]}
            data={filteredRequests}
            keyField="id"
          />
        )}
      </section>

      {/* PROCESS REVALUATION MODAL */}
      {reviewModal && (
        <div className="modal-backdrop" onClick={() => setReviewModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Process Revaluation: {reviewModal.rollNo}
                </h3>
              </div>
              <button type="button" onClick={() => setReviewModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <form onSubmit={handleSaveReview} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <div>Course: <strong>{reviewModal.courseCode} - {reviewModal.subjectName}</strong></div>
                <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                  Student: {reviewModal.studentName} ({reviewModal.rollNo}) · Original: <strong>{reviewModal.originalMarks} ({reviewModal.originalGrade})</strong>
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Appeal Note: <em>"{reviewModal.reason}"</em>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Target Status *
                </label>
                <select
                  className="input-field"
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  style={{ width: '100%', height: '36px' }}
                >
                  <option value="under_review">Under Review (Assigned to Examiner)</option>
                  <option value="completed">Completed (Amended & Concluded)</option>
                  <option value="rejected">Rejected (Original Marks Upheld)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Reassessed Marks *
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={reviewData.updatedMarks}
                    onChange={(e) => setReviewData({ ...reviewData, updatedMarks: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Reassessed Grade *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={reviewData.updatedGrade}
                    onChange={(e) => setReviewData({ ...reviewData, updatedGrade: e.target.value.toUpperCase() })}
                    placeholder="e.g. A"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Controller / Examiner Remarks
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={reviewData.remarks}
                  onChange={(e) => setReviewData({ ...reviewData, remarks: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Record Decision & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
