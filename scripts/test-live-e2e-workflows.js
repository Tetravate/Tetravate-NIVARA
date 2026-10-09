import fs from 'fs';

// Setup environment for Node environment
const envContent = fs.readFileSync('.env', 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
});

const { dataService } = await import('../src/services/dataService.js');

async function runE2ETests() {
  console.log('=== NIVARA ERP — LIVE SUPABASE END-TO-END WORKFLOW AUDIT ===\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  // 1. ATTENDANCE WORKFLOW
  console.log('--- 1. Testing Attendance Workflow ---');
  const attInsert = await dataService.recordAttendance('CS301', [
    { studentId: '2024-AIDS-042', status: 'present' },
    { studentId: '2024-AIDS-015', status: 'present' },
    { studentId: '2024-AIDS-089', status: 'absent' }
  ], 'Dr. Priya Raman');
  assert(attInsert.success, 'Faculty recorded attendance in Supabase');

  const attRecords = await dataService.getCoursesAttendance();
  assert(attRecords.success && attRecords.data.length >= 3, `Attendance records retrieved from Supabase (Count: ${attRecords.data?.length})`);

  // 2. ASSIGNMENT LIFECYCLE (Create -> Submit -> Grade)
  console.log('\n--- 2. Testing Assignment Lifecycle ---');
  const asgId = `asg-live-${Date.now()}`;
  const asgCreate = await dataService.createAssignment({
    id: asgId,
    course_code: 'CS301',
    course_name: 'Data Structures & Algorithms',
    title: 'Red-Black Tree Self-Balancing Implementation',
    subject: 'Data Structures & Algorithms',
    due_date: '2026-11-20',
    weightage: '15% CIA',
    brief: 'Implement full insertion and deletion recoloring routines.',
    created_by: 'Dr. Priya Raman',
    urgency: 'important'
  });
  assert(asgCreate.success, 'Faculty created assignment in Supabase');

  const subRes = await dataService.submitAssignment(
    asgId,
    '2024-AIDS-042',
    'Aadhi Narayanan',
    'https://github.com/aadhi/rb-tree-solution'
  );
  assert(subRes.success, 'Student submitted assignment in Supabase');

  const gradeRes = await dataService.gradeSubmission(asgId, '2024-AIDS-042', 96, 'Exemplary pointer manipulation and rotation proofs.');
  assert(gradeRes.success, 'Faculty graded student submission in Supabase');

  // 3. LEAVE REQUEST WORKFLOW
  console.log('\n--- 3. Testing Student Leave Workflow ---');
  const leaveRes = await dataService.submitLeave({
    student_id: '2024-AIDS-042',
    student_name: 'Aadhi Narayanan',
    dept_code: 'AIDS',
    reason: 'National AI Hackathon Finals at IIT Bombay',
    start_date: '2026-11-12',
    end_date: '2026-11-15',
    days: 4,
    status: 'pending',
    duty_concession: true
  });
  assert(leaveRes.success, 'Student submitted on-duty leave request to Supabase');

  const leaveList = await dataService.getLeaveRequests();
  assert(leaveList.success && leaveList.data.some(l => l.student_id === '2024-AIDS-042'), 'HOD retrieved pending leave request');

  // 4. FEES & PAYMENT WORKFLOW
  console.log('\n--- 4. Testing Finance & Payment Workflow ---');
  const receiptNo = `REC-LIVE-${Date.now()}`;
  const payRes = await dataService.recordPayment({
    student_id: '2024-AIDS-042',
    studentId: '2024-AIDS-042',
    student_name: 'Aadhi Narayanan',
    receipt_no: receiptNo,
    amount: 45000.00,
    mode: 'Institutional Net Banking',
    transaction_id: `TXN-${Date.now()}`,
    status: 'verified'
  });
  assert(payRes.success, 'Student paid fee and Finance ledger verified in Supabase');

  const payHistory = await dataService.getPayments();
  assert(payHistory.success && payHistory.data.some(p => p.receipt_no === receiptNo), 'Verified payment receipt logged in payment ledger');

  // 5. PLACEMENT RECRUITMENT PIPELINE
  console.log('\n--- 5. Testing Placement & Recruitment Pipeline ---');
  const testDriveId = `drv-test-${Date.now()}`;
  await dataService.createPlacementDrive({
    id: testDriveId,
    company: 'Google',
    role: 'Associate Software Engineer (SWE)',
    deadline: '2026-11-30',
    min_cgpa: 8.5
  });

  const appRes = await dataService.submitPlacementApplication({
    drive_id: testDriveId,
    student_id: '2024-AIDS-042',
    student_name: 'Aadhi Narayanan',
    company: 'Google',
    role: 'Associate Software Engineer (SWE)',
    stage: 'Application Received & Screening',
    status: 'active'
  });
  assert(appRes.success, 'Student submitted placement application to Google drive');

  const stageAdvance = await dataService.advancePlacementStage(testDriveId, '2024-AIDS-042', 'Offer Extended (Selected)');
  assert(stageAdvance.success, 'Placement Officer advanced candidate to "Offer Extended" in Supabase');

  // 6. ANNOUNCEMENT BROADCAST
  console.log('\n--- 6. Testing Institutional Announcement Broadcast ---');
  const announceRes = await dataService.publishAnnouncement({
    title: 'Semester End Theory Examinations Commencing Nov 25',
    content: 'Hall tickets are available for download subject to fee and attendance clearance.',
    scope: 'institutional',
    priority: 'urgent',
    published_by: 'Prof. V. Ramanathan',
    published_role: 'exam_cell'
  });
  assert(announceRes.success, 'Exam Cell published urgent announcement in Supabase');

  const allAnnouncements = await dataService.getAnnouncements();
  assert(allAnnouncements.success && allAnnouncements.data.length >= 3, `Announcements stream synchronized (Count: ${allAnnouncements.data?.length})`);

  console.log(`\n==================================================`);
  console.log(`SUMMARY: ${passCount} Passed, ${failCount} Failed.`);
  console.log(`==================================================`);
  
  if (failCount > 0) process.exit(1);
}

runE2ETests().catch(err => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
