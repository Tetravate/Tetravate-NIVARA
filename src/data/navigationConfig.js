import {
  Home,
  Clock,
  Zap,
  CheckSquare,
  Layers,
  CreditCard,
  Briefcase,
  Calendar,
  FileText,
  Award,
  CalendarDays,
  Users,
  User,
  AlertTriangle,
  Shield,
  TrendingUp,
  Settings,
  ClipboardList,
  Building,
  ScrollText,
  Receipt,
  Percent,
  Send,
  Building2,
  BookOpen,
} from 'lucide-react';
import { PERMISSIONS } from '../services/permissionService.js';

/**
 * SINGLE SOURCE OF TRUTH: ROLE NAVIGATION & MODULE ARCHITECTURE
 * Defines the established final Information Architecture for all 8 roles.
 */

export const STUDENT_NAV = [
  { id: 'home', label: 'Student Home', route: '#/student/home', icon: Home, permission: PERMISSIONS.STUDENT_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'today', label: "Today's Schedule", route: '#/student/today', icon: Clock, permission: PERMISSIONS.STUDENT_SCHEDULE_VIEW, isPrimaryMobile: true },
  { id: 'attendance', label: 'Attendance', route: '#/student/attendance', icon: Zap, permission: PERMISSIONS.STUDENT_ATTENDANCE_VIEW, isPrimaryMobile: true },
  { id: 'assignments', label: 'Assignments', route: '#/student/assignments', icon: CheckSquare, permission: PERMISSIONS.STUDENT_ASSIGNMENTS_VIEW, isPrimaryMobile: true },
  { id: 'materials', label: 'Courses & Materials', route: '#/student/materials', icon: Layers, permission: PERMISSIONS.STUDENT_MATERIALS_VIEW },
  { id: 'fees', label: 'Fees & Dues', route: '#/student/fees', icon: CreditCard, permission: PERMISSIONS.STUDENT_FEES_VIEW },
  { id: 'placement', label: 'Placement Drives', route: '#/student/placement', icon: Briefcase, permission: PERMISSIONS.STUDENT_PLACEMENT_VIEW },
  { id: 'leaves', label: 'Leave Requests', route: '#/student/leaves', icon: Calendar, permission: PERMISSIONS.STUDENT_LEAVES_CREATE },
  { id: 'exams', label: 'Exams & Schedule', route: '#/student/exams', icon: FileText, permission: PERMISSIONS.STUDENT_EXAMS_VIEW },
  { id: 'results', label: 'Results & Academic Record', route: '#/student/results', icon: Award, permission: PERMISSIONS.STUDENT_RESULTS_VIEW },
  { id: 'timetable', label: 'Timetable', route: '#/student/timetable', icon: CalendarDays, permission: PERMISSIONS.STUDENT_TIMETABLE_VIEW },
];

export const FACULTY_NAV = [
  { id: 'home', label: 'Faculty Home', route: '#/faculty/home', icon: Home, permission: PERMISSIONS.FACULTY_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'today', label: "Today's Schedule", route: '#/faculty/today', icon: Clock, permission: PERMISSIONS.FACULTY_CLASSES_VIEW, isPrimaryMobile: true },
  { id: 'classes', label: 'My Classes', route: '#/faculty/classes', icon: BookOpen, permission: PERMISSIONS.FACULTY_CLASSES_VIEW },
  { id: 'attendance', label: 'Attendance', route: '#/faculty/attendance', icon: Zap, permission: PERMISSIONS.FACULTY_ATTENDANCE_VIEW, isPrimaryMobile: true },
  { id: 'assignments', label: 'Assignments', route: '#/faculty/assignments', icon: CheckSquare, permission: PERMISSIONS.FACULTY_ASSIGNMENTS_CREATE, isPrimaryMobile: true },
  { id: 'materials', label: 'Courses & Materials', route: '#/faculty/materials', icon: Layers, permission: PERMISSIONS.FACULTY_MATERIALS_UPLOAD },
  { id: 'marks', label: 'Assessments & Marks', route: '#/faculty/marks', icon: Award, permission: PERMISSIONS.FACULTY_MARKS_ENTER },
  { id: 'students', label: 'Students', route: '#/faculty/students', icon: User, permission: PERMISSIONS.FACULTY_STUDENTS_VIEW },
  { id: 'progress', label: 'Student Progress', route: '#/faculty/progress', icon: TrendingUp, permission: PERMISSIONS.FACULTY_PROGRESS_VIEW },
  { id: 'leaves', label: 'Leave Requests', route: '#/faculty/leaves', icon: Calendar, permission: PERMISSIONS.FACULTY_LEAVES_REVIEW },
  { id: 'announcements', label: 'Announcements', route: '#/faculty/announcements', icon: Send, permission: PERMISSIONS.FACULTY_ANNOUNCEMENTS_POST },
  { id: 'timetable', label: 'Timetable', route: '#/faculty/timetable', icon: CalendarDays, permission: PERMISSIONS.FACULTY_TIMETABLE_VIEW },
];

