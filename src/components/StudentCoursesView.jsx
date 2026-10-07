import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Download,
  FileText,
  Check,
  ArrowLeft,
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from './workspace';

export default function StudentCoursesView({ onBack }) {
  const { courseMaterials, coursesAttendance, showToast } = useNivara();
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Course registry for Semester 5
  const enrolledCourses = [
    { code: 'CS301', name: 'Data Structures & Algorithms', faculty: 'Dr. Priya Raman', credits: 4, section: 'AIDS-A' },
    { code: 'CS302', name: 'Object Oriented Programming & Design', faculty: 'Prof. S. Rangarajan', credits: 4, section: 'AIDS-A' },
    { code: 'CS304', name: 'Database Management Systems', faculty: 'Dr. K. Mohan', credits: 4, section: 'AIDS-A' },
    { code: 'MA301', name: 'Discrete Mathematics & Graph Theory', faculty: 'Prof. S. Venkatesh', credits: 4, section: 'AIDS-A' },
    { code: 'AI301', name: 'Applied Machine Learning Foundations', faculty: 'Dr. Priya Raman', credits: 4, section: 'AIDS-A' },
    { code: 'CS305', name: 'Computing Architecture & Systems Lab', faculty: 'Dr. R. Ananth', credits: 2, section: 'AIDS-A' },
  ];

  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalMaterials = (courseMaterials || []).length;

  const coursesMetrics = [
    {
      label: 'Registered Courses',
      value: `${enrolledCourses.length} Subjects`,
      subtext: 'Semester 5 Academic Term',
      state: 'info',
    },
    {
      label: 'Degree Credits',
      value: `${totalCredits} Credits`,
      subtext: 'Prescribed curriculum weight',
      state: 'neutral',
    },
    {
      label: 'Learning Materials',
      value: `${totalMaterials} Handouts`,
      subtext: 'Faculty verified resources',
      state: 'success',
    },
    {
      label: 'Access Authorization',
      value: 'Enrolled Class',
      subtext: 'Restricted to AIDS-A section',
      state: 'success',
    },
  ];

  const filteredMaterials = (courseMaterials || []).filter((mat) => {
    if (selectedCourse !== 'ALL' && mat.courseCode !== selectedCourse) return false;
    if (selectedType !== 'ALL' && mat.materialType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (mat.title || '').toLowerCase().includes(q);
      const matchSub = (mat.subjectName || '').toLowerCase().includes(q);
      const matchFaculty = (mat.facultyName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchFaculty) return false;
    }
    return true;
  });

  const handleDownload = (mat) => {
    // Generate an authentic document blob for student offline study
    const content = `NIVARA INSTITUTIONAL COURSE REPOSITORY\n\nCourse: ${mat.subjectName} (${mat.courseCode})\nDocument: ${mat.title}\nFaculty: ${mat.facultyName}\nRelease Date: ${mat.uploadedAt}\nFile: ${mat.fileName}\n\nDescription:\n${mat.description || 'Verified course handouts and problem sets for enrolled students.'}\n\n[Verified Institutional Material · Section AIDS-A]`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mat.fileName.replace(/\.pdf$/, '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${mat.fileName} ✓`, 'success');
  };

  return (
    <div className="workspace-normal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Curriculum Repository · Semester 5 · Autumn 2026"
        title="Courses & Study Materials"
        description="Course syllabi, lecture presentations, lab manuals, and faculty reference materials."
        actions={
          onBack && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={13} /> Back to Home
            </button>
          )
        }
      />

      {/* 2. Metrics Strip */}
      <MetricStrip metrics={coursesMetrics} />

      {/* 3. Enrolled Courses Horizontal Strip */}
      <section>
        <SectionHeader
          title="Enrolled Semester 5 Courses"
          subtitle="Official academic subject registrations"
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
          {enrolledCourses.map((c) => (
            <div
              key={c.code}
              onClick={() => setSelectedCourse(selectedCourse === c.code ? 'ALL' : c.code)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: selectedCourse === c.code ? 'var(--bg-hover)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: selectedCourse === c.code ? 'var(--brand-primary)' : 'var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span className="badge badge-info">{c.code}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.credits} Credits</span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {c.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {c.faculty}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { id: 'ALL', label: 'All Courses' },
            ...enrolledCourses.map((c) => ({ id: c.code, label: c.code })),
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn btn-sm ${selectedCourse === f.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCourse(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem 0.45rem 2rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
            }}
          />
        </div>
      </div>

      {/* 5. Course Materials List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filteredMaterials.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No course materials found"
            description={
              selectedCourse !== 'ALL'
                ? `No materials currently uploaded for ${selectedCourse}. Faculty will release lecture slides prior to review sessions.`
                : 'No course materials match your current search query.'
            }
          />
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              style={{
                padding: '1.15rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {mat.title}
                  </span>
                  <span className="badge badge-info">{mat.courseCode}</span>
                  <span className="badge badge-neutral">{mat.materialType || 'Lecture Notes'}</span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {mat.subjectName} · Faculty: <strong>{mat.facultyName}</strong>
                </div>

                {mat.description && (
                  <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {mat.description}
                  </p>
                )}

                <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span>File: <code style={{ fontFamily: 'var(--font-mono)' }}>{mat.fileName}</code></span>
                  <span>•</span>
                  <span>Size: {Math.round(mat.fileSizeKb || 2400)} KB</span>
                  <span>•</span>
                  <span>Uploaded: {mat.uploadedAt}</span>
                  <span>•</span>
                  <span>{mat.downloads || 42} Downloads</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownload(mat)}
                >
                  <Download size={13} /> Download Handout
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
