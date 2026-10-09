import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const tables = [
  'departments',
  'programs',
  'academic_years',
  'classes_sections',
  'courses',
  'timetable_entries',
  'exam_sessions',
  'fee_structures',
  'leave_requests',
  'revaluation_requests',
  'audit_logs',
  'assignments',
  'internal_marks',
  'results',
  'companies',
  'placement_drives',
  'placement_applications',
  'placement_offers',
  'payments',
  'refund_requests',
  'fee_concessions',
  'course_materials',
  'announcements'
];

async function check() {
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    console.log(t.padEnd(25), error ? 'ERR: ' + error.message : 'OK (' + (data?.length || 0) + ' rows)');
  }
}

check();
