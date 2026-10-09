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
  await client.query(`
    CREATE OR REPLACE FUNCTION public.fn_recalculate_department_attendance()
    RETURNS TRIGGER AS $$
    DECLARE
        v_dept_code VARCHAR(32);
        v_avg NUMERIC(5,2);
    BEGIN
        v_dept_code := COALESCE(NEW.dept_code, OLD.dept_code);
        IF v_dept_code IS NOT NULL THEN
            SELECT ROUND(AVG(attendance_pct), 2) INTO v_avg
            FROM public.students
            WHERE dept_code = v_dept_code;
            
            UPDATE public.departments
            SET avg_attendance = COALESCE(v_avg, 85.00)
            WHERE code = v_dept_code;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  console.log('Trigger function updated successfully!');
  await client.end();
}

run();
