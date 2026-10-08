import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Check,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState, DataTable } from './workspace';

export default function ResultsView({ onBack }) {
  const { students, publishedResults, internalMarks, currentUser, showToast } = useNivara();

  const activeStudentId = currentUser?.studentId || currentUser?.id || '';
  const student = (students || []).find((s) => s.id === activeStudentId) || (students || [])[0] || {};

  const studentSem = student?.semester || 1;
  const overallCgpa = student?.cgpa || publishedResults?.overallCgpa || 0;
  const creditsEarned = student?.creditsCompleted || publishedResults?.creditsEarned || 0;
  const totalCredits = 160;
  const completionPct = totalCredits > 0 ? Math.round((creditsEarned / totalCredits) * 100) : 0;

  const [selectedSem, setSelectedSem] = useState(studentSem);
  const [verificationModal, setVerificationModal] = useState(false);

  const semesterHistory = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
    const isCompleted = s < studentSem;
    const isCurrent = s === studentSem;
    return {
      sem: s,
      cgpa: s === publishedResults?.semester ? publishedResults.overallCgpa : (isCompleted && student?.cgpa ? student.cgpa : null),
      credits: isCompleted ? 20 : (isCurrent ? 20 : 0),
      status: isCompleted ? 'completed' : isCurrent ? 'in-progress' : 'planned',
    };
  });

  const resultsMetrics = [
    {
      label: 'Cumulative CGPA',
      value: overallCgpa ? `${overallCgpa}` : '0.0',
      unit: '/ 10.0',
      subtext: overallCgpa >= 8.5 ? 'First Class with Distinction' : overallCgpa >= 6.5 ? 'First Class' : (overallCgpa > 0 ? 'Satisfactory Standing' : 'No graded terms yet'),
      state: overallCgpa > 0 ? 'success' : 'neutral',
    },
    {
      label: 'Degree Credits Earned',
      value: `${creditsEarned} Credits`,
      subtext: totalCredits > 0 ? `${completionPct}% of ${totalCredits} degree requirement` : '0% requirement completed',
      state: creditsEarned > 0 ? 'info' : 'neutral',
    },
    {
      label: 'Academic Standing',
      value: student?.standing || (overallCgpa > 0 ? 'Good Standing' : 'Pending Enrollment'),
      subtext: 'Official COE standing record',
      state: 'success',
    },
    {
      label: 'Latest Published Term',
      value: publishedResults?.semester ? `Semester ${publishedResults.semester}` : 'None Published',
      subtext: publishedResults?.publishedAt ? `Published: ${publishedResults.publishedAt}` : 'No published grade sheet yet',
      state: publishedResults?.semester ? 'neutral' : 'warning',
    },
  ];

  const getCoursesForSem = (sem) => {
    if (Array.isArray(publishedResults?.courses) && publishedResults.semester === sem) {
      return publishedResults.courses;
    }
    if (Array.isArray(student?.semesterResults?.[sem])) {
      return student.semesterResults[sem];
    }
    return [];
  };

  const isCurrentSem = selectedSem === studentSem;
  const isFutureSem = selectedSem > studentSem;
  const isPublishedSem = selectedSem < studentSem;

  const currentCourses = getCoursesForSem(selectedSem);

  const columns = [
    {
      header: 'Course Code',
      accessor: 'code',
      render: (row) => <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.code}</code>,
    },
    {
      header: 'Subject Title',
      accessor: 'name',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    {
      header: 'Credits',
      accessor: 'credits',
      align: 'center',
      render: (row) => <span>{row.credits}</span>,
    },
    {
      header: 'Letter Grade',
      accessor: 'grade',
      align: 'center',
      render: (row) => (
        <span className={`badge ${row.grade === 'O' || row.grade === 'A+' ? 'badge-success' : 'badge-neutral'}`}>
          {row.grade}
        </span>
      ),
    },
    {
      header: 'Grade Points',
      accessor: 'points',
      align: 'center',
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.points} / 10</span>,
    },
    {
      header: 'Result Status',
      accessor: 'status',
      align: 'right',
      render: (row) => (
        <span style={{ color: 'var(--state-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Check size={12} strokeWidth={3} /> {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Academic Standing & Evaluations · Office of the Controller of Examinations"
        title="Academic Record & Results"
        description="Official academic record across 8 semesters, cumulative CGPA progression, and verified grade sheets."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setVerificationModal(true)}
            >
              <FileText size={12} /> Grade Sheet Verification
            </button>
            {onBack && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
                <ArrowLeft size={13} /> Back to Home
              </button>
            )}
          </div>
        }
      />

      {/* 2. Results Metrics Strip */}
      <MetricStrip metrics={resultsMetrics} />

      {/* 3. 8-Semester Academic Roadmap */}
      <section>
        <SectionHeader
          title="8-Semester Progression Roadmap"
          subtitle="Select completed semesters to inspect official term grade sheets"
        />

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {semesterHistory.map((s) => {
            const isCompleted = s.status === 'completed';
            const isCurrent = s.status === 'in-progress';
            const isSelected = selectedSem === s.sem;

            return (
              <button
                key={s.sem}
                type="button"
                onClick={() => setSelectedSem(s.sem)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--border-strong)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                  opacity: isCompleted || isCurrent ? 1 : 0.6,
                  minWidth: '85px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--state-success-bg)' : isCurrent ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                    color: isCompleted ? 'var(--state-success)' : isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                  }}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : s.sem}
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Sem {s.sem}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {s.cgpa ? `SGPA ${s.cgpa.toFixed(2)}` : isCurrent ? 'Active' : 'Planned'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Semester Evaluation View */}
      <section>
        <SectionHeader
          title={`Semester ${selectedSem} Course Evaluations`}
          subtitle={
            isPublishedSem
              ? `Officially published & authenticated by Office of the COE`
              : isCurrentSem
              ? `Semester 5 is in session — Continuous internal assessments recorded`
              : `Curriculum scheduled for future academic year`
          }
        />

        {isCurrentSem ? (
          /* RESULT NOT PUBLISHED YET STATE for current Semester 5 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <Clock size={20} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Semester 5 evaluation is currently under moderation. Result not published yet.
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  Official end-semester grade cards are published by the Controller of Examinations after final theory and laboratory examinations are completed.
                </div>
              </div>
            </div>

            {/* Continuous Internal Assessment (CIA) marks display for in-progress term */}
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Continuous Internal Assessment (CIA) Component Marks (Max 25):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {internalMarks.map((im) => (
                  <div
                    key={im.courseCode}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span className="badge badge-info">{im.courseCode}</span>
                      <span className={`badge ${im.status === 'locked' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.625rem' }}>
                        {im.status === 'locked' ? 'Locked CIA' : 'Draft'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {im.subject}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {im.scoredMark}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {im.maxMark} Marks</span>
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Evaluator: {im.enteredBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isFutureSem ? (
          <EmptyState
            icon={Layers}
            title={`Semester ${selectedSem} Planned Curriculum`}
            description="Course registrations and syllabus credits for future academic terms will be unlocked upon formal semester enrollment."
          />
        ) : (
          /* Officially Published Semester Grade Sheet */
          <DataTable
            columns={columns}
            data={currentCourses}
            keyExtractor={(row) => row.code}
            emptyMessage="No grade evaluation records found for this term."
          />
        )}
      </section>

      {/* 5. Grade Verification Modal */}
      {verificationModal && (
        <div className="modal-backdrop" onClick={() => setVerificationModal(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Official Academic Transcript Verification
                </h3>
              </div>
              <button type="button" onClick={() => setVerificationModal(false)} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  border: '2px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem',
                  background: 'var(--bg-canvas)',
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-blue)' }}>
                  Office of the Controller of Examinations · Nivara University
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0.75rem' }}>
                  Authenticated Student Grade Summary
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8125rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                    <div style={{ fontWeight: 700 }}>{student?.name || currentUser?.userName || '—'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Registration Roll:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{student?.rollNo || student?.id || activeStudentId || '—'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Cumulative CGPA:</span>
                    <div style={{ fontWeight: 800, color: 'var(--state-success)' }}>{overallCgpa} / 10.0</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Completed Credits:</span>
                    <div style={{ fontWeight: 700 }}>{creditsEarned} Credits</div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Verification Status: <code>{overallCgpa > 0 ? 'COE-SEALED' : 'UNVERIFIED'}</code> · Digital Records Office
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    showToast('Official Grade Transcript PDF downloaded ✓', 'success');
                    setVerificationModal(false);
                  }}
                >
                  <Download size={13} /> Download Authenticated Transcript
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
