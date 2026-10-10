import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginWithCredentials,
  logoutSession,
  getActiveSession,
  INSTITUTIONAL_ACCOUNTS,
} from '../services/authService';
import { dataService } from '../services/dataService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isValidModuleForRole, getDefaultModuleForRole, resolveCanonicalModule } from '../data/navigationConfig';
import { can } from '../services/permissionService';

import {
  DEMO_DEPARTMENTS,
  DEMO_PROGRAMS,
  DEMO_ACADEMIC_YEARS,
  DEMO_CLASS_SECTIONS,
  DEMO_COURSES_MASTER,
  DEMO_STUDENTS,
  DEMO_FACULTY_MEMBERS,
  DEMO_COURSES_ATTENDANCE,
  DEMO_FACULTY_ROSTER,
  DEMO_ASSIGNMENTS,
  DEMO_INTERNAL_MARKS,
  DEMO_EXAM_SESSIONS,
  DEMO_PUBLISHED_RESULTS,
  DEMO_REVALUATION_REQUESTS,
  DEMO_FEE_STRUCTURES,
  DEMO_PAYMENT_HISTORY,
  DEMO_REFUND_REQUESTS,
  DEMO_FEE_CONCESSIONS,
  DEMO_COMPANIES,
  DEMO_PLACEMENT_DRIVES,
  DEMO_PLACEMENT_APPLICATIONS,
  DEMO_PLACEMENT_INTERVIEWS,
  DEMO_PLACEMENT_OFFERS,
  DEMO_LEAVE_REQUESTS,
  DEMO_TIMETABLE_ENTRIES,
  DEMO_COURSE_MATERIALS,
  DEMO_ANNOUNCEMENTS,
  DEMO_ROOM_CONFLICTS,
  DEMO_SYSTEM_USERS,
  DEMO_AUDIT_LOGS,
  DEMO_NOTIFICATIONS,
} from '../data/initialDemoData';

const NivaraContext = createContext();

export function useNivara() {
  const context = useContext(NivaraContext);
  if (!context) {
    throw new Error('useNivara must be used within a NivaraProvider');
  }
  return context;
}

const SYNC_CHANNEL_NAME = 'nivara_realtime_sync';
const DEMO_STORAGE_PREFIX = 'nivara_demo_v3_';

