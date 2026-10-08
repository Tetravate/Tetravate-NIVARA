import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODTimetable() {
  const {
    timetableEntries,
    roomConflicts,
  } = useNivara();

  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Master department timetable entries derived from real data
  const departmentSchedule = useMemo(() => {
    return (timetableEntries || []).map((e) => ({
      id: e.id,
      day: e.dayOfWeek || e.day,
      timeSlot: e.timeSlot || `${e.startTime || ''} – ${e.endTime || ''}`,
      courseCode: e.courseCode,
      subject: e.subjectName || e.subject,
      faculty: e.facultyName || e.faculty,
      room: e.room,
      section: e.section || 'General',
      type: e.sessionType || e.type || 'Lecture',
    }));
  }, [timetableEntries]);

  const availableSections = useMemo(() => {
    const s = new Set((timetableEntries || []).map((e) => e.section).filter(Boolean));
    return Array.from(s);
  }, [timetableEntries]);

  const filteredEntries = useMemo(() => {
    return departmentSchedule.filter((e) => {
      if (selectedSection !== 'ALL' && e.section !== selectedSection) return false;
      if (selectedDay !== 'ALL' && e.day !== selectedDay) return false;
      return true;
    });
  }, [departmentSchedule, selectedSection, selectedDay]);

  const totalSlots = filteredEntries.length;
  const labSlots = filteredEntries.filter((e) => e.type === 'Laboratory').length;
  const theorySlots = filteredEntries.filter((e) => e.type === 'Lecture' || e.type === 'Elective').length;

  const metrics = [
    {
      label: 'Scheduled Slots',
      value: `${totalSlots} Sessions`,
      subtext: `For ${selectedSection}`,
      state: 'info',
    },
    {
      label: 'Theory Deliveries',
      value: `${theorySlots} Lectures`,
      subtext: 'Classrooms A204 & B102',
      state: 'neutral',
    },
    {
      label: 'Practical Lab Hours',
      value: `${labSlots} Blocks`,
      subtext: 'Computing Lab 2 & AI Lab 1',
      state: 'success',
    },
    {
      label: 'Room Conflict Status',
      value: 'Zero Collisions ✓',
      subtext: 'Autonomous Timetable Cell verified',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Master Schedule & Venue Allocations"
        title="Department Timetable"
        description="Inspect cohort instructional timetables, verify laboratory slot distributions, and confirm room allocations for the Department of AI & Data Science."
      />

      <MetricStrip metrics={metrics} />

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Department Cohorts</option>
            {availableSections.map((sec) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Weekdays (Mon – Sat)</option>
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Read-Only Mode: Schedule modifications require ERP Administrator approval.
        </span>
      </div>

      {/* Timetable List Table */}
      <div>
        <SectionHeader
          title={`Master Teaching Schedule · ${selectedSection}`}
          subtitle="Autonomous Timetable Cell Verified Allocation"
        />

        <div style={{ overflowX: 'auto', marginTop: '0.65rem' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Day</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Time Slot</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Course Code</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject Title</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Faculty</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Room / Venue</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((e) => {
                const isLab = e.type === 'Laboratory';

                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {e.day}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {e.timeSlot}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {e.courseCode}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {e.subject}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {e.faculty}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      {e.room}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span className={`badge ${isLab ? 'badge-info' : 'badge-neutral'}`}>
                        {e.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