export const HOD_NAV = [
  { id: 'home', label: 'HOD Home', route: '#/hod/home', icon: Home, permission: PERMISSIONS.HOD_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'overview', label: 'Department Overview', route: '#/hod/overview', icon: Building2, permission: PERMISSIONS.HOD_DEPT_OVERVIEW, isPrimaryMobile: true },
  { id: 'students', label: 'Students', route: '#/hod/students', icon: User, permission: PERMISSIONS.HOD_DEPT_STUDENTS_VIEW },
  { id: 'faculty', label: 'Faculty', route: '#/hod/faculty', icon: Users, permission: PERMISSIONS.HOD_DEPT_FACULTY_VIEW },
  { id: 'attendance', label: 'Attendance', route: '#/hod/attendance', icon: Zap, permission: PERMISSIONS.HOD_DEPT_ATTENDANCE_VIEW, isPrimaryMobile: true },
  { id: 'performance', label: 'Academic Performance', route: '#/hod/performance', icon: Award, permission: PERMISSIONS.HOD_DEPT_PERFORMANCE_VIEW },
  { id: 'at_risk', label: 'At-Risk Students', route: '#/hod/at_risk', icon: AlertTriangle, permission: PERMISSIONS.HOD_AT_RISK_VIEW, isPrimaryMobile: true },
  { id: 'workload', label: 'Faculty Workload', route: '#/hod/workload', icon: ClipboardList, permission: PERMISSIONS.HOD_WORKLOAD_VIEW },
  { id: 'timetable', label: 'Timetable', route: '#/hod/timetable', icon: CalendarDays, permission: PERMISSIONS.HOD_TIMETABLE_VIEW },
  { id: 'approvals', label: 'Approvals', route: '#/hod/approvals', icon: CheckSquare, permission: PERMISSIONS.HOD_APPROVALS_MANAGE },
  { id: 'announcements', label: 'Announcements', route: '#/hod/announcements', icon: Send, permission: PERMISSIONS.HOD_ANNOUNCEMENTS_POST },
  { id: 'reports', label: 'Reports', route: '#/hod/reports', icon: ScrollText, permission: PERMISSIONS.HOD_REPORTS_VIEW },
];

export const PRINCIPAL_NAV = [
  { id: 'home', label: 'Executive Home', route: '#/principal/home', icon: Home, permission: PERMISSIONS.PRINCIPAL_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'overview', label: 'College Overview', route: '#/principal/overview', icon: Building2, permission: PERMISSIONS.PRINCIPAL_COLLEGE_OVERVIEW, isPrimaryMobile: true },
  { id: 'departments', label: 'Departments', route: '#/principal/departments', icon: Building, permission: PERMISSIONS.PRINCIPAL_DEPTS_VIEW, isPrimaryMobile: true },
  { id: 'students', label: 'Students', route: '#/principal/students', icon: User, permission: PERMISSIONS.PRINCIPAL_STUDENTS_VIEW },
  { id: 'faculty', label: 'Faculty', route: '#/principal/faculty', icon: Users, permission: PERMISSIONS.PRINCIPAL_FACULTY_VIEW },
  { id: 'performance', label: 'Academic Performance', route: '#/principal/performance', icon: Award, permission: PERMISSIONS.PRINCIPAL_PERFORMANCE_VIEW },
  { id: 'attendance', label: 'Attendance', route: '#/principal/attendance', icon: Zap, permission: PERMISSIONS.PRINCIPAL_ATTENDANCE_VIEW },
  { id: 'exams_results', label: 'Examinations & Results', route: '#/principal/exams_results', icon: FileText, permission: PERMISSIONS.PRINCIPAL_EXAMS_RESULTS_VIEW },
  { id: 'placements', label: 'Placements', route: '#/principal/placements', icon: Briefcase, permission: PERMISSIONS.PRINCIPAL_PLACEMENTS_VIEW, isPrimaryMobile: true },
  { id: 'finance', label: 'Finance', route: '#/principal/finance', icon: CreditCard, permission: PERMISSIONS.PRINCIPAL_FINANCE_VIEW },
  { id: 'approvals', label: 'Approvals', route: '#/principal/approvals', icon: CheckSquare, permission: PERMISSIONS.PRINCIPAL_APPROVALS_MANAGE },
  { id: 'announcements', label: 'Announcements', route: '#/principal/announcements', icon: Send, permission: PERMISSIONS.PRINCIPAL_ANNOUNCEMENTS_POST },
  { id: 'reports', label: 'Reports', route: '#/principal/reports', icon: ScrollText, permission: PERMISSIONS.PRINCIPAL_REPORTS_VIEW },
];

