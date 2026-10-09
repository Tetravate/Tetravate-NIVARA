import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
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

console.log('Testing Supabase Client connection...');
console.log('URL:', env.VITE_SUPABASE_URL);
console.log('Key prefix:', env.VITE_SUPABASE_ANON_KEY?.slice(0, 15));

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  try {
    // Attempt a light ping/query
    const { data, error } = await supabase.from('departments').select('*').limit(1);
    if (error) {
      console.log('Query result:', error.message, '(Code:', error.code, ')');
    } else {
      console.log('Query success! Data:', data);
    }
  } catch (err) {
    console.error('Connection exception:', err);
  }
}

test();
