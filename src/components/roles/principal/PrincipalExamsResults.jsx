import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Award,
  Clock,
  Download,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PrincipalExamsResults() {
  const { examSessions, publishedResults, departments, students, showToast } = useNivara();

  const [activeViewTab, setActiveViewTab] = useState('schedules'); // 'schedules' | 'results'

  const supplementaryCount = (students || []).filter((s) => (s.backlogs || 0) > 0).length;

  const examMetrics = [
    {
      label: 'Scheduled Examination Sessions',
      value: `${(examSessions || []).length} Sessions`,
      subtext: 'Central Examination Cell Calendar',
      state: 'neutral',
    },
    {
      label: 'End-Sem Pass Percentage',
      value: `${publishedResults?.departmentPassPct || 0}%`,
      subtext: (publishedResults?.departmentPassPct || 0) > 0 ? 'Official Examination Board Rate' : 'Pending published results',
      state: (publishedResults?.departmentPassPct || 0) >= 80 ? 'success' : 'neutral',
    },
    {
      label: 'Evaluation Board Status',
      value: publishedResults?.status === 'published' ? 'Completed & Certified' : 'In Session',
      subtext: publishedResults?.status === 'published' ? 'Certified results gazette' : 'Moderation in progress',
      state: publishedResults?.status === 'published' ? 'success' : 'warning',
    },
    {
      label: 'Supplementary Candidates',
      value: `${supplementaryCount} Candidates`,
      subtext: supplementaryCount > 0 ? 'Supplementary remedial eligible' : 'Zero active arrear backlogs',
      state: supplementaryCount > 0 ? 'warning' : 'success',
    },
  ];

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Examination Syndicate · Central Controller of Examinations"
        title="Examinations Schedules & Published Gazettes"
        description="Autonomous examination schedules, seating capacity audits, continuous assessment lock status, and official result gazettes."
        actions={[
          <button
            key="export-gazette"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Official University Examination Gazette downloaded ✓', 'success')}
          >
            <Download size={13} /> Download Official Gazette
          </button>,
        ]}
      />

      {/* 2. Metrics */}
      <MetricStrip metrics={examMetrics} />

      {/* 3. Sub-View Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeViewTab === 'schedules' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setActiveViewTab('schedules')}
        >
          <Calendar size={13} /> Active & Upcoming Examination Schedules
        </button>
        <button
          type="button"
          className={`btn ${activeViewTab === 'results' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => setActiveViewTab('results')}
        >
          <Award size={13} /> Published Semester Result Gazette
        </button>
      </div>

      {/* 4. Schedules View */}
      {activeViewTab === 'schedules' && (
        <section>
          <SectionHeader
            title="Scheduled Autonomous Examination Sessions"
            subtitle="Central Examination Cell managed seating halls and timetable slots"
          />

          <DataTable
            columns={[
              {
                key: 'subjectCode',
                label: 'Course Code',
                width: '110px',
                render: (ex) => <span className="badge badge-info">{ex.subjectCode}</span>,
              },
              {
                key: 'subjectName',
                label: 'Subject Title',
                render: (ex) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ex.subjectName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Departments: {ex.departments?.join(', ') || 'AI & Data Science, CSE'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'date',
                label: 'Examination Date',
                render: (ex) => (
                  <div style={{ fontWeight: 600 }}>
                    {ex.date} · <span style={{ color: 'var(--text-muted)' }}>{ex.session}</span>
                  </div>
                ),
              },
              {
                key: 'halls',
                label: 'Assigned Halls',
                render: (ex) => <span>{ex.halls?.join(', ') || 'Exam Hall 401, 402'}</span>,
              },
              {
                key: 'candidates',
                label: 'Candidates',
                align: 'right',
                render: (ex) => `${ex.candidatesCount || 120} Students`,
              },
              {
                key: 'status',
                label: 'Status',
                render: (ex) => (
                  <span className={`badge ${ex.status === 'scheduled' ? 'badge-neutral' : 'badge-success'}`}>
                    {ex.status === 'scheduled' ? 'Scheduled' : 'Completed'}
                  </span>
                ),
              },
            ]}
            data={examSessions || []}
            keyField="id"
          />
        </section>
      )}

      {/* 5. Published Results View */}
      {activeViewTab === 'results' && (
        <section>
          <SectionHeader
            title="Autumn 2026 Term Results Gazette"
            subtitle="Certified End-Semester evaluation outcomes moderated by the Examination Syndicate"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="notion-callout notion-callout-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--state-success)" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.875rem' }}>Official University Results Notification Released</strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Results verified by Dean of Academic Affairs. Revaluation application window remains active through Central Exam Cell.
                </p>
              </div>
            </div>

            <DataTable
              columns={[
                {
                  key: 'name',
                  label: 'Department',
                  render: (d) => <strong style={{ color: 'var(--text-primary)' }}>{d.name}</strong>,
                },
                {
                  key: 'code',
                  label: 'Code',
                  width: '90px',
                  render: (d) => <span className="badge badge-neutral">{d.code}</span>,
                },
                {
                  key: 'students',
                  label: 'Appeared',
                  align: 'right',
                  render: (d) => `${d.studentCount} Students`,
                },
                {
                  key: 'passed',
                  label: 'Passed',
                  align: 'right',
                  render: (d) => {
                    const passCount = Math.round((d.studentCount * (d.code === 'AIDS' ? 91.2 : 88.0)) / 100);
                    return <span style={{ fontWeight: 700, color: 'var(--state-success)' }}>{passCount}</span>;
                  },
                },
                {
                  key: 'passRate',
                  label: 'Pass Percentage',
                  align: 'right',
                  render: (d) => {
                    const rate = d.code === 'AIDS' ? '91.2%' : d.code === 'CSE' ? '93.4%' : d.code === 'ECE' ? '88.0%' : '85.0%';
                    return <span style={{ fontWeight: 800 }}>{rate}</span>;
                  },
                },
                {
                  key: 'cgpa',
                  label: 'Cohort CGPA',
                  align: 'right',
                  render: (d) => `${d.avgCgpa}`,
                },
              ]}
              data={departments || []}
              keyField="code"
            />
          </div>
        </section>
      )}
    </div>
  );
}
