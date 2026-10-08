import React from 'react';
import {
  Award,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function ExamCellResults({ onNavigate }) {
  const {
    departments,
    publishedResults,
    setPublishedResults,
    publishExamResults,
    showToast,
  } = useNivara();

  const isPublished = publishedResults?.status === 'published';

  const handlePublish = () => {
    publishExamResults();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleRevertModeration = () => {
    setPublishedResults((prev) => ({
      ...prev,
      status: 'under_moderation',
    }));
    showToast('Result publication reverted to Committee Moderation stage ✓', 'info');
  };

  const departmentBreakdown = (departments || []).map((d) => ({
    code: d.code,
    name: d.name,
    enrolled: d.studentCount || 0,
    evaluated: d.studentCount || 0,
    passed: Math.round(((d.studentCount || 0) * (d.passPct || 100)) / 100),
    failed: Math.max(0, (d.studentCount || 0) - Math.round(((d.studentCount || 0) * (d.passPct || 100)) / 100)),
    passPct: `${d.passPct || 100}%`,
    avgCgpa: d.avgCgpa || 0,
  }));

  const resultsMetrics = [
    {
      label: 'Gazette Publishing Status',
      value: isPublished ? 'Published & Distributed' : 'Under Committee Moderation',
      subtext: isPublished ? 'Live across Student & Institutional portals' : 'Awaiting Controller sign-off',
      state: isPublished ? 'success' : 'warning',
    },
    {
      label: 'Institutional Pass Rate',
      value: `${publishedResults?.departmentPassPct || 0}%`,
      subtext: 'Across all evaluated engineering departments',
      state: (publishedResults?.departmentPassPct || 0) > 0 ? 'success' : 'neutral',
    },
    {
      label: 'Average CGPA Benchmark',
      value: `${publishedResults?.overallCgpa || 0}`,
      subtext: (publishedResults?.overallCgpa || 0) > 0 ? 'Institutional CGPA benchmark' : 'Pending published results',
      state: (publishedResults?.overallCgpa || 0) > 0 ? 'info' : 'neutral',
    },
    {
      label: 'Degree Credits Tabulated',
      value: `${publishedResults?.creditsEarned || 82} Credits`,
      subtext: 'Validated through semester 4',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Semester Evaluation & Official Gazette Publication"
        title="Results Moderation & Distribution"
        description="Review consolidated grade sheets, audit departmental pass benchmarks, and officially release moderated semester grade sheets to student portfolios and institutional leadership."
        actions={[
          <button
            key="reval"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate && onNavigate('revaluation')}
          >
            Revaluation Queue
          </button>,
        ]}
      />

      <MetricStrip metrics={resultsMetrics} />

      {/* Formal Publication Dispatch Panel */}
      <section>
        <SectionHeader
          title="Formal Semester Gazette Publication Pipeline"
          subtitle="Governed release mechanism synchronized with Student, HOD, and Principal roles"
        />

        <div style={{
          padding: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Semester {publishedResults?.semester || 4} Final Moderated Results
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Gazette Status: <strong>{isPublished ? 'Officially Published & Distributed' : 'Under Committee Moderation'}</strong> · Published Date: <strong>{publishedResults?.publishedAt || '15 Aug 2026'}</strong>
              </div>
            </div>

            <span className={`badge ${isPublished ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
              {isPublished ? 'Published to All Portals' : 'Ready for Formal Publication'}
            </span>
          </div>

          <div style={{
            padding: '0.85rem',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            Publishing formal results synchronizes verified grade sheets to all student portfolios, recalculates cumulative CGPAs, unlocks transcripts, and notifies the Principal, Department HODs, and enrolled students immediately via institutional real-time notifications.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {isPublished && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRevertModeration}
              >
                <RotateCcw size={13} /> Revert to Moderation
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePublish}
            >
              <Award size={14} /> {isPublished ? 'Re-Publish Gazette' : 'Publish Semester Results Now'}
            </button>
          </div>
        </div>
      </section>

      {/* Departmental Pass Benchmarks */}
      <section>
        <SectionHeader
          title="Departmental Performance & Pass Distribution"
          subtitle="Audited statistics derived from moderated grade tabulation slates"
        />

        <DataTable
          columns={[
            {
              key: 'code',
              label: 'Department',
              render: (d) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.code}</div>
                </div>
              ),
            },
            {
              key: 'enrolled',
              label: 'Enrolled',
              align: 'right',
              render: (d) => d.enrolled,
            },
            {
              key: 'evaluated',
              label: 'Evaluated',
              align: 'right',
              render: (d) => d.evaluated,
            },
            {
              key: 'passed',
              label: 'Passed',
              align: 'right',
              render: (d) => <span style={{ color: 'var(--color-success, #10b981)', fontWeight: 700 }}>{d.passed}</span>,
            },
            {
              key: 'failed',
              label: 'Arrears / Reappear',
              align: 'right',
              render: (d) => <span style={{ color: d.failed > 0 ? 'var(--color-danger, #ef4444)' : 'var(--text-muted)' }}>{d.failed}</span>,
            },
            {
              key: 'passPct',
              label: 'Pass Percentage',
              align: 'right',
              render: (d) => (
                <span className="badge badge-success" style={{ fontWeight: 700 }}>
                  {d.passPct}
                </span>
              ),
            },
            {
              key: 'avgCgpa',
              label: 'Term GPA Benchmark',
              align: 'right',
              render: (d) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{d.avgCgpa}</strong>,
            },
          ]}
          data={departmentBreakdown}
          keyField="code"
        />
      </section>
    </div>
  );
}
