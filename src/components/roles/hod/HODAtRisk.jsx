import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Send,
  UserCheck,
  BookOpen,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODAtRisk() {
  const {
    students,
    facultyMembers,
    showToast,
  } = useNivara();

  const [filterCriteria, setFilterCriteria] = useState('ALL'); // 'ALL' | 'attendance' | 'backlogs' | 'cia'
  const [searchQuery, setSearchQuery] = useState('');
  const [counselingModal, setCounselingModal] = useState(null);
  const [counselingNotes, setCounselingNotes] = useState('');
  const [assignedMentor, setAssignedMentor] = useState(() => (facultyMembers && facultyMembers[0]?.name) || '');

  // Scoped strictly to Department of AI & Data Science
  const deptStudents = useMemo(() => {
    return (students || []).filter((s) => s.deptCode === 'AIDS' || s.department?.includes('AI & Data Science'));
  }, [students]);

  // Deterministic rule-based student evaluation
  const evaluatedAtRiskStudents = useMemo(() => {
    return deptStudents
      .map((st) => {
        const triggers = [];

        // 1. Attendance Rule: < 75%
        if ((st.attendancePct || 0) < 75) {
          triggers.push({
            type: 'attendance',
            severity: 'urgent',
            label: `Attendance Deficit: ${st.attendancePct}%`,
            detail: `Shortfall of ${Math.max(1, Math.ceil(75 - st.attendancePct))}% below autonomous examination condonation ceiling.`,
          });
        }

        // 2. Backlogs Rule
        if ((st.backlogs || 0) > 0) {
          triggers.push({
            type: 'backlogs',
            severity: 'urgent',
            label: `Active Course Backlogs: ${st.backlogs}`,
            detail: 'Remedial examination registration and faculty mentoring required.',
          });
        }

        // 3. Continuous Internal Assessment benchmark
        if (st.ciaScore !== undefined && st.ciaScore < 15) {
          triggers.push({
            type: 'cia',
            severity: 'urgent',
            label: `Continuous Assessment: ${st.ciaScore} / 25`,
            detail: 'Below minimum departmental internal benchmark (15/25).',
          });
        }

        return {
          ...st,
          triggers,
          isAtRisk: triggers.length > 0,
        };
      })
      .filter((st) => st.isAtRisk);
  }, [deptStudents]);

  const filteredStudents = useMemo(() => {
    return evaluatedAtRiskStudents.filter((st) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        st.name.toLowerCase().includes(q) ||
        (st.id || '').toLowerCase().includes(q) ||
        (st.rollNo || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterCriteria === 'attendance') return st.triggers.some((t) => t.type === 'attendance');
      if (filterCriteria === 'backlogs') return st.triggers.some((t) => t.type === 'backlogs');
      if (filterCriteria === 'cia') return st.triggers.some((t) => t.type === 'cia');
      return true;
    });
  }, [evaluatedAtRiskStudents, searchQuery, filterCriteria]);

  const totalAtRisk = evaluatedAtRiskStudents.length;
  const attendanceDefaulters = evaluatedAtRiskStudents.filter((s) => s.triggers.some((t) => t.type === 'attendance')).length;
  const backlogStudents = evaluatedAtRiskStudents.filter((s) => s.triggers.some((t) => t.type === 'backlogs')).length;

  const metrics = [
    {
      label: 'Flagged Students',
      value: `${totalAtRisk} Under Surveillance`,
      subtext: 'Rule-based evaluation criteria',
      state: totalAtRisk > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Attendance Cutoff Breaches',
      value: `${attendanceDefaulters} Students`,
      subtext: 'Below 75% examination cutoff',
      state: attendanceDefaulters > 0 ? 'urgent' : 'neutral',
    },
    {
      label: 'Active Course Arrears',
      value: `${backlogStudents} Students`,
      subtext: 'Remedial coaching assigned',
      state: backlogStudents > 0 ? 'warning' : 'success',
    },
    {
      label: 'Counseling Interventions',
      value: 'Action Mandatory',
      subtext: 'Dean of Academics compliance',
      state: 'info',
    },
  ];

  const handleConfirmCounseling = (e) => {
    e.preventDefault();
    if (!counselingModal) return;

    showToast(
      `Counseling notice issued for ${counselingModal.name} · Assigned Mentor: ${assignedMentor} ✓`,
      'success'
    );
    setCounselingModal(null);
    setCounselingNotes('');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Academic Safeguarding & Intervention Radar"
        title="At-Risk Students Radar"
        description="Deterministic tracking of attendance condonation shortfalls, course arrears, and continuous assessment deficits to mandate targeted faculty mentoring."
      />

      <MetricStrip metrics={metrics} />

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('ALL')}
          >
            All Flagged ({totalAtRisk})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'attendance' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('attendance')}
          >
            Attendance &lt; 75% ({attendanceDefaulters})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'backlogs' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('backlogs')}
          >
            Course Backlogs ({backlogStudents})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'cia' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('cia')}
          >
            CIA Below Threshold
          </button>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem 0.4rem 2rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Flagged Students List with Trigger Breakdown */}
      <div>
        <SectionHeader
          title="Students Flagged for Departmental Intervention"
          subtitle="Specific rule violations identified from attendance registers and continuous evaluation"
        />

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No students match the criteria"
            description="Zero students in this filter threshold require counseling or intervention."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.65rem' }}>
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={16} color="var(--state-urgent)" />
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {st.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {st.rollNo || st.id}
                    </span>
                    <span className="badge badge-neutral">{st.section || 'AIDS-A'} (Sem 5)</span>
                    <span className="badge badge-urgent">Attendance: {st.attendancePct}%</span>
                    {st.backlogs > 0 && <span className="badge badge-warning">{st.backlogs} Backlog(s)</span>}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setCounselingModal(st)}
                  >
                    Initiate Counseling Directive
                  </button>
                </div>

                {/* Specific Risk Triggers Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                  {st.triggers.map((trig, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.75rem 0.95rem',
                        borderRadius: 'var(--radius-xs)',
                        background: trig.severity === 'urgent' ? 'var(--state-urgent-bg)' : 'var(--state-warning-bg)',
                        border: '1px solid',
                        borderColor: trig.severity === 'urgent' ? 'var(--state-urgent-border)' : 'var(--state-warning-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                        <AlertTriangle
                          size={13}
                          color={trig.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)'}
                        />
                        <strong
                          style={{
                            fontSize: '0.8125rem',
                            color: trig.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)',
                          }}
                        >
                          {trig.label}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                        {trig.detail}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advisor & Remedial Plan */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.65rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    Assigned Academic Advisor: <strong>{st.advisor || 'Not Assigned'}</strong> · CGPA: <strong>{st.cgpa}</strong>
                  </div>
                  <div>
                    Action Protocol: Issue formal parent notification & mandate 4 hours weekly remedial problem-solving clinic.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COUNSELING MODAL */}
      {counselingModal && (
        <div className="modal-backdrop" onClick={() => setCounselingModal(null)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={16} color="var(--state-urgent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Issue Official Academic Intervention Directive
                </h3>
              </div>
              <button type="button" onClick={() => setCounselingModal(null)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleConfirmCounseling} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
                <div>Student: <strong>{counselingModal.name}</strong> ({counselingModal.id})</div>
                <div>Attendance: <strong style={{ color: 'var(--state-urgent)' }}>{counselingModal.attendancePct}%</strong> (Below 75% Mandatory Cutoff)</div>
                <div>Current CGPA: <strong>{counselingModal.cgpa}</strong> · Backlogs: <strong>{counselingModal.backlogs || 0}</strong></div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Assigned Faculty Mentor
                </label>
                <select
                  value={assignedMentor}
                  onChange={(e) => setAssignedMentor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                >
                  {(facultyMembers || []).map((f) => (
                    <option key={f.id || f.name} value={f.name}>
                      {f.name} ({f.designation || f.role || 'Faculty'})
                    </option>
                  ))}
                  {(!facultyMembers || facultyMembers.length === 0) && (
                    <option value="">No faculty mentors available</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Intervention Directives & Remedial Schedule
                </label>
                <textarea
                  rows="3"
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  placeholder="e.g. Schedule bi-weekly mentor review, compulsory lab benchmark submissions, and parent advisory communication."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCounselingModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Sign & Issue Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
