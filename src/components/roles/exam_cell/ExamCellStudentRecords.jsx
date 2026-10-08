import React, { useState, useMemo } from 'react';
import {
  User,
  Search,
  ShieldCheck,
  Printer,
  Download,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

export default function ExamCellStudentRecords() {
  const {
    students,
    revaluationRequests,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSem, setSelectedSem] = useState('all');
  const [selectedEligibility, setSelectedEligibility] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const studentRecords = useMemo(() => {
    return (students || []).map((s) => {
      // Check attendance eligibility (institutional 75% threshold)
      const att = s.attendancePct || s.attendance || 0;
      const isEligible = att >= 75;

      // Match revaluations
      const revals = (revaluationRequests || []).filter(
        (r) => r.studentId === s.id || r.rollNo === s.rollNo || r.rollNo === s.id
      );

      return {
        ...s,
        attendanceRate: att,
        isEligible,
        revaluations: revals,
        hallTicketIssued: isEligible,
        assignedSeat: s.seatingSeat || 'Unassigned',
      };
    });
  }, [students, revaluationRequests]);

  const filteredStudents = useMemo(() => {
    return studentRecords.filter((s) => {
      const matchSearch =
        !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = selectedDept === 'all' || s.department === selectedDept || s.dept === selectedDept;
      const matchSem = selectedSem === 'all' || String(s.semester || 5) === selectedSem;
      const matchElig =
        selectedEligibility === 'all' ||
        (selectedEligibility === 'eligible' && s.isEligible) ||
        (selectedEligibility === 'shortage' && !s.isEligible);

      return matchSearch && matchDept && matchSem && matchElig;
    });
  }, [studentRecords, searchQuery, selectedDept, selectedEligibility]);

  const totalCount = studentRecords.length;
  const eligibleCount = studentRecords.filter((s) => s.isEligible).length;
  const shortageCount = totalCount - eligibleCount;

  const recordsMetrics = [
    {
      label: 'Exam Candidates',
      value: `${totalCount} Registered`,
      subtext: 'B.Tech Autumn 2026 Cohort',
      state: 'info',
    },
    {
      label: 'Hall Ticket Eligible',
      value: `${eligibleCount} Cleared`,
      subtext: 'Attendance >= 75% institutional cutoff',
      state: 'success',
    },
    {
      label: 'Attendance Shortage',
      value: `${shortageCount} Flagged`,
      subtext: shortageCount === 0 ? 'Zero candidates disqualified' : 'Requires academic condonation',
      state: shortageCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Active Petitions',
      value: `${(revaluationRequests || []).length} Revaluations`,
      subtext: 'Mapped to student exam records',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Examination Registry & Candidate Eligibility Ledger"
        title="Student Examination Records"
        description="Inspect student examination dossiers, verify hall ticket attendance thresholds, examine assigned examination desks, and trace revaluation histories."
        actions={[
          <button
            key="export"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Dispatched student eligibility list to institutional printer', 'info')}
          >
            <Printer size={13} /> Print Eligibility Ledger
          </button>,
        ]}
      />

      <MetricStrip metrics={recordsMetrics} />

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
            placeholder="Search by student roll no, ID, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', height: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ height: '36px', minWidth: '150px' }}
          >
            <option value="all">All Departments</option>
            <option value="AI & Data Science">AI & Data Science</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
          </select>

          <select
            className="input-field"
            value={selectedEligibility}
            onChange={(e) => setSelectedEligibility(e.target.value)}
            style={{ height: '36px', minWidth: '150px' }}
          >
            <option value="all">All Eligibility</option>
            <option value="eligible">Eligible (&gt;= 75%)</option>
            <option value="shortage">Shortage (&lt; 75%)</option>
          </select>
        </div>
      </section>

      {/* Student Records Table */}
      <section>
        <SectionHeader
          title="Candidate Examination Ledger"
          subtitle={`Displaying ${filteredStudents.length} candidate dossiers`}
        />

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={User}
            title="No Candidate Records Found"
            message="No students match the chosen search criteria."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'rollNo',
                label: 'Candidate & Roll No',
                render: (s) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Roll: {s.rollNo || s.id} · ID: {s.id}
                    </div>
                  </div>
                ),
              },
              {
                key: 'department',
                label: 'Department & Semester',
                render: (s) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{s.department || 'Artificial Intelligence & Data Science'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Semester {s.semester || 5} · Batch 2024-2028
                    </div>
                  </div>
                ),
              },
              {
                key: 'isEligible',
                label: 'Hall Ticket Eligibility',
                width: '180px',
                render: (s) => (
                  <span className={`badge ${s.isEligible ? 'badge-success' : 'badge-danger'}`}>
                    {s.isEligible ? 'Eligible (>75% Att.)' : 'Shortage (<75%)'}
                  </span>
                ),
              },
              {
                key: 'assignedSeat',
                label: 'Assigned Seating Desk',
                render: (s) => (
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {s.assignedSeat}
                  </span>
                ),
              },
              {
                key: 'cgpa',
                label: 'Cumulative CGPA',
                align: 'right',
                render: (s) => (
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {s.cgpa || 8.72} / 10.0
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Dossier',
                align: 'right',
                width: '140px',
                render: (s) => (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedStudent(s)}
                  >
                    Inspect Dossier
                  </button>
                ),
              },
            ]}
            data={filteredStudents}
            keyField="id"
          />
        )}
      </section>

      {/* STUDENT DOSSIER MODAL */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Examination Dossier: {selectedStudent.name}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedStudent(null)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Roll No: <strong>{selectedStudent.rollNo || selectedStudent.id}</strong></span>
                  <span>Semester: <strong>{selectedStudent.semester || 5}</strong></span>
                </div>
                <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                  Department: {selectedStudent.department || 'Artificial Intelligence & Data Science'}
                </div>
              </div>

              {/* Hall Ticket Clearance */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Hall Ticket Allotment & Clearance
                </div>
                <div style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div>Venue: <strong>Block B · Examination Hall 2</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Designated Desk: <strong>{selectedStudent.assignedSeat}</strong>
                    </div>
                  </div>
                  <span className={`badge ${selectedStudent.isEligible ? 'badge-success' : 'badge-danger'}`}>
                    {selectedStudent.isEligible ? 'Hall Ticket Active' : 'Condonation Hold'}
                  </span>
                </div>
              </div>

              {/* Academic CGPA Progression */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Academic Performance Profile
                </div>
                <div style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cumulative CGPA</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {selectedStudent.cgpa || 8.72} / 10.0
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Standing</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-success, #10b981)' }}>
                      {selectedStudent.standing || 'Good Standing'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance Record</div>
                    <div style={{ fontWeight: 700 }}>
                      {selectedStudent.attendanceRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Revaluation Appeals History */}
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Revaluation Grievance History
                </div>
                {selectedStudent.revaluations.length === 0 ? (
                  <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Zero revaluation appeals filed by this candidate.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {selectedStudent.revaluations.map((r) => (
                      <div key={r.id} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{r.courseCode} - {r.subjectName}</strong>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Original: {r.originalMarks} ({r.originalGrade})
                          </div>
                        </div>
                        <span className="badge badge-info">{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast(`Hall ticket transcript downloaded for ${selectedStudent.name} ✓`, 'success');
                    setSelectedStudent(null);
                  }}
                >
                  <Download size={13} /> Download Hall Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
