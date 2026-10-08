import React, { useState, useMemo } from 'react';
import {
  ScrollText,
  Download,
  Printer,
  BarChart2,
  PieChart,
  Layers,
  Award,
  Users,
  Briefcase,
  Building,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementReports() {
  const {
    placementDrives,
    studentPlacementApplications,
    placementOffers,
    placementInterviews,
    students,
    departments,
    showToast,
  } = useNivara();

  const [activeReportTab, setActiveReportTab] = useState('drives'); // drives | departments | funnel | roster

  // 1. Strictly Defined Numerators & Denominators
  // Eligible Pool: Students with CGPA >= 7.0 and 0 active backlogs
  const eligiblePlacementPool = useMemo(() => {
    return (students || []).filter(
      (s) => (s.cgpa || 0) >= 7.0 && (s.backlogs || 0) === 0
    );
  }, [students]);

  const confirmedPlacedStudents = useMemo(() => {
    return (placementOffers || []).filter(
      (o) => o.placementStatus === 'placed' || o.offerStatus === 'accepted'
    );
  }, [placementOffers]);

  const placedCount = confirmedPlacedStudents.length;
  const eligiblePoolCount = eligiblePlacementPool.length;
  const placementRatePct =
    eligiblePoolCount > 0
      ? Math.round((placedCount / eligiblePoolCount) * 100)
      : 0;

  // CTC Distribution
  const ctcNumbers = useMemo(() => {
    return (placementOffers || [])
      .map((o) => parseFloat(o.packageLpa) || 0)
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
  }, [placementOffers]);

  const highestCtc = ctcNumbers.length > 0 ? Math.max(...ctcNumbers) : 0;
  const avgCtc =
    ctcNumbers.length > 0
      ? (ctcNumbers.reduce((a, b) => a + b, 0) / ctcNumbers.length).toFixed(1)
      : '0.0';
  const medianCtc =
    ctcNumbers.length > 0
      ? ctcNumbers[Math.floor(ctcNumbers.length / 2)]
      : 0;

  const summaryMetrics = [
    {
      label: 'Institutional Placement Rate',
      value: `${placementRatePct}%`,
      subtext: `${placedCount} Placed / ${eligiblePoolCount} Eligible Pool`,
      state: 'success',
    },
    {
      label: 'Verified Corporate Offers',
      value: `${(placementOffers || []).length} Offers`,
      subtext: `${placedCount} accepted & confirmed`,
      state: 'info',
    },
    {
      label: 'Highest Package Extended',
      value: `${highestCtc} LPA`,
      subtext: 'Tier-1 Super Dream recruit',
      state: 'success',
    },
    {
      label: 'Average Compensation CTC',
      value: `${avgCtc} LPA`,
      subtext: `Median CTC: ${medianCtc} LPA`,
      state: 'neutral',
    },
  ];

  // 2. Drive-Wise Report
  const driveWiseData = useMemo(() => {
    return (placementDrives || []).map((drive) => {
      const driveApps = (studentPlacementApplications || []).filter(
        (a) => a.driveId === drive.id || a.company.toLowerCase() === drive.company.toLowerCase()
      );
      const driveRounds = (placementInterviews || []).filter(
        (i) => i.driveId === drive.id || i.company.toLowerCase() === drive.company.toLowerCase()
      );
      const driveOffers = (placementOffers || []).filter(
        (o) => o.driveId === drive.id || o.company.toLowerCase() === drive.company.toLowerCase()
      );

      const applicationsCount = driveApps.length;
      const selectionsCount = driveOffers.length || drive.selectedCount || 0;
      const convRate =
        applicationsCount > 0
          ? `${Math.round((selectionsCount / applicationsCount) * 100)}%`
          : '0%';

      return {
        id: drive.id,
        company: drive.company,
        role: drive.role,
        packageLpa: drive.packageLpa,
        minCgpa: drive.minCgpa,
        applicationsCount,
        interviewsCount: driveRounds.length,
        selectionsCount,
        convRate,
        status: drive.status || 'active',
      };
    });
  }, [placementDrives, studentPlacementApplications, placementInterviews, placementOffers]);

  // 3. Department-Wise Placement Breakdown
  const deptWiseData = useMemo(() => {
    return (departments || []).map((dept) => {
      const deptStudents = (students || []).filter((s) => s.deptCode === dept.code);
      const deptEligible = deptStudents.filter(
        (s) => (s.cgpa || 0) >= 7.0 && (s.backlogs || 0) === 0
      );
      const deptPlaced = (placementOffers || []).filter(
        (o) =>
          (o.deptCode === dept.code || deptStudents.some((s) => s.id === o.studentId)) &&
          (o.placementStatus === 'placed' || o.offerStatus === 'accepted')
      );

      const poolCount = deptEligible.length;
      const placedCountInDept = deptPlaced.length;
      const ratePct =
        poolCount > 0 ? Math.round((placedCountInDept / poolCount) * 100) : 0;

      return {
        deptCode: dept.code,
        name: dept.name,
        totalStudents: deptStudents.length,
        eligiblePool: poolCount,
        placedCount: placedCountInDept,
        placementRatePct: `${ratePct}%`,
      };
    });
  }, [departments, students, placementOffers]);

  // 4. Recruitment Funnel Conversion Numbers
  const funnelStages = useMemo(() => {
    const totalApplied = (studentPlacementApplications || []).length;
    const shortlistedAssessment = (studentPlacementApplications || []).filter(
      (a) => !a.stage?.toLowerCase().includes('received')
    ).length;
    const reachedInterviews = (studentPlacementApplications || []).filter(
      (a) => a.stage?.toLowerCase().includes('interview') || a.stage?.toLowerCase().includes('evaluation') || a.stage?.toLowerCase().includes('offer')
    ).length;
    const finalHr = (studentPlacementApplications || []).filter(
      (a) => a.stage?.toLowerCase().includes('hr') || a.stage?.toLowerCase().includes('offer') || a.stage?.toLowerCase().includes('placed')
    ).length;
    const offersExtended = (placementOffers || []).length;
    const offersAccepted = confirmedPlacedStudents.length;

    return [
      { stage: '1. Applications Received & Profile Screening', count: totalApplied, pct: '100%' },
      { stage: '2. Shortlisted for Technical Assessment', count: shortlistedAssessment, pct: totalApplied > 0 ? `${Math.round((shortlistedAssessment / totalApplied) * 100)}%` : '0%' },
      { stage: '3. Technical Interview Rounds (1 & 2)', count: reachedInterviews, pct: totalApplied > 0 ? `${Math.round((reachedInterviews / totalApplied) * 100)}%` : '0%' },
      { stage: '4. Final HR & Cultural Evaluation', count: finalHr, pct: totalApplied > 0 ? `${Math.round((finalHr / totalApplied) * 100)}%` : '0%' },
      { stage: '5. Corporate Offers Extended', count: offersExtended, pct: totalApplied > 0 ? `${Math.round((offersExtended / totalApplied) * 100)}%` : '0%' },
      { stage: '6. Accepted & Certified Placed', count: offersAccepted, pct: totalApplied > 0 ? `${Math.round((offersAccepted / totalApplied) * 100)}%` : '0%' },
    ];
  }, [studentPlacementApplications, placementOffers, confirmedPlacedStudents]);

  // Export handlers
  const handleExportCsv = (filename, headers, rows) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filename}.csv successfully ✓`, 'success');
  };

  const exportCurrentReport = () => {
    if (activeReportTab === 'drives') {
      const headers = ['Company', 'Role', 'Package', 'Min CGPA', 'Applied', 'Interviews', 'Selections', 'Conversion Rate'];
      const rows = driveWiseData.map((d) => [
        `"${d.company}"`,
        `"${d.role}"`,
        `"${d.packageLpa}"`,
        d.minCgpa,
        d.applicationsCount,
        d.interviewsCount,
        d.selectionsCount,
        `"${d.convRate}"`,
      ]);
      handleExportCsv('Drive_Wise_Recruitment_Report', headers, rows);
    } else if (activeReportTab === 'departments') {
      const headers = ['Department Code', 'Department Name', 'Cohort Students', 'Eligible Pool', 'Placed Students', 'Placement Rate'];
      const rows = deptWiseData.map((d) => [
        `"${d.deptCode}"`,
        `"${d.name}"`,
        d.totalStudents,
        d.eligiblePool,
        d.placedCount,
        `"${d.placementRatePct}"`,
      ]);
      handleExportCsv('Department_Placement_Performance', headers, rows);
    } else if (activeReportTab === 'roster') {
      const headers = ['Student ID', 'Student Name', 'Department', 'Company', 'Role', 'Package', 'Offer Date', 'Placement Status'];
      const rows = confirmedPlacedStudents.map((o) => [
        `"${o.studentId}"`,
        `"${o.studentName}"`,
        `"${o.deptCode || 'AIDS'}"`,
        `"${o.company}"`,
        `"${o.role}"`,
        `"${o.packageLpa}"`,
        `"${o.offerDate}"`,
        `"${o.placementStatus}"`,
      ]);
      handleExportCsv('Certified_Placed_Students_Roster', headers, rows);
    } else {
      const headers = ['Pipeline Funnel Stage', 'Candidate Count', 'Stage Retention %'];
      const rows = funnelStages.map((f) => [`"${f.stage}"`, f.count, `"${f.pct}"`]);
      handleExportCsv('Recruitment_Pipeline_Funnel', headers, rows);
    }
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Placement Intelligence"
        title="Recruitment Analytics & Executive Reports"
        description="Comprehensive reports generated from active recruitment data. Metrics adhere to strict institutional mathematical definitions: Placement Rate = Placed Students / Eligible Placement Pool."
        actions={[
          <button
            key="export-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={exportCurrentReport}
          >
            <Download size={13} /> Export Active Report (CSV)
          </button>,
        ]}
      />

      {/* 2. Key Metrics Strip */}
      <MetricStrip metrics={summaryMetrics} />

      {/* 3. Mathematical Formula Notice */}
      <div
        style={{
          padding: '0.85rem 1.15rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Formula Definition: </strong>
          <code>Placement Rate = (Confirmed Placed Students / Eligible Pool: CGPA ≥ 7.0 & 0 Backlogs) × 100</code>
        </div>
        <span className="badge badge-neutral">Audited CDC Definition</span>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'drives' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('drives')}
        >
          Drive-Wise Performance
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'departments' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('departments')}
        >
          Department Summary
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'funnel' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('funnel')}
        >
          Application Funnel
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeReportTab === 'roster' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveReportTab('roster')}
        >
          Placed Students Roster ({confirmedPlacedStudents.length})
        </button>
      </div>

      {/* 5. TAB 1: Drive-Wise Performance */}
      {activeReportTab === 'drives' && (
        <section>
          <SectionHeader
            title="Drive-Wise Applications & Offer Conversions"
            subtitle="Recruitment drive volume, selection ratios, and interview rounds"
          />

          <DataTable
            columns={[
              {
                key: 'company',
                label: 'Hiring Partner & Role',
                render: (d) => (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{d.company}</strong>
                      <span className="badge badge-info">{d.packageLpa}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {d.role}
                    </div>
                  </div>
                ),
              },
              {
                key: 'minCgpa',
                label: 'Cutoff',
                width: '100px',
                render: (d) => <span className="badge badge-neutral">Min {d.minCgpa}</span>,
              },
              {
                key: 'applicationsCount',
                label: 'Applied',
                align: 'right',
                width: '90px',
                render: (d) => <strong style={{ color: 'var(--text-primary)' }}>{d.applicationsCount}</strong>,
              },
              {
                key: 'interviewsCount',
                label: 'Rounds',
                align: 'right',
                width: '90px',
                render: (d) => `${d.interviewsCount}`,
              },
              {
                key: 'selectionsCount',
                label: 'Offers',
                align: 'right',
                width: '90px',
                render: (d) => <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{d.selectionsCount}</span>,
              },
              {
                key: 'convRate',
                label: 'Conversion',
                align: 'right',
                width: '110px',
                render: (d) => <span className="badge badge-success">{d.convRate}</span>,
              },
            ]}
            data={driveWiseData}
            keyField="id"
            emptyMessage="No drives on record."
          />
        </section>
      )}

      {/* 6. TAB 2: Department Summary */}
      {activeReportTab === 'departments' && (
        <section>
          <SectionHeader
            title="Department Placement Performance"
            subtitle="Eligible cohort pool sizes and department conversion rates"
          />

          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Department',
                render: (dept) => (
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{dept.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {dept.deptCode}</div>
                  </div>
                ),
              },
              {
                key: 'totalStudents',
                label: 'Total Cohort',
                align: 'right',
                width: '120px',
                render: (dept) => `${dept.totalStudents}`,
              },
              {
                key: 'eligiblePool',
                label: 'Eligible Pool',
                align: 'right',
                width: '130px',
                render: (dept) => <strong style={{ color: 'var(--text-primary)' }}>{dept.eligiblePool}</strong>,
              },
              {
                key: 'placedCount',
                label: 'Placed',
                align: 'right',
                width: '110px',
                render: (dept) => <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>{dept.placedCount}</span>,
              },
              {
                key: 'placementRatePct',
                label: 'Placement %',
                align: 'right',
                width: '130px',
                render: (dept) => <span className="badge badge-success">{dept.placementRatePct}</span>,
              },
            ]}
            data={deptWiseData}
            keyField="deptCode"
            emptyMessage="No department records available."
          />
        </section>
      )}

      {/* 7. TAB 3: Application Funnel */}
      {activeReportTab === 'funnel' && (
        <section>
          <SectionHeader
            title="Candidate Recruitment Funnel"
            subtitle="Pipeline conversion ratios from application submission to formal placement"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {funnelStages.map((stage, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {stage.stage}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Stage conversion metric
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
                      {stage.count} Candidates
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      Retention: {stage.pct}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. TAB 4: Placed Students Roster */}
      {activeReportTab === 'roster' && (
        <section>
          <SectionHeader
            title="Certified Placed Students Roster"
            subtitle="Official institutional records of students who formally accepted offers"
          />

          <DataTable
            columns={[
              {
                key: 'studentName',
                label: 'Candidate',
                render: (o) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{o.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {o.studentId} · Dept: {o.deptCode || 'AIDS'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'company',
                label: 'Recruiter & Role',
                render: (o) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.company}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.role}</div>
                  </div>
                ),
              },
              {
                key: 'packageLpa',
                label: 'Compensation',
                width: '130px',
                render: (o) => <span className="badge badge-success">{o.packageLpa}</span>,
              },
              {
                key: 'dates',
                label: 'Offer & Joining',
                render: (o) => (
                  <div style={{ fontSize: '0.75rem' }}>
                    <div>Offer: {o.offerDate}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Joining: {o.joiningDate || 'TBD'}</div>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Certification',
                width: '120px',
                render: () => (
                  <span className="badge badge-success">
                    <CheckCircle2 size={11} /> Placed
                  </span>
                ),
              },
            ]}
            data={confirmedPlacedStudents}
            keyField="id"
            emptyMessage="No students currently marked as placed."
          />
        </section>
      )}
    </div>
  );
}
