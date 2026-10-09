import pg from 'pg';
import fs from 'fs';

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
  const tables = [
    'departments', 'programs', 'academic_years', 'classes_sections',
    'profiles', 'faculty', 'students', 'courses', 'timetable_entries',
    'fee_structures', 'companies', 'placement_drives', 'announcements'
  ];

  console.log('--- DATABASE STATE VERIFICATION ---');
  for (const table of tables) {
    const res = await client.query(`SELECT count(*) FROM public.${table};`);
    console.log(`${table.padEnd(22)}: ${res.rows[0].count} rows`);
  }
  await client.end();
}

run();
