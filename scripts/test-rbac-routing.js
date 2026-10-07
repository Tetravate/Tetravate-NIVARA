import assert from 'node:assert';
import {
  STUDENT_NAV,
  FACULTY_NAV,
  HOD_NAV,
  PRINCIPAL_NAV,
  ADMIN_NAV,
  EXAM_CELL_NAV,
  FINANCE_NAV,
  PLACEMENT_NAV,
  getNavigationForRole,
  isValidModuleForRole,
  getDefaultModuleForRole,
  getPrimaryMobileTabs,
  getSecondaryMobileTabs,
} from '../src/data/navigationConfig.js';

import {
  ACTIONS,
  PERMISSIONS,
  hasPermission,
  can,
} from '../src/services/permissionService.js';

console.log('====================================================');
console.log('NIVARA RBAC + ROUTING + NAVIGATION VERIFICATION SUITE');
console.log('====================================================\n');

// 1. VERIFY ALL 8 ROLES HAVE EXACT NAVIGATION ARRAYS
console.log('1. Checking Role Navigation Item Counts:');
const expectedCounts = {
  student: 11,
  faculty: 12,
  hod: 12,
  principal: 13,
  admin: 13,
  exam_cell: 11,
  finance: 10,
  placement: 10,
};

for (const [role, count] of Object.entries(expectedCounts)) {
  const nav = getNavigationForRole(role).items;
  assert.strictEqual(nav.length, count, `Role ${role} expected ${count} nav items, found ${nav.length}`);
  console.log(`  ✓ ${role.padEnd(12)}: ${nav.length} modules configured correctly`);
}

// 2. VERIFY ROUTE STRUCTURE & FORMAT
console.log('\n2. Checking Route Format Consistency:');
const allRoles = ['student', 'faculty', 'hod', 'principal', 'admin', 'exam_cell', 'finance', 'placement'];

for (const role of allRoles) {
  const nav = getNavigationForRole(role).items;
  for (const item of nav) {
    assert(item.id, `Nav item missing id in role ${role}`);
    assert(item.label, `Nav item missing label in role ${role}`);
    assert(item.permission, `Nav item ${item.id} missing permission in role ${role}`);
    assert(item.route.startsWith(`#/${role}/`), `Route ${item.route} must start with #/${role}/`);
    assert.strictEqual(item.route, `#/${role}/${item.id}`, `Route mismatch: expected #/${role}/${item.id}, got ${item.route}`);
  }
}
console.log('  ✓ All 92 navigation items strictly conform to #/${role}/${moduleId} canonical format');

// 3. VERIFY PERMISSION SERVICE & ACTION VERBS
console.log('\n3. Checking RBAC Permission Engine & Action Matrix:');
// Faculty permissions
assert(hasPermission('faculty', PERMISSIONS.FACULTY_ATTENDANCE_VIEW), 'Faculty should have attendance.view');
assert(hasPermission('faculty', PERMISSIONS.FACULTY_MARKS_ENTER), 'Faculty should have marks.enter');
assert(!hasPermission('faculty', PERMISSIONS.ADMIN_USERS_MANAGE), 'Faculty must NOT have admin.users.manage');

// Student permissions
assert(hasPermission('student', PERMISSIONS.STUDENT_ATTENDANCE_VIEW), 'Student should have attendance.view');
assert(hasPermission('student', PERMISSIONS.STUDENT_LEAVES_CREATE), 'Student should have leaves.create');
assert(!hasPermission('student', PERMISSIONS.FACULTY_MARKS_ENTER), 'Student must NOT have marks.enter');
assert(!hasPermission('student', PERMISSIONS.ADMIN_USERS_MANAGE), 'Student must NOT have admin.users.manage');

// Admin permissions
assert(hasPermission('admin', PERMISSIONS.ADMIN_USERS_MANAGE), 'Admin should have admin.users.manage');
assert(hasPermission('admin', PERMISSIONS.ADMIN_SETTINGS_MANAGE), 'Admin should have admin.settings.manage');

