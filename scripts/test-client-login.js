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

const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testLogin() {
  console.log('Testing client login with student@nivara.edu / Password@123...');
  const { data, error } = await client.auth.signInWithPassword({
    email: 'student@nivara.edu',
    password: 'Password@123',
  });

  if (error) {
    console.error('Login failed:', error);
  } else {
    console.log('Login SUCCESS! User ID:', data.user.id);
    console.log('Access token present:', Boolean(data.session.access_token));
    
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    console.log('Profile query result:', profile?.role, 'Error:', profileError);
  }
}

testLogin();
