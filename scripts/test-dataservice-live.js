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

async function run() {
  console.log('Testing dataService with live Supabase...');
  
  const depts = await dataService.getDepartments();
  console.log('getDepartments success:', depts.success, 'Count:', depts.data?.length);

  const students = await dataService.getStudents();
  console.log('getStudents success:', students.success, 'Count:', students.data?.length);

  const fees = await dataService.getFeeStructures();
  console.log('getFeeStructures success:', fees.success, 'Count:', fees.data?.length);

  const drives = await dataService.getPlacementDrives();
  console.log('getPlacementDrives success:', drives.success, 'Count:', drives.data?.length);

  const timetable = await dataService.getTimetableEntries();
  console.log('getTimetableEntries success:', timetable.success, 'Count:', timetable.data?.length);

  const announcements = await dataService.getAnnouncements();
  console.log('getAnnouncements success:', announcements.success, 'Count:', announcements.data?.length);

  console.log('\nTesting dataService mutations against live Supabase...');
  
  // Test logging an audit event
  const auditRes = await dataService.logAuditEvent('admin', 'Admin Operations', 'Database Initialization', 'Supabase foundation tables verified');
  console.log('logAuditEvent emitted:', auditRes.action);

  const auditLogs = await dataService.getAuditLogs();
  console.log('getAuditLogs success:', auditLogs.success, 'Count:', auditLogs.data?.length);

  // Test recording an attendance session
  const attRes = await dataService.recordAttendance('CS301', [
    { studentId: '2024-AIDS-042', status: 'present' },
    { studentId: '2024-AIDS-089', status: 'absent' }
  ], 'Dr. Priya Raman');
  console.log('recordAttendance result:', attRes.success);

  const attRecords = await dataService.getCoursesAttendance();
  console.log('getCoursesAttendance count:', attRecords.data?.length);
}

run().catch(console.error);