export const ADMIN_NAV = [
  { id: 'home', label: 'Admin Home', route: '#/admin/home', icon: Home, permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'users', label: 'Users & Roles', route: '#/admin/users', icon: Shield, permission: PERMISSIONS.ADMIN_USERS_MANAGE, isPrimaryMobile: true },
  { id: 'students', label: 'Students', route: '#/admin/students', icon: User, permission: PERMISSIONS.ADMIN_STUDENTS_MANAGE },
  { id: 'faculty', label: 'Faculty', route: '#/admin/faculty', icon: Users, permission: PERMISSIONS.ADMIN_FACULTY_MANAGE },
  { id: 'departments', label: 'Departments', route: '#/admin/departments', icon: Building, permission: PERMISSIONS.ADMIN_DEPTS_MANAGE },
  { id: 'programs', label: 'Programs & Courses', route: '#/admin/programs', icon: BookOpen, permission: PERMISSIONS.ADMIN_PROGRAMS_MANAGE },
  { id: 'subjects', label: 'Subjects', route: '#/admin/subjects', icon: Layers, permission: PERMISSIONS.ADMIN_SUBJECTS_MANAGE },
  { id: 'sections', label: 'Classes & Sections', route: '#/admin/sections', icon: Users, permission: PERMISSIONS.ADMIN_SECTIONS_MANAGE },
  { id: 'conflicts', label: 'Timetable & Rooms', route: '#/admin/conflicts', icon: CalendarDays, permission: PERMISSIONS.ADMIN_TIMETABLE_MANAGE, isPrimaryMobile: true },
  { id: 'academic_years', label: 'Academic Years', route: '#/admin/academic_years', icon: Calendar, permission: PERMISSIONS.ADMIN_ACADEMIC_YEARS_MANAGE },
  { id: 'settings', label: 'System Configuration', route: '#/admin/settings', icon: Settings, permission: PERMISSIONS.ADMIN_SETTINGS_MANAGE, isPrimaryMobile: true },
  { id: 'announcements', label: 'Announcements', route: '#/admin/announcements', icon: Send, permission: PERMISSIONS.ADMIN_ANNOUNCEMENTS_POST },
  { id: 'audit_logs', label: 'Audit Logs', route: '#/admin/audit_logs', icon: ScrollText, permission: PERMISSIONS.ADMIN_AUDIT_LOGS_VIEW },
];

export const EXAM_CELL_NAV = [
  { id: 'home', label: 'Exam Cell Home', route: '#/exam_cell/home', icon: Home, permission: PERMISSIONS.EXAM_CELL_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'calendar', label: 'Exam Calendar', route: '#/exam_cell/calendar', icon: Calendar, permission: PERMISSIONS.EXAM_CELL_CALENDAR_MANAGE, isPrimaryMobile: true },
  { id: 'schedules', label: 'Exam Schedules', route: '#/exam_cell/schedules', icon: CalendarDays, permission: PERMISSIONS.EXAM_CELL_SCHEDULES_MANAGE },
  { id: 'management', label: 'Exam Management', route: '#/exam_cell/management', icon: FileText, permission: PERMISSIONS.EXAM_CELL_EXAMS_MANAGE },
  { id: 'internals', label: 'Internal Assessments', route: '#/exam_cell/internals', icon: ClipboardList, permission: PERMISSIONS.EXAM_CELL_INTERNALS_VERIFY, isPrimaryMobile: true },
  { id: 'marks', label: 'Marks & Grades', route: '#/exam_cell/marks', icon: Award, permission: PERMISSIONS.EXAM_CELL_MARKS_VERIFY },
  { id: 'results', label: 'Results', route: '#/exam_cell/results', icon: Award, permission: PERMISSIONS.EXAM_CELL_RESULTS_PUBLISH, isPrimaryMobile: true },
  { id: 'revaluation', label: 'Revaluation', route: '#/exam_cell/revaluation', icon: CheckSquare, permission: PERMISSIONS.EXAM_CELL_REVALUATION_MANAGE },
  { id: 'records', label: 'Student Records', route: '#/exam_cell/records', icon: User, permission: PERMISSIONS.EXAM_CELL_RECORDS_VIEW },
  { id: 'reports', label: 'Reports', route: '#/exam_cell/reports', icon: ScrollText, permission: PERMISSIONS.EXAM_CELL_REPORTS_VIEW },
  { id: 'announcements', label: 'Announcements', route: '#/exam_cell/announcements', icon: Send, permission: PERMISSIONS.EXAM_CELL_ANNOUNCEMENTS_POST },
];

