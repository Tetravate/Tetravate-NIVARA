import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Briefcase,
  Users,
  Search,
  Filter,
  Download,
  Send,
  Sliders,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable } from '../../workspace';

export default function PlacementEligibility({ onNavigate }) {
  const {
    students,
    placementDrives,
    showToast,
  } = useNivara();

  const [selectedDriveId, setSelectedDriveId] = useState(
    placementDrives && placementDrives.length > 0 ? placementDrives[0].id : ''
  );
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('all'); // all | eligible | ineligible
  const [deptFilter, setDeptFilter] = useState('all');

  // Currently evaluated drive
  const selectedDrive = useMemo(() => {
    return (placementDrives || []).find((d) => d.id === selectedDriveId) || (placementDrives || [])[0] || {
      company: 'General Benchmark',
      role: 'Core Engineering',
      minCgpa: 7.5,
      allowedBacklogs: 0,
      departmentTarget: ['AIDS', 'CSE'],
    };
  }, [placementDrives, selectedDriveId]);

  // Evaluate every student with transparent, deterministic criteria
  const evaluatedStudents = useMemo(() => {
    return (students || []).map((student) => {
      const minCgpa = selectedDrive.minCgpa || 7.5;
      const allowedBacklogs = selectedDrive.allowedBacklogs || 0;
      const targetDepts = selectedDrive.departmentTarget || ['AIDS', 'CSE', 'ECE'];

      const cgpaSatisfied = (student.cgpa || 0) >= minCgpa;
      const deptSatisfied = targetDepts.includes(student.deptCode);
      const backlogsSatisfied = (student.backlogs || 0) <= allowedBacklogs;

      const isEligible = cgpaSatisfied && deptSatisfied && backlogsSatisfied;

      // Construct transparent criteria breakdown
      const reasons = [];
      if (cgpaSatisfied) {
        reasons.push(`CGPA satisfied (${student.cgpa} >= ${minCgpa})`);
      } else {
        reasons.push(`CGPA below benchmark (${student.cgpa} < ${minCgpa})`);
      }

      if (deptSatisfied) {
        reasons.push(`Department matched (${student.deptCode})`);
      } else {
        reasons.push(`Department not targeted (${student.deptCode})`);
      }

      if (backlogsSatisfied) {
        reasons.push(`Backlogs satisfied (${student.backlogs || 0} <= ${allowedBacklogs})`);
      } else {
        reasons.push(`Active backlogs (${student.backlogs} > allowed ${allowedBacklogs})`);
      }

      return {
        ...student,
        isEligible,
        cgpaSatisfied,
        deptSatisfied,
        backlogsSatisfied,
        reasons,
      };
    });
  }, [students, selectedDrive]);

  // Filtered evaluation roster
  const filteredRoster = useMemo(() => {
    return evaluatedStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase());

      const matchesVerdict =
        verdictFilter === 'all'
          ? true
          : verdictFilter === 'eligible'
          ? s.isEligible
          : !s.isEligible;

      const matchesDept = deptFilter === 'all' ? true : s.deptCode === deptFilter;

      return matchesSearch && matchesVerdict && matchesDept;
    });
  }, [evaluatedStudents, search, verdictFilter, deptFilter]);

  // Metrics
  const eligibleCount = useMemo(
    () => evaluatedStudents.filter((s) => s.isEligible).length,
    [evaluatedStudents]
  );
  const totalCount = evaluatedStudents.length;
  const ineligibleCount = totalCount - eligibleCount;
  const eligibilityPct = totalCount > 0 ? Math.round((eligibleCount / totalCount) * 100) : 0;

  const metrics = [
    {
      label: 'Selected Target Drive',
      value: selectedDrive.company,
      subtext: `${selectedDrive.role} (${selectedDrive.packageLpa || 'N/A'})`,
      state: 'info',
    },
    {
      label: 'Eligible Candidates',
      value: `${eligibleCount} of ${totalCount}`,
      subtext: `Qualify for ${selectedDrive.company}`,
      state: 'success',
    },
    {
      label: 'Disqualified / Blocked',
      value: `${ineligibleCount} Students`,
      subtext: 'Below CGPA, backlogs, or cohort',
      state: ineligibleCount > 0 ? 'urgent' : 'neutral',
    },
    {
      label: 'Institutional Clearance Rate',
      value: `${eligibilityPct}%`,
      subtext: `${eligibleCount}/${totalCount} cleared criteria`,
      state: eligibilityPct >= 70 ? 'success' : 'neutral',
    },
  ];

  const handleExportEligibleCsv = () => {
    const eligibleList = evaluatedStudents.filter((s) => s.isEligible);
    if (eligibleList.length === 0) {
      showToast('No eligible students to export for this drive.', 'info');
      return;
    }

    const headers = ['Roll No', 'Student Name', 'Department', 'CGPA', 'Backlogs', 'Drive', 'Package'];
    const rows = eligibleList.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      s.cgpa,
      s.backlogs || 0,
      `"${selectedDrive.company}"`,
      `"${selectedDrive.packageLpa || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Eligible_Students_${selectedDrive.company.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${eligibleList.length} eligible candidates to CSV ✓`, 'success');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <PageHeader
        eyebrow="Career Development Center · Verification Engine"
        title="Candidate Eligibility & Academic Benchmarking"
        description="Audit candidate cohorts against corporate placement drive benchmarks. Every eligibility verdict is computed from verifiable academic records (CGPA, backlogs, department) with transparent justifications."
        actions={[
          <button
            key="export-roster"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportEligibleCsv}
          >
            <Download size={13} /> Export Eligible Roster (CSV)
          </button>,
          <button
            key="announce-drive"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('announcements')}
          >
            <Send size={13} /> Broadcast Drive Notice
          </button>,
        ]}
      />

      {/* 2. Drive Selector Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Briefcase size={15} color="var(--brand-blue)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Drive Evaluation:
            </span>
          </div>

          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              minWidth: '260px',
            }}
            aria-label="Select placement drive to evaluate eligibility"
          >
            {(placementDrives || []).map((drive) => (
              <option key={drive.id} value={drive.id}>
                {drive.company} — {drive.role} (Min {drive.minCgpa} CGPA)
              </option>
            ))}
          </select>
        </div>

        {/* Current Benchmark Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-neutral">Benchmark: ≥ {selectedDrive.minCgpa} CGPA</span>
          <span className="badge badge-neutral">Allowed Backlogs: ≤ {selectedDrive.allowedBacklogs || 0}</span>
          <span className="badge badge-info">
            Cohorts: {(selectedDrive.departmentTarget || ['AIDS', 'CSE']).join(', ')}
          </span>
        </div>
      </div>

      {/* 3. Metrics Strip */}
      <MetricStrip metrics={metrics} />

      {/* 4. Candidate Audit Table */}
      <section>
        <SectionHeader
          title={`Candidate Eligibility Audit (${filteredRoster.length} Evaluated)`}
          subtitle={`Transparent rule breakdown for ${selectedDrive.company}`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter student or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem 0.25rem 1.65rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    width: '100%',
                  }}
                />
              </div>

              <select
                value={verdictFilter}
                onChange={(e) => setVerdictFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter eligibility verdict"
              >
                <option value="all">All Verdicts</option>
                <option value="eligible">Eligible Only ({eligibleCount})</option>
                <option value="ineligible">Ineligible Only ({ineligibleCount})</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
                aria-label="Filter department"
              >
                <option value="all">All Departments</option>
                <option value="AIDS">AIDS</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
          }
        />

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Student Candidate',
              render: (s) => (
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {s.rollNo} · {s.department}
                  </div>
                </div>
              ),
            },
            {
              key: 'cgpa',
              label: 'CGPA',
              width: '90px',
              render: (s) => (
                <strong style={{ color: s.cgpaSatisfied ? 'var(--state-success)' : 'var(--state-danger)' }}>
                  {s.cgpa}
                </strong>
              ),
            },
            {
              key: 'backlogs',
              label: 'Backlogs',
              width: '90px',
              render: (s) => (
                <span style={{ color: s.backlogsSatisfied ? 'var(--text-primary)' : 'var(--state-danger)', fontWeight: 600 }}>
                  {s.backlogs || 0}
                </span>
              ),
            },
            {
              key: 'isEligible',
              label: 'Eligibility Verdict',
              width: '130px',
              render: (s) => (
                <span className={`badge ${s.isEligible ? 'badge-success' : 'badge-urgent'}`}>
                  {s.isEligible ? (
                    <>
                      <CheckCircle2 size={11} /> Eligible
                    </>
                  ) : (
                    <>
                      <XCircle size={11} /> Ineligible
                    </>
                  )}
                </span>
              ),
            },
            {
              key: 'reasons',
              label: 'Deterministic Criteria Breakdown',
              render: (s) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {s.reasons.map((r, i) => {
                    const isFailure = r.includes('below') || r.includes('not') || r.includes('Active backlogs');
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.71875rem',
                          color: isFailure ? 'var(--state-danger)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isFailure ? 'var(--state-danger)' : 'var(--state-success)' }} />
                        {r}
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
          data={filteredRoster}
          keyField="id"
          emptyMessage="No students match the current filter parameters."
        />
      </section>
    </div>
  );
}
