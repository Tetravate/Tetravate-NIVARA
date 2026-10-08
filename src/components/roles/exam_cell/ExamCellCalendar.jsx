import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Printer,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function ExamCellCalendar() {
  const { examSessions, showToast } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [seatingModal, setSeatingModal] = useState(null);

  const filteredSessions = useMemo(() => {
    return (examSessions || []).filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.venue?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSem =
        selectedSem === 'all' ||
        (s.semester ? String(s.semester) === selectedSem : true);

      const matchType =
        selectedType === 'all' ||
        s.examType?.toLowerCase().includes(selectedType.toLowerCase());

      const matchStatus =
        selectedStatus === 'all' ||
        (s.status || 'Scheduled').toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchSem && matchType && matchStatus;
    });
  }, [examSessions, searchQuery, selectedSem, selectedType, selectedStatus]);

  const calendarMetrics = [
    {
      label: 'Total Sessions',
      value: `${(examSessions || []).length} Exams`,
      subtext: 'Institution-wide scheduled papers',
      state: 'info',
    },
    {
      label: 'Filtered Results',
      value: `${filteredSessions.length} Matching`,
      subtext: 'Matching active calendar filters',
      state: 'neutral',
    },
    {
      label: 'Venues Allocated',
      value: '3 Halls Active',
      subtext: 'Block B, CC3, Auditorium',
      state: 'success',
    },
    {
      label: 'Session Window',
      value: '18 Oct – 28 Oct',
      subtext: 'Autumn Mid-Term 2026',
      state: 'neutral',
    },
  ];

  const handleExportCSV = () => {
    if (filteredSessions.length === 0) {
      showToast('No exam sessions matching current filters to export.', 'warning');
      return;
    }
    const headers = ['Code', 'Subject', 'Type', 'Date', 'Time', 'Venue', 'Status'];
    const rows = filteredSessions.map((s) => [
      s.code,
      `"${s.subject}"`,
      `"${s.examType}"`,
      s.dateFormatted,
      `"${s.time}"`,
      `"${s.venue}"`,
      s.status || 'Scheduled',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nivara_exam_calendar_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Examination calendar exported as CSV ✓', 'success');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Institution-Wide Examination Calendar · Autumn 2026"
        title="Institutional Examination Timetable"
        description="Comprehensive date sheet, hall seating configurations, and invigilation slots across all engineering disciplines."
        actions={[
          <button
            key="export"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
          >
            <Download size={13} /> Export Calendar CSV
          </button>,
          <button
            key="print"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Dispatched consolidated exam calendar to institutional print queue', 'info')}
          >
            <Printer size={13} /> Print Schedule Roster
          </button>,
        ]}
      />

      <MetricStrip metrics={calendarMetrics} />

      {/* Filter and Search Bar */}
      <section style={{
        padding: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by subject code, title, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.25rem', height: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="input-field"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              style={{ height: '36px', minWidth: '130px' }}
            >
              <option value="all">All Semesters</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>

            <select
              className="input-field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ height: '36px', minWidth: '160px' }}
            >
              <option value="all">All Exam Types</option>
              <option value="Mid-Semester">Mid-Semester</option>
              <option value="Practical">Practical Lab</option>
              <option value="End-Semester">End-Semester Final</option>
            </select>

            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ height: '36px', minWidth: '140px' }}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="conducted">Conducted</option>
              <option value="completed">Completed</option>
            </select>

            {(searchQuery || selectedSem !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSem('all');
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Calendar Data Table */}
      <section>
        <SectionHeader
          title="Consolidated Timetable Registry"
          subtitle={`Displaying ${filteredSessions.length} session entries`}
        />

        {filteredSessions.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No Matching Examination Sessions"
            message="No examinations match your current filter parameters. Try resetting your query."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'dateFormatted',
                label: 'Examination Date & Day',
                width: '180px',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.dateFormatted}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.day || 'Scheduled'}</div>
                  </div>
                ),
              },
              {
                key: 'subject',
                label: 'Course & Subject Title',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Code: {ex.code} · Program: {ex.program || 'B.Tech AI & Data Science'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'time',
                label: 'Session Window',
                width: '180px',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={12} color="var(--text-muted)" /> {ex.time}
                    </div>
                    <span className="badge badge-neutral" style={{ marginTop: '0.2rem', fontSize: '0.7rem' }}>
                      {ex.examType}
                    </span>
                  </div>
                ),
              },
              {
                key: 'venue',
                label: 'Venue & Capacity',
                render: (ex) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>{ex.venue}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Capacity: {ex.capacity || 64} seats · Allotted: {ex.registeredCount || 42}
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '120px',
                render: (ex) => {
                  const st = ex.status || 'Scheduled';
                  const badgeClass =
                    st === 'Completed' || st === 'Conducted'
                      ? 'badge-success'
                      : st === 'Scheduled'
                      ? 'badge-info'
                      : 'badge-warning';
                  return <span className={`badge ${badgeClass}`}>{st}</span>;
                },
              },
              {
                key: 'actions',
                label: 'Seating Allotment',
                align: 'right',
                width: '160px',
                render: (ex) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSeatingModal(ex)}
                  >
                    <ShieldCheck size={13} /> Seating Roster
                  </button>
                ),
              },
            ]}
            data={filteredSessions}
            keyField="id"
          />
        )}
      </section>

      {/* SEATING ROSTER MODAL */}
      {seatingModal && (
        <div className="modal-backdrop" onClick={() => setSeatingModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Seating Roster: {seatingModal.code}
                </h3>
              </div>
              <button type="button" onClick={() => setSeatingModal(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                Venue: <strong>{seatingModal.venue}</strong> · Scheduled: {seatingModal.dateFormatted} ({seatingModal.time})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS001 - Aarav Sharma</span>
                  <strong>Desk B-11</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS003 - Arun Kumar</span>
                  <strong>Desk B-12</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-surface)', borderRadius: '3px' }}>
                  <span>22AIDS014 - Kavin Venkatesh</span>
                  <strong>Desk B-13</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-hover)', borderRadius: '3px', border: '1px solid var(--brand-primary)' }}>
                  <span>22AIDS042 - Aadhi Narayanan</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{seatingModal.seatingSeat || 'Desk B-14'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Seating roster print file for ${seatingModal.code} generated ✓`, 'success');
                    setSeatingModal(null);
                  }}
                >
                  <Download size={13} /> Download Print Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
