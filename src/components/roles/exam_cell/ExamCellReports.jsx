import React, { useState } from 'react';
import {
  Download,
  Printer,
  Calendar,
  Award,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function ExamCellReports() {
  const {
    examSessions,
    internalMarks,
    publishedResults,
    revaluationRequests,
    showToast,
  } = useNivara();

  const [activeReportTab, setActiveReportTab] = useState('performance');

  // Report 1: Department Performance Summary
  const departmentReportData = [
    { dept: 'Artificial Intelligence & Data Science', code: 'AIDS', enrolled: 42, evaluated: 42, passed: 40, arrears: 2, passPct: '95.2%', avgCgpa: 8.74 },
    { dept: 'Computer Science & Engineering', code: 'CSE', enrolled: 60, evaluated: 60, passed: 57, arrears: 3, passPct: '95.0%', avgCgpa: 8.62 },
    { dept: 'Electronics & Communication Eng.', code: 'ECE', enrolled: 55, evaluated: 55, passed: 50, arrears: 5, passPct: '90.9%', avgCgpa: 8.35 },
    { dept: 'Mechanical Engineering', code: 'MECH', enrolled: 48, evaluated: 48, passed: 43, arrears: 5, passPct: '89.6%', avgCgpa: 8.15 },
  ];

  // Report 2: Timetable & Venue Utilization
  const venueReportData = (examSessions || []).map((ex) => ({
    code: ex.code,
    subject: ex.subject,
    date: ex.dateFormatted,
    time: ex.time,
    venue: ex.venue,
    capacity: ex.capacity || 64,
    registered: ex.registeredCount || 45,
    utilization: `${Math.round(((ex.registeredCount || 45) / (ex.capacity || 64)) * 100)}%`,
    status: ex.status || 'Scheduled',
  }));

  // Report 3: CIA Completion Status
  const ciaReportData = (internalMarks || []).map((im) => ({
    courseCode: im.courseCode,
    subject: im.subject,
    instructor: im.enteredBy,
    maxMark: im.maxMark,
    benchmarkScore: `${im.scoredMark} / 25`,
    status: im.status === 'locked' ? 'Locked & Verified' : 'Pending Faculty Submission',
  }));

  // Report 4: Revaluation Summary
  const revalReportData = (revaluationRequests || []).map((r) => ({
    rollNo: r.rollNo,
    studentName: r.studentName,
    courseCode: r.courseCode,
    subjectName: r.subjectName,
    originalMarks: r.originalMarks,
    updatedMarks: r.updatedMarks !== null ? r.updatedMarks : 'Pending',
    status: r.status,
  }));

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeReportTab === 'performance') {
      headers = ['Department', 'Code', 'Enrolled', 'Evaluated', 'Passed', 'Arrears', 'Pass %', 'Average CGPA'];
      rows = departmentReportData.map((d) => [
        `"${d.dept}"`,
        d.code,
        d.enrolled,
        d.evaluated,
        d.passed,
        d.arrears,
        d.passPct,
        d.avgCgpa,
      ]);
      filename = 'nivara_department_performance_report.csv';
    } else if (activeReportTab === 'venues') {
      headers = ['Course Code', 'Subject', 'Date', 'Time Window', 'Venue', 'Capacity', 'Allocated', 'Utilization', 'Status'];
      rows = venueReportData.map((v) => [
        v.code,
        `"${v.subject}"`,
        v.date,
        `"${v.time}"`,
        `"${v.venue}"`,
        v.capacity,
        v.registered,
        v.utilization,
        v.status,
      ]);
      filename = 'nivara_venue_utilization_report.csv';
    } else if (activeReportTab === 'cia') {
      headers = ['Course Code', 'Subject', 'Instructor', 'Max Marks', 'Benchmark Score', 'Moderation Status'];
      rows = ciaReportData.map((c) => [
        c.courseCode,
        `"${c.subject}"`,
        `"${c.instructor}"`,
        c.maxMark,
        `"${c.benchmarkScore}"`,
        `"${c.status}"`,
      ]);
      filename = 'nivara_cia_completion_report.csv';
    } else if (activeReportTab === 'revaluation') {
      headers = ['Roll No', 'Student Name', 'Course Code', 'Subject', 'Original Marks', 'Updated Marks', 'Status'];
      rows = revalReportData.map((r) => [
        r.rollNo,
        `"${r.studentName}"`,
        r.courseCode,
        `"${r.subjectName}"`,
        r.originalMarks,
        r.updatedMarks,
        r.status,
      ]);
      filename = 'nivara_revaluation_appeals_report.csv';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Report downloaded: ${filename} ✓`, 'success');
  };

  const reportMetrics = [
    {
      label: 'Institutional Pass Rate',
      value: `${publishedResults?.departmentPassPct || 94.2}%`,
      subtext: 'Audited semester 4 gazette',
      state: 'success',
    },
    {
      label: 'Sessions Scheduled',
      value: `${(examSessions || []).length} Exams`,
      subtext: 'Autumn assessment series',
      state: 'info',
    },
    {
      label: 'CIA Moderation Rate',
      value: `${Math.round(((internalMarks || []).filter((im) => im.status === 'locked').length / Math.max(1, (internalMarks || []).length)) * 100)}% Locked`,
      subtext: 'Faculty mark submissions',
      state: 'neutral',
    },
    {
      label: 'Revaluation Petitions',
      value: `${(revaluationRequests || []).length} Appeals`,
      subtext: 'Logged in institutional queue',
      state: 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Office of the Controller of Examinations · Institutional Analytics"
        title="Official Examination Reports"
        description="Extract audited institutional grade summaries, venue capacity utilization analytics, continuous assessment completion registers, and revaluation decision ledgers."
        actions={[
          <button
            key="export"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
          >
            <Download size={13} /> Export Active Report CSV
          </button>,
          <button
            key="print"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => showToast('Dispatched report summary to institutional printer queue', 'info')}
          >
            <Printer size={13} /> Print Official Report
          </button>,
        ]}
      />

      <MetricStrip metrics={reportMetrics} />

      {/* Report Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'performance' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('performance')}
        >
          <Award size={13} /> Departmental Performance
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'venues' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('venues')}
        >
          <Calendar size={13} /> Venue Capacity Utilization
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'cia' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('cia')}
        >
          <ClipboardList size={13} /> CIA Moderation Register
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'revaluation' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('revaluation')}
        >
          <CheckSquare size={13} /> Revaluation Grievance Register
        </button>
      </div>

      {/* REPORT CONTENT: PERFORMANCE */}
      {activeReportTab === 'performance' && (
        <section>
          <SectionHeader
            title="Institutional Departmental Performance Summary"
            subtitle="Semester 4 consolidated pass rates, candidate counts, and GPA benchmarks"
          />

          <DataTable
            columns={[
              {
                key: 'dept',
                label: 'Department Title',
                render: (d) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.dept}</div>
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
                key: 'arrears',
                label: 'Arrears',
                align: 'right',
                render: (d) => d.arrears,
              },
              {
                key: 'passPct',
                label: 'Pass Percentage',
                align: 'right',
                render: (d) => <span className="badge badge-success">{d.passPct}</span>,
              },
              {
                key: 'avgCgpa',
                label: 'Average CGPA',
                align: 'right',
                render: (d) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{d.avgCgpa}</strong>,
              },
            ]}
            data={departmentReportData}
            keyField="code"
          />
        </section>
      )}

      {/* REPORT CONTENT: VENUES */}
      {activeReportTab === 'venues' && (
        <section>
          <SectionHeader
            title="Examination Hall & Venue Capacity Utilization"
            subtitle="Scheduled sessions vs configured room seat allocations"
          />

          <DataTable
            columns={[
              {
                key: 'code',
                label: 'Paper & Code',
                render: (v) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{v.code}</div>
                  </div>
                ),
              },
              {
                key: 'date',
                label: 'Date & Time Slot',
                render: (v) => (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>{v.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.time}</div>
                  </div>
                ),
              },
              {
                key: 'venue',
                label: 'Venue Hall',
                render: (v) => <strong>{v.venue}</strong>,
              },
              {
                key: 'capacity',
                label: 'Hall Capacity',
                align: 'right',
                render: (v) => `${v.capacity} seats`,
              },
              {
                key: 'registered',
                label: 'Candidates',
                align: 'right',
                render: (v) => `${v.registered} candidates`,
              },
              {
                key: 'utilization',
                label: 'Utilization %',
                align: 'right',
                render: (v) => <span className="badge badge-info">{v.utilization}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (v) => <span className="badge badge-neutral">{v.status}</span>,
              },
            ]}
            data={venueReportData}
            keyField="code"
          />
        </section>
      )}

      {/* REPORT CONTENT: CIA */}
      {activeReportTab === 'cia' && (
        <section>
          <SectionHeader
            title="Continuous Assessment Moderation Register"
            subtitle="Verification status across academic department faculties"
          />

          <DataTable
            columns={[
              {
                key: 'courseCode',
                label: 'Course & Subject',
                render: (c) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.courseCode}</div>
                  </div>
                ),
              },
              {
                key: 'instructor',
                label: 'Assigned Instructor',
                render: (c) => <strong>{c.instructor}</strong>,
              },
              {
                key: 'maxMark',
                label: 'Max Weightage',
                align: 'right',
                render: (c) => `${c.maxMark} Marks`,
              },
              {
                key: 'benchmarkScore',
                label: 'Benchmark Score',
                align: 'right',
                render: (c) => <span style={{ fontWeight: 700 }}>{c.benchmarkScore}</span>,
              },
              {
                key: 'status',
                label: 'Moderation Status',
                render: (c) => (
                  <span className={`badge ${c.status.includes('Locked') ? 'badge-success' : 'badge-warning'}`}>
                    {c.status}
                  </span>
                ),
              },
            ]}
            data={ciaReportData}
            keyField="courseCode"
          />
        </section>
      )}

      {/* REPORT CONTENT: REVALUATION */}
      {activeReportTab === 'revaluation' && (
        <section>
          <SectionHeader
            title="Revaluation Appeals Resolution Register"
            subtitle="Student grievances, original marks, and amended evaluation results"
          />

          <DataTable
            columns={[
              {
                key: 'rollNo',
                label: 'Candidate Roll No',
                render: (r) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.rollNo}</div>
                  </div>
                ),
              },
              {
                key: 'courseCode',
                label: 'Course',
                render: (r) => (
                  <div>
                    <div>{r.subjectName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.courseCode}</div>
                  </div>
                ),
              },
              {
                key: 'originalMarks',
                label: 'Original Marks',
                align: 'right',
                render: (r) => `${r.originalMarks} Marks`,
              },
              {
                key: 'updatedMarks',
                label: 'Amended Marks',
                align: 'right',
                render: (r) => (
                  <span style={{ fontWeight: 700, color: r.updatedMarks !== 'Pending' ? 'var(--color-success, #10b981)' : 'var(--text-muted)' }}>
                    {r.updatedMarks}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Decision Status',
                render: (r) => <span className="badge badge-info">{r.status}</span>,
              },
            ]}
            data={revalReportData}
            keyField="rollNo"
          />
        </section>
      )}
    </div>
  );
}
