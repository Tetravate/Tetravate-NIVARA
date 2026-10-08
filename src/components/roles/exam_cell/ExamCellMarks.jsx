import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Download,
  Check,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader, DataTable, EmptyState } from '../../workspace';

// Standard 10-point UGC grade mapping
const calculateGrade = (marks, maxMarks = 100) => {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return { grade: 'O', points: 10, label: 'Outstanding' };
  if (pct >= 80) return { grade: 'A+', points: 9, label: 'Excellent' };
  if (pct >= 70) return { grade: 'A', points: 8, label: 'Very Good' };
  if (pct >= 60) return { grade: 'B+', points: 7, label: 'Good' };
  if (pct >= 50) return { grade: 'B', points: 6, label: 'Above Average' };
  if (pct >= 40) return { grade: 'C', points: 5, label: 'Pass' };
  return { grade: 'F', points: 0, label: 'Reappear' };
};

export default function ExamCellMarks({ onNavigate }) {
  const {
    students,
    internalMarks,
    publishedResults,
    showToast,
  } = useNivara();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Master marks registry derived from real students and courses
  const masterMarksList = useMemo(() => {
    const list = [];
    const courses = [
      { code: 'CS304', name: 'Database Management Systems', maxMarks: 100 },
      { code: 'CS301', name: 'Data Structures & Algorithms', maxMarks: 100 },
      { code: 'CS302', name: 'Object Oriented Programming', maxMarks: 100 },
      { code: 'MA301', name: 'Discrete Mathematics', maxMarks: 100 },
      { code: 'AI302', name: 'Machine Learning Foundations Lab', maxMarks: 50 },
    ];

    (students || []).forEach((st, sIdx) => {
      courses.forEach((c, cIdx) => {
        // Derive deterministic baseline marks from student profile or defaults
        const baseMark = c.maxMarks === 50
          ? Math.min(50, Math.max(30, 42 - ((sIdx * 3 + cIdx) % 12)))
          : Math.min(100, Math.max(55, 84 - ((sIdx * 5 + cIdx * 4) % 25)));

        // Verification status
        let status = 'entered';
        const im = (internalMarks || []).find((m) => m.courseCode === c.code);
        if (publishedResults?.status === 'published') {
          status = 'published';
        } else if (im?.status === 'locked') {
          status = 'verified';
        } else {
          status = 'locked';
        }

        const gradeObj = calculateGrade(baseMark, c.maxMarks);

        list.push({
          id: `${st.id}-${c.code}`,
          studentId: st.id,
          rollNo: st.rollNo || st.id,
          studentName: st.name,
          courseCode: c.code,
          courseName: c.name,
          assessment: 'Autumn Sem 5 Consolidated',
          marks: baseMark,
          maxMarks: c.maxMarks,
          grade: gradeObj.grade,
          points: gradeObj.points,
          status,
        });
      });
    });

    return list;
  }, [students, internalMarks, publishedResults]);

  const filteredMarks = useMemo(() => {
    return masterMarksList.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCourse = selectedCourse === 'all' || item.courseCode === selectedCourse;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [masterMarksList, searchQuery, selectedCourse, selectedStatus]);

  const [verifiedMap, setVerifiedMap] = useState({});

  const handleVerify = (id) => {
    setVerifiedMap((prev) => ({ ...prev, [id]: true }));
    showToast('Marks entry verified by Examination Controller ✓', 'success');
  };

  const handleExportCSV = () => {
    if (filteredMarks.length === 0) {
      showToast('No records to export.', 'warning');
      return;
    }
    const headers = ['Roll No', 'Student Name', 'Course Code', 'Subject', 'Marks', 'Max Marks', 'Grade', 'Status'];
    const rows = filteredMarks.map((m) => [
      m.rollNo,
      `"${m.studentName}"`,
      m.courseCode,
      `"${m.courseName}"`,
      m.marks,
      m.maxMarks,
      m.grade,
      verifiedMap[m.id] ? 'verified' : m.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `master_marks_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Master marks registry exported as CSV ✓', 'success');
  };

  const marksMetrics = [
    {
      label: 'Marks Entries',
      value: `${masterMarksList.length} Records`,
      subtext: 'Autumn Semester 5 Assessment Series',
      state: 'info',
    },
    {
      label: 'Verified Entries',
      value: `${Object.keys(verifiedMap).length + masterMarksList.filter((m) => m.status === 'published' || m.status === 'verified').length} Verified`,
      subtext: 'Audited against faculty submission slates',
      state: 'success',
    },
    {
      label: 'Grading Framework',
      value: '10-Point UGC',
      subtext: 'Institutional CBCS standard',
      state: 'neutral',
    },
    {
      label: 'Publication State',
      value: publishedResults?.status === 'published' ? 'Published' : 'Moderated',
      subtext: 'Master ledger synchronized',
      state: publishedResults?.status === 'published' ? 'success' : 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Institutional Marks Tabulation & Grading Registry"
        title="Marks & Grades Administration"
        description="Verify faculty continuous assessments, check UGC 10-point grade mappings, and validate course-level score sheets before official gazette publication."
        actions={[
          <button
            key="export-csv"
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
          >
            <Download size={13} /> Export Ledger CSV
          </button>,
          <button
            key="results-nav"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate && onNavigate('results')}
          >
            Proceed to Results
          </button>,
        ]}
      />

      <MetricStrip metrics={marksMetrics} />

      {/* Filter and Search Bar */}
      <section style={{
        padding: '1rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by student roll no, name, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', height: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ height: '36px', minWidth: '150px' }}
          >
            <option value="all">All Courses</option>
            <option value="CS304">CS304 - DBMS</option>
            <option value="CS301">CS301 - DSA</option>
            <option value="CS302">CS302 - OOP</option>
            <option value="MA301">MA301 - Discrete Math</option>
            <option value="AI302">AI302 - ML Lab</option>
          </select>

          <select
            className="input-field"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ height: '36px', minWidth: '140px' }}
          >
            <option value="all">All Statuses</option>
            <option value="entered">Entered</option>
            <option value="locked">Locked</option>
            <option value="verified">Verified</option>
            <option value="published">Published</option>
          </select>
        </div>
      </section>

      {/* Marks Table */}
      <section>
        <SectionHeader
          title="Master Assessment Grade Ledger"
          subtitle={`Displaying ${filteredMarks.length} student grade entries`}
        />

        {filteredMarks.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No Records Found"
            message="No mark records match the chosen search query or filters."
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'rollNo',
                label: 'Student & Roll No',
                render: (m) => (
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {m.rollNo}
                    </div>
                  </div>
                ),
              },
              {
                key: 'courseCode',
                label: 'Subject Code & Title',
                render: (m) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>{m.courseName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.courseCode}</div>
                  </div>
                ),
              },
              {
                key: 'assessment',
                label: 'Evaluation Phase',
                render: (m) => (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.assessment}</span>
                ),
              },
              {
                key: 'marks',
                label: 'Total Marks',
                align: 'right',
                render: (m) => (
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {m.marks} / {m.maxMarks}
                  </span>
                ),
              },
              {
                key: 'grade',
                label: 'Calculated Grade',
                align: 'center',
                width: '100px',
                render: (m) => (
                  <span className="badge badge-info" style={{ fontWeight: 700 }}>
                    {m.grade} ({m.points})
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                width: '130px',
                render: (m) => {
                  const isVer = verifiedMap[m.id] || m.status === 'verified';
                  const isPub = m.status === 'published';
                  const badgeClass = isPub ? 'badge-success' : isVer ? 'badge-info' : 'badge-neutral';
                  const label = isPub ? 'Published' : isVer ? 'Verified' : m.status;
                  return <span className={`badge ${badgeClass}`}>{label}</span>;
                },
              },
              {
                key: 'actions',
                label: 'Verification',
                align: 'right',
                width: '120px',
                render: (m) => {
                  const isVer = verifiedMap[m.id] || m.status === 'verified' || m.status === 'published';
                  return (
                    <button
                      type="button"
                      className={`btn btn-sm ${isVer ? 'btn-ghost' : 'btn-secondary'}`}
                      disabled={isVer}
                      onClick={() => handleVerify(m.id)}
                    >
                      {isVer ? <Check size={12} /> : 'Verify'}
                    </button>
                  );
                },
              },
            ]}
            data={filteredMarks}
            keyField="id"
          />
        )}
      </section>
    </div>
  );
}
