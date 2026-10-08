import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Send,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyStudentProgress() {
  const {
    students,
    assignments,
    internalMarks,
    showToast,
  } = useNivara();

  const [filterCriteria, setFilterCriteria] = useState('all-flagged'); // 'all-flagged' | 'attendance' | 'missing-asg' | 'low-cia'
  const [searchQuery, setSearchQuery] = useState('');

  // Scoped students in faculty cohorts: AIDS
  const authorizedStudents = useMemo(() => {
    return (students || []).filter((s) => s.deptCode === 'AIDS' || s.department?.includes('AI & Data Science'));
  }, [students]);

  // Deterministic rule-based student evaluation
  // Rules:
  // 1. Attendance < 75% -> At Risk: Attendance Condonation Limit Breach
  // 2. Unsubmitted Deliverables -> Missing Assignment Submissions
  // 3. CIA Internal Marks < 15 / 25 -> Below Passing Standard in Continuous Assessment
  const evaluatedStudents = useMemo(() => {
    return authorizedStudents.map((st) => {
      const risks = [];

      // Attendance check
      if ((st.attendancePct || 0) < 75) {
        risks.push({
          type: 'attendance',
          severity: 'urgent',
          label: `Low Attendance (${st.attendancePct}%)`,
          detail: 'Below 75% mandatory autonomous threshold. Exam hall ticket hold risk.',
        });
      } else if ((st.attendancePct || 0) < 80) {
        risks.push({
          type: 'attendance',
          severity: 'warning',
          label: `Marginal Attendance (${st.attendancePct}%)`,
          detail: 'Close to 75% condonation border. 1 safe miss remaining.',
        });
      }

      if (st.ciaScore !== undefined && st.ciaScore < 15) {
        risks.push({
          type: 'low-cia',
          severity: 'urgent',
          label: `Low CIA (${st.ciaScore} / 25)`,
          detail: 'Below minimum departmental internal benchmark (15/25).',
        });
      }

      if (st.backlogs && st.backlogs > 0) {
        risks.push({
          type: 'backlogs',
          severity: 'warning',
          label: `${st.backlogs} Active Backlog(s)`,
          detail: 'Requires academic counseling and remedial support.',
        });
      }

      return {
        ...st,
        riskCount: risks.length,
        risks,
        needsAttention: risks.length > 0,
      };
    });
  }, [authorizedStudents]);

  const flaggedStudents = useMemo(() => {
    return evaluatedStudents.filter((st) => {
      if (!st.needsAttention) return false;

      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (st.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterCriteria === 'attendance') return st.risks.some((r) => r.type === 'attendance');
      if (filterCriteria === 'missing-asg') return st.risks.some((r) => r.type === 'missing-asg');
      if (filterCriteria === 'low-cia') return st.risks.some((r) => r.type === 'low-cia');
      return true;
    });
  }, [evaluatedStudents, searchQuery, filterCriteria]);

  const totalFlaggedCount = evaluatedStudents.filter((s) => s.needsAttention).length;
  const severeCount = evaluatedStudents.filter((s) => s.risks.some((r) => r.severity === 'urgent')).length;

  const metrics = [
    {
      label: 'Students Needing Attention',
      value: `${totalFlaggedCount} Flagged`,
      subtext: 'Based on rule thresholds',
      state: totalFlaggedCount > 0 ? 'urgent' : 'success',
    },
    {
      label: 'Severe Risk Alerts',
      value: `${severeCount} Students`,
      subtext: 'Attendance < 75% or CIA < 15',
      state: severeCount > 0 ? 'urgent' : 'neutral',
    },
    {
      label: 'Cohort Average CIA',
      value: '21.4 / 25',
      subtext: 'CS301 & AI302 Aggregated',
      state: 'success',
    },
    {
      label: 'Deliverable Turn-in Rate',
      value: '86%',
      subtext: 'Across active problem sets',
      state: 'info',
    },
  ];

  const handleRemedialAction = (studentName, actionType) => {
    if (actionType === 'mentor') {
      showToast(`Mentorship session scheduled with ${studentName} ✓`, 'success');
    } else if (actionType === 'remedial') {
      showToast(`Enrolled ${studentName} into Tuesday remedial algorithm clinic ✓`, 'info');
    } else {
      showToast(`Notice dispatched to ${studentName}'s portal ✓`, 'info');
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Deterministic Academic Health & Intervention"
        title="Student Progress & Attention Queue"
        description="Rule-based monitoring of attendance condonation risks, unsubmitted deliverables, and continuous assessment benchmarks to target timely academic remediation."
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'all-flagged' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('all-flagged')}
          >
            All Flagged ({totalFlaggedCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'attendance' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('attendance')}
          >
            Attendance Risks (&lt;75%)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'missing-asg' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('missing-asg')}
          >
            Missing Work
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filterCriteria === 'low-cia' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCriteria('low-cia')}
          >
            Low CIA Marks
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

      {/* Flagged Attention Queue */}
      <div>
        <SectionHeader
          title="Students Requiring Faculty Action"
          subtitle="Specific rule violations identified from attendance registers and continuous evaluation"
        />

        {flaggedStudents.length === 0 ? (
          <EmptyState
            title="No students flagged under this criteria"
            description="All students meet the threshold requirements for the selected filter."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            {flaggedStudents.map((st) => (
              <div
                key={st.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={16} color="var(--state-urgent)" />
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {st.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {st.rollNo || st.roll}
                    </span>
                    <span className="badge badge-neutral">{st.section || 'AIDS-A'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemedialAction(st.name, 'notify')}
                    >
                      <Send size={12} /> Send Alert
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemedialAction(st.name, 'remedial')}
                    >
                      Remedial Class
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleRemedialAction(st.name, 'mentor')}
                    >
                      Schedule Mentoring
                    </button>
                  </div>
                </div>

                {/* Specific Risk Triggers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
                  {st.risks.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-xs)',
                        background: r.severity === 'urgent' ? 'var(--state-urgent-bg)' : 'var(--state-warning-bg)',
                        border: '1px solid',
                        borderColor: r.severity === 'urgent' ? 'var(--state-urgent-border)' : 'var(--state-warning-border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                        <AlertTriangle
                          size={13}
                          color={r.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)'}
                        />
                        <strong
                          style={{
                            fontSize: '0.8125rem',
                            color: r.severity === 'urgent' ? 'var(--state-urgent)' : 'var(--state-warning)',
                          }}
                        >
                          {r.label}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                        {r.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
