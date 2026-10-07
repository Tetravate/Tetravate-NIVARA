/**
 * NIVARA INSTITUTIONAL ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION ENGINE
 * 
 * Defines the canonical permission hierarchy and role matrices across all 8 roles.
 * Canonical Action Verbs: VIEW, CREATE, UPDATE, DELETE, APPROVE, PUBLISH, MANAGE.
 */

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  PUBLISH: 'publish',
  MANAGE: 'manage',
};

export const PERMISSIONS = {
  // Student Scope
  STUDENT_DASHBOARD_VIEW: 'student.dashboard.view',
  STUDENT_ATTENDANCE_VIEW: 'attendance.view.self',
  STUDENT_SCHEDULE_VIEW: 'schedule.view.self',
  STUDENT_ASSIGNMENTS_VIEW: 'assignments.view.self',
  STUDENT_ASSIGNMENTS_SUBMIT: 'assignments.submit',
  STUDENT_MATERIALS_VIEW: 'materials.view.enrolled',
  STUDENT_FEES_VIEW: 'fees.view.self',
  STUDENT_FEES_PAY: 'fees.pay',
  STUDENT_PLACEMENT_VIEW: 'placement.view.eligible',
  STUDENT_PLACEMENT_APPLY: 'placement.apply',
  STUDENT_LEAVES_CREATE: 'leaves.create',
  STUDENT_EXAMS_VIEW: 'exams.view.self',
  STUDENT_RESULTS_VIEW: 'results.view.self',
  STUDENT_REVALUATION_SUBMIT: 'revaluation.submit',
  STUDENT_TIMETABLE_VIEW: 'timetable.view.self',

  // Faculty Scope
  FACULTY_DASHBOARD_VIEW: 'faculty.dashboard.view',
  FACULTY_CLASSES_VIEW: 'classes.view.assigned',
  FACULTY_ATTENDANCE_VIEW: 'attendance.view.assigned',
  FACULTY_ATTENDANCE_MARK: 'attendance.mark',
  FACULTY_ASSIGNMENTS_CREATE: 'assignments.create',
  FACULTY_ASSIGNMENTS_GRADE: 'assignments.grade',
  FACULTY_MATERIALS_UPLOAD: 'materials.upload',
  FACULTY_MARKS_ENTER: 'marks.enter',
  FACULTY_MARKS_UPDATE: 'marks.update',
  FACULTY_STUDENTS_VIEW: 'students.view.roster',
  FACULTY_PROGRESS_VIEW: 'progress.view.assigned',
  FACULTY_LEAVES_REVIEW: 'leaves.review',
  FACULTY_ANNOUNCEMENTS_POST: 'announcements.post.class',
  FACULTY_TIMETABLE_VIEW: 'timetable.view.assigned',

  // HOD Scope
  HOD_DASHBOARD_VIEW: 'hod.dashboard.view',
  HOD_DEPT_OVERVIEW: 'department.overview.view',
  HOD_DEPT_STUDENTS_VIEW: 'students.view.department',
  HOD_DEPT_FACULTY_VIEW: 'faculty.view.department',
  HOD_DEPT_ATTENDANCE_VIEW: 'attendance.view.department',
  HOD_DEPT_PERFORMANCE_VIEW: 'performance.view.department',
  HOD_AT_RISK_VIEW: 'at_risk.view.department',
  HOD_WORKLOAD_VIEW: 'workload.view.department',
  HOD_TIMETABLE_VIEW: 'timetable.view.department',
  HOD_LEAVES_APPROVE: 'leaves.approve.department',
  HOD_APPROVALS_MANAGE: 'approvals.manage.department',
  HOD_ANNOUNCEMENTS_POST: 'announcements.post.department',
  HOD_REPORTS_VIEW: 'reports.view.department',

  // Principal / Dean Scope
  PRINCIPAL_DASHBOARD_VIEW: 'principal.dashboard.view',
  PRINCIPAL_COLLEGE_OVERVIEW: 'college.overview.view',
  PRINCIPAL_DEPTS_VIEW: 'departments.view.institutional',
  PRINCIPAL_STUDENTS_VIEW: 'students.view.institutional',
  PRINCIPAL_FACULTY_VIEW: 'faculty.view.institutional',
  PRINCIPAL_PERFORMANCE_VIEW: 'performance.view.institutional',
  PRINCIPAL_ATTENDANCE_VIEW: 'attendance.view.institutional',
  PRINCIPAL_EXAMS_RESULTS_VIEW: 'exams_results.view.institutional',
  PRINCIPAL_PLACEMENTS_VIEW: 'placements.view.institutional',
  PRINCIPAL_FINANCE_VIEW: 'finance.view.institutional',
  PRINCIPAL_APPROVALS_MANAGE: 'approvals.manage.institutional',
  PRINCIPAL_ANNOUNCEMENTS_POST: 'announcements.post.institutional',
  PRINCIPAL_REPORTS_VIEW: 'reports.view.institutional',

  // ERP Administrator Scope
  ADMIN_DASHBOARD_VIEW: 'admin.dashboard.view',
  ADMIN_USERS_MANAGE: 'users.manage',
  ADMIN_ROLES_MANAGE: 'roles.manage',
  ADMIN_STUDENTS_MANAGE: 'students.manage',
  ADMIN_FACULTY_MANAGE: 'faculty.manage',
  ADMIN_DEPTS_MANAGE: 'departments.manage',
  ADMIN_PROGRAMS_MANAGE: 'programs.manage',
  ADMIN_SUBJECTS_MANAGE: 'subjects.manage',
  ADMIN_SECTIONS_MANAGE: 'sections.manage',
  ADMIN_TIMETABLE_MANAGE: 'timetable.manage',
  ADMIN_ACADEMIC_YEARS_MANAGE: 'academic_years.manage',
  ADMIN_SETTINGS_MANAGE: 'system_configuration.manage',
  ADMIN_ANNOUNCEMENTS_POST: 'announcements.post.system',
  ADMIN_AUDIT_LOGS_VIEW: 'audit_logs.view',

  // Exam Cell Scope
  EXAM_CELL_DASHBOARD_VIEW: 'exam_cell.dashboard.view',
  EXAM_CELL_CALENDAR_MANAGE: 'exam_calendar.manage',
  EXAM_CELL_SCHEDULES_MANAGE: 'exam_schedules.manage',
  EXAM_CELL_EXAMS_MANAGE: 'exams.manage',
  EXAM_CELL_INTERNALS_VERIFY: 'internals.verify',
  EXAM_CELL_MARKS_VERIFY: 'marks.verify',
  EXAM_CELL_RESULTS_PUBLISH: 'results.publish',
  EXAM_CELL_REVALUATION_MANAGE: 'revaluation.manage',
  EXAM_CELL_RECORDS_VIEW: 'student_records.view',
  EXAM_CELL_REPORTS_VIEW: 'reports.view.exam',
  EXAM_CELL_ANNOUNCEMENTS_POST: 'announcements.post.exam',

  // Finance & Accounts Scope
  FINANCE_DASHBOARD_VIEW: 'finance.dashboard.view',
  FINANCE_STRUCTURE_MANAGE: 'fee_structure.manage',
  FINANCE_STUDENT_ACCOUNTS_VIEW: 'student_accounts.view',
  FINANCE_PAYMENTS_MANAGE: 'payments.manage',
  FINANCE_DUES_MANAGE: 'dues.manage',
  FINANCE_RECEIPTS_MANAGE: 'receipts.manage',
  FINANCE_REFUNDS_MANAGE: 'refunds.manage',
  FINANCE_SCHOLARSHIPS_MANAGE: 'scholarships.manage',
  FINANCE_REPORTS_VIEW: 'reports.view.finance',
  FINANCE_ANNOUNCEMENTS_POST: 'announcements.post.finance',

  // Placement Officer Scope
  PLACEMENT_DASHBOARD_VIEW: 'placement.dashboard.view',
  PLACEMENT_COMPANIES_MANAGE: 'companies.manage',
  PLACEMENT_DRIVES_MANAGE: 'drives.manage',
  PLACEMENT_ELIGIBILITY_MANAGE: 'eligibility.manage',
  PLACEMENT_APPLICATIONS_MANAGE: 'applications.manage',
  PLACEMENT_INTERVIEWS_MANAGE: 'interviews.manage',
  PLACEMENT_OFFERS_MANAGE: 'offers.manage',
  PLACEMENT_STUDENTS_VIEW: 'students.view.placement',
  PLACEMENT_ANNOUNCEMENTS_POST: 'announcements.post.placement',
  PLACEMENT_REPORTS_VIEW: 'reports.view.placement',
};

