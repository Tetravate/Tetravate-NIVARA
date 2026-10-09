import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const res = await supabase.from('departments').select('*');
  console.log('Direct Supabase departments result:', JSON.stringify(res, null, 2));

  // Also test with service role key if available
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminSupabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const adminRes = await adminSupabase.from('departments').select('*');
    console.log('Admin Supabase departments count:', adminRes.data?.length, 'Error:', adminRes.error);
  }
}

run();
