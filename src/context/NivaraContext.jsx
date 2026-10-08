import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginWithCredentials,
  logoutSession,
  getActiveSession,
  INSTITUTIONAL_ACCOUNTS,
} from '../services/authService';
import { dataService } from '../services/dataService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isValidModuleForRole, getDefaultModuleForRole } from '../data/navigationConfig';
import { can } from '../services/permissionService';

const NivaraContext = createContext();


export function useNivara() {
  const context = useContext(NivaraContext);
  if (!context) {
    throw new Error('useNivara must be used within a NivaraProvider');
  }
  return context;
}

const SYNC_CHANNEL_NAME = 'nivara_realtime_sync';

function getStoredOrFallback(key, fallback) {
  try {
    const val = localStorage.getItem(`nivara_db_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, val) {
  try {
    localStorage.setItem(`nivara_db_${key}`, JSON.stringify(val));
  } catch (e) {
    // safe fallback
  }
}

function broadcastSync(type, data) {
  try {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type, data, timestamp: Date.now() });
      channel.close();
    }
  } catch (e) {
    // safe fallback
  }
}

export function NivaraProvider({ children }) {
  // -------------------------------------------------------------
  // 1. ROLES DEFINITIONS & USER PROFILES
  // -------------------------------------------------------------
  const ROLES = [
    {
      id: 'student',
      label: 'Student',
      userName: 'Aadhi Narayanan',
      title: 'B.Tech AI & Data Science (III Year)',
      dept: 'AI & Data Science',
      email: 'aadhi.narayanan@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'faculty',
      label: 'Faculty',
      userName: 'Dr. Priya Raman',
      title: 'Associate Professor, CS & AI',
      dept: 'Computer Science & AI',
      email: 'priya.raman@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'hod',
      label: 'HOD',
      userName: 'Dr. K. Mohan',
      title: 'Head of Department, AI & DS',
      dept: 'AI & Data Science',
      email: 'k.mohan@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'principal',
      label: 'Principal / Dean',
      userName: 'Dr. Aris Thorne',
      title: 'Principal & Academic Dean',
      dept: 'Executive Council',
      email: 'principal@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'admin',
      label: 'ERP Administrator',
      userName: 'Admin Operations',
      title: 'System & Master Data Controller',
      dept: 'Campus Information Systems',
      email: 'admin.erp@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'exam_cell',
      label: 'Exam Cell',
      userName: 'Prof. V. Ramanathan',
      title: 'Controller of Examinations',
      dept: 'Academic Evaluation Office',
      email: 'exam.controller@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'finance',
      label: 'Finance & Accounts',
      userName: 'Mrs. S. Mythili',
      title: 'Senior Bursar & Accounts Officer',
      dept: 'Office of the Bursar',
      email: 'bursar.finance@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'placement',
      label: 'Placement Officer',
      userName: 'Dr. S. Kapoor',
      title: 'Dean of Corporate Relations & Placement',
      dept: 'Career Development Center',
      email: 'placement.cell@nivara.edu',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    },
  ];

  // Helper to parse role and tab from location hash with architecture validation
  const parseHashRoute = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return null;
    const parts = hash.split('/');
    const roleId = parts[0];
    const rawTabId = parts[1] || 'home';
    const isValidRole = ROLES.some((r) => r.id === roleId);
    if (isValidRole) {
      const validTab = isValidModuleForRole(roleId, rawTabId) ? rawTabId : getDefaultModuleForRole(roleId);
      return { role: roleId, tab: validTab };
    }
    return null;
  }, [ROLES]);

  const initialRoute = parseHashRoute();

  // Authentication session state
  const [authenticatedSession, setAuthenticatedSession] = useState(() => {
    return getActiveSession();
  });

  // Effective role is STRICTLY determined by authenticated session if active
  const initialSession = getActiveSession();
  const sessionRole = (initialSession?.user?.role && ROLES.some((r) => r.id === initialSession.user.role))
    ? initialSession.user.role
    : null;

  const resolvedInitialRole = sessionRole || (initialRoute && ROLES.some((r) => r.id === initialRoute.role) ? initialRoute.role : 'student');

  // Verify that initial requested route belongs to the user's role and is a valid module
  const isAuthorizedInitialTab = initialRoute && initialRoute.role === resolvedInitialRole && isValidModuleForRole(resolvedInitialRole, initialRoute.tab);
  const resolvedInitialTab = isAuthorizedInitialTab
    ? initialRoute.tab
    : getDefaultModuleForRole(resolvedInitialRole);

  // Active role
  const [currentRole, setCurrentRole] = useState(resolvedInitialRole);

  // Active navigation tab (persists on direct refresh, falls back to home on unauthorized URL)
  const [activeTab, setActiveTabState] = useState(resolvedInitialTab);

  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nivara_theme') || 'light';
  });

  // Offline mode simulation
  const [isOffline, setIsOffline] = useState(false);

  // UI state: Modals and Drawers
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast dispatcher
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize URL Hash when role or tab changes
  const setActiveTab = (tab) => {
    if (!isValidModuleForRole(currentRole, tab)) {
      tab = getDefaultModuleForRole(currentRole);
    }
    setActiveTabState(tab);
    window.location.hash = `#/${currentRole}/${tab}`;
  };

  // Real Login Method
  const login = async (email, password, remember = true) => {
    const result = await loginWithCredentials(email, password, remember);
    if (result.success) {
      setAuthenticatedSession(result.session);
      const userRole = result.session.user.role;
      setCurrentRole(userRole);
      const defaultTab = getDefaultModuleForRole(userRole);
      setActiveTabState(defaultTab);
      window.location.hash = `#/${userRole}/${defaultTab}`;
      showToast(`Welcome back, ${result.session.user.userName} (${userRole.toUpperCase()}) ✓`, 'success');
    }
    return result;
  };

  // Real Logout Method
  const logout = async () => {
    await logoutSession();
    setAuthenticatedSession(null);
    setCurrentRole('student');
    setActiveTabState('home');
    window.location.hash = '';
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    showToast('Signed out of session safely.', 'info');
  };

  // Development sandbox perspective switch (clearly isolated for testing)
  const switchRole = (newRole) => {
    const targetAccount = INSTITUTIONAL_ACCOUNTS.find((a) => a.role === newRole);
    if (targetAccount) {
      const mockSession = {
        token: `dev-token-${Date.now()}`,
        user: {
          id: `usr-${targetAccount.role}`,
          email: targetAccount.email,
          role: targetAccount.role,
          userName: targetAccount.userName,
          title: targetAccount.title,
          dept: targetAccount.dept,
          avatar: targetAccount.avatar,
          studentId: targetAccount.studentId,
          facultyId: targetAccount.facultyId,
        },
        provider: 'developer_switch',
      };
      localStorage.setItem('nivara_authenticated_session', JSON.stringify(mockSession));
      setAuthenticatedSession(mockSession);
      setCurrentRole(newRole);
      const defaultTab = getDefaultModuleForRole(newRole);
      setActiveTabState(defaultTab);
      window.location.hash = `#/${newRole}/${defaultTab}`;
      showToast(`[Dev Sandbox] Switched perspective to ${targetAccount.role.toUpperCase()}: ${targetAccount.userName}`, 'info');
    }
  };

  // Route Gate & Authorization Guard: handles direct address bar typing, Back, Forward, and refresh
  useEffect(() => {
    const enforceRouteGate = () => {
      const parsed = parseHashRoute();
      const activeRole = authenticatedSession?.user?.role || currentRole;

      if (!parsed) {
        // Normalize hash if empty or invalid
        window.location.hash = `#/${activeRole}/${activeTab}`;
        return;
      }

      // Check 1: Cross-role unauthorized access attempt
      if (authenticatedSession?.user?.role && parsed.role !== authenticatedSession.user.role) {
        const authorizedTab = getDefaultModuleForRole(authenticatedSession.user.role);
        window.location.hash = `#/${authenticatedSession.user.role}/${authorizedTab}`;
        showToast(
          `Access Restricted: Cannot access ${parsed.role.toUpperCase()} module with ${authenticatedSession.user.role.toUpperCase()} credentials. Redirected to workspace.`,
          'warning'
        );
        return;
      }

      // Check 2: Invalid module/tab within role
      if (!isValidModuleForRole(parsed.role, parsed.tab)) {
        const safeTab = getDefaultModuleForRole(parsed.role);
        window.location.hash = `#/${parsed.role}/${safeTab}`;
        showToast(`Module Not Found: Redirected to ${parsed.role} home.`, 'info');
        return;
      }

      // Synchronize valid route state
      if (parsed.role !== currentRole) {
        setCurrentRole(parsed.role);
      }
      if (parsed.tab !== activeTab) {
        setActiveTabState(parsed.tab);
      }
    };

    // Run immediately on boot to guard initial URL
    enforceRouteGate();

    // Listen to Back / Forward navigation and hash changes
    window.addEventListener('hashchange', enforceRouteGate);
    return () => window.removeEventListener('hashchange', enforceRouteGate);
  }, [authenticatedSession, currentRole, activeTab, parseHashRoute, showToast]);


  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('nivara_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Current active user metadata
  const currentUser = authenticatedSession?.user || ROLES.find((r) => r.id === currentRole) || ROLES[0];

  // -------------------------------------------------------------
  // CENTRALIZED SHARED DATA STORE
  // -------------------------------------------------------------

  // 1. Central Student Directory
  const [students, setStudents] = useState(() => getStoredOrFallback('students', [
    {
      id: '2024-AIDS-042',
      rollNo: '22AIDS042',
      name: 'Aadhi Narayanan',
      email: 'aadhi.narayanan@nivara.edu',
      department: 'AI & Data Science',
      deptCode: 'AIDS',
      year: '3rd Year',
      semester: 5,
      cgpa: 8.72,
      standing: 'Good Standing',
      attendancePct: 87,
      backlogs: 0,
      feeStatus: 'pending', // pending | paid
      feePendingAmount: 45000,
      feeDueDate: '15 Oct 2026',
      advisor: 'Dr. Priya Raman',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '2024-AIDS-014',
      rollNo: '22AIDS014',
      name: 'Kavin Venkatesh',
      email: 'kavin.v@nivara.edu',
      department: 'AI & Data Science',
      deptCode: 'AIDS',
      year: '3rd Year',
      semester: 5,
      cgpa: 6.95,
      standing: 'Academic Risk',
      attendancePct: 68, // Below 75% cutoff
      backlogs: 2,
      feeStatus: 'paid',
      feePendingAmount: 0,
      advisor: 'Dr. Priya Raman',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '2024-AIDS-003',
      rollNo: '22AIDS003',
      name: 'Arun Kumar',
      email: 'arun.k@nivara.edu',
      department: 'AI & Data Science',
      deptCode: 'AIDS',
      year: '3rd Year',
      semester: 5,
      cgpa: 9.15,
      standing: 'Dean List',
      attendancePct: 94,
      backlogs: 0,
      feeStatus: 'paid',
      feePendingAmount: 0,
      advisor: 'Dr. K. Mohan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '2024-AIDS-027',
      rollNo: '22AIDS027',
      name: 'Tanvi Saxena',
      email: 'tanvi.s@nivara.edu',
      department: 'AI & Data Science',
      deptCode: 'AIDS',
      year: '3rd Year',
      semester: 5,
      cgpa: 7.40,
      standing: 'Good Standing',
      attendancePct: 79,
      backlogs: 0,
      feeStatus: 'paid',
      feePendingAmount: 0,
      advisor: 'Prof. Ananya Sen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: '2024-CSE-102',
      rollNo: '22CSE102',
      name: 'Bhavana Patel',
      email: 'bhavana.p@nivara.edu',
      department: 'Computer Science',
      deptCode: 'CSE',
      year: '3rd Year',
      semester: 5,
      cgpa: 8.45,
      standing: 'Good Standing',
      attendancePct: 91,
      backlogs: 0,
      feeStatus: 'paid',
      feePendingAmount: 0,
      advisor: 'Dr. S. Rangan',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    },
  ]));

  // 2. Department Master Data (Shared across HOD, Principal, Admin)
  const [departments, setDepartments] = useState(() => getStoredOrFallback('departments', [
    {
      code: 'AIDS',
      name: 'Artificial Intelligence & Data Science',
      hod: 'Dr. K. Mohan',
      studentCount: 380,
      facultyCount: 24,
      attendancePct: 88.5,
      atRiskCount: 8,
      avgCgpa: 8.12,
      placedPct: 78,
    },
    {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      hod: 'Dr. S. Rangan',
      studentCount: 640,
      facultyCount: 38,
      attendancePct: 91.2,
      atRiskCount: 12,
      avgCgpa: 8.25,
      placedPct: 84,
    },
    {
      code: 'ECE',
      name: 'Electronics & Communication',
      hod: 'Dr. M. Chitra',
      studentCount: 510,
      facultyCount: 30,
      attendancePct: 89.6,
      atRiskCount: 15,
      avgCgpa: 7.85,
      placedPct: 72,
    },
    {
      code: 'MECH',
      name: 'Mechanical Engineering',
      hod: 'Dr. R. Natarajan',
      studentCount: 490,
      facultyCount: 28,
      attendancePct: 86.4,
      atRiskCount: 22,
      avgCgpa: 7.45,
      placedPct: 65,
    },
    {
      code: 'CIVIL',
      name: 'Civil Engineering',
      hod: 'Dr. V. Sundaram',
      studentCount: 462,
      facultyCount: 28,
      attendancePct: 87.8,
      atRiskCount: 18,
      avgCgpa: 7.60,
      placedPct: 61,
    },
  ]));

  // 3. Central Attendance Sessions (Synchronized: Faculty -> Student -> HOD -> Principal)
  const [coursesAttendance, setCoursesAttendance] = useState(() => getStoredOrFallback('coursesAttendance', [
    {
      id: 'sub-dsa',
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      faculty: 'Dr. Priya Raman',
      deptCode: 'AIDS',
      attended: 23,
      total: 25,
      percentage: 92,
      nextClass: 'Today · 10:00 AM · Lab 2',
      room: 'Computing Lab 2 (Block B)',
      safeToMiss: 5,
      canMissExplanation: 'You can safely miss up to 5 more classes before dropping below the 75% cutoff threshold.',
    },
    {
      id: 'sub-dbms',
      code: 'CS304',
      name: 'Database Management Systems',
      faculty: 'Dr. K. Mohan',
      deptCode: 'AIDS',
      attended: 19,
      total: 22,
      percentage: 86,
      nextClass: 'Today · 02:00 PM · Room B104',
      room: 'Room B104',
      safeToMiss: 3,
      canMissExplanation: 'You can safely miss up to 3 more classes before dropping below the 75% cutoff threshold.',
    },
    {
      id: 'sub-oop',
      code: 'CS302',
      name: 'Object-Oriented Programming (Java)',
      faculty: 'Prof. Ananya Sen',
      deptCode: 'AIDS',
      attended: 18,
      total: 23,
      percentage: 78,
      nextClass: 'Thursday · 10:30 AM · Room C302',
      room: 'Room C302',
      safeToMiss: 1, // Alert
      canMissExplanation: 'Warning: You can only miss 1 more class before dropping below 75% and triggering an attendance lock.',
    },
    {
      id: 'sub-dm',
      code: 'MA301',
      name: 'Discrete Structures',
      faculty: 'Prof. S. Venkatesh',
      deptCode: 'AIDS',
      attended: 20,
      total: 22,
      percentage: 91,
      nextClass: 'Tomorrow · 08:30 AM · Room A204',
      room: 'Room A204',
      safeToMiss: 4,
      canMissExplanation: 'You can safely miss up to 4 more classes before dropping below the 75% cutoff threshold.',
    },
    {
      id: 'sub-ml',
      code: 'AI302',
      name: 'Machine Learning Foundations Lab',
      faculty: 'Dr. Rajesh K.',
      deptCode: 'AIDS',
      attended: 19,
      total: 20,
      percentage: 95,
      nextClass: 'Friday · 02:00 PM · AI Lab 1',
      room: 'AI Lab 1',
      safeToMiss: 5,
      canMissExplanation: 'Outstanding consistency. You have 5 safe misses remaining without affecting exam eligibility.',
    },
  ]));

  // Faculty Class Roster for Data Structures (CS301)
  const [facultyRoster, setFacultyRoster] = useState(() => getStoredOrFallback('facultyRoster', [
    { id: '2024-AIDS-001', roll: '22AIDS001', name: 'Aarav Sharma', status: 'present' },
    { id: '2024-AIDS-002', roll: '22AIDS002', name: 'Ananya Iyer', status: 'present' },
    { id: '2024-AIDS-003', roll: '22AIDS003', name: 'Arun Kumar', status: 'present' },
    { id: '2024-AIDS-014', roll: '22AIDS014', name: 'Kavin Venkatesh', status: 'absent' },
    { id: '2024-AIDS-018', roll: '22AIDS018', name: 'Naveen Roy', status: 'absent' },
    { id: '2024-AIDS-027', roll: '22AIDS027', name: 'Tanvi Saxena', status: 'absent' },
    { id: '2024-AIDS-042', roll: '22AIDS042', name: 'Aadhi Narayanan', status: 'present' },
  ]));

  // 4. Assignments & Submissions
  const [assignments, setAssignments] = useState(() => getStoredOrFallback('assignments', [
    {
      id: 'asg-1',
      title: 'C++ Graph Traversal & Dijkstra Algorithm',
      subject: 'Data Structures (CS301)',
      courseCode: 'CS301',
      dueFormatted: 'Tomorrow · 11:59 PM',
      dueTimestamp: '2026-10-08T23:59:00',
      urgency: 'urgent',
      progress: 80,
      completed: false, // Student completion status
      faculty: 'Dr. Priya Raman',
      totalEnrolled: 28,
      submittedCount: 24,
      gradedCount: 18,
      weightage: '10% of Internal Mark',
      brief: 'Implement Dijkstra shortest path using min-heap. Include benchmarks on a graph with 10k vertices.',
      submissions: [
        { studentId: '2024-AIDS-042', studentName: 'Aadhi Narayanan', status: 'pending', submittedAt: null, grade: null, feedback: null },
        { studentId: '2024-AIDS-003', studentName: 'Arun Kumar', status: 'graded', submittedAt: 'Yesterday', grade: '20 / 20', feedback: 'Perfect adjacency list implementation.' },
        { studentId: '2024-AIDS-014', studentName: 'Kavin Venkatesh', status: 'submitted', submittedAt: '2 hours ago', grade: null, feedback: null },
      ],
    },
    {
      id: 'asg-2',
      title: 'DBMS B+ Tree Indexing & Query Tuning',
      subject: 'Database Management (CS304)',
      courseCode: 'CS304',
      dueFormatted: 'Friday · 05:00 PM',
      dueTimestamp: '2026-10-10T17:00:00',
      urgency: 'important',
      progress: 40,
      completed: false,
      faculty: 'Dr. K. Mohan',
      totalEnrolled: 28,
      submittedCount: 14,
      gradedCount: 0,
      weightage: '5% of Internal Mark',
      brief: 'Compare query plan execution cost before and after B+ tree composite indexing on 500k rows.',
      submissions: [
        { studentId: '2024-AIDS-042', studentName: 'Aadhi Narayanan', status: 'pending', submittedAt: null, grade: null, feedback: null },
      ],
    },
    {
      id: 'asg-3',
      title: 'Discrete Math Proof Set: Recurrence Relations',
      subject: 'Mathematics III (MA301)',
      courseCode: 'MA301',
      dueFormatted: 'Monday · 09:00 AM',
      dueTimestamp: '2026-10-13T09:00:00',
      urgency: 'normal',
      progress: 15,
      completed: false,
      faculty: 'Prof. S. Venkatesh',
      totalEnrolled: 28,
      submittedCount: 6,
      gradedCount: 0,
      weightage: 'Problem Set #4',
      brief: 'Prove master theorem cases for non-polynomial subproblem growths.',
      submissions: [],
    },
    {
      id: 'asg-4',
      title: 'Linear Regression from Scratch with NumPy',
      subject: 'Machine Learning (AI302)',
      courseCode: 'AI302',
      dueFormatted: 'Submitted Oct 4',
      dueTimestamp: '2026-10-04T12:00:00',
      urgency: 'completed',
      progress: 100,
      completed: true,
      grade: '19 / 20',
      faculty: 'Dr. Rajesh K.',
      totalEnrolled: 28,
      submittedCount: 28,
      gradedCount: 28,
      brief: 'Vectorized gradient descent implementation and learning curve visualization.',
      feedback: 'Clean vectorization and excellent learning curve analysis.',
      submissions: [
        { studentId: '2024-AIDS-042', studentName: 'Aadhi Narayanan', status: 'graded', submittedAt: '04 Oct 2026', grade: '19 / 20', feedback: 'Clean vectorization and excellent learning curve analysis.' },
      ],
    },
  ]));

  // 5. Internal Assessment Marks
  const [internalMarks, setInternalMarks] = useState(() => getStoredOrFallback('internalMarks', [
    { courseCode: 'CS301', subject: 'Data Structures & Algorithms', maxMark: 25, scoredMark: 23, status: 'locked', enteredBy: 'Dr. Priya Raman' },
    { courseCode: 'CS304', subject: 'Database Management Systems', maxMark: 25, scoredMark: 21, status: 'locked', enteredBy: 'Dr. K. Mohan' },
    { courseCode: 'CS302', subject: 'Object Oriented Programming', maxMark: 25, scoredMark: 19, status: 'locked', enteredBy: 'Prof. Ananya Sen' },
    { courseCode: 'MA301', subject: 'Discrete Mathematics', maxMark: 25, scoredMark: 24, status: 'locked', enteredBy: 'Prof. S. Venkatesh' },
    { courseCode: 'AI302', subject: 'Machine Learning Foundations Lab', maxMark: 25, scoredMark: 24, status: 'draft', enteredBy: 'Dr. Rajesh K.' },
  ]));

  // 6. Examination Sessions & Hall Tickets
  const [examSessions, setExamSessions] = useState(() => getStoredOrFallback('examSessions', [
    {
      id: 'ex-1',
      subject: 'Database Management Systems',
      code: 'CS304',
      examType: 'Mid-Semester Internal II',
      dateFormatted: '18 Oct 2026',
      day: 'Saturday',
      time: '10:00 AM – 12:00 PM',
      venue: 'Block B · Examination Hall 2',
      seatingSeat: 'Desk B-14',
      daysRemaining: 11,
      resultsPublished: false,
    },
    {
      id: 'ex-2',
      subject: 'Data Structures & Algorithms',
      code: 'CS301',
      examType: 'Practical Lab Assessment',
      dateFormatted: '22 Oct 2026',
      day: 'Wednesday',
      time: '02:00 PM – 05:00 PM',
      venue: 'Computing Center 3',
      seatingSeat: 'Terminal CC3-28',
      daysRemaining: 15,
      resultsPublished: false,
    },
    {
      id: 'ex-3',
      subject: 'Discrete Mathematics',
      code: 'MA301',
      examType: 'Mid-Semester Internal II',
      dateFormatted: '28 Oct 2026',
      day: 'Tuesday',
      time: '09:30 AM – 11:30 AM',
      venue: 'Main Academic Auditorium',
      seatingSeat: 'Hall Desk M-42',
      daysRemaining: 21,
      resultsPublished: false,
    },
  ]));

  const [publishedResults, setPublishedResults] = useState(() => getStoredOrFallback('publishedResults', {
    semester: 4,
    status: 'published', // 'published' | 'under_moderation'
    publishedAt: '15 Aug 2026',
    overallCgpa: 8.72,
    creditsEarned: 82,
    departmentPassPct: 94.2,
  }));

  // 7. Finance & Fees
  const [feeStructures, setFeeStructures] = useState(() => getStoredOrFallback('feeStructures', [
    {
      id: 'fee-sem5',
      name: 'Autumn 2026 Semester 5 Tuition & Lab Dues',
      department: 'AI & Data Science',
      amount: 45000,
      dueDate: '15 Oct 2026',
      totalBilled: 17100000,
      totalCollected: 14850000,
      studentsPaidCount: 330,
      studentsPendingCount: 50,
    },
    {
      id: 'fee-exam',
      name: 'Mid-Term Assessment Examination Fee',
      department: 'All Departments',
      amount: 2500,
      dueDate: '10 Oct 2026',
      totalBilled: 6205000,
      totalCollected: 5800000,
      studentsPaidCount: 2320,
      studentsPendingCount: 162,
    },
  ]));

  const [paymentHistory, setPaymentHistory] = useState(() => getStoredOrFallback('paymentHistory', [
    {
      id: 'pay-2026-081',
      description: 'Semester 4 Tuition & Academic Fees',
      amount: 45000,
      paidOn: '14 Jan 2026',
      receiptNo: 'REC-2026-NIV-8921',
      status: 'verified',
    },
  ]));

  // 8. Placement Opportunities & Applications
  const [placementDrives, setPlacementDrives] = useState(() => getStoredOrFallback('placementDrives', [
    {
      id: 'drive-1',
      company: 'Google DeepMind & Systems',
      role: 'Research Software Engineer',
      packageLpa: '28 - 34 LPA',
      location: 'Bangalore / Hybrid',
      minCgpa: 8.5,
      allowedBacklogs: 0,
      deadline: '16 Oct 2026',
      status: 'active',
      eligibleCount: 42,
      appliedCount: 28,
      selectedCount: 4,
      departmentTarget: ['AIDS', 'CSE'],
      description: 'Frontier AI engineering, distributed neural kernels, and multimodal model infrastructure.',
    },
    {
      id: 'drive-2',
      company: 'Tetravate Engineering Labs',
      role: 'Product Systems Architect',
      packageLpa: '22 - 26 LPA',
      location: 'Chennai / Remote',
      minCgpa: 8.0,
      allowedBacklogs: 0,
      deadline: '20 Oct 2026',
      status: 'active',
      eligibleCount: 88,
      appliedCount: 52,
      selectedCount: 8,
      departmentTarget: ['AIDS', 'CSE', 'ECE'],
      description: 'Engineering resilient consumer SaaS platforms and synchronized distributed operating systems.',
    },
    {
      id: 'drive-3',
      company: 'Microsoft Azure Core',
      role: 'Cloud Infrastructure Associate',
      packageLpa: '20 - 24 LPA',
      location: 'Hyderabad',
      minCgpa: 7.5,
      allowedBacklogs: 0,
      deadline: '25 Oct 2026',
      status: 'active',
      eligibleCount: 195,
      appliedCount: 110,
      selectedCount: 12,
      departmentTarget: ['AIDS', 'CSE', 'ECE', 'MECH'],
      description: 'Hyper-scale cloud virtualization, distributed storage systems, and Linux performance tuning.',
    },
  ]));

  const [studentPlacementApplications, setStudentPlacementApplications] = useState(() => getStoredOrFallback('studentPlacementApplications', [
    {
      driveId: 'drive-2',
      studentId: '2024-AIDS-042',
      studentName: 'Aadhi Narayanan',
      company: 'Tetravate Engineering Labs',
      role: 'Product Systems Architect',
      appliedAt: '05 Oct 2026',
      stage: 'Shortlisted for Technical Round',
      status: 'active',
    },
  ]));

  // 9. Leave Requests (Student -> Faculty / HOD -> Attendance)
  const [leaveRequests, setLeaveRequests] = useState(() => getStoredOrFallback('leaveRequests', [
    {
      id: 'leave-1',
      studentId: '2024-AIDS-042',
      studentName: 'Aadhi Narayanan',
      department: 'AI & Data Science',
      reason: 'Representing University at Inter-Collegiate AI Hackathon in Bangalore',
      startDate: '11 Oct 2026',
      endDate: '12 Oct 2026',
      days: 2,
      status: 'approved',
      approvedBy: 'Dr. K. Mohan (HOD)',
      dutyAttendanceGranted: true,
    },
    {
      id: 'leave-2',
      studentId: '2024-AIDS-014',
      studentName: 'Kavin Venkatesh',
      department: 'AI & Data Science',
      reason: 'Medical Leave - Viral fever under physician care',
      startDate: '08 Oct 2026',
      endDate: '09 Oct 2026',
      days: 2,
      status: 'pending',
      approvedBy: null,
      dutyAttendanceGranted: false,
    },
  ]));

  // 10. Audit Activity Trail
  const [auditLogs, setAuditLogs] = useState(() => getStoredOrFallback('auditLogs', [
    {
      id: 'log-1',
      timestamp: 'Today · 09:30 AM',
      actorRole: 'Faculty',
      actorName: 'Dr. Priya Raman',
      action: 'Recorded Lecture Attendance',
      details: 'Data Structures CS301 (25 Present, 3 Absent) — Synced to Student & HOD dashboards.',
    },
    {
      id: 'log-2',
      timestamp: 'Yesterday · 04:15 PM',
      actorRole: 'Placement Officer',
      actorName: 'Dr. S. Kapoor',
      action: 'Published Placement Drive',
      details: 'Google DeepMind & Systems drive opened for 42 eligible AIDS/CSE students.',
    },
    {
      id: 'log-3',
      timestamp: '05 Oct 2026 · 11:20 AM',
      actorRole: 'HOD',
      actorName: 'Dr. K. Mohan',
      action: 'Approved Duty Leave',
      details: 'Approved 2 days On-Duty leave for Aadhi Narayanan (Hackathon delegation).',
    },
    {
      id: 'log-4',
      timestamp: '04 Oct 2026 · 02:45 PM',
      actorRole: 'Finance',
      actorName: 'Mrs. S. Mythili',
      action: 'Verified Student Fee Receipts',
      details: 'Reconciled 142 tuition fee transactions for Autumn 2026.',
    },
  ]));

  // 11. Cross-Role Shared Notifications
  const [notifications, setNotifications] = useState(() => getStoredOrFallback('notifications', [
    {
      id: 'notif-1',
      recipientRole: 'student',
      title: 'C++ Assignment Due Tomorrow',
      message: 'Dr. Priya Raman: Graph Traversal implementation due at 11:59 PM.',
      timeAgo: '2 hours ago',
      unread: true,
      tier: 'urgent',
      actionTab: 'assignments',
    },
    {
      id: 'notif-2',
      recipientRole: 'student',
      title: 'Fee Payment Reminder',
      message: 'Finance Office: Semester 5 dues (₹45,000) are due by 15 Oct.',
      timeAgo: '5 hours ago',
      unread: true,
      tier: 'important',
      actionTab: 'fees',
    },
    {
      id: 'notif-3',
      recipientRole: 'hod',
      title: 'New Student Leave Request',
      message: 'Kavin Venkatesh (AIDS) submitted medical leave awaiting approval.',
      timeAgo: '1 hour ago',
      unread: true,
      tier: 'important',
      actionTab: 'leaves',
    },
    {
      id: 'notif-4',
      recipientRole: 'principal',
      title: 'Room Collision Resolved',
      message: 'Timetable Cell reallocated Hall B204 for Thursday lecture.',
      timeAgo: '3 hours ago',
      unread: false,
      tier: 'updates',
      actionTab: 'departments',
    },
  ]));

  // 12. Faculty Workload & Department Staff
  const [facultyMembers, setFacultyMembers] = useState(() => getStoredOrFallback('facultyMembers', [
    {
      id: 'fac-1',
      name: 'Dr. Priya Raman',
      dept: 'AI & Data Science',
      designation: 'Associate Professor',
      workloadHours: 16,
      maxHours: 18,
      courses: ['CS301 (Data Structures)', 'AI302 (ML Lab)'],
      rating: 4.8,
      compliancePct: 98,
    },
    {
      id: 'fac-2',
      name: 'Dr. K. Mohan',
      dept: 'AI & Data Science',
      designation: 'Professor & HOD',
      workloadHours: 12,
      maxHours: 14,
      courses: ['CS304 (Database Systems)'],
      rating: 4.9,
      compliancePct: 100,
    },
    {
      id: 'fac-3',
      name: 'Prof. Ananya Sen',
      dept: 'AI & Data Science',
      designation: 'Assistant Professor',
      workloadHours: 18,
      maxHours: 18,
      courses: ['CS302 (OOP Java)'],
      rating: 4.6,
      compliancePct: 94,
    },
    {
      id: 'fac-4',
      name: 'Prof. S. Venkatesh',
      dept: 'AI & Data Science',
      designation: 'Assistant Professor (Math)',
      workloadHours: 16,
      maxHours: 18,
      courses: ['MA301 (Discrete Math)'],
      rating: 4.7,
      compliancePct: 96,
    },
  ]));

  // 13. System Users (for Admin RBAC)
  const [systemUsers, setSystemUsers] = useState(() => getStoredOrFallback('systemUsers', [
    { id: 'usr-1', name: 'Aadhi Narayanan', email: 'aadhi.narayanan@nivara.edu', role: 'student', dept: 'AI & Data Science', status: 'active' },
    { id: 'usr-2', name: 'Dr. Priya Raman', email: 'priya.raman@nivara.edu', role: 'faculty', dept: 'AI & Data Science', status: 'active' },
    { id: 'usr-3', name: 'Dr. K. Mohan', email: 'k.mohan@nivara.edu', role: 'hod', dept: 'AI & Data Science', status: 'active' },
    { id: 'usr-4', name: 'Dr. Aris Thorne', email: 'principal@nivara.edu', role: 'principal', dept: 'Executive Council', status: 'active' },
    { id: 'usr-5', name: 'Admin Operations', email: 'admin.erp@nivara.edu', role: 'admin', dept: 'Campus Information Systems', status: 'active' },
    { id: 'usr-6', name: 'Prof. V. Ramanathan', email: 'exam.controller@nivara.edu', role: 'exam_cell', dept: 'Academic Evaluation Office', status: 'active' },
    { id: 'usr-7', name: 'Mrs. S. Mythili', email: 'bursar.finance@nivara.edu', role: 'finance', dept: 'Office of the Bursar', status: 'active' },
    { id: 'usr-8', name: 'Dr. S. Kapoor', email: 'placement.cell@nivara.edu', role: 'placement', dept: 'Career Development Center', status: 'active' },
    { id: 'usr-9', name: 'Kavin Venkatesh', email: 'kavin.v@nivara.edu', role: 'student', dept: 'AI & Data Science', status: 'active' },
    { id: 'usr-10', name: 'Tanvi Saxena', email: 'tanvi.s@nivara.edu', role: 'student', dept: 'AI & Data Science', status: 'active' },
  ]));

  // 14. Room Conflicts (for Admin)
  const [roomConflicts, setRoomConflicts] = useState(() => getStoredOrFallback('roomConflicts', [
    {
      id: 'conf-1',
      title: 'Classroom Double-Booking Collision',
      detail: 'Room B204 is booked by both AI Lab (AIDS) and ECE Seminar on Thursday 11:30 AM.',
      severity: 'urgent',
      venue: 'Room B204',
      timeSlot: 'Thursday 11:30 AM',
    },
    {
      id: 'conf-2',
      title: 'Elective Course Capacity Cap Reached',
      detail: 'Cloud Architecture CS308 has 65 registrations against 60 maximum seat capacity.',
      severity: 'important',
      venue: 'Lecture Hall 4',
      timeSlot: 'Friday 02:00 PM',
    },
  ]));

  // 15. Study Materials
  const [studyMaterials, setStudyMaterials] = useState(() => getStoredOrFallback('studyMaterials', [
    {
      id: 'mat-1',
      title: 'Lecture Slides: Graph Algorithms & Minimum Spanning Trees',
      courseCode: 'CS301',
      courseName: 'Data Structures & Algorithms',
      uploadedBy: 'Dr. Priya Raman',
      uploadedAt: '03 Oct 2026',
      fileType: 'PDF Document (4.2 MB)',
      downloads: 48,
    },
    {
      id: 'mat-2',
      title: 'B+ Tree Indexing Query Optimization Cheatsheet',
      courseCode: 'CS304',
      courseName: 'Database Management Systems',
      uploadedBy: 'Dr. K. Mohan',
      uploadedAt: '01 Oct 2026',
      fileType: 'Markdown & SQL Samples (1.8 MB)',
      downloads: 36,
    },
    {
      id: 'mat-3',
      title: 'Recurrence Relations & Master Theorem Practice Set',
      courseCode: 'MA301',
      courseName: 'Discrete Structures',
      uploadedBy: 'Prof. S. Venkatesh',
      uploadedAt: '28 Sep 2026',
      fileType: 'Problem Set PDF (2.1 MB)',
      downloads: 41,
    },
  ]));

  // 16. System Settings
  const [systemSettings, setSystemSettings] = useState(() => getStoredOrFallback('systemSettings', {
    minAttendanceCutoff: 75,
    academicTerm: 'Autumn Semester 2026',
    gracePeriodDays: 10,
    maintenanceMode: false,
    autoLockCIA: true,
  }));

  // 17. Unified Multi-Role Timetable Entries
  const [timetableEntries, setTimetableEntries] = useState(() => getStoredOrFallback('timetableEntries', [
    {
      id: 'tt-1',
      courseCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      facultyName: 'Dr. Priya Raman',
      sectionCode: 'AIDS-A-SEM5',
      deptCode: 'AIDS',
      dayOfWeek: 'Monday',
      timeSlot: '08:30 AM – 10:00 AM',
      startTime: '08:30:00',
      endTime: '10:00:00',
      room: 'Room A204',
      isLab: false,
    },
    {
      id: 'tt-2',
      courseCode: 'AI302',
      subjectName: 'Machine Learning Foundations Lab',
      facultyName: 'Dr. Rajesh K.',
      sectionCode: 'AIDS-A-SEM5',
      deptCode: 'AIDS',
      dayOfWeek: 'Monday',
      timeSlot: '10:15 AM – 12:45 PM',
      startTime: '10:15:00',
      endTime: '12:45:00',
      room: 'AI Computing Lab 1',
      isLab: true,
    },
    {
      id: 'tt-3',
      courseCode: 'MA301',
      subjectName: 'Discrete Mathematics & Graph Theory',
      facultyName: 'Prof. S. Venkatesh',
      sectionCode: 'AIDS-A-SEM5',
      deptCode: 'AIDS',
      dayOfWeek: 'Tuesday',
      timeSlot: '09:00 AM – 10:30 AM',
      startTime: '09:00:00',
      endTime: '10:30:00',
      room: 'Room A204',
      isLab: false,
    },
    {
      id: 'tt-4',
      courseCode: 'CS304',
      subjectName: 'Database Management Systems',
      facultyName: 'Dr. K. Mohan',
      sectionCode: 'AIDS-A-SEM5',
      deptCode: 'AIDS',
      dayOfWeek: 'Tuesday',
      timeSlot: '11:00 AM – 12:30 PM',
      startTime: '11:00:00',
      endTime: '12:30:00',
      room: 'Room B102',
      isLab: false,
    },
    {
      id: 'tt-5',
      courseCode: 'CS302',
      subjectName: 'Object Oriented Programming with Java',
      facultyName: 'Prof. Ananya Sen',
      sectionCode: 'AIDS-A-SEM5',
      deptCode: 'AIDS',
      dayOfWeek: 'Wednesday',
      timeSlot: '08:30 AM – 10:00 AM',
      startTime: '08:30:00',
      endTime: '10:00:00',
      room: 'Room A204',
      isLab: false,
    },
  ]));

  // 18. Extended Course Materials
  const [courseMaterials, setCourseMaterials] = useState(() => getStoredOrFallback('courseMaterials', [
    {
      id: 'mat-1',
      courseCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      title: 'Lecture Slides: Graph Algorithms & Minimum Spanning Trees',
      description: 'Complete slide deck on Prim, Kruskal, and Dijkstra complexity proofs.',
      facultyName: 'Dr. Priya Raman',
      materialType: 'lecture_notes',
      fileName: 'cs301_graphs_mst.pdf',
      fileUrl: 'https://nivara-storage.local/courseware/cs301_graphs_mst.pdf',
      fileSizeKb: 4200,
      visibility: 'enrolled_class',
      sectionCode: 'AIDS-A-SEM5',
      uploadedAt: '03 Oct 2026',
      downloads: 48,
    },
    {
      id: 'mat-2',
      courseCode: 'CS304',
      subjectName: 'Database Management Systems',
      title: 'B+ Tree Indexing Query Optimization Cheatsheet',
      description: 'Composite indexing heuristics and PostgreSQL EXPLAIN ANALYZE walkthrough.',
      facultyName: 'Dr. K. Mohan',
      materialType: 'cheatsheet',
      fileName: 'cs304_bplus_trees.pdf',
      fileUrl: 'https://nivara-storage.local/courseware/cs304_bplus_trees.pdf',
      fileSizeKb: 1800,
      visibility: 'enrolled_class',
      sectionCode: 'AIDS-A-SEM5',
      uploadedAt: '01 Oct 2026',
      downloads: 36,
    },
    {
      id: 'mat-3',
      courseCode: 'MA301',
      subjectName: 'Discrete Mathematics',
      title: 'Recurrence Relations & Master Theorem Practice Set',
      description: 'Homework and practice problem set with worked solutions for divide-and-conquer recurrences.',
      facultyName: 'Prof. S. Venkatesh',
      materialType: 'problem_set',
      fileName: 'ma301_recurrence_set.pdf',
      fileUrl: 'https://nivara-storage.local/courseware/ma301_recurrence_set.pdf',
      fileSizeKb: 2100,
      visibility: 'department',
      sectionCode: 'AIDS-A-SEM5',
      uploadedAt: '28 Sep 2026',
      downloads: 41,
    },
  ]));

  // 19. Examination Revaluation Pipeline
  const [revaluationRequests, setRevaluationRequests] = useState(() => getStoredOrFallback('revaluationRequests', [
    {
      id: 'rev-1',
      studentId: '2024-AIDS-042',
      rollNo: '22AIDS042',
      studentName: 'Aadhi Narayanan',
      courseCode: 'CS302',
      subjectName: 'Object Oriented Programming',
      semester: 4,
      originalGrade: 'B+',
      originalMarks: 72,
      reason: 'Discrepancy in Question 4b recursion trace valuation; request re-totaling and reassessment of Part B answer script.',
      status: 'under_review',
      updatedMarks: null,
      updatedGrade: null,
      reviewedBy: 'Prof. V. Ramanathan',
      submittedAt: '02 Oct 2026',
    },
    {
      id: 'rev-2',
      studentId: '2024-AIDS-014',
      rollNo: '22AIDS014',
      studentName: 'Kavin Venkatesh',
      courseCode: 'MA301',
      subjectName: 'Discrete Mathematics',
      semester: 4,
      originalGrade: 'C',
      originalMarks: 58,
      reason: 'Part A Question 2 graph theory theorem statement was penalized despite citing correct standard lemma.',
      status: 'submitted',
      updatedMarks: null,
      updatedGrade: null,
      reviewedBy: null,
      submittedAt: '05 Oct 2026',
    },
  ]));

  // 20. Scholarships & Fee Concessions
  const [feeConcessions, setFeeConcessions] = useState(() => getStoredOrFallback('feeConcessions', [
    {
      id: 'conc-1',
      studentId: '2024-AIDS-003',
      studentName: 'Arun Kumar',
      category: 'Merit Academic Dean Scholarship (Top 1% Department Rank)',
      amount: 25000,
      status: 'sanctioned',
      sanctionedBy: 'Mrs. S. Mythili (Accounts Bursar)',
      academicYear: '2026-2027',
    },
    {
      id: 'conc-2',
      studentId: '2024-AIDS-042',
      studentName: 'Aadhi Narayanan',
      category: 'State Sports & Technical Hackathon Excellence Concession',
      amount: 10000,
      status: 'sanctioned',
      sanctionedBy: 'Dr. Aris Thorne (Principal)',
      academicYear: '2026-2027',
    },
  ]));

  // 21. Multi-Tier Announcements
  const [announcements, setAnnouncements] = useState(() => getStoredOrFallback('announcements', [
    {
      id: 'anc-1',
      title: 'Autonomous Mid-Semester Examination Schedule Published',
      content: 'Autonomous Mid-Semester II schedules for all 3rd Year B.Tech cohorts are verified and uploaded to student portals.',
      scope: 'institutional',
      targetDept: 'ALL',
      targetSection: 'ALL',
      targetRole: 'ALL',
      priority: 'high',
      publishedBy: 'Prof. V. Ramanathan',
      publishedRole: 'exam_cell',
      publishedAt: 'Today · 09:15 AM',
    },
    {
      id: 'anc-2',
      title: 'Autumn 2026 Tuition Fee Settlement Grace Window',
      content: 'Students with pending Semester 5 dues are advised to complete online reconciliation before 15 October 2026 to avoid hall ticket holds.',
      scope: 'institutional',
      targetDept: 'ALL',
      targetSection: 'ALL',
      targetRole: 'student',
      priority: 'high',
      publishedBy: 'Mrs. S. Mythili',
      publishedRole: 'finance',
      publishedAt: 'Yesterday · 04:30 PM',
    },
    {
      id: 'anc-3',
      title: 'Campus Recruitment Drive: Google DeepMind & Systems',
      content: 'Eligible 3rd and 4th Year AIDS and CSE students (CGPA >= 8.5, 0 backlogs) can register on the placement portal by 16 October.',
      scope: 'department',
      targetDept: 'AIDS',
      targetSection: 'ALL',
      targetRole: 'student',
      priority: 'high',
      publishedBy: 'Dr. S. Kapoor',
      publishedRole: 'placement',
      publishedAt: '05 Oct 2026 · 11:00 AM',
    },
  ]));

  // -------------------------------------------------------------
  // REAL-TIME MULTI-TAB / CONCURRENT SESSION SYNCHRONIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);

    const onMessage = (event) => {
      const { type, data } = event.data || {};
      if (!type || !data) return;

      if (type === 'SYNC_ATTENDANCE') {
        if (data.coursesAttendance) setCoursesAttendance(data.coursesAttendance);
        if (data.students) setStudents(data.students);
        if (data.departments) setDepartments(data.departments);
        if (data.facultyRoster) setFacultyRoster(data.facultyRoster);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_ASSIGNMENTS') {
        if (data.assignments) setAssignments(data.assignments);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_LEAVES') {
        if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
        if (data.students) setStudents(data.students);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_FEES') {
        if (data.students) setStudents(data.students);
        if (data.feeStructures) setFeeStructures(data.feeStructures);
        if (data.paymentHistory) setPaymentHistory(data.paymentHistory);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_PLACEMENTS') {
        if (data.placementDrives) setPlacementDrives(data.placementDrives);
        if (data.studentPlacementApplications) setStudentPlacementApplications(data.studentPlacementApplications);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_EXAMS') {
        if (data.publishedResults) setPublishedResults(data.publishedResults);
        if (data.internalMarks) setInternalMarks(data.internalMarks);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_ADMIN') {
        if (data.departments) setDepartments(data.departments);
        if (data.systemUsers) setSystemUsers(data.systemUsers);
        if (data.roomConflicts) setRoomConflicts(data.roomConflicts);
        if (data.systemSettings) setSystemSettings(data.systemSettings);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_NOTIFICATIONS') {
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.studyMaterials) setStudyMaterials(data.studyMaterials);
      } else if (type === 'SYNC_TIMETABLE') {
        if (data.timetableEntries) setTimetableEntries(data.timetableEntries);
      } else if (type === 'SYNC_MATERIALS') {
        if (data.courseMaterials) setCourseMaterials(data.courseMaterials);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.notifications) setNotifications(data.notifications);
      } else if (type === 'SYNC_REVALUATION') {
        if (data.revaluationRequests) setRevaluationRequests(data.revaluationRequests);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.notifications) setNotifications(data.notifications);
      } else if (type === 'SYNC_CONCESSIONS') {
        if (data.feeConcessions) setFeeConcessions(data.feeConcessions);
        if (data.students) setStudents(data.students);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_ANNOUNCEMENTS') {
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    };

    channel.addEventListener('message', onMessage);
    return () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, []);

  // Supabase PostgreSQL Realtime Channel Integration
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const realTimeChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          if (payload?.table === 'attendance_records') {
            dataService.getCoursesAttendance().then((res) => {
              if (res.data) setCoursesAttendance(res.data);
            });
          } else if (payload?.table === 'assignments') {
            dataService.getAssignments().then((res) => {
              if (res.data) setAssignments(res.data);
            });
          } else if (payload?.table === 'leave_requests') {
            dataService.getLeaveRequests().then((res) => {
              if (res.data) setLeaveRequests(res.data);
            });
          } else if (payload?.table === 'placement_drives') {
            dataService.getPlacementDrives().then((res) => {
              if (res.data) setPlacementDrives(res.data);
            });
          } else if (payload?.table === 'audit_logs') {
            dataService.getAuditLogs().then((res) => {
              if (res.data) setAuditLogs(res.data);
            });
          } else if (payload?.table === 'timetable_entries') {
            dataService.getTimetableEntries(timetableEntries).then((res) => {
              if (res) setTimetableEntries(res);
            });
          } else if (payload?.table === 'course_materials') {
            dataService.getCourseMaterials(courseMaterials).then((res) => {
              if (res) setCourseMaterials(res);
            });
          } else if (payload?.table === 'revaluation_requests') {
            dataService.getRevaluationRequests(revaluationRequests).then((res) => {
              if (res) setRevaluationRequests(res);
            });
          } else if (payload?.table === 'fee_concessions') {
            dataService.getFeeConcessions(feeConcessions).then((res) => {
              if (res) setFeeConcessions(res);
            });
          } else if (payload?.table === 'announcements') {
            dataService.getAnnouncements(announcements).then((res) => {
              if (res) setAnnouncements(res);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realTimeChannel);
    };
  }, [timetableEntries, courseMaterials, revaluationRequests, feeConcessions, announcements]);

  // Automatic persistence to localStorage for offline resilience
  useEffect(() => { saveToStorage('students', students); }, [students]);
  useEffect(() => { saveToStorage('departments', departments); }, [departments]);
  useEffect(() => { saveToStorage('coursesAttendance', coursesAttendance); }, [coursesAttendance]);
  useEffect(() => { saveToStorage('assignments', assignments); }, [assignments]);
  useEffect(() => { saveToStorage('internalMarks', internalMarks); }, [internalMarks]);
  useEffect(() => { saveToStorage('examSessions', examSessions); }, [examSessions]);
  useEffect(() => { saveToStorage('publishedResults', publishedResults); }, [publishedResults]);
  useEffect(() => { saveToStorage('feeStructures', feeStructures); }, [feeStructures]);
  useEffect(() => { saveToStorage('paymentHistory', paymentHistory); }, [paymentHistory]);
  useEffect(() => { saveToStorage('placementDrives', placementDrives); }, [placementDrives]);
  useEffect(() => { saveToStorage('studentPlacementApplications', studentPlacementApplications); }, [studentPlacementApplications]);
  useEffect(() => { saveToStorage('leaveRequests', leaveRequests); }, [leaveRequests]);
  useEffect(() => { saveToStorage('auditLogs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('systemUsers', systemUsers); }, [systemUsers]);
  useEffect(() => { saveToStorage('roomConflicts', roomConflicts); }, [roomConflicts]);
  useEffect(() => { saveToStorage('systemSettings', systemSettings); }, [systemSettings]);
  useEffect(() => { saveToStorage('timetableEntries', timetableEntries); }, [timetableEntries]);
  useEffect(() => { saveToStorage('courseMaterials', courseMaterials); }, [courseMaterials]);
  useEffect(() => { saveToStorage('revaluationRequests', revaluationRequests); }, [revaluationRequests]);
  useEffect(() => { saveToStorage('feeConcessions', feeConcessions); }, [feeConcessions]);
  useEffect(() => { saveToStorage('announcements', announcements); }, [announcements]);


  // Institutional RBAC Permission Checker
  const checkPermission = useCallback(
    (actionOrPermission) => can(currentRole, actionOrPermission),
    [currentRole]
  );

  // -------------------------------------------------------------
  // MUTATORS / ACTIONS (CROSS-ROLE SYNCHRONIZATION)
  // -------------------------------------------------------------

  // WORKFLOW 1: ATTENDANCE
  // Faculty marks Attendance -> Student + HOD + Principal updates
  const markAttendance = (courseCode, newRoster) => {

    setFacultyRoster(newRoster);
    const presentCount = newRoster.filter((s) => s.status === 'present').length;
    const absentCount = newRoster.filter((s) => s.status === 'absent').length;
    const totalCount = newRoster.length;
    const sessionPct = Math.round((presentCount / totalCount) * 100);

    // 1. Update course record with robust matcher
    const updatedCourses = coursesAttendance.map((c) => {
      if (c.code === courseCode || courseCode.includes(c.code) || c.name.includes(courseCode)) {
        const updatedTotal = c.total + 1;
        const aadhiPresent = newRoster.find((s) => s.id === '2024-AIDS-042' || s.roll === '22AIDS042')?.status === 'present';
        const updatedAttended = aadhiPresent ? c.attended + 1 : c.attended;
        const updatedPct = Math.round((updatedAttended / updatedTotal) * 100);
        const safeToMiss = Math.max(0, Math.floor((updatedAttended - 0.75 * updatedTotal) / 0.75));
        return {
          ...c,
          attended: updatedAttended,
          total: updatedTotal,
          percentage: updatedPct,
          safeToMiss,
        };
      }
      return c;
    });
    setCoursesAttendance(updatedCourses);

    // 2. Update Student overall attendance & standing
    const updatedStudents = students.map((st) => {
      const studentInRoster = newRoster.find((r) => r.id === st.id || r.roll === st.rollNo);
      if (studentInRoster) {
        const isPresent = studentInRoster.status === 'present';
        const currentPct = st.attendancePct;
        const adjusted = isPresent ? Math.min(100, currentPct + 1) : Math.max(0, currentPct - 1);
        const standing = adjusted < 75 ? 'Academic Risk' : adjusted >= 90 ? 'Dean List' : 'Good Standing';
        return { ...st, attendancePct: adjusted, standing };
      }
      return st;
    });
    setStudents(updatedStudents);

    // 3. Update HOD Department attendance & at-risk count
    const updatedDepartments = departments.map((dept) => {
      if (dept.code === 'AIDS') {
        const atRiskCount = updatedStudents.filter((s) => s.deptCode === 'AIDS' && (s.attendancePct < 75 || s.backlogs > 0)).length;
        return {
          ...dept,
          attendancePct: Number(((dept.attendancePct * 0.95) + (sessionPct * 0.05)).toFixed(1)),
          atRiskCount,
        };
      }
      return dept;
    });
    setDepartments(updatedDepartments);

    // 4. Append Audit Log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Faculty',
      actorName: 'Dr. Priya Raman',
      action: `Marked Attendance for ${courseCode}`,
      details: `${presentCount} Present, ${absentCount} Absent. Synced across Student, HOD & Principal portals.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    // 5. Broadcast to concurrent sessions
    broadcastSync('SYNC_ATTENDANCE', {
      facultyRoster: newRoster,
      coursesAttendance: updatedCourses,
      students: updatedStudents,
      departments: updatedDepartments,
      auditLogs: updatedAuditLogs,
    });

    dataService.recordAttendance(courseCode, newRoster, 'Dr. Priya Raman');
    showToast(`Attendance synchronized: ${presentCount} Present, ${absentCount} Absent ✓`, 'success');
  };

  // WORKFLOW 2: ASSIGNMENT CREATION, SUBMISSION & GRADING
  const createAssignment = (assignmentData) => {
    const newId = `asg-${Date.now()}`;
    const newAssignment = {
      id: newId,
      title: assignmentData.title,
      subject: assignmentData.subject,
      courseCode: assignmentData.courseCode || 'CS301',
      dueFormatted: assignmentData.dueFormatted || 'Next Week',
      dueTimestamp: assignmentData.dueTimestamp || new Date().toISOString(),
      urgency: assignmentData.urgency || 'important',
      progress: 0,
      completed: false,
      faculty: assignmentData.faculty || 'Dr. Priya Raman',
      totalEnrolled: 28,
      submittedCount: 0,
      gradedCount: 0,
      weightage: assignmentData.weightage || '10% of Internal Mark',
      brief: assignmentData.brief || 'Complete all problem sets and benchmark algorithms.',
      submissions: [],
    };

    const updatedAssignments = [newAssignment, ...assignments];
    setAssignments(updatedAssignments);
    dataService.createAssignment(newAssignment);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `New Assignment: ${newAssignment.title}`,
      message: `${newAssignment.faculty} posted a new deliverable in ${newAssignment.subject}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'urgent',
      actionTab: 'assignments',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Faculty',
      actorName: 'Dr. Priya Raman',
      action: 'Created New Assignment',
      details: `Published "${newAssignment.title}" for ${newAssignment.courseCode}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_ASSIGNMENTS', {
      assignments: updatedAssignments,
      notifications: updatedNotifications,
      auditLogs: updatedAuditLogs,
    });

    showToast(`Assignment "${newAssignment.title}" published to student portal ✓`, 'success');
  };

  const submitStudentAssignment = (assignmentId, notes = '') => {
    const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
    const activeStudentName = currentUser?.userName || 'Aadhi Narayanan';
    const updatedAssignments = assignments.map((a) => {
      if (a.id === assignmentId) {
        const alreadySubmitted = (a.submissions || []).some((s) => s.studentId === activeStudentId);
        const updatedSubmissions = alreadySubmitted
          ? a.submissions.map((s) => (s.studentId === activeStudentId ? { ...s, status: 'submitted', submittedAt: 'Just now', notes } : s))
          : [...(a.submissions || []), { studentId: activeStudentId, studentName: activeStudentName, status: 'submitted', submittedAt: 'Just now', notes }];

        return {
          ...a,
          completed: true,
          progress: 100,
          submittedCount: alreadySubmitted ? a.submittedCount : a.submittedCount + 1,
          submissions: updatedSubmissions,
        };
      }
      return a;
    });
    setAssignments(updatedAssignments);
    dataService.submitAssignment(assignmentId, activeStudentId, activeStudentName, notes);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'faculty',
      title: 'New Assignment Submission',
      message: `${activeStudentName} submitted deliverables awaiting grading.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'updates',
      actionTab: 'submissions',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Student',
      actorName: activeStudentName,
      action: 'Submitted Assignment',
      details: `Submission recorded for ${assignmentId}. Forwarded to faculty grading queue.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_ASSIGNMENTS', {
      assignments: updatedAssignments,
      notifications: updatedNotifications,
      auditLogs: updatedAuditLogs,
    });

    showToast('Assignment submitted successfully! Forwarded to Faculty queue ✓', 'success');
  };

  const gradeStudentSubmission = (assignmentId, studentId, grade, feedback) => {
    const updatedAssignments = assignments.map((a) => {
      if (a.id === assignmentId) {
        const updatedSubmissions = a.submissions.map((sub) => {
          if (sub.studentId === studentId) {
            return { ...sub, status: 'graded', grade, feedback };
          }
          return sub;
        });
        const gradedCount = updatedSubmissions.filter((s) => s.status === 'graded').length;
        return {
          ...a,
          gradedCount,
          grade: studentId === '2024-AIDS-042' ? grade : a.grade,
          feedback: studentId === '2024-AIDS-042' ? feedback : a.feedback,
          submissions: updatedSubmissions,
        };
      }
      return a;
    });
    setAssignments(updatedAssignments);
    dataService.gradeSubmission(assignmentId, studentId, grade, feedback);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: 'Assignment Graded ✓',
      message: `Your submission was graded: ${grade}. Feedback: "${feedback.substring(0, 40)}..."`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'success',
      actionTab: 'assignments',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Faculty',
      actorName: 'Dr. Priya Raman',
      action: 'Graded Assignment Submission',
      details: `Graded submission for student ${studentId} with ${grade}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_ASSIGNMENTS', {
      assignments: updatedAssignments,
      notifications: updatedNotifications,
      auditLogs: updatedAuditLogs,
    });

    showToast(`Submission graded: ${grade} ✓`, 'success');
  };

  const toggleAssignmentCompletion = (id) => {
    const updatedAssignments = assignments.map((a) => {
      if (a.id === id) {
        const nextCompleted = !a.completed;
        showToast(
          nextCompleted
            ? `Assignment marked complete ✓ (${a.title.split(' ')[0]})`
            : `Assignment returned to In Progress`,
          nextCompleted ? 'success' : 'info'
        );
        return {
          ...a,
          completed: nextCompleted,
          progress: nextCompleted ? 100 : a.progress === 100 ? 50 : a.progress,
          submittedCount: nextCompleted ? a.submittedCount + 1 : Math.max(0, a.submittedCount - 1),
        };
      }
      return a;
    });
    setAssignments(updatedAssignments);
    broadcastSync('SYNC_ASSIGNMENTS', { assignments: updatedAssignments });
  };

  // WORKFLOW 3: LEAVE REQUEST & HOD ATTENDANCE CONCESSION
  const submitLeaveRequest = (leaveData) => {
    const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
    const activeStudentName = currentUser?.userName || 'Aadhi Narayanan';
    const newId = `leave-${Date.now()}`;
    const newLeave = {
      id: newId,
      studentId: activeStudentId,
      studentName: activeStudentName,
      department: currentUser?.dept || 'AI & Data Science',
      reason: leaveData.reason,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      days: Number(leaveData.days) || 1,
      status: 'pending',
      approvedBy: null,
      dutyAttendanceGranted: false,
    };

    const updatedLeaves = [newLeave, ...leaveRequests];
    setLeaveRequests(updatedLeaves);
    dataService.submitLeave(newLeave);

    const newNotifs = [
      {
        id: `notif-${Date.now()}-hod`,
        recipientRole: 'hod',
        title: 'New Student Duty Leave Request',
        message: `${activeStudentName} requested ${newLeave.days} day(s) leave for: ${newLeave.reason.substring(0, 40)}.`,
        timeAgo: 'Just now',
        unread: true,
        tier: 'important',
        actionTab: 'leaves',
      },
      {
        id: `notif-${Date.now()}-fac`,
        recipientRole: 'faculty',
        title: 'Student Leave Notification',
        message: `${activeStudentName} submitted leave request (${newLeave.startDate} to ${newLeave.endDate}).`,
        timeAgo: 'Just now',
        unread: true,
        tier: 'updates',
        actionTab: 'leaves',
      },
    ];
    const updatedNotifications = [...newNotifs, ...notifications];
    setNotifications(updatedNotifications);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Student',
      actorName: 'Aadhi Narayanan',
      action: 'Submitted Duty Leave Request',
      details: `Requested ${newLeave.days} day(s) leave (${newLeave.startDate} – ${newLeave.endDate}) for ${newLeave.reason}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_LEAVES', {
      leaveRequests: updatedLeaves,
      notifications: updatedNotifications,
      auditLogs: updatedAuditLogs,
    });

    showToast('Leave request submitted! Forwarded to HOD for approval ✓', 'success');
  };

  const approveLeaveRequest = (leaveId, approved = true) => {
    const leave = leaveRequests.find((l) => l.id === leaveId);
    const updatedLeaves = leaveRequests.map((l) =>
      l.id === leaveId
        ? {
            ...l,
            status: approved ? 'approved' : 'rejected',
            approvedBy: 'Dr. K. Mohan (HOD)',
            dutyAttendanceGranted: approved,
          }
        : l
    );
    setLeaveRequests(updatedLeaves);

    // Apply on-duty attendance credit directly to student
    let updatedStudents = students;
    if (approved && leave) {
      const concessionBonus = Math.min(3, Math.max(1, (leave.days || 1) * 1.5));
      updatedStudents = students.map((s) => {
        if (s.id === leave.studentId) {
          const newPct = Math.min(100, Math.round(s.attendancePct + concessionBonus));
          const newStanding = newPct >= 75 && s.backlogs === 0 ? 'Good Standing' : s.standing;
          return { ...s, attendancePct: newPct, standing: newStanding };
        }
        return s;
      });
      setStudents(updatedStudents);
    }

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'HOD',
      actorName: 'Dr. K. Mohan',
      action: approved ? 'Approved Student Duty Leave' : 'Rejected Student Duty Leave',
      details: approved
        ? `Approved ${leave?.days || 2} days on-duty leave for ${leave?.studentName || 'Student'} with attendance concession.`
        : `Declined leave request for ${leave?.studentName || 'Student'}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: approved ? 'Duty Leave Approved ✓' : 'Duty Leave Declined',
      message: approved
        ? `HOD approved your ${leave?.days || 2}-day leave request for "${(leave?.reason || '').substring(0, 30)}..." with attendance concession.`
        : `Your leave request for "${(leave?.reason || '').substring(0, 30)}..." was reviewed and declined.`,
      timeAgo: 'Just now',
      unread: true,
      tier: approved ? 'success' : 'important',
      actionTab: 'leaves',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_LEAVES', {
      leaveRequests: updatedLeaves,
      students: updatedStudents,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifications,
    });

    showToast(
      approved ? 'Duty leave approved with attendance waiver ✓' : 'Leave request declined',
      approved ? 'success' : 'info'
    );
  };

  // WORKFLOW 4: FEES & MULTI-STUDENT BURSARY RECONCILIATION
  const payStudentFee = (amount, targetStudentId) => {
    const effectiveStudentId = targetStudentId || currentUser?.studentId || '2024-AIDS-042';
    const targetStudent = students.find((s) => s.id === effectiveStudentId) || students[0];
    const studentName = targetStudent ? targetStudent.name : (currentUser?.userName || 'Aadhi Narayanan');
    const feeAmt = Number(amount) || (targetStudent?.feePendingAmount || 45000);

    // 1. Update Student record
    const updatedStudents = students.map((st) =>
      st.id === effectiveStudentId
        ? { ...st, feeStatus: 'paid', feePendingAmount: 0 }
        : st
    );
    setStudents(updatedStudents);

    // 2. Record in Payment History with verifiable receipt
    const receiptId = `REC-${new Date().getFullYear()}-NIV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      id: `pay-${Date.now()}`,
      studentId: effectiveStudentId,
      studentName: studentName,
      description: 'Autumn 2026 Semester 5 Tuition & Lab Dues',
      amount: feeAmt,
      paidOn: 'Today',
      receiptNo: receiptId,
      status: 'verified',
    };
    const updatedPaymentHistory = [newPayment, ...paymentHistory];
    setPaymentHistory(updatedPaymentHistory);

    // 3. Update Finance Department Ledger
    const updatedFeeStructures = feeStructures.map((fee) => {
      if (fee.id === 'fee-sem5' || fee.department === 'AI & Data Science' || fee.department === 'All Departments') {
        return {
          ...fee,
          totalCollected: fee.totalCollected + feeAmt,
          studentsPaidCount: fee.studentsPaidCount + 1,
          studentsPendingCount: Math.max(0, fee.studentsPendingCount - 1),
        };
      }
      return fee;
    });
    setFeeStructures(updatedFeeStructures);

    // 4. Append Audit Log
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: currentUser.role === 'finance' ? 'Finance' : 'Student',
      actorName: currentUser.userName || studentName,
      action: 'Processed Tuition Payment',
      details: `Reconciled ₹${feeAmt.toLocaleString()} for ${studentName} (${targetStudentId}). Receipt ${receiptId} issued.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    // 5. Notify Finance and Student
    const newNotifs = [
      {
        id: `notif-${Date.now()}-fin`,
        recipientRole: 'finance',
        title: 'Fee Payment Reconciled',
        message: `${studentName} cleared ₹${feeAmt.toLocaleString()} dues. Receipt ${receiptId}.`,
        timeAgo: 'Just now',
        unread: true,
        tier: 'updates',
        actionTab: 'payments',
      },
      {
        id: `notif-${Date.now()}-stu`,
        recipientRole: 'student',
        title: 'Tuition Fee Cleared ✓',
        message: `Official receipt ${receiptId} generated for ₹${feeAmt.toLocaleString()}.`,
        timeAgo: 'Just now',
        unread: true,
        tier: 'success',
        actionTab: 'fees',
      },
    ];
    const updatedNotifications = [...newNotifs, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_FEES', {
      students: updatedStudents,
      feeStructures: updatedFeeStructures,
      paymentHistory: updatedPaymentHistory,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifications,
    });

    dataService.recordPayment({
      studentId: targetStudentId,
      studentName: studentName,
      receiptNo: receiptId,
      amount: feeAmt,
      mode: currentUser.role === 'finance' ? 'Bank Challan (Offline Verified)' : 'Online UPI/Card Gateway',
      transactionId: `TXN-${Date.now()}`,
    });

    showToast(`Payment of ₹${feeAmt.toLocaleString()} cleared! Receipt ${receiptId} issued ✓`, 'success');
  };

  const createFeeStructure = (feeData) => {
    const newFee = {
      id: `fee-${Date.now()}`,
      name: feeData.name,
      department: feeData.department || 'All Departments',
      amount: Number(feeData.amount) || 10000,
      dueDate: feeData.dueDate || '30 Oct 2026',
      totalBilled: (Number(feeData.amount) || 10000) * 380,
      totalCollected: 0,
      studentsPaidCount: 0,
      studentsPendingCount: 380,
    };

    const updatedFeeStructures = [newFee, ...feeStructures];
    setFeeStructures(updatedFeeStructures);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `New Fee Dues Announced: ${newFee.name}`,
      message: `Bursar Office: ₹${newFee.amount.toLocaleString()} due by ${newFee.dueDate}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'fees',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_FEES', {
      feeStructures: updatedFeeStructures,
      notifications: updatedNotifications,
    });

    showToast(`New fee obligation "${newFee.name}" created ✓`, 'success');
  };

  // WORKFLOW 5: CAMPUS PLACEMENTS & PIPELINE
  const createPlacementDrive = (driveData) => {
    const newDrive = {
      id: `drive-${Date.now()}`,
      company: driveData.company,
      role: driveData.role,
      packageLpa: driveData.packageLpa,
      location: driveData.location || 'Bangalore',
      minCgpa: Number(driveData.minCgpa) || 7.0,
      allowedBacklogs: Number(driveData.allowedBacklogs) || 0,
      deadline: driveData.deadline || '30 Oct 2026',
      status: 'active',
      eligibleCount: 65,
      appliedCount: 0,
      selectedCount: 0,
      departmentTarget: driveData.departmentTarget || ['AIDS', 'CSE'],
      description: driveData.description || 'Core engineering and software development roles.',
    };

    const updatedDrives = [newDrive, ...placementDrives];
    setPlacementDrives(updatedDrives);
    dataService.createPlacementDrive(newDrive);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Campus Recruitment: ${newDrive.company}`,
      message: `Recruiting for ${newDrive.role} (${newDrive.packageLpa}). Min CGPA: ${newDrive.minCgpa}. Apply before ${newDrive.deadline}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'urgent',
      actionTab: 'placement',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: 'Dr. S. Kapoor',
      action: 'Created Placement Drive',
      details: `Published recruitment drive for ${newDrive.company} (${newDrive.role}).`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementDrives: updatedDrives,
      notifications: updatedNotifications,
      auditLogs: updatedAuditLogs,
    });

    showToast(`Placement drive for ${newDrive.company} published to eligible students ✓`, 'success');
  };

  const applyPlacementDrive = (driveId) => {
    const drive = placementDrives.find((d) => d.id === driveId);
    if (!drive) return;
    const activeStudentId = currentUser?.studentId || '2024-AIDS-042';
    const activeStudentName = currentUser?.userName || 'Aadhi Narayanan';

    const alreadyApplied = studentPlacementApplications.some((a) => a.driveId === driveId && a.studentId === activeStudentId);
    if (alreadyApplied) {
      showToast('You have already applied for this placement opportunity', 'info');
      return;
    }

    const newApp = {
      driveId: drive.id,
      studentId: activeStudentId,
      studentName: activeStudentName,
      company: drive.company,
      role: drive.role,
      appliedAt: 'Today',
      stage: 'Application Received & Screening',
      status: 'active',
    };
    const updatedApplications = [newApp, ...studentPlacementApplications];
    setStudentPlacementApplications(updatedApplications);

    const updatedDrives = placementDrives.map((d) => (d.id === driveId ? { ...d, appliedCount: d.appliedCount + 1 } : d));
    setPlacementDrives(updatedDrives);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Student',
      actorName: activeStudentName,
      action: 'Submitted Placement Application',
      details: `Applied for ${drive.role} at ${drive.company}. Forwarded to Placement Cell.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'placement',
      title: 'New Drive Candidate',
      message: `${activeStudentName} applied for ${drive.company}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'updates',
      actionTab: 'applications',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_PLACEMENTS', {
      placementDrives: updatedDrives,
      studentPlacementApplications: updatedApplications,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifications,
    });

    showToast(`Application submitted for ${drive.company} ✓`, 'success');
  };

  const advancePlacementCandidate = (driveId, studentId, newStage) => {
    const updatedApplications = studentPlacementApplications.map((app) => {
      if (app.driveId === driveId && (app.studentId === studentId || !app.studentId)) {
        return {
          ...app,
          stage: newStage,
          status: newStage.toLowerCase().includes('reject') ? 'rejected' : newStage.toLowerCase().includes('offer') ? 'offer' : 'active',
        };
      }
      return app;
    });
    setStudentPlacementApplications(updatedApplications);
    dataService.advancePlacementStage(driveId, studentId, newStage);

    const drive = placementDrives.find((d) => d.id === driveId);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Placement Status Update: ${drive?.company || 'Recruitment'}`,
      message: `Your application stage has advanced to: "${newStage}". Check interview schedules.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'success',
      actionTab: 'placement',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: 'Dr. S. Kapoor',
      action: 'Advanced Candidate Stage',
      details: `Candidate stage updated to "${newStage}" for ${drive?.company || 'Drive'}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementDrives,
      studentPlacementApplications: updatedApplications,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifications,
    });

    showToast(`Candidate stage updated: ${newStage} ✓`, 'success');
  };

  // WORKFLOW 6: CONTINUOUS ASSESSMENT & SEMESTER RESULTS MODERATION
  const updateInternalMarks = (courseCode, newScore, lock = false) => {
    const updatedMarks = internalMarks.map((m) => {
      if (m.courseCode === courseCode) {
        return {
          ...m,
          scoredMark: Number(newScore),
          status: lock ? 'locked' : m.status,
        };
      }
      return m;
    });
    setInternalMarks(updatedMarks);

    let updatedNotifications = notifications;
    if (lock) {
      const newNotifs = [
        {
          id: `notif-${Date.now()}-stu`,
          recipientRole: 'student',
          title: `Internal CIA Marks Locked: ${courseCode}`,
          message: `Your final CIA score is ${newScore} / 25. Forwarded to Exam Cell.`,
          timeAgo: 'Just now',
          unread: true,
          tier: 'important',
          actionTab: 'results',
        },
        {
          id: `notif-${Date.now()}-exam`,
          recipientRole: 'exam_cell',
          title: `Faculty Marks Sheet Locked: ${courseCode}`,
          message: 'Faculty locked continuous assessment sheets for semester tabulation.',
          timeAgo: 'Just now',
          unread: true,
          tier: 'updates',
          actionTab: 'internals',
        },
      ];
      updatedNotifications = [...newNotifs, ...notifications];
      setNotifications(updatedNotifications);
    }

    broadcastSync('SYNC_EXAMS', {
      internalMarks: updatedMarks,
      notifications: updatedNotifications,
    });

    showToast(
      lock ? `CIA marks for ${courseCode} locked and submitted to Exam Cell ✓` : `CIA marks draft saved ✓`,
      'success'
    );
  };

  const publishExamResults = () => {
    const updatedResults = {
      ...publishedResults,
      status: 'published',
      publishedAt: 'Today',
    };
    setPublishedResults(updatedResults);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Exam Cell',
      actorName: 'Prof. V. Ramanathan',
      action: 'Published Official Semester 4 Results',
      details: 'Moderated grade sheets released for all departments. Synced to Student & Principal records.',
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: 'Official Results Published',
      message: 'Exam Cell released moderated grade sheets for Semester 4.',
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'results',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_EXAMS', {
      publishedResults: updatedResults,
      internalMarks,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifications,
    });

    showToast('Semester examination results officially published ✓', 'success');
  };

  // SYSTEM / CAMPUS ANNOUNCEMENTS BROADCAST
  const sendAnnouncement = (title, message, targetRole = 'all') => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: currentUser.label,
      actorName: currentUser.userName,
      action: `Broadcasted Announcement`,
      details: `Dispatched "${title}" to target audience: ${targetRole}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: targetRole,
      title: title,
      message: message,
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'home',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_NOTIFICATIONS', {
      notifications: updatedNotifications,
      auditLogs: updatedAuditLogs,
    });

    showToast(`Announcement broadcasted to ${targetRole} audience ✓`, 'success');
  };

  // ERP ADMIN SYSTEM ACTIONS
  const resolveConflict = (conflictId, resolutionNote) => {
    const updatedConflicts = roomConflicts.filter((c) => c.id !== conflictId);
    setRoomConflicts(updatedConflicts);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'ERP Admin',
      actorName: 'Admin Operations',
      action: 'Resolved Room Collision Conflict',
      details: resolutionNote || 'Room collision resolved and reallocated to alternate hall.',
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_ADMIN', {
      roomConflicts: updatedConflicts,
      auditLogs: updatedAuditLogs,
    });

    showToast(`Conflict resolved: ${resolutionNote || 'Reallocated to Seminar Hall 2'} ✓`, 'success');
  };

  const createUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'student',
      dept: userData.dept || 'AI & Data Science',
      status: 'active',
    };
    const updatedUsers = [newUser, ...systemUsers];
    setSystemUsers(updatedUsers);

    broadcastSync('SYNC_ADMIN', { systemUsers: updatedUsers });
    showToast(`New user "${newUser.name}" created with role ${newUser.role} ✓`, 'success');
  };

  const updateUser = (userId, updates) => {
    const updatedUsers = systemUsers.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setSystemUsers(updatedUsers);
    broadcastSync('SYNC_ADMIN', { systemUsers: updatedUsers });
    showToast('User details updated successfully ✓', 'success');
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = systemUsers.map((u) => {
      if (u.id === userId) {
        const next = u.status === 'active' ? 'inactive' : 'active';
        showToast(`User ${u.name} set to ${next}`, 'info');
        return { ...u, status: next };
      }
      return u;
    });
    setSystemUsers(updatedUsers);
    broadcastSync('SYNC_ADMIN', { systemUsers: updatedUsers });
  };

  const createDepartment = (deptData) => {
    const newDept = {
      code: deptData.code.toUpperCase(),
      name: deptData.name,
      hod: deptData.hod || 'Appointed HOD',
      studentCount: Number(deptData.studentCount) || 120,
      facultyCount: Number(deptData.facultyCount) || 12,
      attendancePct: 90.0,
      atRiskCount: 0,
      avgCgpa: 8.0,
      placedPct: 75,
    };
    const updatedDepts = [...departments, newDept];
    setDepartments(updatedDepts);
    broadcastSync('SYNC_ADMIN', { departments: updatedDepts });
    showToast(`Department "${newDept.name}" created successfully ✓`, 'success');
  };

  const uploadStudyMaterial = (materialData) => {
    const newMat = {
      id: `mat-${Date.now()}`,
      title: materialData.title,
      courseCode: materialData.courseCode || 'CS301',
      courseName: materialData.courseName || 'Data Structures & Algorithms',
      uploadedBy: currentUser.userName,
      uploadedAt: 'Today',
      fileType: materialData.fileType || 'PDF Document (2.5 MB)',
      downloads: 0,
    };
    const updatedMaterials = [newMat, ...studyMaterials];
    setStudyMaterials(updatedMaterials);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Study Resource: ${newMat.title}`,
      message: `${newMat.uploadedBy} uploaded notes for ${newMat.courseCode}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'updates',
      actionTab: 'home',
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);

    broadcastSync('SYNC_NOTIFICATIONS', {
      studyMaterials: updatedMaterials,
      notifications: updatedNotifications,
    });

    showToast(`Study resource "${newMat.title}" uploaded ✓`, 'success');
  };

  // Notification actions
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // User Profile Updates
  const updateUserProfile = (profileData) => {
    const activeStudentId = currentUser?.studentId || currentUser?.id || '2024-AIDS-042';
    setStudents((prev) =>
      prev.map((s) => (s.id === activeStudentId || s.email === currentUser?.email ? { ...s, ...profileData } : s))
    );
    showToast('Profile credentials updated successfully ✓', 'success');
  };

  // Revaluation Workflow
  const submitRevaluationRequest = async (revalData) => {
    const activeStudentId = currentUser?.studentId || currentUser?.id || '2024-AIDS-042';
    const student = (students || []).find((s) => s.id === activeStudentId || s.email === currentUser?.email) || (students || [])[0] || {};
    const newReq = {
      id: `rev-${Date.now()}`,
      studentId: student.id || activeStudentId,
      rollNo: student.rollNo || '22AIDS042',
      studentName: student.name || currentUser?.userName || 'Aadhi Narayanan',
      courseCode: revalData.courseCode,
      subjectName: revalData.subjectName,
      semester: Number(revalData.semester) || 4,
      originalGrade: revalData.originalGrade || 'B',
      originalMarks: Number(revalData.originalMarks) || 65,
      reason: revalData.reason,
      status: 'submitted',
      updatedMarks: null,
      updatedGrade: null,
      reviewedBy: null,
      submittedAt: 'Today',
    };
    const updated = [newReq, ...revaluationRequests];
    setRevaluationRequests(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Student',
      actorName: newReq.studentName,
      action: 'Submitted Revaluation Request',
      details: `Revaluation request submitted for ${newReq.courseCode} (${newReq.subjectName}).`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'exam_cell',
      title: 'New Revaluation Request',
      message: `${newReq.studentName} requested revaluation for ${newReq.courseCode}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'revaluation',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    broadcastSync('SYNC_REVALUATION', {
      revaluationRequests: updated,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifs,
    });

    await dataService.submitRevaluationRequest(newReq);
    showToast(`Revaluation request for ${newReq.courseCode} submitted to Exam Cell ✓`, 'success');
  };

  const updateRevaluationStatus = async (id, status, updatedMarks = null, updatedGrade = null, reviewer = 'Exam Controller') => {
    const target = revaluationRequests.find((r) => r.id === id);
    const updated = revaluationRequests.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status,
          updatedMarks: updatedMarks !== null ? updatedMarks : r.updatedMarks,
          updatedGrade: updatedGrade !== null ? updatedGrade : r.updatedGrade,
          reviewedBy: reviewer,
        };
      }
      return r;
    });
    setRevaluationRequests(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Exam Cell',
      actorName: reviewer,
      action: `Updated Revaluation: ${status.toUpperCase()}`,
      details: `Revaluation for ${target?.rollNo || 'Student'} on ${target?.courseCode} status changed to ${status}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: 'Revaluation Request Updated',
      message: `Your revaluation request for ${target?.courseCode || 'course'} has been marked as ${status}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'results',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    broadcastSync('SYNC_REVALUATION', {
      revaluationRequests: updated,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifs,
    });

    await dataService.updateRevaluationStatus(id, status, updatedMarks, updatedGrade, reviewer);
    showToast(`Revaluation request ${status} successfully ✓`, 'success');
  };

  // Course Materials Upload
  const uploadCourseMaterial = async (matData) => {
    const newMat = {
      id: `mat-${Date.now()}`,
      courseCode: matData.courseCode,
      subjectName: matData.subjectName || matData.courseCode,
      title: matData.title,
      description: matData.description || 'Uploaded course study resource',
      facultyName: matData.facultyName || currentUser?.userName || 'Dr. Priya Raman',
      materialType: matData.materialType || 'lecture_notes',
      fileName: matData.fileName || 'course_document.pdf',
      fileUrl: matData.fileUrl || 'https://nivara-storage.local/courseware/sample.pdf',
      fileSizeKb: Number(matData.fileSizeKb) || 2400,
      visibility: matData.visibility || 'enrolled_class',
      sectionCode: matData.sectionCode || 'AIDS-A-SEM5',
      uploadedAt: 'Today',
      downloads: 0,
    };
    const updated = [newMat, ...courseMaterials];
    setCourseMaterials(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Faculty',
      actorName: newMat.facultyName,
      action: 'Uploaded Courseware Material',
      details: `Uploaded "${newMat.title}" for ${newMat.courseCode} (${newMat.sectionCode}).`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `New Material: ${newMat.courseCode}`,
      message: `${newMat.facultyName} posted ${newMat.title}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'updates',
      actionTab: 'materials',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    broadcastSync('SYNC_MATERIALS', {
      courseMaterials: updated,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifs,
    });
    showToast(`Course material "${newMat.title}" published ✓`, 'success');
  };

  // Fee Concession / Scholarship Sanction
  const grantFeeConcession = async (concessionData) => {
    const newConc = {
      id: `conc-${Date.now()}`,
      studentId: concessionData.studentId,
      studentName: concessionData.studentName,
      category: concessionData.category,
      amount: Number(concessionData.amount) || 0,
      status: 'sanctioned',
      sanctionedBy: currentUser?.userName || 'Finance Bursar',
      academicYear: '2026-2027',
    };
    const updated = [newConc, ...feeConcessions];
    setFeeConcessions(updated);

    const updatedStudents = students.map((s) => {
      if (s.id === concessionData.studentId) {
        const nextPending = Math.max(0, (s.feePendingAmount || 0) - newConc.amount);
        return {
          ...s,
          feePendingAmount: nextPending,
          feeStatus: nextPending === 0 ? 'paid' : s.feeStatus,
        };
      }
      return s;
    });
    setStudents(updatedStudents);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Finance',
      actorName: newConc.sanctionedBy,
      action: 'Sanctioned Fee Concession',
      details: `Granted ₹${newConc.amount.toLocaleString()} scholarship concession to ${newConc.studentName}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_CONCESSIONS', {
      feeConcessions: updated,
      students: updatedStudents,
      auditLogs: updatedAuditLogs,
    });
    showToast(`Scholarship concession of ₹${newConc.amount.toLocaleString()} granted to ${newConc.studentName} ✓`, 'success');
  };

  // Multi-tier Announcement Broadcast
  const publishAnnouncement = async (announcementData) => {
    const newAnc = {
      id: `anc-${Date.now()}`,
      title: announcementData.title,
      content: announcementData.content,
      scope: announcementData.scope || 'institutional',
      targetDept: announcementData.targetDept || 'ALL',
      targetSection: announcementData.targetSection || 'ALL',
      targetRole: announcementData.targetRole || 'ALL',
      priority: announcementData.priority || 'high',
      publishedBy: currentUser?.userName || 'Executive Office',
      publishedRole: currentRole,
      publishedAt: 'Today · Just now',
    };
    const updated = [newAnc, ...announcements];
    setAnnouncements(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: currentRole.toUpperCase(),
      actorName: newAnc.publishedBy,
      action: 'Published Announcement',
      details: `[${newAnc.scope.toUpperCase()}] ${newAnc.title}`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const targetRecipient = newAnc.targetRole === 'ALL' ? 'student' : newAnc.targetRole;
    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: targetRecipient,
      title: newAnc.title,
      message: newAnc.content,
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'announcements',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    broadcastSync('SYNC_ANNOUNCEMENTS', {
      announcements: updated,
      notifications: updatedNotifs,
      auditLogs: updatedAuditLogs,
    });

    await dataService.publishAnnouncement(newAnc);
    showToast(`Announcement "${newAnc.title}" broadcasted successfully ✓`, 'success');
  };

  return (
    <NivaraContext.Provider
      value={{
        // Authentication & Session
        authenticatedSession,
        login,
        logout,

        // Role & Theme
        currentRole,
        switchRole,
        currentUser,
        ROLES,
        theme,
        toggleTheme,
        isOffline,
        setIsOffline,
        activeTab,
        setActiveTab,

        // Shared Entities
        students,
        setStudents,
        departments,
        coursesAttendance,
        facultyRoster,
        assignments,
        internalMarks,
        examSessions,
        setExamSessions,
        publishedResults,
        feeStructures,
        paymentHistory,
        placementDrives,
        studentPlacementApplications,
        leaveRequests,
        auditLogs,
        notifications,
        facultyMembers,
        setFacultyMembers,
        systemUsers,
        roomConflicts,
        studyMaterials,
        systemSettings,
        setSystemSettings,
        timetableEntries,
        setTimetableEntries,
        courseMaterials,
        setCourseMaterials,
        revaluationRequests,
        setRevaluationRequests,
        feeConcessions,
        setFeeConcessions,
        announcements,
        setAnnouncements,

        // Mutators / Actions
        markAttendance,
        createAssignment,
        submitStudentAssignment,
        gradeStudentSubmission,
        toggleAssignmentCompletion,
        submitLeaveRequest,
        approveLeaveRequest,
        payStudentFee,
        createFeeStructure,
        createPlacementDrive,
        applyPlacementDrive,
        advancePlacementCandidate,
        updateInternalMarks,
        publishExamResults,
        sendAnnouncement,
        resolveConflict,
        createUser,
        updateUser,
        toggleUserStatus,
        createDepartment,
        uploadStudyMaterial,
        uploadCourseMaterial,
        submitRevaluationRequest,
        updateRevaluationStatus,
        grantFeeConcession,
        publishAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        updateUserProfile,

        // RBAC Permissions
        can: checkPermission,
        hasPermission: checkPermission,

        // Modal triggers
        commandPaletteOpen,
        setCommandPaletteOpen,
        notificationsOpen,
        setNotificationsOpen,
        auditLogOpen,
        setAuditLogOpen,
        profileModalOpen,
        setProfileModalOpen,
        settingsModalOpen,
        setSettingsModalOpen,

        // Toasts
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </NivaraContext.Provider>
  );

}
