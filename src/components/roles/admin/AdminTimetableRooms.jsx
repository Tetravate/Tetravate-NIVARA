import React, { useState } from 'react';
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  Building,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState, DataTable } from '../../workspace';

export default function AdminTimetableRooms() {
  const {
    roomConflicts,
    resolveConflict,
    departments,
    timetableEntries,
    createTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    facultyMembers,
    showToast,
  } = useNivara();

  const [resolveModal, setResolveModal] = useState(null);
  const [reallocationRoom, setReallocationRoom] = useState('Seminar Hall 2');

  const [addSlotModal, setAddSlotModal] = useState(false);
  const [editSlotModal, setEditSlotModal] = useState(false);

  const [slotForm, setSlotForm] = useState({
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: 'Data Structures & Algorithms',
    courseId: 'CS301',
    sectionId: 'AIDS-A',
    facultyName: 'Dr. S. K. Raman',
    room: 'Room 401',
  });

  const [editSlotForm, setEditSlotForm] = useState({
    id: '',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subject: '',
    courseId: '',
    sectionId: '',
    facultyName: '',
    room: '',
  });

  const availableRooms = [
    { code: 'Room 401', building: 'Tech Block A', capacity: 70, type: 'Lecture Hall', status: 'Available' },
    { code: 'Room 402', building: 'Tech Block A', capacity: 70, type: 'Lecture Hall', status: 'Occupied' },
    { code: 'Room 403', building: 'Tech Block A', capacity: 70, type: 'Lecture Hall', status: 'Occupied' },
    { code: 'Seminar Hall 1', building: 'Administrative Complex', capacity: 150, type: 'Auditorium', status: 'Reserved' },
    { code: 'Seminar Hall 2', building: 'Administrative Complex', capacity: 120, type: 'Auditorium', status: 'Available' },
    { code: 'AI Computing Lab 1', building: 'Center for Computing', capacity: 60, type: 'Computer Lab', status: 'Occupied' },
    { code: 'Computing Lab 2', building: 'Center for Computing', capacity: 60, type: 'Computer Lab', status: 'Occupied' },
  ];

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolveModal) return;

    resolveConflict(
      resolveModal.id,
      `Reallocated from ${resolveModal.venue} to ${reallocationRoom} and dispatched timetable collision notice to faculty and students.`
    );
    showToast(`Conflict resolved: reallocated to ${reallocationRoom} ✓`, 'success');
    setResolveModal(null);
  };

  const handleAddSlotSubmit = async (e) => {
    e.preventDefault();

    // Conflict check
    const hasConflict = (timetableEntries || []).some(
      (t) =>
        (t.day_of_week === slotForm.day || t.day === slotForm.day) &&
        t.room === slotForm.room &&
        (t.start_time === slotForm.startTime || t.startTime === slotForm.startTime)
    );

    if (hasConflict) {
      showToast(`Schedule Conflict: ${slotForm.room} is already booked on ${slotForm.day} at ${slotForm.startTime}!`, 'error');
      return;
    }

    const payload = {
      day_of_week: slotForm.day,
      start_time: slotForm.startTime,
      end_time: slotForm.endTime,
      subject: slotForm.subject,
      course_id: slotForm.courseId,
      section_id: slotForm.sectionId,
      faculty_name: slotForm.facultyName,
      room: slotForm.room,
    };

    await createTimetableEntry(payload);
    setAddSlotModal(false);
  };

  const handleOpenEditSlot = (slot) => {
    setEditSlotForm({
      id: slot.id,
      day: slot.day_of_week || slot.day || 'Monday',
      startTime: slot.start_time || slot.startTime || '09:00 AM',
      endTime: slot.end_time || slot.endTime || '10:00 AM',
      subject: slot.subject || '',
      courseId: slot.course_id || slot.courseId || '',
      sectionId: slot.section_id || slot.sectionId || '',
      facultyName: slot.faculty_name || slot.facultyName || '',
      room: slot.room || 'Room 401',
    });
    setEditSlotModal(true);
  };

  const handleEditSlotSubmit = async (e) => {
    e.preventDefault();
    await updateTimetableEntry(editSlotForm.id, {
      day_of_week: editSlotForm.day,
      start_time: editSlotForm.startTime,
      end_time: editSlotForm.endTime,
      subject: editSlotForm.subject,
      course_id: editSlotForm.courseId,
      section_id: editSlotForm.sectionId,
      faculty_name: editSlotForm.facultyName,
      room: editSlotForm.room,
    });
    setEditSlotModal(false);
  };

  const handleDeleteSlot = async (slot) => {
    if (window.confirm(`Are you sure you want to remove the timetable schedule slot for ${slot.subject || slot.course_id} on ${slot.day_of_week || slot.day}?`)) {
      await deleteTimetableEntry(slot.id);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Campus Infrastructure & Operations Directorate"
        title="Timetable & Room Allocation Master"
        description="Schedule curricular periods, prevent classroom double-booking, and arbitrate physical venue reallocations."
        actions={[
          <button
            key="add-slot"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setAddSlotModal(true)}
          >
            <Plus size={13} /> Add Timetable Schedule Slot
          </button>,
        ]}
      />

      {/* 2. Room Conflicts Queue */}
      <section>
        <SectionHeader
          title="Active Venue Collisions & Double-Bookings"
          subtitle="Automated space collision detection across lecture halls and laboratories"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
          {roomConflicts.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Zero Schedule Collisions"
              description="All classroom bookings, lab slots, and guest lectures are collision-free."
            />
          ) : (
            roomConflicts.map((conf) => (
              <div
                key={conf.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: conf.severity === 'urgent' ? 'var(--state-urgent-bg)' : 'var(--state-warning-bg)',
                  border: `1px solid ${conf.severity === 'urgent' ? 'var(--state-urgent-border)' : 'var(--state-warning-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <AlertTriangle size={15} color={conf.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)'} />
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {conf.title}
                    </strong>
                    <span className={`badge ${conf.severity === 'urgent' ? 'badge-urgent' : 'badge-warning'}`}>
                      {conf.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {conf.detail}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setResolveModal(conf)}
                >
                  Resolve & Reallocate
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. Operational Timetable Schedules */}
      <section>
        <SectionHeader
          title="University Timetable Schedule Matrix"
          subtitle="Live slots synchronized to faculty rosters, student schedules, and HOD departments"
        />

        <DataTable
          columns={[
            {
              key: 'day',
              label: 'Day of Week',
              width: '110px',
              render: (t) => <span className="badge badge-info">{t.day_of_week || t.day || 'Monday'}</span>,
            },
            {
              key: 'time',
              label: 'Period Time',
              width: '160px',
              render: (t) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                  <Clock size={12} color="var(--text-muted)" />
                  <span>{t.start_time || t.startTime} – {t.end_time || t.endTime}</span>
                </div>
              ),
            },
            {
              key: 'subject',
              label: 'Course & Subject',
              render: (t) => (
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{t.subject || t.course_id}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Section: <strong>{t.section_id || t.section || 'All'}</strong></div>
                </div>
              ),
            },
            {
              key: 'room',
              label: 'Classroom / Venue',
              width: '140px',
              render: (t) => <span className="badge badge-neutral">{t.room}</span>,
            },
            {
              key: 'faculty',
              label: 'Instructor',
              render: (t) => <span>{t.faculty_name || t.facultyName || 'Faculty'}</span>,
            },
            {
              key: 'actions',
              label: 'Actions',
              align: 'right',
              width: '130px',
              render: (t) => (
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => handleOpenEditSlot(t)}
                    title="Edit Slot"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-danger"
                    onClick={() => handleDeleteSlot(t)}
                    title="Remove Slot"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ),
            },
          ]}
          data={timetableEntries || []}
          keyField="id"
        />
      </section>

      {/* 4. Master Room Inventory Table */}
      <section>
        <SectionHeader
          title="Campus Lecture Halls & Laboratories Master Inventory"
          subtitle="Physical venue capacity, multimedia facilities, and reservation statuses"
        />

        <DataTable
          columns={[
            {
              key: 'code',
              label: 'Venue Identifier',
              render: (r) => <strong style={{ color: 'var(--text-primary)' }}>{r.code}</strong>,
            },
            {
              key: 'building',
              label: 'Campus Block',
              render: (r) => <span>{r.building}</span>,
            },
            {
              key: 'type',
              label: 'Venue Type',
              render: (r) => <span className="badge badge-neutral">{r.type}</span>,
            },
            {
              key: 'capacity',
              label: 'Seating Capacity',
              align: 'right',
              render: (r) => `${r.capacity} Seats`,
            },
            {
              key: 'status',
              label: 'Availability',
              render: (r) => (
                <span className={`badge ${r.status === 'Available' ? 'badge-success' : 'badge-neutral'}`}>
                  {r.status}
                </span>
              ),
            },
          ]}
          data={availableRooms}
          keyField="code"
        />
      </section>

      {/* 5. Add Timetable Slot Modal */}
      {addSlotModal && (
        <div className="modal-backdrop" onClick={() => setAddSlotModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarDays size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Add Timetable Schedule Slot
                </h3>
              </div>
              <button type="button" onClick={() => setAddSlotModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSlotSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Day of Week</label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Venue / Room</label>
                  <select
                    value={slotForm.room}
                    onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    {availableRooms.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Start Time</label>
                  <input
                    type="text"
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>End Time</label>
                  <input
                    type="text"
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    placeholder="10:00 AM"
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Course Code</label>
                  <input
                    type="text"
                    value={slotForm.courseId}
                    onChange={(e) => setSlotForm({ ...slotForm, courseId: e.target.value.toUpperCase() })}
                    placeholder="CS301"
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Cohort Section</label>
                  <input
                    type="text"
                    value={slotForm.sectionId}
                    onChange={(e) => setSlotForm({ ...slotForm, sectionId: e.target.value.toUpperCase() })}
                    placeholder="AIDS-A"
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Designated Faculty Instructor
                </label>
                <input
                  type="text"
                  value={slotForm.facultyName}
                  onChange={(e) => setSlotForm({ ...slotForm, facultyName: e.target.value })}
                  placeholder="e.g. Dr. S. K. Raman"
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddSlotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Timetable Slot Modal */}
      {editSlotModal && (
        <div className="modal-backdrop" onClick={() => setEditSlotModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Timetable Slot
                </h3>
              </div>
              <button type="button" onClick={() => setEditSlotModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditSlotSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Day of Week</label>
                  <select
                    value={editSlotForm.day}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, day: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Venue / Room</label>
                  <select
                    value={editSlotForm.room}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, room: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  >
                    {availableRooms.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Start Time</label>
                  <input
                    type="text"
                    value={editSlotForm.startTime}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, startTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>End Time</label>
                  <input
                    type="text"
                    value={editSlotForm.endTime}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, endTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={editSlotForm.subject}
                  onChange={(e) => setEditSlotForm({ ...editSlotForm, subject: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Course Code</label>
                  <input
                    type="text"
                    value={editSlotForm.courseId}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, courseId: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Cohort Section</label>
                  <input
                    type="text"
                    value={editSlotForm.sectionId}
                    onChange={(e) => setEditSlotForm({ ...editSlotForm, sectionId: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Designated Faculty Instructor
                </label>
                <input
                  type="text"
                  value={editSlotForm.facultyName}
                  onChange={(e) => setEditSlotForm({ ...editSlotForm, facultyName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditSlotModal(false)}>
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

      {/* 7. Resolve Conflict Modal */}
      {resolveModal && (
        <div className="modal-backdrop" onClick={() => setResolveModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Reallocate Schedule & Resolve
                </h3>
              </div>
              <button type="button" onClick={() => setResolveModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{resolveModal.title}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{resolveModal.detail}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Reallocate to Verified Vacant Room
                </label>
                <select
                  value={reallocationRoom}
                  onChange={(e) => setReallocationRoom(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: '0.8125rem' }}
                >
                  <option value="Seminar Hall 2">Seminar Hall 2 (Capacity: 120)</option>
                  <option value="Room 401">Room 401 (Capacity: 70)</option>
                  <option value="Computing Lab 3">Computing Lab 3 (Capacity: 60)</option>
                </select>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Resolving this collision immediately updates the active timetable on student and faculty dashboards and publishes an automated venue reallocation notice.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResolveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Apply Reallocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
