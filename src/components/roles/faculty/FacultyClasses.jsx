import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Zap,
  CheckSquare,
  Layers,
  Award,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyClasses({ onBack }) {
  const { currentUser, students, assignments, setActiveTab } = useNivara();
  const [selectedClassCode, setSelectedClassCode] = useState('CS301');

  const facultyName = currentUser?.userName || 'Dr. Priya Raman';

  // Authorized teaching classes assigned to Dr. Priya Raman
  const assignedClasses = [
    {
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      section: 'AIDS-A',
      year: 'III Year B.Tech',
      semester: 5,
      academicYear: '2026–2027',
      credits: 4,
      room: 'Computing Lab 2 (Block B)',
      schedule: 'Mon 08:30 AM · Tue 10:00 AM',
      enrolledCount: 28,
      avgAttendance: 88.5,
      pendingDeliverables: 1,
      isPrimary: true,
      description: 'Advanced graph traversals, shortest paths, min-heap priority queues, disjoint-set forests, and algorithmic asymptotic proofs.',
    },
    {
      code: 'AI302',
      name: 'Machine Learning Foundations Lab',
      section: 'AIDS-A',
      year: 'III Year B.Tech',
      semester: 5,
      academicYear: '2026–2027',
      credits: 2,
      room: 'AI Computing Lab 1',
      schedule: 'Mon 10:15 AM · Fri 02:00 PM',
      enrolledCount: 28,
      avgAttendance: 92.1,
      pendingDeliverables: 0,
      isPrimary: false,
      description: 'Supervised regression, classification benchmarks, gradient descent optimization, and Scikit-Learn/PyTorch laboratory implementations.',
    },
    {
      code: 'AI308',
      name: 'Applied Deep Learning & NLP',
      section: 'AIDS-A',
      year: 'IV Year B.Tech',
      semester: 7,
      academicYear: '2026–2027',
      credits: 4,
      room: 'Lecture Hall 302',
      schedule: 'Wed 11:30 AM · Thu 02:15 PM',
      enrolledCount: 32,
      avgAttendance: 90.4,
      pendingDeliverables: 1,
      isPrimary: false,
      description: 'Transformer architectures, multi-head attention mechanisms, encoder-decoder language modeling, and fine-tuning BERT/Llama foundations.',
    },
  ];

  const totalStudents = assignedClasses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const totalCredits = assignedClasses.reduce((sum, c) => sum + c.credits, 0);

  const classesMetrics = [
    {
      label: 'Assigned Teaching Classes',
      value: `${assignedClasses.length} Cohorts`,
      subtext: 'Semester 5 & 7 Term',
      state: 'info',
    },
    {
      label: 'Total Enrolled Roster',
      value: `${totalStudents} Students`,
      subtext: 'Across assigned cohorts',
      state: 'neutral',
    },
    {
      label: 'Teaching Workload',
      value: `${totalCredits} Credits`,
      subtext: '16 Lecture & Lab Hours/Week',
      state: 'success',
    },
    {
      label: 'Department Authorization',
      value: 'AI & Data Science',
      subtext: 'Scoped Teaching Roster',
      state: 'success',
    },
  ];

  const currentClass = assignedClasses.find((c) => c.code === selectedClassCode) || assignedClasses[0];

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={`Curriculum Instruction · Academic Year 2026–2027 · ${facultyName}`}
        title="My Classes & Assigned Teaching Cohorts"
        description="Official academic cohorts, registered classroom rosters, syllabus progression, and connected operations."
        actions={
          onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          )
        }
      />

      {/* 2. Key Metrics Strip */}
      <MetricStrip metrics={classesMetrics} />

      {/* 3. Assigned Classes Cards Grid */}
      <section>
        <SectionHeader
          title="Assigned Teaching Courses"
          subtitle="Click to inspect course operations and enrolled students"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {assignedClasses.map((cls) => {
            const isSelected = selectedClassCode === cls.code;
            return (
              <div
                key={cls.code}
                onClick={() => setSelectedClassCode(cls.code)}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--bg-hover)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--brand-primary)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-info">{cls.code}</span>
                    <span className="badge badge-neutral">{cls.section}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {cls.credits} Credits
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cls.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {cls.year} · Semester {cls.semester} · {cls.academicYear}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.65rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={12} /> {cls.enrolledCount} Students
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={12} /> {cls.room.split('(')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Selected Class Workspace & Operations */}
      {currentClass && (
        <section style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-info">{currentClass.code}</span>
                <span className="badge badge-neutral">{currentClass.section}</span>
                <span className="badge badge-success">Instructor: {facultyName}</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {currentClass.name}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '720px', lineHeight: 1.5 }}>
                {currentClass.description}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Venue</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentClass.room}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{currentClass.schedule}</div>
            </div>
          </div>

          {/* Quick Contextual Operations Bar */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Direct Class Operations & Portals
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('attendance')}
                style={{ justifyContent: 'center' }}
              >
                <Zap size={13} /> Take Attendance
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('students')}
                style={{ justifyContent: 'center' }}
              >
                <Users size={13} /> Enrolled Students ({currentClass.enrolledCount})
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('assignments')}
                style={{ justifyContent: 'center' }}
              >
                <CheckSquare size={13} /> Assignments & Grading
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('materials')}
                style={{ justifyContent: 'center' }}
              >
                <Layers size={13} /> Course Handouts
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('marks')}
                style={{ justifyContent: 'center' }}
              >
                <Award size={13} /> CIA Marks Moderation
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