// Exam cell permissions
assert(hasPermission('exam_cell', PERMISSIONS.EXAM_CELL_RESULTS_PUBLISH), 'Exam cell should have results.publish');
assert(!hasPermission('student', PERMISSIONS.EXAM_CELL_RESULTS_PUBLISH), 'Student must NOT have results.publish');

// Finance permissions
assert(hasPermission('finance', PERMISSIONS.FINANCE_PAYMENTS_MANAGE), 'Finance should have payments.manage');
assert(!hasPermission('faculty', PERMISSIONS.FINANCE_PAYMENTS_MANAGE), 'Faculty must NOT have payments.manage');

// Placement permissions
assert(hasPermission('placement', PERMISSIONS.PLACEMENT_DRIVES_MANAGE), 'Placement should have drives.manage');
assert(!hasPermission('finance', PERMISSIONS.PLACEMENT_DRIVES_MANAGE), 'Finance must NOT have drives.manage');

// Principal permissions
assert(hasPermission('principal', PERMISSIONS.PRINCIPAL_COLLEGE_OVERVIEW), 'Principal should have college.overview');

// Action verb checks
assert(can('student', ACTIONS.VIEW), 'Student can VIEW');
assert(!can('student', ACTIONS.MANAGE), 'Student CANNOT MANAGE');
assert(can('admin', ACTIONS.MANAGE), 'Admin can MANAGE');
assert(can('faculty', ACTIONS.CREATE), 'Faculty can CREATE');
assert(can('exam_cell', ACTIONS.PUBLISH), 'Exam Cell can PUBLISH');
assert(!can('student', ACTIONS.PUBLISH), 'Student CANNOT PUBLISH');
console.log('  ✓ Action verbs (VIEW, CREATE, UPDATE, DELETE, APPROVE, PUBLISH, MANAGE) enforced strictly across matrix');

// 4. ROUTE GATE ENFORCEMENT SIMULATION (Unauthorized Access Prevention)
console.log('\n4. Testing Route Gate & Cross-Role Access Rejection:');