export const FINANCE_NAV = [
  { id: 'home', label: 'Finance Home', route: '#/finance/home', icon: Home, permission: PERMISSIONS.FINANCE_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'structure', label: 'Fee Structure', route: '#/finance/structure', icon: Building2, permission: PERMISSIONS.FINANCE_STRUCTURE_MANAGE },
  { id: 'students', label: 'Student Accounts', route: '#/finance/students', icon: User, permission: PERMISSIONS.FINANCE_STUDENT_ACCOUNTS_VIEW, isPrimaryMobile: true },
  { id: 'payments', label: 'Payments', route: '#/finance/payments', icon: CheckSquare, permission: PERMISSIONS.FINANCE_PAYMENTS_MANAGE, isPrimaryMobile: true },
  { id: 'dues', label: 'Pending Dues', route: '#/finance/dues', icon: CreditCard, permission: PERMISSIONS.FINANCE_DUES_MANAGE, isPrimaryMobile: true },
  { id: 'receipts', label: 'Receipts', route: '#/finance/receipts', icon: Receipt, permission: PERMISSIONS.FINANCE_RECEIPTS_MANAGE },
  { id: 'refunds', label: 'Refunds', route: '#/finance/refunds', icon: Receipt, permission: PERMISSIONS.FINANCE_REFUNDS_MANAGE },
  { id: 'scholarships', label: 'Scholarships & Concessions', route: '#/finance/scholarships', icon: Percent, permission: PERMISSIONS.FINANCE_SCHOLARSHIPS_MANAGE },
  { id: 'reports', label: 'Reports', route: '#/finance/reports', icon: ScrollText, permission: PERMISSIONS.FINANCE_REPORTS_VIEW },
  { id: 'announcements', label: 'Announcements', route: '#/finance/announcements', icon: Send, permission: PERMISSIONS.FINANCE_ANNOUNCEMENTS_POST },
];

export const PLACEMENT_NAV = [
  { id: 'home', label: 'Placement Home', route: '#/placement/home', icon: Home, permission: PERMISSIONS.PLACEMENT_DASHBOARD_VIEW, isPrimaryMobile: true },
  { id: 'companies', label: 'Companies', route: '#/placement/companies', icon: Building, permission: PERMISSIONS.PLACEMENT_COMPANIES_MANAGE },
  { id: 'drives', label: 'Placement Drives', route: '#/placement/drives', icon: Briefcase, permission: PERMISSIONS.PLACEMENT_DRIVES_MANAGE, isPrimaryMobile: true },
  { id: 'eligibility', label: 'Eligibility', route: '#/placement/eligibility', icon: CheckSquare, permission: PERMISSIONS.PLACEMENT_ELIGIBILITY_MANAGE },
  { id: 'applications', label: 'Applications', route: '#/placement/applications', icon: FileText, permission: PERMISSIONS.PLACEMENT_APPLICATIONS_MANAGE, isPrimaryMobile: true },
  { id: 'interviews', label: 'Tests & Interviews', route: '#/placement/interviews', icon: Calendar, permission: PERMISSIONS.PLACEMENT_INTERVIEWS_MANAGE },
  { id: 'offers', label: 'Offers & Placements', route: '#/placement/offers', icon: Award, permission: PERMISSIONS.PLACEMENT_OFFERS_MANAGE, isPrimaryMobile: true },
  { id: 'students', label: 'Students', route: '#/placement/students', icon: User, permission: PERMISSIONS.PLACEMENT_STUDENTS_VIEW },
  { id: 'announcements', label: 'Announcements', route: '#/placement/announcements', icon: Send, permission: PERMISSIONS.PLACEMENT_ANNOUNCEMENTS_POST },
  { id: 'reports', label: 'Reports', route: '#/placement/reports', icon: ScrollText, permission: PERMISSIONS.PLACEMENT_REPORTS_VIEW },
];

