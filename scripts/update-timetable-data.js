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

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  // Clear previous timetable entries and re-seed clean weekly schedule
  await client.query('DELETE FROM public.timetable_entries;');
  await client.query(`
    INSERT INTO public.timetable_entries 
      (id, course_code, subject_name, faculty_name, section_code, dept_code, day_of_week, time_slot, start_time, end_time, room, is_lab, academic_year)
    VALUES
      ('tt-1', 'CS301', 'Data Structures & Algorithms', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Monday', '09:00 AM - 10:00 AM', '09:00:00', '10:00:00', 'Hall B204', false, '2026-2027'),
      ('tt-2', 'CS302', 'Database Management Systems', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Monday', '10:15 AM - 11:15 AM', '10:15:00', '11:15:00', 'Hall B104', false, '2026-2027'),
      ('tt-3', 'CS301', 'Data Structures & Algorithms', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Tuesday', '10:00 AM - 11:30 AM', '10:00:00', '11:30:00', 'Hall B204', false, '2026-2027'),
      ('tt-4', 'CS302', 'Database Management Systems', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Tuesday', '02:00 PM - 03:30 PM', '14:00:00', '15:30:00', 'Hall B104', false, '2026-2027'),
      ('tt-5', 'MA301', 'Discrete Mathematics & Probability', 'Dr. K. Mohan', 'AIDS-3A', 'AIDS', 'Wednesday', '09:00 AM - 10:00 AM', '09:00:00', '10:00:00', 'Hall A101', false, '2026-2027'),
      ('tt-6', 'CS303', 'Object-Oriented Programming (OOP)', 'Prof. Arvind Swamy', 'AIDS-3A', 'AIDS', 'Wednesday', '11:30 AM - 01:00 PM', '11:30:00', '13:00:00', 'Lab 3', true, '2026-2027'),
      ('tt-7', 'AI301', 'Machine Learning Foundations', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Thursday', '02:00 PM - 04:00 PM', '14:00:00', '16:00:00', 'AI Lab 2', true, '2026-2027'),
      ('tt-8', 'CS301', 'Data Structures & Algorithms', 'Dr. Priya Raman', 'AIDS-3A', 'AIDS', 'Friday', '10:00 AM - 11:30 AM', '10:00:00', '11:30:00', 'Hall B204', false, '2026-2027'),
      ('tt-9', 'CS303', 'Object-Oriented Programming (OOP)', 'Prof. Arvind Swamy', 'AIDS-3A', 'AIDS', 'Friday', '02:00 PM - 03:30 PM', '14:00:00', '15:30:00', 'Hall B104', false, '2026-2027');
  `);
  console.log('✓ timetable_entries updated in Supabase');

  const rows = await client.query('SELECT id, course_code, day_of_week, time_slot FROM public.timetable_entries ORDER BY day_of_week, start_time;');
  console.log('Total timetable rows:', rows.rowCount);

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
