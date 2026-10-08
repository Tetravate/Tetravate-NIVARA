import React, { useState, useMemo } from 'react';
import {
  Lock,
  AlertTriangle,
  Save,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useNivara } from '../../../context/NivaraContext';
import { PageHeader, MetricStrip, SectionHeader } from '../../workspace';

export default function FacultyMarks() {
  const {
    internalMarks,
    updateInternalMarks,
    students,
    showToast,
  } = useNivara();

  const [selectedCourse, setSelectedCourse] = useState(
    (internalMarks && internalMarks[0]?.courseCode) || 'CS301'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMarks, setEditingMarks] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [studentScores, setStudentScores] = useState({});

  const currentCourseMeta = (internalMarks || []).find((m) => m.courseCode === selectedCourse) || {
    courseCode: selectedCourse,
    subject: selectedCourse,
    maxMark: 25,
    scoredMark: 0,
    status: 'draft',
    enteredBy: 'Faculty Evaluator',
  };

  const isCourseLocked = currentCourseMeta.status === 'locked';
  const activeCohortStudents = useMemo(() => {
    if (studentScores[selectedCourse]) return studentScores[selectedCourse];
    return (students || []).map((s) => ({
      id: s.id,
      roll: s.rollNo || s.roll || s.id,
      name: s.name,
      cia1: 0,
      cia2: 0,
      modelExam: 0,
      attendanceScore: 0,
      totalCia: 0,
      status: 'draft',
    }));
  }, [studentScores, selectedCourse, students]);

  const filteredStudents = useMemo(() => {
    return activeCohortStudents.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.roll.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [activeCohortStudents, searchQuery]);

  // Cohort statistics
  const scoresArray = activeCohortStudents.map((s) => s.totalCia);
  const avgScore = scoresArray.length > 0 ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length).toFixed(1) : 0;
  const passCount = scoresArray.filter((s) => s >= 12.5).length;
  const passPct = scoresArray.length > 0 ? Math.round((passCount / scoresArray.length) * 100) : 100;

  const handleScoreChange = (studentId, rawVal) => {
    if (isCourseLocked) {
      showToast('Cannot modify marks: Sheet is locked and submitted to Exam Cell', 'error');
      return;
    }

    const val = Number(rawVal);
    if (isNaN(val) || val < 0 || val > 25) {
      setValidationErrors((prev) => ({
        ...prev,
        [studentId]: 'Score must be between 0 and 25',
      }));
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }

    setEditingMarks((prev) => ({
      ...prev,
      [studentId]: rawVal,
    }));
  };

  const handleSaveDraft = () => {
    if (isCourseLocked) {
      showToast('Sheet is locked and already submitted to Exam Cell', 'info');
      return;
    }

    // Persist changes to local scores
    const updated = activeCohortStudents.map((st) => {
      if (editingMarks[st.id] !== undefined) {
        const val = Number(editingMarks[st.id]);
        return { ...st, totalCia: isNaN(val) ? st.totalCia : val };
      }
      return st;
    });

    setStudentScores((prev) => ({
      ...prev,
      [selectedCourse]: updated,
    }));

    // Save to context
    const firstScore = activeCohortStudents[0]
      ? (editingMarks[activeCohortStudents[0].id] !== undefined ? Number(editingMarks[activeCohortStudents[0].id]) : activeCohortStudents[0].totalCia)
      : currentCourseMeta.scoredMark;
    updateInternalMarks(selectedCourse, firstScore, false);
    showToast(`Continuous assessment draft saved for ${selectedCourse} ✓`, 'success');
  };

  const handleLockAndSubmit = () => {
    if (Object.keys(validationErrors).length > 0) {
      showToast('Resolve mark validation errors before locking the sheet', 'error');
      return;
    }

    const updated = activeCohortStudents.map((st) => {
      const val = editingMarks[st.id] !== undefined ? Number(editingMarks[st.id]) : st.totalCia;
      return { ...st, totalCia: isNaN(val) ? st.totalCia : val, status: 'locked' };
    });

    setStudentScores((prev) => ({
      ...prev,
      [selectedCourse]: updated,
    }));

    const firstScore = activeCohortStudents[0]
      ? (editingMarks[activeCohortStudents[0].id] !== undefined ? Number(editingMarks[activeCohortStudents[0].id]) : activeCohortStudents[0].totalCia)
      : currentCourseMeta.scoredMark;
    updateInternalMarks(selectedCourse, firstScore, true);
  };

  const metrics = [
    {
      label: 'Selected Course Sheet',
      value: selectedCourse,
      subtext: currentCourseMeta.subject,
      state: 'info',
    },
    {
      label: 'Moderation Status',
      value: isCourseLocked ? 'Locked & Verified' : 'Draft Assessment',
      subtext: isCourseLocked ? 'Submitted to Exam Controller' : 'Editable by course instructor',
      state: isCourseLocked ? 'success' : 'warning',
    },
    {
      label: 'Cohort Average CIA',
      value: `${avgScore} / 25`,
      subtext: `${passPct}% Passing Standard (>=12.5)`,
      state: Number(avgScore) >= 18 ? 'success' : 'info',
    },
    {
      label: 'Exam Cell Tabulation',
      value: isCourseLocked ? 'Synchronized' : 'Pending Lock',
      subtext: 'Auto-syncs upon final lock',
      state: isCourseLocked ? 'success' : 'neutral',
    },
  ];

  return (
    <div className="workspace-dense" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        eyebrow="Faculty Operations · Continuous Internal Assessment Moderation"
        title="Assessments & Internal Marks"
        description="Tabulate continuous assessment marks (CIA I, CIA II, Lab/Model Exam), review class statistics, and lock final sheets for Exam Cell moderation."
        actions={[
          !isCourseLocked ? (
            <React.Fragment key="actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSaveDraft}
              >
                <Save size={13} /> Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleLockAndSubmit}
              >
                <Lock size={13} /> Lock & Submit to Exam Cell
              </button>
            </React.Fragment>
          ) : (
            <span key="locked-badge" className="badge badge-success" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}>
              <ShieldCheck size={14} style={{ marginRight: '4px' }} /> Sheet Locked · Submitted to Exam Cell
            </span>
          ),
        ]}
      />

      <MetricStrip metrics={metrics} />

      {/* Course Selector and Search Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Select Teaching Course Sheet:
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setEditingMarks({});
                setValidationErrors({});
              }}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-canvas)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
              }}
            >
              <option value="CS301">CS301 — Data Structures & Algorithms</option>
              <option value="AI302">AI302 — Machine Learning Foundations Lab</option>
              <option value="AI308">AI308 — Deep Learning & Neural Architectures</option>
            </select>
          </div>

          {isCourseLocked && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                color: 'var(--state-success)',
                fontWeight: 600,
                marginTop: '1rem',
              }}
            >
              <Lock size={12} /> Modifications disabled by Exam Cell lock policy
            </div>
          )}
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search student or roll..."
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

      {/* Lock Notice Banner */}
      {isCourseLocked ? (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--state-success-bg)',
            border: '1px solid var(--state-success-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={16} color="var(--state-success)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            <strong>Assessment Sheet Locked:</strong> Continuous Internal Assessment marks for <strong>{selectedCourse}</strong>{' '}
            have been locked by {currentCourseMeta.enteredBy} and transmitted to the Autonomous Examination Cell. To request a moderation override, contact the Exam Controller.
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--state-warning-bg)',
            border: '1px solid var(--state-warning-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={16} color="var(--state-warning)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
            <strong>Draft Assessment Status:</strong> Marks are in editable draft state. Students cannot view these internal scores until you click <strong>Lock & Submit to Exam Cell</strong>.
          </div>
        </div>
      )}

      {/* Marks Table */}
      <div>
        <SectionHeader
          title={`Continuous Assessment Mark Sheet · ${currentCourseMeta.subject}`}
          subtitle={`Max Marks: 25 · Weightage: 25% of Final Autonomous Tabulation · ${filteredStudents.length} Students`}
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
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Roll No</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>CIA I (25)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>CIA II (25)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Model (50)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Attendance (5)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>Moderated CIA (/ 25)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students found matching search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const currentScore = editingMarks[st.id] !== undefined ? editingMarks[st.id] : st.totalCia;
                  const hasError = validationErrors[st.id];

                  return (
                    <tr
                      key={st.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {st.roll}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {st.name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {st.cia1}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {st.cia2}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {st.modelExam}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {st.attendanceScore}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="25"
                            step="1"
                            disabled={isCourseLocked}
                            value={currentScore}
                            onChange={(e) => handleScoreChange(st.id, e.target.value)}
                            style={{
                              width: '64px',
                              textAlign: 'center',
                              padding: '0.35rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid',
                              borderColor: hasError ? 'var(--state-urgent)' : isCourseLocked ? 'var(--border-subtle)' : 'var(--border-strong)',
                              background: isCourseLocked ? 'var(--bg-subtle)' : 'var(--bg-canvas)',
                              color: isCourseLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          />
                          {hasError && (
                            <span style={{ fontSize: '0.625rem', color: 'var(--state-urgent)', marginTop: '2px' }}>
                              {hasError}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <span className={`badge ${isCourseLocked ? 'badge-success' : 'badge-warning'}`}>
                          {isCourseLocked ? 'Locked' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