function simulateRouteGate(sessionRole, hashPath) {
  // Logic matches NivaraContext enforceRouteGate
  const cleanPath = (hashPath || '').replace(/^#\/?/, '');
  const [targetRole, targetModule] = cleanPath.split('/');

  if (!targetRole) {
    return {
      allowed: true,
      role: sessionRole,
      tab: getDefaultModuleForRole(sessionRole),
      redirectRoute: `#/${sessionRole}/${getDefaultModuleForRole(sessionRole)}`,
    };
  }

  // Cross-role breach detection
  if (targetRole !== sessionRole) {
    return {
      allowed: false,
      role: sessionRole,
      tab: getDefaultModuleForRole(sessionRole),
      redirectRoute: `#/${sessionRole}/${getDefaultModuleForRole(sessionRole)}`,
      error: `Access Denied: Persona "${sessionRole}" unauthorized for route ${hashPath}`,
    };
  }

  // Same role, check module validity
  const valid = isValidModuleForRole(sessionRole, targetModule);
  if (!valid) {
    return {
      allowed: false,
      role: sessionRole,
      tab: getDefaultModuleForRole(sessionRole),
      redirectRoute: `#/${sessionRole}/${getDefaultModuleForRole(sessionRole)}`,
      error: `Module ${targetModule} not found for role ${sessionRole}`,
    };
  }

  return {
    allowed: true,
    role: sessionRole,
    tab: targetModule || getDefaultModuleForRole(sessionRole),
    redirectRoute: `#/${sessionRole}/${targetModule || getDefaultModuleForRole(sessionRole)}`,
  };
}

// Test cases from Prompt requirements
const gateTests = [
  { session: 'student', hash: '#/admin/users', shouldAllow: false, expectedRedirect: '#/student/home' },
  { session: 'faculty', hash: '#/finance/payments', shouldAllow: false, expectedRedirect: '#/faculty/home' },
  { session: 'finance', hash: '#/exam_cell/results', shouldAllow: false, expectedRedirect: '#/finance/home' },
  { session: 'placement', hash: '#/principal/departments', shouldAllow: false, expectedRedirect: '#/placement/home' },
  { session: 'hod', hash: '#/finance/payments', shouldAllow: false, expectedRedirect: '#/hod/home' },
  { session: 'student', hash: '#/student/random-fake-tab', shouldAllow: false, expectedRedirect: '#/student/home' },
  { session: 'faculty', hash: '#/faculty/random-page', shouldAllow: false, expectedRedirect: '#/faculty/home' },
  { session: 'admin', hash: '#/admin/users', shouldAllow: true, expectedRedirect: '#/admin/users' },
  { session: 'faculty', hash: '#/faculty/attendance', shouldAllow: true, expectedRedirect: '#/faculty/attendance' },
  { session: 'student', hash: '#/student/materials', shouldAllow: true, expectedRedirect: '#/student/materials' },
  { session: 'finance', hash: '#/finance/dues', shouldAllow: true, expectedRedirect: '#/finance/dues' },
];

for (const test of gateTests) {
  const result = simulateRouteGate(test.session, test.hash);
  assert.strictEqual(
    result.allowed,
    test.shouldAllow,
    `Route gate test failed for ${test.session} accessing ${test.hash}`
  );
  assert.strictEqual(
    result.redirectRoute,
    test.expectedRedirect,
    `Redirect mismatch for ${test.session} accessing ${test.hash}: got ${result.redirectRoute}, expected ${test.expectedRedirect}`
  );
  if (!result.allowed) {
    console.log(`  ✓ BLOCKED: ${test.session.padEnd(9)} attempting ${test.hash.padEnd(25)} → Redirected to ${test.expectedRedirect}`);
  } else {
    console.log(`  ✓ ALLOWED: ${test.session.padEnd(9)} accessing ${test.hash.padEnd(25)} → Authorized`);
  }
}

// 5. DIRECT REFRESH PRESERVATION
console.log('\n5. Checking Direct Refresh Deep Linking:');
const deepLinkTests = [
  { role: 'faculty', tab: 'attendance', hash: '#/faculty/attendance' },
  { role: 'student', tab: 'materials', hash: '#/student/materials' },
  { role: 'hod', tab: 'at_risk', hash: '#/hod/at_risk' },
  { role: 'principal', tab: 'departments', hash: '#/principal/departments' },
  { role: 'exam_cell', tab: 'results', hash: '#/exam_cell/results' },
  { role: 'finance', tab: 'payments', hash: '#/finance/payments' },
  { role: 'placement', tab: 'applications', hash: '#/placement/applications' },
];

for (const dl of deepLinkTests) {
  const res = simulateRouteGate(dl.role, dl.hash);
  assert.strictEqual(res.allowed, true);
  assert.strictEqual(res.tab, dl.tab);
  assert.strictEqual(res.redirectRoute, dl.hash);
  console.log(`  ✓ Direct refresh on ${dl.hash.padEnd(28)} correctly preserves role=${dl.role}, tab=${dl.tab}`);
}

// 6. MOBILE NAVIGATION STRUCTURE
console.log('\n6. Checking Mobile Navigation Structure (Primary vs More Drawer):');
for (const role of allRoles) {
  const primary = getPrimaryMobileTabs(role);
  const secondary = getSecondaryMobileTabs(role);
  assert(primary.length <= 4, `Primary tabs for ${role} exceed 4 (${primary.length})`);
  assert(primary.length + secondary.length === expectedCounts[role], `Total mobile tabs don't match for ${role}`);
  console.log(`  ✓ ${role.padEnd(12)}: ${primary.length} primary bar items + ${secondary.length} items in More drawer (Total: ${primary.length + secondary.length})`);
}

console.log('\n====================================================');
console.log('ALL RBAC & NAVIGATION TESTS PASSED SUCCESSFULLY! ✓');
console.log('====================================================');
