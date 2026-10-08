import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileText,
  Download,
  Search,
  HardDrive,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, EmptyState } from '../../workspace';

export default function FacultyMaterials() {
  const {
    courseMaterials,
    uploadCourseMaterial,
    currentUser,
    showToast,
  } = useNivara();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    courseCode: 'CS301',
    subjectName: 'Data Structures & Algorithms',
    materialType: 'lecture_notes',
    description: '',
    fileName: 'cs301_lecture_unit4.pdf',
    fileUrl: 'https://nivara-storage.local/courseware/cs301_lecture_unit4.pdf',
    fileSizeKb: 3400,
    sectionCode: 'AIDS-A-SEM5',
    visibility: 'enrolled_class',
  });

  // Filter materials to Faculty's courses: CS301, AI302, AI308
  const assignedCourses = [
    { code: 'CS301', name: 'Data Structures & Algorithms', section: 'AIDS-A-SEM5' },
    { code: 'AI302', name: 'Machine Learning Foundations Lab', section: 'AIDS-A-SEM5' },
    { code: 'AI308', name: 'Deep Learning & Neural Architectures', section: 'AIDS-B-SEM5' },
  ];

  const facultyMaterials = useMemo(() => {
    return (courseMaterials || []).filter((m) => {
      return (
        m.courseCode === 'CS301' ||
        m.courseCode === 'AI302' ||
        m.courseCode === 'AI308' ||
        m.facultyName?.includes('Priya Raman') ||
        m.facultyName === currentUser?.userName
      );
    });
  }, [courseMaterials, currentUser]);

  const filteredMaterials = useMemo(() => {
    return facultyMaterials.filter((m) => {
      if (selectedCourseFilter !== 'ALL' && m.courseCode !== selectedCourseFilter) return false;
      if (selectedTypeFilter !== 'ALL' && m.materialType !== selectedTypeFilter) return false;

      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [facultyMaterials, selectedCourseFilter, selectedTypeFilter, searchQuery]);

  const totalDownloads = facultyMaterials.reduce((acc, m) => acc + (m.downloads || 0), 0);

  const metrics = [
    {
      label: 'Published Resources',
      value: `${facultyMaterials.length} Items`,
      subtext: 'Across CS301, AI302 & AI308',
      state: 'info',
    },
    {
      label: 'Student Downloads',
      value: `${totalDownloads} Total`,
      subtext: 'Enrolled cohort access',
      state: 'success',
    },
    {
      label: 'Courseware Storage',
      value: 'Local & Supabase',
      subtext: 'Bucket: /courseware/v1',
      state: 'neutral',
    },
    {
      label: 'Cohort Reach',
      value: 'AIDS-A & AIDS-B',
      subtext: '60 Total Enrolled Students',
      state: 'info',
    },
  ];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please provide a title for the study resource', 'error');
      return;
    }

    await uploadCourseMaterial({
      ...formData,
      facultyName: currentUser?.userName || 'Dr. Priya Raman',
    });

    setUploadModalOpen(false);
    setFormData({
      title: '',
      courseCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      materialType: 'lecture_notes',
      description: '',
      fileName: 'cs301_resource.pdf',
      fileUrl: 'https://nivara-storage.local/courseware/cs301_resource.pdf',
      fileSizeKb: 2800,
      sectionCode: 'AIDS-A-SEM5',
      visibility: 'enrolled_class',
    });
  };

  const handleDownload = (material) => {
    showToast(`Downloading: ${material.title} (${material.fileName || 'file.pdf'}) ✓`, 'info');
  };

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Courseware & Academic Resources"
        title="Courses & Materials"
        description="Publish courseware notes, lab exercise sheets, problem sets, and syllabus handouts directly into student workspaces."
        actions={[
          <button
            key="upload-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setUploadModalOpen(true)}
          >
            <Upload size={13} /> Upload Resource
          </button>,
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Assigned Courses</option>
            <option value="CS301">CS301 — Data Structures</option>
            <option value="AI302">AI302 — ML Foundations</option>
            <option value="AI308">AI308 — Deep Learning</option>
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-canvas)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Resource Types</option>
            <option value="lecture_notes">Lecture Notes</option>
            <option value="cheatsheet">Cheatsheets & Handouts</option>
            <option value="problem_set">Lab Problem Sets</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search resources..."
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

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <EmptyState
          title="No course materials found"
          description="You haven't uploaded any resources matching the selected filter. Click 'Upload Resource' to add one."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--brand-blue-subtle)',
                    color: 'var(--brand-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <FileText size={18} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {mat.title}
                    </strong>
                    <span className="badge badge-info">{mat.courseCode}</span>
                    <span className="badge badge-neutral">
                      {(mat.materialType || 'notes').replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    {mat.description}
                  </div>

                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>Uploaded: <strong>{mat.uploadedAt || 'Oct 2026'}</strong></span>
                    <span>•</span>
                    <span>Section: <strong>{mat.sectionCode || 'AIDS-A'}</strong></span>
                    <span>•</span>
                    <span>Size: <strong>{Math.round((mat.fileSizeKb || 2400) / 1024 * 10) / 10} MB</strong></span>
                    <span>•</span>
                    <span>Downloads: <strong>{mat.downloads || 0}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDownload(mat)}
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="modal-backdrop" onClick={() => setUploadModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={16} color="var(--brand-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Upload Course Material
                </h3>
              </div>
              <button type="button" onClick={() => setUploadModalOpen(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Document / Material Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3: Graph Traversal & Dijkstra Shortest Paths"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Assigned Course
                  </label>
                  <select
                    value={formData.courseCode}
                    onChange={(e) => {
                      const course = assignedCourses.find((c) => c.code === e.target.value);
                      setFormData({
                        ...formData,
                        courseCode: e.target.value,
                        subjectName: course ? course.name : e.target.value,
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-canvas)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {assignedCourses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Material Category
                  </label>
                  <select
                    value={formData.materialType}
                    onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      background: 'var(--bg-canvas)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <option value="lecture_notes">Lecture Slides & Notes</option>
                    <option value="problem_set">Lab Manual / Problem Set</option>
                    <option value="cheatsheet">Cheatsheet & Formula Sheet</option>
                    <option value="syllabus">Syllabus & Lesson Plan</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Description / Topic Summary
                </label>
                <textarea
                  rows="2"
                  placeholder="Outline key topics covered, prerequisites, or required readings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  File Reference / Cloud URL
                </label>
                <input
                  type="text"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="e.g. https://storage.nivara.edu/cs301/unit3.pdf"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-strong)',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <HardDrive size={14} color="var(--brand-blue)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Storage bucket: <code>/nivara-courseware/{formData.courseCode.toLowerCase()}</code> (Authenticates via session RBAC).
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setUploadModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Publish to Student Portals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
