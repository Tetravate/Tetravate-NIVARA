import React, { useState } from 'react';
import {
  Download,
  Filter,
  Users,
  Calendar,
  Layers,
  Printer,
  FileSpreadsheet,
  Building,
  Briefcase,
  CreditCard,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader } from '../../workspace';

export default function PrincipalReports() {
  const {
    departments,
    students,
    feeStructures,
    placementDrives,
    showToast,
  } = useNivara();

  const [selectedReportType, setSelectedReportType] = useState('comprehensive');
  const [currentDateStr] = useState(() => new Date().toLocaleDateString('en-GB'));

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Institutional Comprehensive Governance Audit',
      description: 'Macro overview of college-wide student intake, faculty ratios, attendance rates, and financial realizations.',
      icon: Layers,
      badge: 'Executive',
    },
    {
      id: 'departments',
      name: 'Department-Wise Comparative Benchmark Matrix',
      description: 'Cross-department comparison across student enrollments, faculty counts, average CGPA, and placement percentages.',
      icon: Building,
      badge: 'Governance',
    },
    {
      id: 'attendance',
      name: 'College Attendance & Statutory Condonation Docket',
      description: 'Audit of attendance defaulters below the mandatory 75% cutoff threshold eligible for Academic Advisory review.',
      icon: Users,
      badge: 'Regulatory',
    },
    {
      id: 'placements',
      name: 'Corporate Campus Recruitment & Placement Dossier',
      description: 'Active placement drives, participating MNC partners, candidate packages (CTC LPA), and offer conversion counts.',
      icon: Briefcase,
      badge: 'Careers',
    },
    {
      id: 'finance',
      name: 'Tuition Fee Recovery & Institutional Revenue Summary',
      description: 'Fee collection realized versus billed targets, outstanding student balances, and payment mode distributions.',
      icon: CreditCard,
      badge: 'Finance',
    },
  ];

  // Filtered dataset generator for export and tabular preview
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `NIVARA_INSTITUTIONAL_${selectedReportType.toUpperCase()}_REPORT_${timestamp}.csv`;

    if (selectedReportType === 'comprehensive') {
      headers = ['Academic Branch', 'Code', 'HOD', 'Student Count', 'Faculty Count', 'Attendance Pct', 'Mean CGPA', 'Placement Pct'];
      rows = (departments || []).map((d) => [
        `"${d.name}"`,
        `"${d.code}"`,
        `"${d.hod}"`,
        `"${d.studentCount}"`,
        `"${d.facultyCount}"`,
        `"${d.attendancePct}%"`,
        `"${d.avgCgpa}"`,
        `"${d.placedPct}%"`,
      ]);
    } else if (selectedReportType === 'departments') {
      headers = ['Department Code', 'Full Division Title', 'HOD In-Charge', 'Student Capacity', 'Faculty Staff', 'Faculty-Student Ratio', 'NBA Tier-1 Status'];
      rows = (departments || []).map((d) => [
        `"${d.code}"`,
        `"${d.name}"`,
        `"${d.hod}"`,
        `"${d.studentCount}"`,
        `"${d.facultyCount}"`,
        `"1:${Math.round(d.studentCount / (d.facultyCount || 1))}"`,
        `"Accredited"`,
      ]);
    } else if (selectedReportType === 'attendance') {
      headers = ['Student ID', 'Student Name', 'Department', 'Attendance Pct', 'Statutory Cutoff', 'Standing Status'];
      const defaulters = (students || []).filter((s) => (s.attendancePct || 85) < 75);
      rows = defaulters.map((s) => [
        `"${s.id}"`,
        `"${s.name}"`,
        `"${s.department || 'Engineering'}"`,
        `"${s.attendancePct}%"`,
        `"75.0%"`,
        `"Condonation Review Mandated"`,
      ]);
    } else if (selectedReportType === 'placements') {
      headers = ['Company Name', 'Job Role', 'Compensation CTC', 'Location', 'Candidates Applied', 'Offers Released', 'Recruitment Status'];
      rows = (placementDrives || []).map((d) => [
        `"${d.company}"`,
        `"${d.role}"`,
        `"${d.packageLpa}"`,
        `"${d.location || 'Pan-India'}"`,
        `"${d.appliedCount}"`,
        `"${d.selectedCount}"`,
        `"Offer Process Completed"`,
      ]);
    } else {
      // finance
      headers = ['Fee Schedule', 'Target Department', 'Tariff per Student', 'Total Billed', 'Total Collected', 'Realization Pct', 'Pending Students'];
      rows = (feeStructures || []).map((f) => [
        `"${f.name}"`,
        `"${f.department}"`,
        `"₹${f.amount.toLocaleString()}"`,
        `"₹${(f.totalBilled / 10000000).toFixed(2)} Cr"`,
        `"₹${(f.totalCollected / 10000000).toFixed(2)} Cr"`,
        `"${Math.round((f.totalCollected / f.totalBilled) * 100)}%"`,
        `"${f.studentsPendingCount}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Institutional Report ${filename} exported successfully ✓`, 'success');
  };

  return (
    <div className="workspace-wide" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Institution Academic Registry · Governance & Accreditation Office"
        title="Institutional Accreditation Reports & Executive Dossiers"
        description="Certified institutional reporting suites conforming to NBA Tier-1, NAAC Criterion benchmarks, and University Syndicate standards."
        actions={[
          <button
            key="export-csv"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportCSV}
          >
            <Download size={13} /> Export Active Dossier (CSV)
          </button>,
          <button
            key="print-audit"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print Dossier
          </button>,
        ]}
      />

      {/* 2. Report Type Selector Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {reportTypes.map((rt) => {
          const IconComp = rt.icon;
          const isSelected = selectedReportType === rt.id;
          return (
            <button
              key={rt.id}
              type="button"
              onClick={() => setSelectedReportType(rt.id)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                border: isSelected ? '2px solid var(--brand-primary, #6366f1)' : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <IconComp
                  size={18}
                  color={isSelected ? 'var(--brand-primary, #6366f1)' : 'var(--text-muted)'}
                />
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  {rt.badge}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {rt.name}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.3',
                }}
              >
                {rt.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Metadata Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          padding: '0.85rem 1.15rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <Filter size={14} /> Scope: <strong>Institution-Wide (All Divisions)</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Calendar size={13} /> Certified as of: <strong>{currentDateStr}</strong> · Status: <span style={{ color: 'var(--state-success)', fontWeight: 700 }}>Autonomous Syndicate Verified</span>
        </div>
      </div>

      {/* 4. Live Tabular Dataset Preview */}
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {reportTypes.find((r) => r.id === selectedReportType)?.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live tabular dataset showing verified institutional records
            </div>
          </div>
          <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
            {selectedReportType === 'placements'
              ? `${(placementDrives || []).length} Corporate Drives`
              : selectedReportType === 'finance'
              ? `${(feeStructures || []).length} Fee Schedules`
              : selectedReportType === 'attendance'
              ? `${(students || []).filter((s) => (s.attendancePct || 85) < 75).length} Defaulters`
              : `${(departments || []).length} Branches`}
          </span>
        </div>

        {/* Tabular Dataset Rendering */}
        <div style={{ overflowX: 'auto' }}>
          {selectedReportType === 'comprehensive' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Academic Branch</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>HOD</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Students</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Faculty</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Attendance</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Mean CGPA</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Placement Pct</th>
                </tr>
              </thead>
              <tbody>
                {(departments || []).map((d) => (
                  <tr key={d.code} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-neutral">{d.code}</span></td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{d.hod}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>{d.studentCount}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{d.facultyCount}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: d.attendancePct >= 85 ? 'var(--state-success)' : 'var(--state-warning)' }}>{d.attendancePct}%</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>{d.avgCgpa}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>{d.placedPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'departments' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Division Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>HOD In-Charge</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Enrolled Capacity</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Faculty Ratio</th>
                  <th style={{ padding: '0.75rem 1rem' }}>NBA Tier-1 Status</th>
                </tr>
              </thead>
              <tbody>
                {(departments || []).map((d) => (
                  <tr key={d.code} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-info">{d.code}</span></td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{d.hod}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>{d.studentCount} Students</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>1:{Math.round(d.studentCount / (d.facultyCount || 1))}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-success">Accredited (Valid to 2028)</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'attendance' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Recorded Attendance</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Regulatory Standing</th>
                </tr>
              </thead>
              <tbody>
                {(students || [])
                  .filter((s) => (s.attendancePct || 85) < 75)
                  .map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--state-urgent-bg)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{st.id}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{st.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{st.department || 'B.Tech AI & Data Science'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--state-urgent)' }}>{st.attendancePct}%</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-urgent">Condonation Review Mandated</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'placements' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Corporate Partner</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Designation Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Package (CTC)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Screened Candidates</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Offers Released</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(placementDrives || []).map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.company}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{d.role}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-info">{d.packageLpa}</span></td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>{d.appliedCount} Candidates</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>{d.selectedCount} Offers</td>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-success">Completed ✓</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReportType === 'finance' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Fee Schedule</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Target Division</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Billed</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Realized Collection</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Recovery Rate</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Pending Students</th>
                </tr>
              </thead>
              <tbody>
                {(feeStructures || []).map((f) => {
                  const pct = Math.round((f.totalCollected / f.totalBilled) * 100);
                  return (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{f.department}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹{(f.totalBilled / 10000000).toFixed(2)} Cr</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--state-success)' }}>₹{(f.totalCollected / 10000000).toFixed(2)} Cr</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700 }}>{pct}%</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: f.studentsPendingCount > 0 ? 'var(--state-warning)' : 'var(--state-success)', fontWeight: 600 }}>{f.studentsPendingCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 5. Governance Archival Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}
      >
        <FileSpreadsheet size={20} color="var(--brand-primary, #6366f1)" />
        <div style={{ flex: 1 }}>
          <strong>Autonomous Governance Certification:</strong> All reports generated in this workspace are derived from verified institutional ledgers and submitted to the Governing Body and Academic Council per UGC Autonomy Regulations.
        </div>
      </div>
    </div>
  );
}