function getStoredOrFallback(key, fallback) {
  try {
    const val = localStorage.getItem(`${DEMO_STORAGE_PREFIX}${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, val) {
  try {
    localStorage.setItem(`${DEMO_STORAGE_PREFIX}${key}`, JSON.stringify(val));
  } catch {
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
  } catch {
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
      const canonicalTab = resolveCanonicalModule(roleId, rawTabId) || getDefaultModuleForRole(roleId);
      return { role: roleId, tab: canonicalTab };
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
    const canonical = resolveCanonicalModule(currentRole, tab) || getDefaultModuleForRole(currentRole);
    setActiveTabState(canonical);
    window.location.hash = `#/${currentRole}/${canonical}`;
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
          label: targetAccount.label || ROLES.find((r) => r.id === targetAccount.role)?.label || 'Student',
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
      const canonicalTab = resolveCanonicalModule(parsed.role, parsed.tab);
      if (!canonicalTab) {
        const safeTab = getDefaultModuleForRole(parsed.role);
        window.location.hash = `#/${parsed.role}/${safeTab}`;
        showToast(`Module Not Found: Redirected to ${parsed.role} home.`, 'info');
        return;
      }

      // Synchronize valid route state
      if (parsed.role !== currentRole) {
        setCurrentRole(parsed.role);
      }
      if (canonicalTab !== activeTab) {
        setActiveTabState(canonicalTab);
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
  const currentRoleMeta = ROLES.find((r) => r.id === (authenticatedSession?.user?.role || currentRole)) || ROLES[0];
  const currentUser = {
    ...currentRoleMeta,
    ...(authenticatedSession?.user || {}),
    label: authenticatedSession?.user?.label || currentRoleMeta?.label || 'Student',
  };

  // -------------------------------------------------------------
  // CENTRALIZED SHARED DATA STORE (ISOLATED DEMO ENVIRONMENT)
  // Initializes with rich, consistent fictional sample data across all 8 roles.
  // Persists in isolated storage namespace (nivara_demo_v3_*) and syncs via BroadcastChannel.
  // -------------------------------------------------------------

  // 1. Central Student Directory
  const [students, setStudents] = useState(() => getStoredOrFallback('students', DEMO_STUDENTS));

  // 2. Department Master Data
  const [departments, setDepartments] = useState(() => getStoredOrFallback('departments', DEMO_DEPARTMENTS));

  // 3. Central Attendance Sessions
  const [coursesAttendance, setCoursesAttendance] = useState(() => getStoredOrFallback('coursesAttendance', DEMO_COURSES_ATTENDANCE));

  // Faculty Class Roster
  const [facultyRoster, setFacultyRoster] = useState(() => getStoredOrFallback('facultyRoster', DEMO_FACULTY_ROSTER));

  // 4. Assignments & Submissions
  const [assignments, setAssignments] = useState(() => getStoredOrFallback('assignments', DEMO_ASSIGNMENTS));

  // 5. Internal Assessment Marks
  const [internalMarks, setInternalMarks] = useState(() => getStoredOrFallback('internalMarks', DEMO_INTERNAL_MARKS));

  // 6. Examination Sessions & Hall Tickets
  const [examSessions, setExamSessions] = useState(() => getStoredOrFallback('examSessions', DEMO_EXAM_SESSIONS));

  const [publishedResults, setPublishedResults] = useState(() => getStoredOrFallback('publishedResults', DEMO_PUBLISHED_RESULTS));

  // 7. Finance & Fees
  const [feeStructures, setFeeStructures] = useState(() => getStoredOrFallback('feeStructures', DEMO_FEE_STRUCTURES));

  const [paymentHistory, setPaymentHistory] = useState(() => getStoredOrFallback('paymentHistory', DEMO_PAYMENT_HISTORY));

  // 7b. Student Refunds Pipeline
  const [refundRequests, setRefundRequests] = useState(() => getStoredOrFallback('refundRequests', DEMO_REFUND_REQUESTS));

  // 8. Placement Opportunities, Companies, Applications, Interviews & Offers
  const [companies, setCompanies] = useState(() => getStoredOrFallback('companies', DEMO_COMPANIES));

  const [placementDrives, setPlacementDrives] = useState(() => getStoredOrFallback('placementDrives', DEMO_PLACEMENT_DRIVES));

  const [studentPlacementApplications, setStudentPlacementApplications] = useState(() => getStoredOrFallback('studentPlacementApplications', DEMO_PLACEMENT_APPLICATIONS));

  const [placementInterviews, setPlacementInterviews] = useState(() => getStoredOrFallback('placementInterviews', DEMO_PLACEMENT_INTERVIEWS));

  const [placementOffers, setPlacementOffers] = useState(() => getStoredOrFallback('placementOffers', DEMO_PLACEMENT_OFFERS));

  // 9. Leave Requests
  const [leaveRequests, setLeaveRequests] = useState(() => getStoredOrFallback('leaveRequests', DEMO_LEAVE_REQUESTS));

  // 10. Audit Activity Trail
  const [auditLogs, setAuditLogs] = useState(() => getStoredOrFallback('auditLogs', DEMO_AUDIT_LOGS));

  // 11. Cross-Role Shared Notifications
  const [notifications, setNotifications] = useState(() => getStoredOrFallback('notifications', DEMO_NOTIFICATIONS));

  // 12. Faculty Workload & Department Staff
  const [facultyMembers, setFacultyMembers] = useState(() => getStoredOrFallback('facultyMembers', DEMO_FACULTY_MEMBERS));

  // 13. System Users
  const [systemUsers, setSystemUsers] = useState(() => getStoredOrFallback('systemUsers', DEMO_SYSTEM_USERS));

  // 14. Room Conflicts
  const [roomConflicts, setRoomConflicts] = useState(() => getStoredOrFallback('roomConflicts', DEMO_ROOM_CONFLICTS));

  // 15. Study Materials
  const [studyMaterials, setStudyMaterials] = useState(() => getStoredOrFallback('studyMaterials', DEMO_COURSE_MATERIALS));

  // 16. System Settings (Standard institutional configuration)
  const [systemSettings, setSystemSettings] = useState(() => getStoredOrFallback('systemSettings', {
    minAttendanceCutoff: 75,
    academicTerm: 'Autumn Semester 2026',
    gracePeriodDays: 10,
    maintenanceMode: false,
    autoLockCIA: true,
  }));

  // 17. Unified Multi-Role Timetable Entries
  const [timetableEntries, setTimetableEntries] = useState(() => getStoredOrFallback('timetableEntries', DEMO_TIMETABLE_ENTRIES));

  // 18. Extended Course Materials
  const [courseMaterials, setCourseMaterials] = useState(() => getStoredOrFallback('courseMaterials', DEMO_COURSE_MATERIALS));

  // 19. Examination Revaluation Pipeline
  const [revaluationRequests, setRevaluationRequests] = useState(() => getStoredOrFallback('revaluationRequests', DEMO_REVALUATION_REQUESTS));

  // 20. Scholarships & Fee Concessions
  const [feeConcessions, setFeeConcessions] = useState(() => getStoredOrFallback('feeConcessions', DEMO_FEE_CONCESSIONS));

  // 21. Multi-Tier Announcements
  const [announcements, setAnnouncements] = useState(() => getStoredOrFallback('announcements', DEMO_ANNOUNCEMENTS));

  // 22. Degree Programs Master
  const [programs, setPrograms] = useState(() => getStoredOrFallback('programs', DEMO_PROGRAMS));

  // 23. Class Sections Master
  const [classSections, setClassSections] = useState(() => getStoredOrFallback('classSections', DEMO_CLASS_SECTIONS));

  // 24. Curriculum Courses Master
  const [coursesMaster, setCoursesMaster] = useState(() => getStoredOrFallback('coursesMaster', DEMO_COURSES_MASTER));

  // 25. Academic Years Master
  const [academicYears, setAcademicYears] = useState(() => getStoredOrFallback('academicYears', DEMO_ACADEMIC_YEARS));

  // -------------------------------------------------------------
  // SUPABASE AS PRIMARY PRODUCTION SOURCE OF TRUTH
  // Hydrates live records asynchronously into state when Supabase is configured.
  // Genuine empty tables ([]) correctly produce empty state in the UI.
  // -------------------------------------------------------------
  const [isDataLoading, setIsDataLoading] = useState(isSupabaseConfigured);
  const [dataFetchError, setDataFetchError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;
    async function hydrateFromSupabase() {
      try {
        setIsDataLoading(true);
        setDataFetchError(null);

        const [
          studentsRes,
          departmentsRes,
          assignmentsRes,
          marksRes,
          examsRes,
          resultsRes,
          feesRes,
          paymentsRes,
          refundsRes,
          concessionsRes,
          leavesRes,
          companiesRes,
          drivesRes,
          appsRes,
          interviewsRes,
          offersRes,
          timetableRes,
          materialsRes,
          revalRes,
          announcementsRes,
          auditRes,
          notifsRes,
          facultyRes,
          programsRes,
          sectionsRes,
          coursesRes,
          yearsRes,
        ] = await Promise.all([
          dataService.getStudents([]),
          dataService.getDepartments([]),
          dataService.getAssignments([]),
          dataService.getInternalMarks([]),
          dataService.getExamSessions([]),
          dataService.getPublishedResults(null),
          dataService.getFeeStructures([]),
          dataService.getPayments([]),
          dataService.getRefundRequests([]),
          dataService.getFeeConcessions([]),
          dataService.getLeaveRequests([]),
          dataService.getCompanies([]),
          dataService.getPlacementDrives([]),
          dataService.getPlacementApplications([]),
          dataService.getPlacementInterviews([]),
          dataService.getPlacementOffers([]),
          dataService.getTimetableEntries([]),
          dataService.getCourseMaterials([]),
          dataService.getRevaluationRequests([]),
          dataService.getAnnouncements([]),
          dataService.getAuditLogs([]),
          dataService.getNotifications([]),
          dataService.getFaculty([]),
          dataService.getPrograms([]),
          dataService.getClassSections([]),
          dataService.getCourses([]),
          dataService.getAcademicYears([]),
        ]);

        if (!isMounted) return;

        // When Supabase query succeeds, assign remote records (preserve demo baseline if empty)
        if (studentsRes.success && studentsRes.data && studentsRes.data.length > 0) setStudents(studentsRes.data);
        if (facultyRes.success && facultyRes.data && facultyRes.data.length > 0) setFacultyMembers(facultyRes.data);
        if (departmentsRes.success && departmentsRes.data && departmentsRes.data.length > 0) setDepartments(departmentsRes.data);
        if (assignmentsRes.success && assignmentsRes.data && assignmentsRes.data.length > 0) setAssignments(assignmentsRes.data);
        if (marksRes.success && marksRes.data && marksRes.data.length > 0) setInternalMarks(marksRes.data);
        if (examsRes.success && examsRes.data && examsRes.data.length > 0) setExamSessions(examsRes.data);
        if (resultsRes.success && resultsRes.data) setPublishedResults(resultsRes.data);
        if (feesRes.success && feesRes.data && feesRes.data.length > 0) setFeeStructures(feesRes.data);
        if (paymentsRes.success && paymentsRes.data && paymentsRes.data.length > 0) setPaymentHistory(paymentsRes.data);
        if (refundsRes.success && refundsRes.data && refundsRes.data.length > 0) setRefundRequests(refundsRes.data);
        if (concessionsRes.success && concessionsRes.data && concessionsRes.data.length > 0) setFeeConcessions(concessionsRes.data);
        if (leavesRes.success && leavesRes.data && leavesRes.data.length > 0) setLeaveRequests(leavesRes.data);
        if (companiesRes.success && companiesRes.data && companiesRes.data.length > 0) setCompanies(companiesRes.data);
        if (drivesRes.success && drivesRes.data && drivesRes.data.length > 0) setPlacementDrives(drivesRes.data);
        if (appsRes.success && appsRes.data && appsRes.data.length > 0) setStudentPlacementApplications(appsRes.data);
        if (interviewsRes.success && interviewsRes.data && interviewsRes.data.length > 0) setPlacementInterviews(interviewsRes.data);
        if (offersRes.success && offersRes.data && offersRes.data.length > 0) setPlacementOffers(offersRes.data);
        if (timetableRes.success && timetableRes.data && timetableRes.data.length > 0) setTimetableEntries(timetableRes.data);
        if (materialsRes.success && materialsRes.data && materialsRes.data.length > 0) setCourseMaterials(materialsRes.data);
        if (revalRes.success && revalRes.data && revalRes.data.length > 0) setRevaluationRequests(revalRes.data);
        if (announcementsRes.success && announcementsRes.data && announcementsRes.data.length > 0) setAnnouncements(announcementsRes.data);
        if (auditRes.success && auditRes.data && auditRes.data.length > 0) setAuditLogs(auditRes.data);
        if (notifsRes.success && notifsRes.data && notifsRes.data.length > 0) setNotifications(notifsRes.data);
        if (programsRes.success && programsRes.data && programsRes.data.length > 0) setPrograms(programsRes.data);
        if (sectionsRes.success && sectionsRes.data && sectionsRes.data.length > 0) setClassSections(sectionsRes.data);
        if (coursesRes.success && coursesRes.data && coursesRes.data.length > 0) setCoursesMaster(coursesRes.data);
        if (yearsRes.success && yearsRes.data && yearsRes.data.length > 0) setAcademicYears(yearsRes.data);

        const errorItem = [studentsRes, departmentsRes, assignmentsRes, feesRes, programsRes, sectionsRes, coursesRes, yearsRes].find((r) => !r.success);
        if (errorItem) {
          setDataFetchError(errorItem.error);
        }
      } catch (err) {
        console.error('Failed to hydrate state from Supabase:', err);
        if (isMounted) setDataFetchError(err.message || 'Error connecting to database');
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    }

    hydrateFromSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

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
        if (data.companies) setCompanies(data.companies);
        if (data.placementInterviews) setPlacementInterviews(data.placementInterviews);
        if (data.placementOffers) setPlacementOffers(data.placementOffers);
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
      } else if (type === 'SYNC_REFUNDS') {
        if (data.refundRequests) setRefundRequests(data.refundRequests);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.notifications) setNotifications(data.notifications);
      } else if (type === 'SYNC_ANNOUNCEMENTS') {
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.notifications) setNotifications(data.notifications);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      } else if (type === 'SYNC_RESET_DEMO') {
        setStudents(DEMO_STUDENTS);
        setDepartments(DEMO_DEPARTMENTS);
        setCoursesAttendance(DEMO_COURSES_ATTENDANCE);
        setFacultyRoster(DEMO_FACULTY_ROSTER);
        setAssignments(DEMO_ASSIGNMENTS);
        setInternalMarks(DEMO_INTERNAL_MARKS);
        setExamSessions(DEMO_EXAM_SESSIONS);
        setPublishedResults(DEMO_PUBLISHED_RESULTS);
        setFeeStructures(DEMO_FEE_STRUCTURES);
        setPaymentHistory(DEMO_PAYMENT_HISTORY);
        setRefundRequests(DEMO_REFUND_REQUESTS);
        setCompanies(DEMO_COMPANIES);
        setPlacementDrives(DEMO_PLACEMENT_DRIVES);
        setStudentPlacementApplications(DEMO_PLACEMENT_APPLICATIONS);
        setPlacementInterviews(DEMO_PLACEMENT_INTERVIEWS);
        setPlacementOffers(DEMO_PLACEMENT_OFFERS);
        setLeaveRequests(DEMO_LEAVE_REQUESTS);
        setAuditLogs(DEMO_AUDIT_LOGS);
        setNotifications(DEMO_NOTIFICATIONS);
        setFacultyMembers(DEMO_FACULTY_MEMBERS);
        setSystemUsers(DEMO_SYSTEM_USERS);
        setRoomConflicts(DEMO_ROOM_CONFLICTS);
        setStudyMaterials(DEMO_COURSE_MATERIALS);
        setTimetableEntries(DEMO_TIMETABLE_ENTRIES);
        setCourseMaterials(DEMO_COURSE_MATERIALS);
        setRevaluationRequests(DEMO_REVALUATION_REQUESTS);
        setFeeConcessions(DEMO_FEE_CONCESSIONS);
        setAnnouncements(DEMO_ANNOUNCEMENTS);
        setPrograms(DEMO_PROGRAMS);
        setClassSections(DEMO_CLASS_SECTIONS);
        setCoursesMaster(DEMO_COURSES_MASTER);
        setAcademicYears(DEMO_ACADEMIC_YEARS);
        showToast('Demo dataset reset from another tab', 'info');
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
              if (res && res.data) setTimetableEntries(res.data);
            });
          } else if (payload?.table === 'course_materials') {
            dataService.getCourseMaterials(courseMaterials).then((res) => {
              if (res && res.data) setCourseMaterials(res.data);
            });
          } else if (payload?.table === 'revaluation_requests') {
            dataService.getRevaluationRequests(revaluationRequests).then((res) => {
              if (res && res.data) setRevaluationRequests(res.data);
            });
          } else if (payload?.table === 'fee_concessions') {
            dataService.getFeeConcessions(feeConcessions).then((res) => {
              if (res && res.data) setFeeConcessions(res.data);
            });
          } else if (payload?.table === 'students') {
            dataService.getStudents().then((res) => {
              if (res && res.data) setStudents(res.data);
            });
          } else if (payload?.table === 'faculty') {
            dataService.getFaculty().then((res) => {
              if (res && res.data) setFacultyMembers(res.data);
            });
          } else if (payload?.table === 'departments') {
            dataService.getDepartments().then((res) => {
              if (res && res.data) setDepartments(res.data);
            });
          } else if (payload?.table === 'announcements') {
            dataService.getAnnouncements(announcements).then((res) => {
              if (res && res.data) setAnnouncements(res.data);
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
  useEffect(() => { saveToStorage('companies', companies); }, [companies]);
  useEffect(() => { saveToStorage('placementInterviews', placementInterviews); }, [placementInterviews]);
  useEffect(() => { saveToStorage('placementOffers', placementOffers); }, [placementOffers]);
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
  useEffect(() => { saveToStorage('refundRequests', refundRequests); }, [refundRequests]);


  // Institutional RBAC Permission Checker
  const checkPermission = useCallback(
    (actionOrPermission) => can(currentRole, actionOrPermission),
    [currentRole]
  );

  // -------------------------------------------------------------
  // MUTATORS / ACTIONS (CROSS-ROLE SYNCHRONIZATION)
  // -------------------------------------------------------------

  /**
   * Reset Demo Data
   * Restores pristine baseline fictional dataset across all 8 roles.
   * Clears isolated demo storage keys and broadcasts sync across active tabs.
   */
  const resetDemoData = () => {
    const keys = [
      'students', 'departments', 'coursesAttendance', 'facultyRoster', 'assignments',
      'internalMarks', 'examSessions', 'publishedResults', 'feeStructures', 'paymentHistory',
      'refundRequests', 'companies', 'placementDrives', 'studentPlacementApplications',
      'placementInterviews', 'placementOffers', 'leaveRequests', 'auditLogs', 'notifications',
      'facultyMembers', 'systemUsers', 'roomConflicts', 'studyMaterials', 'timetableEntries',
      'courseMaterials', 'revaluationRequests', 'feeConcessions', 'announcements', 'programs',
      'classSections', 'coursesMaster', 'academicYears'
    ];
    keys.forEach((k) => {
      try {
        localStorage.removeItem(`${DEMO_STORAGE_PREFIX}${k}`);
      } catch {}
    });

    setStudents(DEMO_STUDENTS);
    setDepartments(DEMO_DEPARTMENTS);
    setCoursesAttendance(DEMO_COURSES_ATTENDANCE);
    setFacultyRoster(DEMO_FACULTY_ROSTER);
    setAssignments(DEMO_ASSIGNMENTS);
    setInternalMarks(DEMO_INTERNAL_MARKS);
    setExamSessions(DEMO_EXAM_SESSIONS);
    setPublishedResults(DEMO_PUBLISHED_RESULTS);
    setFeeStructures(DEMO_FEE_STRUCTURES);
    setPaymentHistory(DEMO_PAYMENT_HISTORY);
    setRefundRequests(DEMO_REFUND_REQUESTS);
    setCompanies(DEMO_COMPANIES);
    setPlacementDrives(DEMO_PLACEMENT_DRIVES);
    setStudentPlacementApplications(DEMO_PLACEMENT_APPLICATIONS);
    setPlacementInterviews(DEMO_PLACEMENT_INTERVIEWS);
    setPlacementOffers(DEMO_PLACEMENT_OFFERS);
    setLeaveRequests(DEMO_LEAVE_REQUESTS);
    setAuditLogs(DEMO_AUDIT_LOGS);
    setNotifications(DEMO_NOTIFICATIONS);
    setFacultyMembers(DEMO_FACULTY_MEMBERS);
    setSystemUsers(DEMO_SYSTEM_USERS);
    setRoomConflicts(DEMO_ROOM_CONFLICTS);
    setStudyMaterials(DEMO_COURSE_MATERIALS);
    setTimetableEntries(DEMO_TIMETABLE_ENTRIES);
    setCourseMaterials(DEMO_COURSE_MATERIALS);
    setRevaluationRequests(DEMO_REVALUATION_REQUESTS);
    setFeeConcessions(DEMO_FEE_CONCESSIONS);
    setAnnouncements(DEMO_ANNOUNCEMENTS);
    setPrograms(DEMO_PROGRAMS);
    setClassSections(DEMO_CLASS_SECTIONS);
    setCoursesMaster(DEMO_COURSES_MASTER);
    setAcademicYears(DEMO_ACADEMIC_YEARS);

    broadcastSync('SYNC_RESET_DEMO', { resetAt: Date.now() });
    showToast('Demo environment reset to baseline fictional dataset ✓', 'success');
  };

  // WORKFLOW 1: ATTENDANCE
  // Faculty marks Attendance -> Student + HOD + Principal updates
  const markAttendance = (courseCode, newRoster) => {

    setFacultyRoster(newRoster);
    const presentCount = newRoster.filter((s) => s.status === 'present').length;
    const absentCount = newRoster.filter((s) => s.status === 'absent').length;
    const totalCount = newRoster.length;
    const sessionPct = Math.round((presentCount / totalCount) * 100);

    // 1. Update course record with robust matcher
    const activeStudentId = currentUser?.studentId || currentUser?.id;
    const updatedCourses = coursesAttendance.map((c) => {
      if (c.code === courseCode || courseCode.includes(c.code) || c.name.includes(courseCode)) {
        const updatedTotal = c.total + 1;
        const currentStudentPresent = activeStudentId
          ? newRoster.find((s) => s.id === activeStudentId || s.roll === activeStudentId)?.status === 'present'
          : false;
        const updatedAttended = currentStudentPresent ? c.attended + 1 : c.attended;
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
      actorName: currentUser?.userName || 'Faculty',
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

    dataService.recordAttendance(courseCode, newRoster, currentUser?.userName || 'Faculty');
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
      faculty: assignmentData.faculty || currentUser?.userName || 'Faculty',
      totalEnrolled: (students || []).length,
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
      actorName: currentUser?.userName || 'Faculty',
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
    const activeStudentId = currentUser?.studentId || currentUser?.id || '';
    const activeStudentName = currentUser?.userName || currentUser?.name || 'Student';
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
    const currentStudentId = currentUser?.studentId || currentUser?.id;
    const isCurrentStudent = Boolean(currentStudentId && studentId === currentStudentId);
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
          grade: isCurrentStudent ? grade : a.grade,
          feedback: isCurrentStudent ? feedback : a.feedback,
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
      actorName: currentUser?.userName || 'Faculty',
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

  const updateAssignment = async (id, updates) => {
    const updatedAssignments = assignments.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAssignments(updatedAssignments);
    await dataService.updateAssignment(id, updates);
    broadcastSync('SYNC_ASSIGNMENTS', { assignments: updatedAssignments });
    showToast('Assignment updated successfully ✓', 'success');
  };

  const deleteAssignment = async (id) => {
    const updatedAssignments = assignments.filter((a) => a.id !== id);
    setAssignments(updatedAssignments);
    await dataService.deleteAssignment(id);
    broadcastSync('SYNC_ASSIGNMENTS', { assignments: updatedAssignments });
    showToast('Assignment archived/deleted successfully ✓', 'info');
  };

  // WORKFLOW 3: LEAVE REQUEST & HOD ATTENDANCE CONCESSION
  const submitLeaveRequest = (leaveData) => {
    const activeStudentId = currentUser?.studentId || currentUser?.id || '';
    const activeStudentName = currentUser?.userName || currentUser?.name || 'Student';
    const newId = `leave-${Date.now()}`;
    const newLeave = {
      id: newId,
      studentId: activeStudentId,
      studentName: activeStudentName,
      department: currentUser?.dept || currentUser?.department || '',
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
      actorName: activeStudentName || 'Student',
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
            approvedBy: currentUser?.userName ? `${currentUser.userName} (HOD)` : 'Head of Department',
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
      actorName: currentUser?.userName || 'Head of Department',
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

    dataService.updateLeaveStatus(leaveId, approved ? 'approved' : 'rejected', currentUser?.userName ? `${currentUser.userName} (HOD)` : 'Head of Department', approved);

    showToast(
      approved ? 'Duty leave approved with attendance waiver ✓' : 'Leave request declined',
      approved ? 'success' : 'info'
    );
  };

  // WORKFLOW 4: FEES & MULTI-STUDENT BURSARY RECONCILIATION
  const payStudentFee = (amount, targetStudentId, paymentMode = null, feeDescription = null, customReceiptId = null) => {
    const effectiveStudentId = targetStudentId || currentUser?.studentId || currentUser?.id || '';
    const targetStudent = students.find((s) => s.id === effectiveStudentId);
    const studentName = targetStudent ? targetStudent.name : (currentUser?.userName || currentUser?.name || 'Student');
    const feeAmt = Number(amount) || (targetStudent?.feePendingAmount || 0);

    const receiptId = customReceiptId || `REC-${new Date().getFullYear()}-NIV-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveMode = paymentMode || (currentUser?.role === 'finance' ? 'Bank Challan (Offline Verified)' : 'Online UPI / Card Gateway');

    // 1. Update Student record with strict mathematical balance deduction
    const updatedStudents = students.map((st) => {
      if (st.id === effectiveStudentId) {
        const currentPending = st.feePendingAmount !== undefined ? st.feePendingAmount : 0;
        const remaining = Math.max(0, currentPending - feeAmt);
        return {
          ...st,
          feePendingAmount: remaining,
          feeStatus: remaining === 0 ? 'paid' : 'pending',
          feeReceiptId: receiptId,
        };
      }
      return st;
    });
    setStudents(updatedStudents);

    // 2. Record in Payment History with verifiable receipt
    const newPayment = {
      id: `pay-${Date.now()}`,
      studentId: effectiveStudentId,
      studentName: studentName,
      rollNo: targetStudent?.rollNo || effectiveStudentId,
      description: feeDescription || 'Autumn 2026 Semester 5 Tuition & Lab Dues',
      amount: feeAmt,
      paidOn: 'Today',
      receiptNo: receiptId,
      mode: effectiveMode,
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
      details: `Reconciled ₹${feeAmt.toLocaleString()} for ${studentName} (${effectiveStudentId}) via ${effectiveMode}. Receipt ${receiptId} issued.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    // 5. Notify Finance and Student
    const newNotifs = [
      {
        id: `notif-${Date.now()}-fin`,
        recipientRole: 'finance',
        title: 'Fee Payment Reconciled',
        message: `${studentName} cleared ₹${feeAmt.toLocaleString()} dues via ${effectiveMode}. Receipt ${receiptId}.`,
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
      studentId: effectiveStudentId,
      studentName: studentName,
      receiptNo: receiptId,
      amount: feeAmt,
      mode: effectiveMode,
      transactionId: `TXN-${Date.now()}`,
    });

    showToast(`Payment of ₹${feeAmt.toLocaleString()} cleared! Receipt ${receiptId} issued ✓`, 'success');
  };

  const createFeeStructure = (feeData) => {
    const studentCount = (students || []).length || 380;
    const amt = Number(feeData.amount) || 10000;
    const newFee = {
      id: `fee-${Date.now()}`,
      name: feeData.name,
      department: feeData.department || 'All Departments',
      academicYear: feeData.academicYear || '2026-2027',
      category: feeData.category || 'Tuition & Academic',
      semester: feeData.semester || 'Semester 5',
      amount: amt,
      dueDate: feeData.dueDate || '30 Oct 2026',
      totalBilled: amt * studentCount,
      totalCollected: 0,
      studentsPaidCount: 0,
      studentsPendingCount: studentCount,
    };

    const updatedFeeStructures = [newFee, ...feeStructures];
    setFeeStructures(updatedFeeStructures);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Finance',
      actorName: currentUser?.userName || 'Accounts Bursar',
      action: 'Created Fee Structure',
      details: `Published fee obligation "${newFee.name}" with tariff ₹${newFee.amount.toLocaleString()}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

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
      auditLogs: updatedAuditLogs,
    });

    dataService.createFeeStructure(newFee);

    showToast(`New fee obligation "${newFee.name}" created ✓`, 'success');
    return newFee;
  };

  const updateFeeStructure = (id, updates) => {
    const updated = feeStructures.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFeeStructures(updated);

    const target = feeStructures.find((f) => f.id === id);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Finance',
      actorName: currentUser?.userName || 'Accounts Bursar',
      action: 'Updated Fee Schedule',
      details: `Modified fee schedule for "${target?.name || id}".`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_FEES', {
      feeStructures: updated,
      auditLogs: updatedAuditLogs,
    });
    dataService.updateFeeStructure(id, updates);
    showToast(`Fee schedule "${target?.name || id}" updated ✓`, 'success');
  };

  const deleteFeeStructure = (id) => {
    const target = feeStructures.find((f) => f.id === id);
    const updated = feeStructures.filter((f) => f.id !== id);
    setFeeStructures(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Finance',
      actorName: currentUser?.userName || 'Accounts Bursar',
      action: 'Retired Fee Schedule',
      details: `Retired fee schedule "${target?.name || id}". Historical ledger preserved.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_FEES', {
      feeStructures: updated,
      auditLogs: updatedAuditLogs,
    });
    dataService.deleteFeeStructure(id);
    showToast(`Fee schedule "${target?.name || id}" retired ✓`, 'info');
  };

  const createRefundRequest = (refundData) => {
    const newRef = {
      id: `ref-${Date.now()}`,
      studentId: refundData.studentId,
      studentName: refundData.studentName,
      rollNo: refundData.rollNo || refundData.studentId,
      paymentId: refundData.paymentId || `pay-${Date.now()}`,
      receiptNo: refundData.receiptNo || `REC-${Date.now()}`,
      amount: Number(refundData.amount) || 0,
      reason: refundData.reason,
      status: 'requested',
      requestedDate: 'Today',
      processedDate: null,
      authorizedUser: currentUser?.userName || 'Accounts Bursar',
      mode: 'Manual Institutional NEFT Reversal',
      remarks: refundData.remarks || 'Initiated at Bursar finance desk',
    };
    const updated = [newRef, ...refundRequests];
    setRefundRequests(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Finance',
      actorName: currentUser?.userName || 'Accounts Bursar',
      action: 'Created Refund Voucher',
      details: `Logged refund petition for ${newRef.studentName} of ₹${newRef.amount.toLocaleString()}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_REFUNDS', {
      refundRequests: updated,
      auditLogs: updatedAuditLogs,
    });

    showToast(`Refund petition for ₹${newRef.amount.toLocaleString()} logged ✓`, 'success');
    return newRef;
  };

  const processRefundStatus = (id, newStatus, remarks = '', refundMode = 'Manual Institutional NEFT Reversal') => {
    const target = refundRequests.find((r) => r.id === id);
    const updated = refundRequests.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          remarks: remarks || r.remarks,
          mode: refundMode,
          processedDate: newStatus === 'processed' ? 'Today' : r.processedDate,
          authorizedUser: currentUser?.userName || 'Accounts Bursar',
        };
      }
      return r;
    });
    setRefundRequests(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Finance',
      actorName: currentUser?.userName || 'Accounts Bursar',
      action: `Refund Status: ${newStatus.toUpperCase()}`,
      details: `Refund voucher for ${target?.studentName || 'Student'} (₹${target?.amount?.toLocaleString()}) set to ${newStatus}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Fee Refund Update: ${newStatus.toUpperCase()}`,
      message: `Your refund request of ₹${target?.amount?.toLocaleString()} for ${target?.receiptNo || 'Fee'} is now: ${newStatus}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'important',
      actionTab: 'fees',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    broadcastSync('SYNC_REFUNDS', {
      refundRequests: updated,
      auditLogs: updatedAuditLogs,
      notifications: updatedNotifs,
    });

    showToast(`Refund ${id} marked as ${newStatus} ✓`, 'success');
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
      actorName: currentUser?.userName || 'Placement Officer',
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
    const activeStudentId = currentUser?.studentId || currentUser?.id || '';
    const activeStudentName = currentUser?.userName || currentUser?.name || 'Student';

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
      actorName: currentUser?.userName || 'Placement Officer',
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

  const updatePlacementDrive = (id, updatedFields) => {
    const updated = placementDrives.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
    setPlacementDrives(updated);
    dataService.updatePlacementDrive(id, updatedFields);

    const target = placementDrives.find((d) => d.id === id);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Updated Placement Drive',
      details: `Modified parameters for ${target?.company || 'Drive'} (${target?.role || 'Role'}).`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementDrives: updated,
      auditLogs: updatedLogs,
    });
    showToast(`Drive details updated successfully ✓`, 'success');
  };

  const createCompany = (companyData) => {
    const newCompany = {
      id: `comp-${Date.now()}`,
      name: companyData.name,
      category: companyData.category || 'Core Engineering Partner',
      website: companyData.website || '',
      hrContact: companyData.hrContact || '',
      hrEmail: companyData.hrEmail || '',
      hrPhone: companyData.hrPhone || '',
      activeStatus: companyData.activeStatus || 'active',
      notes: companyData.notes || '',
    };
    const updated = [newCompany, ...companies];
    setCompanies(updated);
    dataService.createCompany(newCompany);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Registered Corporate Partner',
      details: `Added corporate entity: ${newCompany.name} (${newCompany.category}).`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      companies: updated,
      auditLogs: updatedLogs,
    });
    showToast(`Company ${newCompany.name} registered ✓`, 'success');
    return newCompany;
  };

  const updateCompany = (id, updatedFields) => {
    const updated = companies.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setCompanies(updated);
    dataService.updateCompany(id, updatedFields);

    const target = companies.find((c) => c.id === id);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Updated Company Dossier',
      details: `Updated information for partner company ${target?.name || id}.`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      companies: updated,
      auditLogs: updatedLogs,
    });
    showToast(`Partner company profile updated ✓`, 'success');
  };

  const toggleCompanyStatus = (id) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;
    const newStatus = target.activeStatus === 'active' ? 'inactive' : 'active';
    updateCompany(id, { activeStatus: newStatus });
  };

  const scheduleInterview = (interviewData) => {
    const newInterview = {
      id: `int-${Date.now()}`,
      driveId: interviewData.driveId,
      company: interviewData.company,
      studentId: interviewData.studentId,
      studentName: interviewData.studentName,
      type: interviewData.type || 'Interview',
      stage: interviewData.stage || 'Technical Interview (Round 1)',
      scheduledDate: interviewData.scheduledDate,
      timeSlot: interviewData.timeSlot,
      venue: interviewData.venue || 'CDC Interview Suite',
      panel: interviewData.panel || 'Technical Assessment Panel',
      status: 'scheduled',
      scoreOrNotes: interviewData.scoreOrNotes || 'Scheduled by Placement Cell',
    };

    const updatedInterviews = [newInterview, ...placementInterviews];
    setPlacementInterviews(updatedInterviews);
    dataService.scheduleInterview(newInterview);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Interview Scheduled: ${newInterview.company}`,
      message: `${newInterview.stage} on ${newInterview.scheduledDate} at ${newInterview.timeSlot} (${newInterview.venue}).`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'urgent',
      actionTab: 'placement',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Scheduled Candidate Assessment',
      details: `Scheduled ${newInterview.stage} for ${newInterview.studentName} (${newInterview.company}).`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementInterviews: updatedInterviews,
      notifications: updatedNotifs,
      auditLogs: updatedLogs,
    });
    showToast(`Interview scheduled for ${newInterview.studentName} ✓`, 'success');
    return newInterview;
  };

  const updateInterviewOutcome = (id, outcomeStatus, scoreOrNotes = '', advanceAppStage = null) => {
    const target = placementInterviews.find((i) => i.id === id);
    if (!target) return;

    const updatedInterviews = placementInterviews.map((i) =>
      i.id === id ? { ...i, status: outcomeStatus, scoreOrNotes: scoreOrNotes || i.scoreOrNotes } : i
    );
    setPlacementInterviews(updatedInterviews);
    dataService.updateInterviewOutcome(id, { status: outcomeStatus, score_or_notes: scoreOrNotes });

    let updatedApps = studentPlacementApplications;
    if (advanceAppStage) {
      updatedApps = studentPlacementApplications.map((app) => {
        if (app.driveId === target.driveId && app.studentId === target.studentId) {
          return {
            ...app,
            stage: advanceAppStage,
            status: advanceAppStage.toLowerCase().includes('reject') ? 'rejected' : advanceAppStage.toLowerCase().includes('offer') ? 'offer' : 'active',
          };
        }
        return app;
      });
      setStudentPlacementApplications(updatedApps);
      dataService.advancePlacementStage(target.driveId, target.studentId, advanceAppStage);
    }

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Interview Result: ${target.company}`,
      message: `Status for ${target.stage}: ${outcomeStatus.toUpperCase()}${advanceAppStage ? ` · Advanced to "${advanceAppStage}"` : ''}.`,
      timeAgo: 'Just now',
      unread: true,
      tier: outcomeStatus === 'selected' ? 'success' : 'important',
      actionTab: 'placement',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Recorded Interview Outcome',
      details: `${target.studentName} · ${target.stage} at ${target.company} marked as ${outcomeStatus}.`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementInterviews: updatedInterviews,
      studentPlacementApplications: updatedApps,
      notifications: updatedNotifs,
      auditLogs: updatedLogs,
    });
    showToast(`Interview outcome recorded: ${outcomeStatus} ✓`, 'success');
  };

  const createPlacementOffer = (offerData) => {
    const newOffer = {
      id: `off-${Date.now()}`,
      driveId: offerData.driveId || null,
      studentId: offerData.studentId,
      studentName: offerData.studentName,
      deptCode: offerData.deptCode || 'AIDS',
      company: offerData.company,
      role: offerData.role,
      packageLpa: offerData.packageLpa.endsWith('LPA') ? offerData.packageLpa : `${offerData.packageLpa} LPA`,
      offerDate: offerData.offerDate || 'Today',
      joiningDate: offerData.joiningDate || 'July 2027',
      offerStatus: offerData.offerStatus || 'extended',
      placementStatus: offerData.placementStatus || 'pending_acceptance',
      letterUrl: offerData.letterUrl || `NIVARA-OFFER-${Date.now().toString().slice(-4)}.pdf`,
    };

    const updatedOffers = [newOffer, ...placementOffers];
    setPlacementOffers(updatedOffers);
    dataService.createPlacementOffer(newOffer);

    // Update application stage if matching
    const updatedApps = studentPlacementApplications.map((app) => {
      if ((app.driveId === offerData.driveId || app.company === offerData.company) && app.studentId === offerData.studentId) {
        return { ...app, stage: 'Offer Extended (Selected)', status: 'offer' };
      }
      return app;
    });
    setStudentPlacementApplications(updatedApps);

    // Update drive selectedCount
    const updatedDrives = placementDrives.map((d) =>
      d.id === offerData.driveId || d.company === offerData.company ? { ...d, selectedCount: (d.selectedCount || 0) + 1 } : d
    );
    setPlacementDrives(updatedDrives);

    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientRole: 'student',
      title: `Congratulations! Offer from ${newOffer.company}`,
      message: `You have received an offer for ${newOffer.role} (${newOffer.packageLpa}). Check Offers tab.`,
      timeAgo: 'Just now',
      unread: true,
      tier: 'success',
      actionTab: 'placement',
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Issued Placement Offer',
      details: `Extended offer to ${newOffer.studentName} for ${newOffer.role} at ${newOffer.company} (${newOffer.packageLpa}).`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementOffers: updatedOffers,
      studentPlacementApplications: updatedApps,
      placementDrives: updatedDrives,
      notifications: updatedNotifs,
      auditLogs: updatedLogs,
    });
    showToast(`Placement offer registered for ${newOffer.studentName} (${newOffer.company}) ✓`, 'success');
    return newOffer;
  };

  const updatePlacementOfferStatus = (id, newOfferStatus, newPlacementStatus) => {
    const target = placementOffers.find((o) => o.id === id);
    if (!target) return;

    const updatedOffers = placementOffers.map((o) =>
      o.id === id ? { ...o, offerStatus: newOfferStatus, placementStatus: newPlacementStatus } : o
    );
    setPlacementOffers(updatedOffers);
    dataService.updatePlacementOffer(id, { offer_status: newOfferStatus, placement_status: newPlacementStatus });

    // If accepted, update student application stage to 'Placed'
    let updatedApps = studentPlacementApplications;
    if (newOfferStatus === 'accepted' || newPlacementStatus === 'placed') {
      updatedApps = studentPlacementApplications.map((app) => {
        if (app.studentId === target.studentId && app.company === target.company) {
          return { ...app, stage: 'Placed', status: 'offer' };
        }
        return app;
      });
      setStudentPlacementApplications(updatedApps);
    }

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Placement Officer',
      actorName: currentUser?.userName || 'Placement Officer',
      action: 'Updated Offer Status',
      details: `${target.studentName} offer with ${target.company} marked as ${newOfferStatus} (Placement: ${newPlacementStatus}).`,
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);

    broadcastSync('SYNC_PLACEMENTS', {
      placementOffers: updatedOffers,
      studentPlacementApplications: updatedApps,
      auditLogs: updatedLogs,
    });
    showToast(`Offer status updated: ${newOfferStatus} ✓`, 'success');
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

    dataService.upsertInternalMarks(courseCode, updatedMarks.filter((m) => m.courseCode === courseCode), lock);

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
      actorName: currentUser?.userName || 'Controller of Examinations',
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

    dataService.publishResults(updatedResults);

    showToast('Semester examination results officially published ✓', 'success');
  };

  const addExamSession = (session) => {
    const newSession = {
      id: `ex-${Date.now()}`,
      daysRemaining: 14,
      resultsPublished: false,
      status: 'Scheduled',
      capacity: 64,
      registeredCount: 45,
      ...session,
    };
    const updated = [newSession, ...examSessions];
    setExamSessions(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Exam Cell',
      actorName: 'Dr. K. Anand',
      action: 'Created Examination Session',
      details: `Scheduled ${newSession.code} - ${newSession.subject} on ${newSession.dateFormatted} at ${newSession.venue}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_EXAMS', {
      examSessions: updated,
      auditLogs: updatedAuditLogs,
    });

    dataService.addExamSession(newSession);

    showToast(`Exam session for ${newSession.code} successfully scheduled ✓`, 'success');
    return newSession;
  };

  const updateExamSession = (id, updates) => {
    const updated = examSessions.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setExamSessions(updated);

    const target = examSessions.find((s) => s.id === id);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Exam Cell',
      actorName: 'Dr. K. Anand',
      action: 'Updated Examination Session',
      details: `Modified examination schedule for ${target?.code || id}. Status: ${updates.status || target?.status}.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_EXAMS', {
      examSessions: updated,
      auditLogs: updatedAuditLogs,
    });

    dataService.updateExamSession(id, updates);

    showToast(`Exam session ${target?.code || ''} updated ✓`, 'success');
  };

  const deleteExamSession = (id) => {
    const target = examSessions.find((s) => s.id === id);
    const updated = examSessions.filter((s) => s.id !== id);
    setExamSessions(updated);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Exam Cell',
      actorName: 'Dr. K. Anand',
      action: 'Cancelled Examination Session',
      details: `Cancelled examination session for ${target?.code || id} (${target?.subject}).`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_EXAMS', {
      examSessions: updated,
      auditLogs: updatedAuditLogs,
    });

    dataService.deleteExamSession(id);

    showToast(`Exam session ${target?.code || ''} cancelled ✓`, 'info');
  };

  const setInternalMarksLock = (courseCode, lockState) => {
    const updatedMarks = internalMarks.map((m) => {
      if (m.courseCode === courseCode) {
        return {
          ...m,
          status: lockState ? 'locked' : 'draft',
        };
      }
      return m;
    });
    setInternalMarks(updatedMarks);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: 'Exam Cell',
      actorName: 'Dr. K. Anand',
      action: lockState ? `Locked CIA Assessment: ${courseCode}` : `Unlocked CIA Assessment: ${courseCode}`,
      details: lockState
        ? `Continuous internal assessment marks for ${courseCode} locked for final semester tabulation.`
        : `Continuous internal assessment marks for ${courseCode} unlocked for department revision.`,
    };
    const updatedAuditLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedAuditLogs);

    broadcastSync('SYNC_EXAMS', {
      internalMarks: updatedMarks,
      auditLogs: updatedAuditLogs,
    });

    dataService.upsertInternalMarks(courseCode, updatedMarks.filter((m) => m.courseCode === courseCode), lockState);

    showToast(
      lockState ? `CIA assessment for ${courseCode} locked ✓` : `CIA assessment for ${courseCode} unlocked ✓`,
      'info'
    );
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

  const createStudent = async (studentData) => {
    const res = await dataService.createStudent(studentData);
    if (res.success) {
      const created = res.data || studentData;
      setStudents((prev) => [created, ...(prev || []).filter((s) => s.id !== created.id)]);
      broadcastSync('SYNC_ADMIN', { students: [created, ...(students || [])] });
      return { success: true, data: created };
    } else {
      showToast(`Error enrolling student: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteStudent = async (studentId) => {
    const res = await dataService.deleteStudent(studentId);
    if (res.success) {
      setStudents((prev) => (prev || []).filter((s) => s.id !== studentId));
      broadcastSync('SYNC_ADMIN', { students: (students || []).filter((s) => s.id !== studentId) });
      return { success: true };
    } else {
      showToast(`Error deleting student: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createFacultyMember = async (facultyData) => {
    const res = await dataService.createFaculty(facultyData);
    if (res.success) {
      const created = res.data || facultyData;
      setFacultyMembers((prev) => [created, ...(prev || []).filter((f) => f.id !== created.id)]);
      broadcastSync('SYNC_ADMIN', { facultyMembers: [created, ...(facultyMembers || [])] });
      return { success: true, data: created };
    } else {
      showToast(`Error adding faculty: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateStudent = async (studentId, updates) => {
    const res = await dataService.updateStudent(studentId, updates);
    if (res.success) {
      setStudents((prev) => (prev || []).map((s) => (s.id === studentId ? { ...s, ...updates } : s)));
      broadcastSync('SYNC_ADMIN', { students: (students || []).map((s) => (s.id === studentId ? { ...s, ...updates } : s)) });
      showToast('Student record updated successfully ✓', 'success');
      return { success: true };
    } else {
      showToast(`Error updating student: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateFacultyMember = async (facultyId, updates) => {
    const res = await dataService.updateFaculty(facultyId, updates);
    if (res.success) {
      setFacultyMembers((prev) => (prev || []).map((f) => (f.id === facultyId ? { ...f, ...updates } : f)));
      broadcastSync('SYNC_ADMIN', { facultyMembers: (facultyMembers || []).map((f) => (f.id === facultyId ? { ...f, ...updates } : f)) });
      showToast('Faculty record updated successfully ✓', 'success');
      return { success: true };
    } else {
      showToast(`Error updating faculty: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteFacultyMember = async (facultyId) => {
    const res = await dataService.deleteFaculty(facultyId);
    if (res.success) {
      setFacultyMembers((prev) => (prev || []).filter((f) => f.id !== facultyId));
      broadcastSync('SYNC_ADMIN', { facultyMembers: (facultyMembers || []).filter((f) => f.id !== facultyId) });
      showToast('Faculty record removed successfully ✓', 'info');
      return { success: true };
    } else {
      showToast(`Error deleting faculty: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createDepartment = async (deptData) => {
    const res = await dataService.createDepartment(deptData);
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
    return res;
  };

  const updateDepartment = async (code, deptData) => {
    const res = await dataService.updateDepartment(code, deptData);
    if (res.success) {
      setDepartments((prev) => (prev || []).map((d) => (d.code === code ? { ...d, ...deptData } : d)));
      broadcastSync('SYNC_ADMIN', { departments: (departments || []).map((d) => (d.code === code ? { ...d, ...deptData } : d)) });
      showToast(`Department ${code} updated successfully ✓`, 'success');
      return { success: true };
    } else {
      showToast(`Error updating department: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteDepartment = async (code) => {
    const res = await dataService.deleteDepartment(code);
    if (res.success) {
      setDepartments((prev) => (prev || []).filter((d) => d.code !== code));
      broadcastSync('SYNC_ADMIN', { departments: (departments || []).filter((d) => d.code !== code) });
      showToast(`Department ${code} archived successfully ✓`, 'info');
      return { success: true };
    } else {
      showToast(`Error deleting department: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createProgram = async (progData) => {
    const res = await dataService.createProgram(progData);
    if (res.success) {
      const created = res.data || progData;
      setPrograms((prev) => [created, ...(prev || []).filter((p) => p.code !== created.code)]);
      showToast(`Degree Program ${created.name} (${created.code}) created ✓`, 'success');
      return { success: true, data: created };
    } else {
      showToast(`Error creating program: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateProgram = async (code, progData) => {
    const res = await dataService.updateProgram(code, progData);
    if (res.success) {
      setPrograms((prev) => (prev || []).map((p) => (p.code === code ? { ...p, ...progData } : p)));
      showToast(`Program ${code} updated ✓`, 'success');
      return { success: true };
    } else {
      showToast(`Error updating program: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteProgram = async (code) => {
    const res = await dataService.deleteProgram(code);
    if (res.success) {
      setPrograms((prev) => (prev || []).filter((p) => p.code !== code));
      showToast(`Program ${code} archived ✓`, 'info');
      return { success: true };
    } else {
      showToast(`Error deleting program: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createClassSection = async (sectionData) => {
    const res = await dataService.createClassSection(sectionData);
    if (res.success) {
      const created = res.data || sectionData;
      setClassSections((prev) => [created, ...(prev || []).filter((s) => s.code !== created.code)]);
      showToast(`Section ${created.name} (${created.code}) chartered ✓`, 'success');
      return { success: true, data: created };
    } else {
      showToast(`Error creating section: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateClassSection = async (code, sectionData) => {
    const res = await dataService.updateClassSection(code, sectionData);
    if (res.success) {
      setClassSections((prev) => (prev || []).map((s) => (s.code === code ? { ...s, ...sectionData } : s)));
      showToast(`Section ${code} updated ✓`, 'success');
      return { success: true };
    } else {
      showToast(`Error updating section: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteClassSection = async (code) => {
    const res = await dataService.deleteClassSection(code);
    if (res.success) {
      setClassSections((prev) => (prev || []).filter((s) => s.code !== code));
      showToast(`Section ${code} archived ✓`, 'info');
      return { success: true };
    } else {
      showToast(`Error deleting section: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createCourse = async (courseData) => {
    const res = await dataService.createCourse(courseData);
    if (res.success) {
      const created = res.data || courseData;
      setCoursesMaster((prev) => [created, ...(prev || []).filter((c) => c.code !== created.code)]);
      showToast(`Course ${created.name} (${created.code}) added ✓`, 'success');
      return { success: true, data: created };
    } else {
      showToast(`Error creating course: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateCourse = async (code, courseData) => {
    const res = await dataService.updateCourse(code, courseData);
    if (res.success) {
      setCoursesMaster((prev) => (prev || []).map((c) => (c.code === code ? { ...c, ...courseData } : c)));
      showToast(`Course ${code} updated ✓`, 'success');
      return { success: true };
    } else {
      showToast(`Error updating course: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteCourse = async (code) => {
    const res = await dataService.deleteCourse(code);
    if (res.success) {
      setCoursesMaster((prev) => (prev || []).filter((c) => c.code !== code));
      showToast(`Course ${code} archived ✓`, 'info');
      return { success: true };
    } else {
      showToast(`Error deleting course: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createAcademicYear = async (ayData) => {
    const res = await dataService.createAcademicYear(ayData);
    if (res.success) {
      const created = res.data || ayData;
      setAcademicYears((prev) => [created, ...(prev || [])]);
      showToast(`Academic Year ${created.name} created ✓`, 'success');
      return { success: true, data: created };
    } else {
      showToast(`Error creating academic year: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateAcademicYear = async (id, ayData) => {
    const res = await dataService.updateAcademicYear(id, ayData);
    if (res.success) {
      setAcademicYears((prev) => (prev || []).map((ay) => (ay.id === id ? { ...ay, ...ayData } : ay)));
      showToast('Academic Year updated ✓', 'success');
      return { success: true };
    } else {
      showToast(`Error updating academic year: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const setCurrentAcademicYear = async (id) => {
    const res = await dataService.setCurrentAcademicYear(id);
    if (res.success) {
      setAcademicYears((prev) => (prev || []).map((ay) => ({ ...ay, isCurrent: ay.id === id, status: ay.id === id ? 'active' : 'archived' })));
      showToast('Current Academic Year updated ✓', 'success');
      return { success: true };
    } else {
      showToast(`Error setting current academic year: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const createTimetableEntry = async (entryData) => {
    const res = await dataService.createTimetableEntry(entryData);
    if (res.success) {
      const created = res.data || entryData;
      setTimetableEntries((prev) => [created, ...(prev || [])]);
      broadcastSync('SYNC_TIMETABLE', { timetableEntries: [created, ...(timetableEntries || [])] });
      showToast(`Timetable schedule slot added for ${created.subject || created.course_id || 'course'} ✓`, 'success');
      return { success: true, data: created };
    } else {
      showToast(`Error scheduling slot: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const updateTimetableEntry = async (id, entryData) => {
    const res = await dataService.updateTimetableEntry(id, entryData);
    if (res.success) {
      setTimetableEntries((prev) => (prev || []).map((t) => (t.id === id ? { ...t, ...entryData } : t)));
      broadcastSync('SYNC_TIMETABLE', { timetableEntries: (timetableEntries || []).map((t) => (t.id === id ? { ...t, ...entryData } : t)) });
      showToast('Timetable schedule updated ✓', 'success');
      return { success: true };
    } else {
      showToast(`Error updating timetable slot: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
  };

  const deleteTimetableEntry = async (id) => {
    const res = await dataService.deleteTimetableEntry(id);
    if (res.success) {
      setTimetableEntries((prev) => (prev || []).filter((t) => t.id !== id));
      broadcastSync('SYNC_TIMETABLE', { timetableEntries: (timetableEntries || []).filter((t) => t.id !== id) });
      showToast('Timetable schedule slot removed ✓', 'info');
      return { success: true };
    } else {
      showToast(`Error removing slot: ${res.error || 'Database error'}`, 'error');
      return { success: false, error: res.error };
    }
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
    const activeStudentId = currentUser?.studentId || currentUser?.id || '';
    setStudents((prev) =>
      prev.map((s) => ((activeStudentId && s.id === activeStudentId) || (currentUser?.email && s.email === currentUser.email) ? { ...s, ...profileData } : s))
    );
    showToast('Profile credentials updated successfully ✓', 'success');
  };

  // Revaluation Workflow
  const submitRevaluationRequest = async (revalData) => {
    const activeStudentId = currentUser?.studentId || currentUser?.id || '';
    const student = (students || []).find((s) => (activeStudentId && s.id === activeStudentId) || (currentUser?.email && s.email === currentUser?.email)) || {};
    const newReq = {
      id: `rev-${Date.now()}`,
      studentId: student.id || activeStudentId,
      rollNo: student.rollNo || '',
      studentName: student.name || currentUser?.userName || currentUser?.name || 'Student',
      courseCode: revalData.courseCode,
      subjectName: revalData.subjectName,
      semester: Number(revalData.semester) || 1,
      originalGrade: revalData.originalGrade || '—',
      originalMarks: Number(revalData.originalMarks) || 0,
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
      facultyName: matData.facultyName || currentUser?.userName || 'Faculty',
      materialType: matData.materialType || 'lecture_notes',
      fileName: matData.fileName || 'course_document.pdf',
      fileUrl: matData.fileUrl || '',
      fileSizeKb: Number(matData.fileSizeKb) || 0,
      visibility: matData.visibility || 'enrolled_class',
      sectionCode: matData.sectionCode || '',
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
    await dataService.uploadCourseMaterial(newMat);
    showToast(`Course material "${newMat.title}" published ✓`, 'success');
  };

  const deleteCourseMaterial = async (id) => {
    const updated = courseMaterials.filter((m) => m.id !== id);
    setCourseMaterials(updated);
    await dataService.deleteCourseMaterial(id);
    broadcastSync('SYNC_MATERIALS', { courseMaterials: updated });
    showToast('Course material deleted ✓', 'info');
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
    await dataService.grantFeeConcession(newConc);
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
        isDemoMode: true,
        resetDemoData,
        isDataLoading,
        dataFetchError,
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
        setFeeStructures,
        paymentHistory,
        setPaymentHistory,
        refundRequests,
        setRefundRequests,
        placementDrives,
        setPlacementDrives,
        studentPlacementApplications,
        setStudentPlacementApplications,
        companies,
        setCompanies,
        placementInterviews,
        setPlacementInterviews,
        placementOffers,
        setPlacementOffers,
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
        programs,
        setPrograms,
        classSections,
        setClassSections,
        coursesMaster,
        setCoursesMaster,
        academicYears,
        setAcademicYears,

        // Mutators / Actions
        markAttendance,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        submitStudentAssignment,
        gradeStudentSubmission,
        toggleAssignmentCompletion,
        submitLeaveRequest,
        approveLeaveRequest,
        payStudentFee,
        createFeeStructure,
        updateFeeStructure,
        deleteFeeStructure,
        createRefundRequest,
        processRefundStatus,
        createPlacementDrive,
        updatePlacementDrive,
        applyPlacementDrive,
        advancePlacementCandidate,
        createCompany,
        updateCompany,
        toggleCompanyStatus,
        scheduleInterview,
        updateInterviewOutcome,
        createPlacementOffer,
        updatePlacementOfferStatus,
        updateInternalMarks,
        setInternalMarksLock,
        addExamSession,
        updateExamSession,
        deleteExamSession,
        publishExamResults,
        sendAnnouncement,
        resolveConflict,
        createUser,
        updateUser,
        toggleUserStatus,
        createStudent,
        updateStudent,
        deleteStudent,
        createFacultyMember,
        updateFacultyMember,
        deleteFacultyMember,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        createProgram,
        updateProgram,
        deleteProgram,
        createClassSection,
        updateClassSection,
        deleteClassSection,
        createCourse,
        updateCourse,
        deleteCourse,
        createAcademicYear,
        updateAcademicYear,
        setCurrentAcademicYear,
        createTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        uploadStudyMaterial,
        uploadCourseMaterial,
        deleteCourseMaterial,
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
