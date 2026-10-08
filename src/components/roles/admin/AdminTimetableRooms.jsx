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
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, SectionHeader, EmptyState, DataTable } from '../../workspace';

export default function AdminTimetableRooms() {
  const { roomConflicts, resolveConflict, departments, showToast } = useNivara();

  const [resolveModal, setResolveModal] = useState(null);
  const [reallocationRoom, setReallocationRoom] = useState('Seminar Hall 2');

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

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Campus Infrastructure & Operations Directorate"
        title="Timetable & Room Collision Arbitration"
        description="Automated classroom double-booking detection, laboratory slot scheduling, and master venue reallocation controls."
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

      {/* 3. Master Room Inventory Table */}
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

      {/* 4. Resolve Conflict Modal */}
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