/**
 * Role to Permissions Matrix
 */
export const ROLE_PERMISSIONS_MATRIX = {
  student: [
    PERMISSIONS.STUDENT_DASHBOARD_VIEW,
    PERMISSIONS.STUDENT_ATTENDANCE_VIEW,
    PERMISSIONS.STUDENT_SCHEDULE_VIEW,
    PERMISSIONS.STUDENT_ASSIGNMENTS_VIEW,
    PERMISSIONS.STUDENT_ASSIGNMENTS_SUBMIT,
    PERMISSIONS.STUDENT_MATERIALS_VIEW,
    PERMISSIONS.STUDENT_FEES_VIEW,
    PERMISSIONS.STUDENT_FEES_PAY,
    PERMISSIONS.STUDENT_PLACEMENT_VIEW,
    PERMISSIONS.STUDENT_PLACEMENT_APPLY,
    PERMISSIONS.STUDENT_LEAVES_CREATE,
    PERMISSIONS.STUDENT_EXAMS_VIEW,
    PERMISSIONS.STUDENT_RESULTS_VIEW,
    PERMISSIONS.STUDENT_REVALUATION_SUBMIT,
    PERMISSIONS.STUDENT_TIMETABLE_VIEW,
  ],
  faculty: [
    PERMISSIONS.FACULTY_DASHBOARD_VIEW,
    PERMISSIONS.FACULTY_CLASSES_VIEW,
    PERMISSIONS.FACULTY_ATTENDANCE_VIEW,
    PERMISSIONS.FACULTY_ATTENDANCE_MARK,
    PERMISSIONS.FACULTY_ASSIGNMENTS_CREATE,
    PERMISSIONS.FACULTY_ASSIGNMENTS_GRADE,
    PERMISSIONS.FACULTY_MATERIALS_UPLOAD,
    PERMISSIONS.FACULTY_MARKS_ENTER,
    PERMISSIONS.FACULTY_MARKS_UPDATE,
    PERMISSIONS.FACULTY_STUDENTS_VIEW,
    PERMISSIONS.FACULTY_PROGRESS_VIEW,
    PERMISSIONS.FACULTY_LEAVES_REVIEW,
    PERMISSIONS.FACULTY_ANNOUNCEMENTS_POST,
    PERMISSIONS.FACULTY_TIMETABLE_VIEW,
  ],
  hod: [
    PERMISSIONS.HOD_DASHBOARD_VIEW,
    PERMISSIONS.HOD_DEPT_OVERVIEW,
    PERMISSIONS.HOD_DEPT_STUDENTS_VIEW,
    PERMISSIONS.HOD_DEPT_FACULTY_VIEW,
    PERMISSIONS.HOD_DEPT_ATTENDANCE_VIEW,
    PERMISSIONS.HOD_DEPT_PERFORMANCE_VIEW,
    PERMISSIONS.HOD_AT_RISK_VIEW,
    PERMISSIONS.HOD_WORKLOAD_VIEW,
    PERMISSIONS.HOD_TIMETABLE_VIEW,
    PERMISSIONS.HOD_LEAVES_APPROVE,
    PERMISSIONS.HOD_APPROVALS_MANAGE,
    PERMISSIONS.HOD_ANNOUNCEMENTS_POST,
    PERMISSIONS.HOD_REPORTS_VIEW,
  ],
  principal: [
    PERMISSIONS.PRINCIPAL_DASHBOARD_VIEW,
    PERMISSIONS.PRINCIPAL_COLLEGE_OVERVIEW,
    PERMISSIONS.PRINCIPAL_DEPTS_VIEW,
    PERMISSIONS.PRINCIPAL_STUDENTS_VIEW,
    PERMISSIONS.PRINCIPAL_FACULTY_VIEW,
    PERMISSIONS.PRINCIPAL_PERFORMANCE_VIEW,
    PERMISSIONS.PRINCIPAL_ATTENDANCE_VIEW,
    PERMISSIONS.PRINCIPAL_EXAMS_RESULTS_VIEW,
    PERMISSIONS.PRINCIPAL_PLACEMENTS_VIEW,
    PERMISSIONS.PRINCIPAL_FINANCE_VIEW,
    PERMISSIONS.PRINCIPAL_APPROVALS_MANAGE,
    PERMISSIONS.PRINCIPAL_ANNOUNCEMENTS_POST,
    PERMISSIONS.PRINCIPAL_REPORTS_VIEW,
  ],
  admin: [
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_USERS_MANAGE,
    PERMISSIONS.ADMIN_ROLES_MANAGE,
    PERMISSIONS.ADMIN_STUDENTS_MANAGE,
    PERMISSIONS.ADMIN_FACULTY_MANAGE,
    PERMISSIONS.ADMIN_DEPTS_MANAGE,
    PERMISSIONS.ADMIN_PROGRAMS_MANAGE,
    PERMISSIONS.ADMIN_SUBJECTS_MANAGE,
    PERMISSIONS.ADMIN_SECTIONS_MANAGE,
    PERMISSIONS.ADMIN_TIMETABLE_MANAGE,
    PERMISSIONS.ADMIN_ACADEMIC_YEARS_MANAGE,
    PERMISSIONS.ADMIN_SETTINGS_MANAGE,
    PERMISSIONS.ADMIN_ANNOUNCEMENTS_POST,
    PERMISSIONS.ADMIN_AUDIT_LOGS_VIEW,
  ],
  exam_cell: [
    PERMISSIONS.EXAM_CELL_DASHBOARD_VIEW,
    PERMISSIONS.EXAM_CELL_CALENDAR_MANAGE,
    PERMISSIONS.EXAM_CELL_SCHEDULES_MANAGE,
    PERMISSIONS.EXAM_CELL_EXAMS_MANAGE,
    PERMISSIONS.EXAM_CELL_INTERNALS_VERIFY,
    PERMISSIONS.EXAM_CELL_MARKS_VERIFY,
    PERMISSIONS.EXAM_CELL_RESULTS_PUBLISH,
    PERMISSIONS.EXAM_CELL_REVALUATION_MANAGE,
    PERMISSIONS.EXAM_CELL_RECORDS_VIEW,
    PERMISSIONS.EXAM_CELL_REPORTS_VIEW,
    PERMISSIONS.EXAM_CELL_ANNOUNCEMENTS_POST,
  ],
  finance: [
    PERMISSIONS.FINANCE_DASHBOARD_VIEW,
    PERMISSIONS.FINANCE_STRUCTURE_MANAGE,
    PERMISSIONS.FINANCE_STUDENT_ACCOUNTS_VIEW,
    PERMISSIONS.FINANCE_PAYMENTS_MANAGE,
    PERMISSIONS.FINANCE_DUES_MANAGE,
    PERMISSIONS.FINANCE_RECEIPTS_MANAGE,
    PERMISSIONS.FINANCE_REFUNDS_MANAGE,
    PERMISSIONS.FINANCE_SCHOLARSHIPS_MANAGE,
    PERMISSIONS.FINANCE_REPORTS_VIEW,
    PERMISSIONS.FINANCE_ANNOUNCEMENTS_POST,
  ],
  placement: [
    PERMISSIONS.PLACEMENT_DASHBOARD_VIEW,
    PERMISSIONS.PLACEMENT_COMPANIES_MANAGE,
    PERMISSIONS.PLACEMENT_DRIVES_MANAGE,
    PERMISSIONS.PLACEMENT_ELIGIBILITY_MANAGE,
    PERMISSIONS.PLACEMENT_APPLICATIONS_MANAGE,
    PERMISSIONS.PLACEMENT_INTERVIEWS_MANAGE,
    PERMISSIONS.PLACEMENT_OFFERS_MANAGE,
    PERMISSIONS.PLACEMENT_STUDENTS_VIEW,
    PERMISSIONS.PLACEMENT_ANNOUNCEMENTS_POST,
    PERMISSIONS.PLACEMENT_REPORTS_VIEW,
  ],
};

/**
 * Checks if a specific role possesses a permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS_MATRIX[role] || [];
  return permissions.includes(permission);
}

/**
 * General helper to check if a user with given role can perform an action or possesses a permission
 * Supports:
 * - can(role, 'attendance.view') -> checks exact permission
 * - can(role, ACTIONS.VIEW, 'attendance') -> constructs resource.action
 * - can(role, ACTIONS.MANAGE) -> checks if role has capabilities with that action verb
 */
export function can(role, actionOrPermission, resource = null) {
  if (!role || !actionOrPermission) return false;
  if (resource) {
    const permString = `${resource}.${actionOrPermission.toLowerCase()}`;
    return hasPermission(role, permString);
  }
  // 1. Direct permission match
  if (hasPermission(role, actionOrPermission)) return true;

  // 2. Action verb evaluation (e.g. ACTIONS.VIEW, ACTIONS.MANAGE)
  const permissions = ROLE_PERMISSIONS_MATRIX[role] || [];
  const actionLower = actionOrPermission.toLowerCase();
  return permissions.some((p) => p.endsWith(`.${actionLower}`) || p.split('.').includes(actionLower));
}
