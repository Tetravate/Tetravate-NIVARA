import fs from 'fs';
import pg from 'pg';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log('Seeding missing tables in demo Supabase PostgreSQL...');
  await client.connect();

  // 1. EXAM SESSIONS
  await client.query(`
    INSERT INTO public.exam_sessions (id, code, subject, subject_code, subject_name, date, exam_date, time_slot, time_window, hall, venue, seat_prefix, total_seats, allocated_seats, total_candidates, status)
    VALUES
      ('exam-1', 'CS301', 'Data Structures & Algorithms', 'CS301', 'Data Structures & Algorithms', '04 Nov 2026', '2026-11-04', '09:30 AM - 12:30 PM', '09:30 AM - 12:30 PM', 'Central Exam Hall - Wing A', 'Central Exam Hall - Wing A', 'CEH-A', 142, 142, 142, 'Scheduled'),
      ('exam-2', 'CS302', 'Database Management Systems', 'CS302', 'Database Management Systems', '07 Nov 2026', '2026-11-07', '09:30 AM - 12:30 PM', '09:30 AM - 12:30 PM', 'Central Exam Hall - Wing B', 'Central Exam Hall - Wing B', 'CEH-B', 142, 142, 142, 'Scheduled'),
      ('exam-3', 'MA301', 'Discrete Mathematics & Probability', 'MA301', 'Discrete Mathematics & Probability', '11 Nov 2026', '2026-11-11', '09:30 AM - 12:30 PM', '09:30 AM - 12:30 PM', 'Academic Block A - Halls 101-104', 'Academic Block A - Halls 101-104', 'AB-101', 142, 142, 142, 'Scheduled'),
      ('exam-4', 'AI301', 'Machine Learning Foundations', 'AI301', 'Machine Learning Foundations', '14 Nov 2026', '2026-11-14', '01:30 PM - 04:30 PM', '01:30 PM - 04:30 PM', 'AI Complex - Halls B201-B204', 'AI Complex - Halls B201-B204', 'AIC-201', 142, 142, 142, 'Scheduled')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ exam_sessions seeded');

  // 2. INTERNAL MARKS
  await client.query(`
    INSERT INTO public.internal_marks (id, student_id, student_name, roll_no, course_code, quiz_score, assignment_score, midterm_score, status)
    VALUES
      ('cia-1', '2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'CS301', 18, 19, 45, 'locked'),
      ('cia-2', '2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'CS302', 17, 18, 42, 'locked'),
      ('cia-3', '2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'CS303', 15, 16, 38, 'draft'),
      ('cia-4', '2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'MA301', 19, 19, 48, 'locked'),
      ('cia-5', '2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'AI301', 20, 20, 47, 'locked')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ internal_marks seeded');

  // 3. RESULTS
  await client.query(`
    INSERT INTO public.results (id, student_id, semester, gpa, cgpa, total_credits, status)
    VALUES
      ('res-1', '2024-AIDS-042', 4, 8.80, 8.72, 23, 'published')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ results seeded');

  // 4. COURSE MATERIALS
  await client.query(`
    INSERT INTO public.course_materials (id, course_code, subject_name, title, description, faculty_name, material_type, file_name, file_url, file_size_kb, visibility, section_code)
    VALUES
      ('mat-1', 'CS301', 'Data Structures & Algorithms', 'Unit 3: Balanced Trees (AVL, Splay & Red-Black)', 'Complete lecture slides with asymptotic rotation complexity and deletion proofs.', 'Dr. Priya Raman', 'Lecture Notes', 'CS301_Unit3_BalancedTrees.pdf', 'https://storage.nivara.edu/courseware/CS301_Unit3.pdf', 3420, 'enrolled', 'AIDS-3A'),
      ('mat-2', 'CS302', 'Database Management Systems', 'ACID Transactions & Two-Phase Locking Protocol', 'Concurrency control, serialization graph testing, and isolation levels walkthrough.', 'Dr. Priya Raman', 'Lecture Notes', 'CS302_Lec14_Transactions.pdf', 'https://storage.nivara.edu/courseware/CS302_Lec14.pdf', 2150, 'enrolled', 'AIDS-3A'),
      ('mat-3', 'CS303', 'Object-Oriented Programming (OOP)', 'Lab Manual: Structural & Behavioral Design Patterns in Modern C++', 'Observer, Strategy, Abstract Factory skeleton code and unit test templates.', 'Prof. Arvind Swamy', 'Lab Manual', 'CS303_LabManual_Patterns.pdf', 'https://storage.nivara.edu/courseware/CS303_Manual.pdf', 4890, 'enrolled', 'AIDS-3A')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ course_materials seeded');

  // 5. REVALUATION REQUESTS
  await client.query(`
    INSERT INTO public.revaluation_requests (id, student_id, student_name, roll_no, course_code, subject_name, semester, original_grade, original_marks, reason, status)
    VALUES
      ('reval-1', '2024-AIDS-042', 'Aadhi Narayanan', '24AD042', 'CS302', 'Database Management Systems', 4, 'B+', 76, 'Question 4b relational algebra optimization was marked uncredited despite correct reduction.', 'submitted')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ revaluation_requests seeded');

  // 6. REFUND REQUESTS
  await client.query(`
    INSERT INTO public.refund_requests (id, student_id, student_name, roll_no, payment_id, receipt_no, amount, reason, status, requested_date)
    VALUES
      ('ref-1', '2024-AIDS-015', 'Kavya S.', '24AD015', 'pay-901', 'REC-2026-091', 5000.00, 'Duplicate transaction debit during fee portal maintenance.', 'approved', '2026-09-28')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ refund_requests seeded');

  // 7. FEE CONCESSIONS
  await client.query(`
    INSERT INTO public.fee_concessions (id, student_id, student_name, category, amount, status, sanctioned_by, academic_year)
    VALUES
      ('conc-1', '2024-AIDS-042', 'Aadhi Narayanan', 'Merit Scholarship (Top 5% CGPA)', 15000.00, 'approved', 'Office of the Bursar', '2026-2027'),
      ('conc-2', '2024-AIDS-015', 'Kavya S.', 'Dean Honor Roll Concession', 20000.00, 'approved', 'Office of the Bursar', '2026-2027')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ fee_concessions seeded');

  // 8. ROOM CONFLICTS
  await client.query(`
    INSERT INTO public.room_conflicts (id, room_name, time_slot, department, day, conflict_details, resolved)
    VALUES
      ('conf-1', 'Hall B204', '11:15 AM - 12:15 PM', 'AIDS vs CSE', 'Thursday', 'CS301 (III AIDS) overlapping with CS402 (IV CSE)', false),
      ('conf-2', 'AI Lab 2', '02:00 PM - 04:00 PM', 'AIDS vs ECE', 'Friday', 'ML Lab Session conflicting with Embedded Systems Lab', false),
      ('conf-3', 'Seminar Audi 1', '03:30 PM - 05:00 PM', 'ECE vs MECH', 'Monday', 'Industry Keynote booked simultaneously by two departments', false)
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ room_conflicts seeded');

  // 9. PLACEMENT INTERVIEWS
  await client.query(`
    INSERT INTO public.placement_interviews (id, drive_id, student_id, student_name, company, type, stage, scheduled_date, time_slot, venue, panel, status)
    VALUES
      ('int-1', 'drive-1', '2024-AIDS-042', 'Aadhi Narayanan', 'Google', 'Interview', 'Technical Interview (Round 1)', '2026-10-22', '03:00 PM - 04:00 PM', 'CDC Placement Wing - Interview Pod 3', 'Google SWE Engineering Panel', 'scheduled')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ placement_interviews seeded');

  // 10. PLACEMENT OFFERS
  await client.query(`
    INSERT INTO public.placement_offers (id, drive_id, student_id, student_name, dept_code, company, role, package_lpa, offer_date, joining_date, offer_status, placement_status)
    VALUES
      ('ofr-1', 'drive-1', '2024-AIDS-015', 'Kavya S.', 'AIDS', 'Google', 'Associate Software Engineer (SWE)', '32.5 LPA', '2026-10-14', '2027-07-01', 'extended', 'placed')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✓ placement_offers seeded');

  await client.end();
  console.log('\n✅ Demo database successfully populated with consistent fictional sample records!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
