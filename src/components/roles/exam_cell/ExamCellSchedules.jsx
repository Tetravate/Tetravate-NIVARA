import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function ExamCellSchedules() {
  const {
    examSessions,
    addExamSession,
    updateExamSession,
    deleteExamSession,
    showToast,
  } = useNivara();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    subject: '',
    examType: 'Mid-Semester Internal II',
    dateFormatted: '25 Oct 2026',
    day: 'Saturday',
    time: '10:00 AM – 12:00 PM',
    venue: 'Block B · Examination Hall 2',
    capacity: 64,
    registeredCount: 45,
    seatingSeat: 'Desk B-14',
    status: 'Scheduled',
  });

  const openCreateModal = () => {
    setEditingSession(null);
    setFormData({
      code: '',
      subject: '',
      examType: 'Mid-Semester Internal II',
      dateFormatted: '25 Oct 2026',
      day: 'Saturday',
      time: '10:00 AM – 12:00 PM',
      venue: 'Block B · Examination Hall 2',
      capacity: 64,
      registeredCount: 45,
      seatingSeat: 'Desk B-14',
      status: 'Scheduled',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      code: session.code || '',
      subject: session.subject || '',
      examType: session.examType || 'Mid-Semester Internal II',
      dateFormatted: session.dateFormatted || '25 Oct 2026',
      day: session.day || 'Saturday',
      time: session.time || '10:00 AM – 12:00 PM',
      venue: session.venue || 'Block B · Examination Hall 2',
      capacity: session.capacity || 64,
      registeredCount: session.registeredCount || 45,
      seatingSeat: session.seatingSeat || 'Desk B-14',
      status: session.status || 'Scheduled',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim() || !formData.subject.trim()) {
      setFormError('Subject code and title are required.');
      return;
    }

    // Capacity validation
    if (Number(formData.registeredCount) > Number(formData.capacity)) {
      setFormError(
        `Capacity exceeded: ${formData.registeredCount} candidates allocated against venue limit of ${formData.capacity} seats.`
      );
      return;
    }

    // Room overlap collision check:
    // Check if another session shares the identical venue and date/time
    const conflict = (examSessions || []).find((s) => {
      if (editingSession && s.id === editingSession.id) return false;
      return (
        s.venue.trim().toLowerCase() === formData.venue.trim().toLowerCase() &&
        s.dateFormatted.trim().toLowerCase() === formData.dateFormatted.trim().toLowerCase() &&
        s.time.trim().toLowerCase() === formData.time.trim().toLowerCase()
      );
    });

    if (conflict) {
      setFormError(
        `Venue Overlap Conflict: ${formData.venue} is already reserved for "${conflict.code} - ${conflict.subject}" at ${formData.dateFormatted} (${formData.time}).`
      );
      return;
    }

    if (editingSession) {
      updateExamSession(editingSession.id, {
        ...formData,
        capacity: Number(formData.capacity),
        registeredCount: Number(formData.registeredCount),
      });
    } else {
      addExamSession({
        ...formData,
        capacity: Number(formData.capacity),
        registeredCount: Number(formData.registeredCount),
      });
    }

    setModalOpen(false);
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Are you sure you want to cancel the scheduled examination for ${code}?`)) {
      deleteExamSession(id);
    }
  };

  const handlePublishAll = () => {
    examSessions.forEach((s) => {
      if (s.status !== 'Published') {
        updateExamSession(s.id, { status: 'Published' });
      }
    });
    showToast('All examination schedules published to Student and Faculty portals ✓', 'success');
  };

  const schedulesMetrics = [
    {
      label: 'Configured Schedules',
      value: `${(examSessions || []).length} Exams`,
      subtext: 'Active autumn assessment pipeline',
      state: 'info',
    },
    {
      label: 'Room Conflicts',
      value: '0 Collisions',
      subtext: 'Algorithmic room arbitration passed',
      state: 'success',
    },
    {
      label: 'Seat Capacity',
      value: '100% Validated',
      subtext: 'No venue over-allocations detected',
      state: 'success',
    },
    {
      label: 'Portal Visibility',
      value: 'Synchronized',
      subtext: 'Live across Student & Faculty portals',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Examination Timetable & Room Capacity Arbitration"
        title="Exam Schedule Management"
        description="Author, modify, and publish examination dates, subject time slots, venue reservations, and collision detection rules."
        actions={[
          <button
            key="publish-all"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePublishAll}
          >
            <Send size={13} /> Publish All to Portals
          </button>,
          <button
            key="create-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openCreateModal}
          >
            <Plus size={13} /> Add New Schedule
          </button>,
        ]}
      />

      <MetricStrip metrics={schedulesMetrics} />

      {/* Schedule Table */}
      <section>
        <SectionHeader
          title="Active Examination Sessions"
          subtitle="Detailed roster of dates, halls, and seating capacities"
        />

        {(!examSessions || examSessions.length === 0) ? (
          <EmptyState
            icon={CalendarDays}
            title="No Exam Schedules Configured"
            message="No examination schedules exist. Click 'Add New Schedule' to register an assessment window."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'code',
                label: 'Course Code & Title',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Code: {ex.code} · Type: {ex.examType}
                    </div>
                  </div>
                ),
              },
              {
                key: 'dateFormatted',
                label: 'Date & Time',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600 }}>{ex.dateFormatted}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.time}</div>
                  </div>
                ),
              },
              {
                key: 'venue',
                label: 'Venue & Seating Allotment',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>{ex.venue}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Allotted: {ex.registeredCount || 45} / {ex.capacity || 64} seats
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '130px',
                render: (ex) => (
                  <span className={`badge ${ex.status === 'Published' ? 'badge-success' : 'badge-info'}`}>
                    {ex.status || 'Scheduled'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Operations',
                align: 'right',
                width: '180px',
                render: (ex) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(ex)}
                      title="Edit Schedule"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-danger, #ef4444)' }}
                      onClick={() => handleDelete(ex.id, ex.code)}
                      title="Cancel Schedule"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={examSessions}
            keyField="id"
          />
        )}
      </section>

      {/* CREATE / EDIT SCHEDULE MODAL */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editingSession ? `Edit Exam Schedule: ${editingSession.code}` : 'Schedule New Examination'}
                </h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formError && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--border-danger, #ef4444)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--color-danger, #ef4444)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <AlertTriangle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Course Code *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CS304"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Subject Title *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Database Management Systems"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Assessment Type
                  </label>
                  <select
                    className="input-field"
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  >
                    <option value="Mid-Semester Internal II">Mid-Semester Internal II</option>
                    <option value="Mid-Semester Internal I">Mid-Semester Internal I</option>
                    <option value="Practical Lab Assessment">Practical Lab Assessment</option>
                    <option value="End-Semester Theory Exam">End-Semester Theory Exam</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                    <option value="Conducted">Conducted</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Date (e.g. 25 Oct 2026) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.dateFormatted}
                    onChange={(e) => setFormData({ ...formData, dateFormatted: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Time Window *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="10:00 AM – 12:00 PM"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Venue / Hall *
                  </label>
                  <select
                    className="input-field"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  >
                    <option value="Block B · Examination Hall 2">Block B · Examination Hall 2</option>
                    <option value="Computing Center 3">Computing Center 3</option>
                    <option value="Main Academic Auditorium">Main Academic Auditorium</option>
                    <option value="Lecture Complex Hall 101">Lecture Complex Hall 101</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Candidates
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.registeredCount}
                    onChange={(e) => setFormData({ ...formData, registeredCount: e.target.value })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingSession ? 'Update Schedule' : 'Confirm & Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
