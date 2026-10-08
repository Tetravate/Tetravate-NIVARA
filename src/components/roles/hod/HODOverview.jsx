import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Award,
  Zap,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODOverview() {
  const {
    departments,
    students,
    facultyMembers,
    coursesAttendance,
  } = useNivara();

  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  // Scoped strictly to Department of AI & Data Science
  const dept = (departments || []).find((d) => d.code === 'AIDS') || {
    code: 'AIDS',
    name: 'Department of AI & Data Science',
    hod: 'Dr. K. Mohan',
    studentCount: 380,
    facultyCount: 14,
    attendancePct: 84.8,
    avgCgpa: 8.42,
    placedPct: 82,
    atRiskCount: 2,
  };

  const programs = [
    { code: 'BTECH-AIDS', name: 'B.Tech Artificial Intelligence & Data Science', students: 340, duration: '4 Years (8 Semesters)' },
    { code: 'MTECH-MLR', name: 'M.Tech Machine Learning & Robotics', students: 40, duration: '2 Years (4 Semesters)' },
  ];

  const cohorts = [
    { year: '3rd Year', semester: 'Semester 5', section: 'AIDS-A', students: 60, advisor: 'Dr. Priya Raman', avgAtt: '85.4%', avgCgpa: '8.48' },
    { year: '3rd Year', semester: 'Semester 5', section: 'AIDS-B', students: 60, advisor: 'Prof. Ananya Sen', avgAtt: '81.2%', avgCgpa: '8.35' },
    { year: '2nd Year', semester: 'Semester 3', section: 'AIDS-A', students: 65, advisor: 'Prof. S. Venkatesh', avgAtt: '86.1%', avgCgpa: '8.52' },
    { year: '2nd Year', semester: 'Semester 3', section: 'AIDS-B', students: 65, advisor: 'Dr. Rajesh K.', avgAtt: '85.0%', avgCgpa: '8.40' },
    { year: '4th Year', semester: 'Semester 7', section: 'AIDS-A', students: 65, advisor: 'Dr. K. Mohan', avgAtt: '83.2%', avgCgpa: '8.65' },
    { year: '1st Year', semester: 'Semester 1', section: 'AIDS-A', students: 65, advisor: 'Dr. S. Kapoor', avgAtt: '88.5%', avgCgpa: '8.20' },
  ];

  const filteredCohorts = useMemo(() => {
    return cohorts.filter((c) => {
      if (selectedYear !== 'ALL' && c.year !== selectedYear) return false;
      if (selectedSection !== 'ALL' && c.section !== selectedSection) return false;
      return true;
    });
  }, [selectedYear, selectedSection]);

  const metrics = [
    {
      label: 'Department Capacity',
      value: `${dept.studentCount} Undergrads`,
      subtext: 'B.Tech AI & Data Science',
      state: 'info',
    },
    {
      label: 'Instructional Staff',
      value: `${dept.facultyCount} Faculty`,
      subtext: 'Professors & Lab Engineers',
      state: 'neutral',
    },
    {
      label: 'Attendance Rate',
      value: `${dept.attendancePct}%`,
      subtext: 'Live synchronized across batches',
      state: dept.attendancePct >= 80 ? 'success' : 'warning',
    },
    {
      label: 'Autonomous Standing',
      value: `CGPA ${dept.avgCgpa}`,
      subtext: `${dept.placedPct}% Placement conversion`,
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Operations · Academic Structure & Cohort Health"
        title="Department Overview"
        description="Comprehensive organizational intelligence for Department of AI & Data Science including accredited programs, cohort sections, faculty-to-student ratios, and active teaching venues."
      />

      <MetricStrip metrics={metrics} />

      {/* Program Academic Vitals & Infrastructure */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {programs.map((prog) => (
          <div
            key={prog.code}
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-info">{prog.code}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prog.duration}</span>
            </div>

            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {prog.name}
              </strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Total Enrollment: <strong>{prog.students} Students</strong> · Affiliation: Autonomous Curriculum 2024
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>NBA Accredited Tier-1</span>
              <span>•</span>
              <span>Outcome-Based Education</span>
              <span>•</span>
              <span>Credit Cap: 164</span>
            </div>
          </div>
        ))}
      </div>

      {/* Department Cohorts Breakdown */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <SectionHeader
            title="Department Cohort Sections & Academic Advisors"
            subtitle="Batch-level attendance rates, continuous academic standing, and assigned mentor faculty"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Academic Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Sections</option>
              <option value="AIDS-A">Section AIDS-A</option>
              <option value="AIDS-B">Section AIDS-B</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cohort Batch</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Semester</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Section</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Advisor</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Students</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Attendance Rate</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Cohort CGPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredCohorts.map((c, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.year}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                    {c.semester}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-info">{c.section}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {c.advisor}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {c.students}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700, color: Number(c.avgAtt.replace('%', '')) >= 80 ? 'var(--state-success)' : 'var(--state-warning)' }}>
                    {c.avgAtt}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {c.avgCgpa}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Research Labs & Facilities */}
      <div>
        <SectionHeader
          title="Department Research Laboratories & Computing Centers"
          subtitle="Physical venues assigned to AI & DS practical sessions"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <MapPin size={14} color="var(--brand-blue)" />
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Computing Lab 2 (Block B)</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              64 High-Performance Workstations · CUDA & GCC Configured · In-Charge: Dr. Priya Raman
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <MapPin size={14} color="var(--brand-blue)" />
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>AI Computing Lab 1 (Block B)</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              48 GPU Accelerated Terminals · PyTorch & TensorFlow Cluster · In-Charge: Dr. Rajesh K.
            </div>
          </div>

          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <MapPin size={14} color="var(--brand-blue)" />
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Cognitive Neural Systems Center</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Specialized PG Research Lab · Edge AI & Jetson Dev Kits · In-Charge: Dr. K. Mohan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
