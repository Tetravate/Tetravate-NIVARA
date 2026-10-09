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

const fileToRun = process.argv[2] || 'supabase/migrations/20261008_000002_seed_academic_foundation.sql';
console.log('Running SQL migration file:', fileToRun);

const sql = fs.readFileSync(fileToRun, 'utf-8');

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected! Executing SQL...');
    await client.query(sql);
    console.log('Successfully executed:', fileToRun);
    await client.end();
  } catch (err) {
    console.error('SQL Execution failed:', err);
    if (client) await client.end().catch(() => {});
    process.exit(1);
  }
}

run();
