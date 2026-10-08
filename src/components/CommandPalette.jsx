import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  BookOpen,
  User,
  MapPin,
  Calendar,
  Zap,
  X,
  Shield,
  CreditCard,
  Briefcase,
  Award,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { useNivara } from '../context/NivaraContext';

export default function CommandPalette() {
  const {
    currentRole,
    authenticatedSession,
    commandPaletteOpen,
    setCommandPaletteOpen,
    switchRole,
    setActiveTab,
    setAuditLogOpen,
    coursesAttendance,
    assignments,
    students,
    facultyMembers,
    placementDrives,
    leaveRequests,
    departments,
    roomConflicts,
  } = useNivara();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Dynamically assemble search dataset contextual to role and system state
  const searchableItems = useMemo(() => {
    const items = [];

    // 1. Role-specific items
    if (currentRole === 'student') {
      // Courses
      coursesAttendance.forEach((c) => {
        items.push({
          id: `course-${c.code}`,
          title: `${c.name} (${c.code})`,
          subtitle: `${c.room} · ${c.faculty} · ${c.percentage}% Attendance`,
          category: 'Courses & Labs',
          icon: BookOpen,
          action: () => {
            setActiveTab('attendance');
            setCommandPaletteOpen(false);
          },
        });
        items.push({
          id: `room-${c.code}`,
          title: `${c.room}`,
          subtitle: `Class venue for ${c.code} (${c.name})`,
          category: 'Campus Facilities & Rooms',
          icon: MapPin,
          action: () => {
            setActiveTab('today');
            setCommandPaletteOpen(false);
          },
        });
        items.push({
          id: `fac-${c.faculty}`,
          title: c.faculty,
          subtitle: `Course Instructor for ${c.code}`,
          category: 'Faculty & Advisors',
          icon: User,
          action: () => {
            setActiveTab('today');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Assignments
      assignments.forEach((a) => {
        items.push({
          id: `asg-${a.id}`,
          title: a.title,
          subtitle: `${a.subject} · Due ${a.dueFormatted} · ${a.completed ? 'Completed' : 'Pending'}`,
          category: 'Assignments & Deliverables',
          icon: CheckSquare,
          action: () => {
            setActiveTab('assignments');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Fees
      items.push({
        id: 'nav-fees',
        title: 'Tuition Fee Payment Portal',
        subtitle: 'View pending semester dues, breakdown, and download verified receipts',
        category: 'Finance & Accounts',
        icon: CreditCard,
        action: () => {
          setActiveTab('fees');
          setCommandPaletteOpen(false);
        },
      });

      // Placements
      placementDrives.forEach((d) => {
        items.push({
          id: `drive-${d.id}`,
          title: `${d.company} — ${d.role}`,
          subtitle: `Package: ${d.packageLpa} · Deadline: ${d.deadline} · Min CGPA: ${d.minCgpa}`,
          category: 'Recruitment & Placements',
          icon: Briefcase,
          action: () => {
            setActiveTab('placement');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Leaves
      items.push({
        id: 'nav-leaves',
        title: 'Student Duty Leave Requests',
        subtitle: 'Apply for official duty, hackathon, or medical leave waivers',
        category: 'Approvals & Requests',
        icon: Calendar,
        action: () => {
          setActiveTab('leaves');
          setCommandPaletteOpen(false);
        },
      });

      // Exams & Results
      items.push({
        id: 'nav-exams',
        title: 'Exam Schedule & Hall Tickets',
        subtitle: 'Mid-semester timetables, assigned examination desks, and venues',
        category: 'Examinations',
        icon: Award,
        action: () => {
          setActiveTab('exams');
          setCommandPaletteOpen(false);
        },
      });
      items.push({
        id: 'nav-results',
        title: 'Academic Results & 8-Semester Journey',
        subtitle: 'Verified grade sheets, CGPA progression, and degree credit progress',
        category: 'Examinations',
        icon: Award,
        action: () => {
          setActiveTab('results');
          setCommandPaletteOpen(false);
        },
      });
    } else if (currentRole === 'faculty') {
      // Students
      students.forEach((s) => {
        items.push({
          id: `stud-${s.id}`,
          title: `${s.name} (${s.rollNo || s.id})`,
          subtitle: `${s.department} · Attendance: ${s.attendancePct}% · CGPA: ${s.cgpa}`,
          category: 'Students & Rosters',
          icon: User,
          action: () => {
            setActiveTab('attendance');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Courses
      coursesAttendance.forEach((c) => {
        items.push({
          id: `fac-course-${c.code}`,
          title: `${c.name} (${c.code}) Roster`,
          subtitle: `${c.room} · Rapid attendance taker and CIA moderation`,
          category: 'Assigned Courses',
          icon: BookOpen,
          action: () => {
            setActiveTab('attendance');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Assignments to grade
      assignments.forEach((a) => {
        items.push({
          id: `fac-asg-${a.id}`,
          title: `Grade: ${a.title}`,
          subtitle: `${a.submittedCount} submissions received · Weightage: ${a.weightage}`,
          category: 'Submissions & Grading',
          icon: CheckSquare,
          action: () => {
            setActiveTab('assignments');
            setCommandPaletteOpen(false);
          },
        });
      });
    } else if (currentRole === 'hod') {
      // At-risk students
      students
        .filter((s) => s.attendancePct < 75 || s.backlogs > 0)
        .forEach((s) => {
          items.push({
            id: `hod-risk-${s.id}`,
            title: `At-Risk: ${s.name} (${s.rollNo || s.id})`,
            subtitle: `Attendance: ${s.attendancePct}% (<75%) · Backlogs: ${s.backlogs}`,
            category: 'Academic Intervention',
            icon: AlertTriangle,
            action: () => {
              setActiveTab('at_risk');
              setCommandPaletteOpen(false);
            },
          });
        });

      // Faculty Workload
      facultyMembers.forEach((f) => {
        items.push({
          id: `hod-fac-${f.id}`,
          title: `${f.name} — ${f.designation}`,
          subtitle: `Workload: ${f.workloadHours} / ${f.maxHours} hrs/week · Rating: ${f.rating} ★`,
          category: 'Department Faculty',
          icon: User,
          action: () => {
            setActiveTab('faculty');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Leave approvals
      leaveRequests.forEach((l) => {
        items.push({
          id: `hod-leave-${l.id}`,
          title: `Leave Request: ${l.studentName}`,
          subtitle: `${l.days} days for: ${l.reason} (${l.status})`,
          category: 'Approvals Queue',
          icon: Calendar,
          action: () => {
            setActiveTab('approvals');
            setCommandPaletteOpen(false);
          },
        });
      });
    } else if (currentRole === 'admin') {
      // Departments
      departments.forEach((d) => {
        items.push({
          id: `admin-dept-${d.code}`,
          title: `${d.name} (${d.code})`,
          subtitle: `HOD: ${d.hod} · ${d.studentCount} Students · ${d.facultyCount} Faculty`,
          category: 'Academic Divisions',
          icon: Shield,
          action: () => {
            setActiveTab('structure');
            setCommandPaletteOpen(false);
          },
        });
      });

      // Conflicts
      roomConflicts.forEach((c) => {
        items.push({
          id: `admin-conf-${c.id}`,
          title: `Collision: ${c.title}`,
          subtitle: c.detail,
          category: 'Infrastructure Conflicts',
          icon: AlertTriangle,
          action: () => {
            setActiveTab('conflicts');
            setCommandPaletteOpen(false);
          },
        });
      });

      items.push({
        id: 'admin-users-mgmt',
        title: 'User Roles & RBAC Management',
        subtitle: 'Configure system permissions, user activations, and roles',
        category: 'Administration',
        icon: Shield,
        action: () => {
          setActiveTab('users');
          setCommandPaletteOpen(false);
        },
      });
    }

    // Role switches
    const roleItems = [
      { id: 'sw-stud', title: 'Switch to Student', subtitle: 'Student schedule, attendance, deliverables, and fees', category: 'Perspective Switch', icon: User, action: () => { switchRole('student'); setCommandPaletteOpen(false); } },
      { id: 'sw-fac', title: 'Switch to Faculty', subtitle: 'Roster attendance, assignment grading, CIA entry', category: 'Perspective Switch', icon: User, action: () => { switchRole('faculty'); setCommandPaletteOpen(false); } },
      { id: 'sw-hod', title: 'Switch to HOD', subtitle: 'Department metrics, at-risk alerts, leave approvals', category: 'Perspective Switch', icon: Award, action: () => { switchRole('hod'); setCommandPaletteOpen(false); } },
      { id: 'sw-prin', title: 'Switch to Principal', subtitle: 'Institutional overview, department radar, college broadcast', category: 'Perspective Switch', icon: Shield, action: () => { switchRole('principal'); setCommandPaletteOpen(false); } },
      { id: 'sw-adm', title: 'Switch to ERP Administrator', subtitle: 'Master structure, room collisions, system users', category: 'Perspective Switch', icon: Shield, action: () => { switchRole('admin'); setCommandPaletteOpen(false); } },
      { id: 'sw-exam', title: 'Switch to Exam Cell', subtitle: 'Examination schedules, seating rosters, publish results', category: 'Perspective Switch', icon: BookOpen, action: () => { switchRole('exam_cell'); setCommandPaletteOpen(false); } },
      { id: 'sw-fin', title: 'Switch to Finance', subtitle: 'Fee structures, student dues, payment verification ledger', category: 'Perspective Switch', icon: CreditCard, action: () => { switchRole('finance'); setCommandPaletteOpen(false); } },
      { id: 'sw-place', title: 'Switch to Placement Officer', subtitle: 'Recruitment drives, eligibility filters, applicant pipeline', category: 'Perspective Switch', icon: Briefcase, action: () => { switchRole('placement'); setCommandPaletteOpen(false); } },
    ];

    // Audit trail action
    items.push({
      id: 'act-audit',
      title: 'Open Synchronized Audit Trail',
      subtitle: 'Inspect real-time cryptographic log of cross-role transactions',
      category: 'System Actions',
      icon: Zap,
      action: () => {
        setAuditLogOpen(true);
        setCommandPaletteOpen(false);
      },
    });

    const isDevOrSandbox = Boolean(import.meta.env.DEV || authenticatedSession?.provider === 'developer_switch');
    return isDevOrSandbox ? [...items, ...roleItems] : items;
  }, [
    currentRole,
    authenticatedSession,
    coursesAttendance,
    assignments,
    students,
    facultyMembers,
    placementDrives,
    leaveRequests,
    departments,
    roomConflicts,
    switchRole,
    setActiveTab,
    setAuditLogOpen,
    setCommandPaletteOpen,
  ]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return searchableItems;
    const lower = query.toLowerCase();
    return searchableItems.filter((item) => {
      const target = `${item.title} ${item.subtitle || ''} ${item.category}`.toLowerCase();
      return target.includes(lower);
    });
  }, [query, searchableItems]);

  const handleKeyDownInBox = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Contextual Command Search Palette"
    >
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', gap: '0.75rem' }}>
          <Search size={16} color="var(--brand-blue)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInBox}
            placeholder={`Search ${currentRole} records, courses, people, venues, or switch perspective...`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px', minHeight: '24px' }}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setCommandPaletteOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.4rem' }}>
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Search size={28} color="var(--border-strong)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                No matching results found for "{query}"
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Try searching for course codes (e.g. CS301), instructor names, classrooms, or tasks.
              </div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-xs)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-hover)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--border-subtle)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-primary)',
                      flexShrink: 0,
                    }}>
                      <Icon size={14} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="badge badge-neutral" style={{ fontSize: '0.625rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{
          padding: '0.5rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span style={{ fontSize: '0.6875rem' }}>Showing contextual {currentRole} results</span>
        </div>
      </div>
    </div>
  );
}