export const ROLE_NAVIGATION_REGISTRY = {
  student: { title: 'Student Portal', items: STUDENT_NAV },
  faculty: { title: 'Faculty Portal', items: FACULTY_NAV },
  hod: { title: 'HOD Department', items: HOD_NAV },
  principal: { title: 'Principal Oversight', items: PRINCIPAL_NAV },
  admin: { title: 'ERP Administration', items: ADMIN_NAV },
  exam_cell: { title: 'Exam Evaluation', items: EXAM_CELL_NAV },
  finance: { title: 'Bursar & Accounts', items: FINANCE_NAV },
  placement: { title: 'Placement Office', items: PLACEMENT_NAV },
};

export const MODULE_ALIASES = {
  student: {
    courses: 'materials',
    schedule: 'today',
    dues: 'fees',
    drives: 'placement',
    placements: 'placement',
    leave: 'leaves',
    exam: 'exams',
    result: 'results',
    profile: 'home',
  },
  faculty: {
    submissions: 'assignments',
    schedule: 'today',
    grading: 'marks',
  },
  hod: {
    academics: 'performance',
    'at-risk': 'at_risk',
    leaves: 'approvals',
    leave: 'approvals',
  },
  principal: {
    academics: 'performance',
    exams: 'exams_results',
    results: 'exams_results',
    financials: 'finance',
    placement: 'placements',
  },
  admin: {
    timetable: 'conflicts',
    rooms: 'conflicts',
    years: 'academic_years',
    config: 'settings',
    configuration: 'settings',
    audit: 'audit_logs',
    logs: 'audit_logs',
  },
  exam_cell: {
    publish: 'results',
    grades: 'marks',
  },
  finance: {
    fees: 'structure',
    dues_mgmt: 'dues',
  },
  placement: {
    recruiter: 'companies',
    interviews_rounds: 'interviews',
  },
};

/**
 * Returns all navigation items for a specific role
 */
export function getNavigationForRole(role) {
  return ROLE_NAVIGATION_REGISTRY[role] || ROLE_NAVIGATION_REGISTRY.student;
}

/**
 * Resolves any module ID or recognized alias to the canonical module ID for that role
 */
export function resolveCanonicalModule(role, moduleId) {
  if (!moduleId) return getDefaultModuleForRole(role);
  const cleanId = String(moduleId).toLowerCase().trim();
  const aliasMap = MODULE_ALIASES[role] || {};
  const mapped = aliasMap[cleanId] || cleanId;
  const roleNav = ROLE_NAVIGATION_REGISTRY[role];
  if (roleNav && roleNav.items.some((item) => item.id === mapped)) {
    return mapped;
  }
  return null;
}

/**
 * Validates if a target module/tab ID belongs to the specified role (including recognized aliases)
 */
export function isValidModuleForRole(role, moduleId) {
  return resolveCanonicalModule(role, moduleId) !== null;
}

/**
 * Returns default home module for a role
 */
export function getDefaultModuleForRole(role) {
  const roleNav = ROLE_NAVIGATION_REGISTRY[role];
  return roleNav?.items[0]?.id || 'home';
}

/**
 * Returns specific module metadata for a role and moduleId
 */
export function getModuleConfig(role, moduleId) {
  const roleNav = ROLE_NAVIGATION_REGISTRY[role];
  if (!roleNav) return null;
  return roleNav.items.find((item) => item.id === moduleId) || null;
}

/**
 * Returns primary navigation tabs for mobile bottom bar (max 4)
 */
export function getPrimaryMobileTabs(role) {
  const items = getNavigationForRole(role).items;
  const primaries = items.filter((item) => item.isPrimaryMobile);
  return primaries.slice(0, 4);
}

/**
 * Returns secondary navigation tabs for mobile "More" menu
 */
export function getSecondaryMobileTabs(role) {
  const items = getNavigationForRole(role).items;
  const primaryIds = new Set(getPrimaryMobileTabs(role).map((p) => p.id));
  return items.filter((item) => !primaryIds.has(item.id));
}
