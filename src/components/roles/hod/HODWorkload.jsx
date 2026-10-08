import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  Search,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function HODWorkload() {
  const {
    facultyMembers,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');

  // Scoped strictly to Department of AI & Data Science
  const deptFaculty = useMemo(() => {
    return (facultyMembers || []).filter(
      (f) => f.dept === 'AI & Data Science' || f.dept === 'AIDS' || !f.dept
    );
  }, [facultyMembers]);

  const filteredFaculty = useMemo(() => {
    return deptFaculty.filter((f) => {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || (f.courses || []).some((c) => c.toLowerCase().includes(q));
    });
  }, [deptFaculty, searchQuery]);

  const totalTeachingHours = deptFaculty.reduce((acc, f) => acc + (f.workloadHours || 0), 0);
  const avgHours = deptFaculty.length > 0 ? (totalTeachingHours / deptFaculty.length).toFixed(1) : 0;
  const atCapCount = deptFaculty.filter((f) => f.workloadHours >= 18).length;
  const underUtilizedCount = deptFaculty.filter((f) => f.workloadHours <= 12).length;

  const metrics = [
    {
      label: 'Department Instruction',
      value: `${totalTeachingHours} Hours/Wk`,
      subtext: `Across ${deptFaculty.length} instructional faculty`,
      state: 'info',
    },
    {
      label: 'Average Faculty Workload',
      value: `${avgHours} Hours`,
      subtext: 'Policy benchmark: 14–16 hrs/wk',
      state: 'neutral',
    },
    {
      label: 'At Statutory Ceiling (18h)',
      value: `${atCapCount} Faculty`,
      subtext: atCapCount > 0 ? 'Prof. Ananya Sen at maximum cap' : 'Within normal bounds',
      state: atCapCount > 0 ? 'warning' : 'success',
    },
    {
      label: 'Syllabus Delivery Index',
      value: '97.2%',
      subtext: 'Department-wide compliance',
      state: 'success',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Department Administration · Instructional Allocation & Workload Distribution"
        title="Faculty Workload Analysis"
        description="Monitor teaching hours, laboratory sessions, syllabus compliance, and workload distribution against statutory institutional ceilings."
      />

      <MetricStrip metrics={metrics} />

      {/* Search and Summary */}
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
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Statutory Ceiling: 18 Teaching Hours/Week (UGC Autonomous Guidelines)
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search faculty name..."
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

      {/* Workload Table */}
      <div>
        <SectionHeader
          title="Faculty Workload Allocations & Subject Distribution"
          subtitle="Direct breakdown of theory lectures, laboratory practicals, and syllabus compliance"
        />

        <div style={{ overflowX: 'auto', marginTop: '0.65rem' }}>
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
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Faculty Member</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Designation</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Courses</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Theory / Lab Split</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>Weekly Hours</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Syllabus Compliance</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Workload Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f) => {
                const isAtCap = f.workloadHours >= 18;
                const isLight = f.workloadHours <= 12;

                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {f.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {f.designation}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {(f.courses || []).map((c, i) => (
                          <span key={i} className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {f.name.includes('Priya') ? '8h Th / 8h Lab' : f.name.includes('Rajesh') ? '4h Th / 10h Lab' : '14h Th / 4h Lab'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {f.workloadHours} / {f.maxHours} hrs
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--state-success)', fontWeight: 600 }}>
                      {f.compliancePct}% on track
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <span className={`badge ${isAtCap ? 'badge-warning' : isLight ? 'badge-neutral' : 'badge-success'}`}>
                        {isAtCap ? 'At Maximum Cap' : isLight ? 'Department Admin' : 'Balanced'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
