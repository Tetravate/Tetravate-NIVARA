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

const migrationSql = fs.readFileSync('supabase/migrations/20261008_000001_nivara_erp_foundation.sql', 'utf-8');

console.log('Connecting to PostgreSQL database to execute migration...');
const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected! Executing migration SQL...');

    await client.query(migrationSql);
    console.log('Migration SQL executed successfully!');

    // Query tables in public schema
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Created tables in public schema (' + res.rows.length + ' tables):');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

    await client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    if (client) await client.end().catch(() => {});
    process.exit(1);
  }
}

runMigration();
