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

const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
console.log('Connecting to Supabase Auth Admin with service role key...');

const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const accounts = [
  { email: 'student@nivara.edu', password: 'Password@123', role: 'student', name: 'Aadhi Narayanan' },
  { email: 'faculty@nivara.edu', password: 'Password@123', role: 'faculty', name: 'Dr. Priya Raman' },
  { email: 'hod@nivara.edu', password: 'Password@123', role: 'hod', name: 'Dr. K. Mohan' },
  { email: 'principal@nivara.edu', password: 'Password@123', role: 'principal', name: 'Dr. Aris Thorne' },
  { email: 'admin@nivara.edu', password: 'Password@123', role: 'admin', name: 'System Controller' },
  { email: 'examcell@nivara.edu', password: 'Password@123', role: 'exam_cell', name: 'Prof. V. Ramanathan' },
  { email: 'finance@nivara.edu', password: 'Password@123', role: 'finance', name: 'Mrs. S. Mythili' },
  { email: 'placement@nivara.edu', password: 'Password@123', role: 'placement', name: 'Dr. S. Kapoor' }
];

async function createUsers() {
  for (const acc of accounts) {
    console.log(`Checking/creating auth user: ${acc.email}...`);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: {
        full_name: acc.name,
        role: acc.role
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.status === 422) {
        console.log(`User ${acc.email} already registered in auth.users.`);
      } else {
        console.error(`Error creating ${acc.email}:`, error.message);
      }
    } else {
      console.log(`Created auth user ${acc.email} (ID: ${data.user.id})!`);
      // Update public.profiles with user_id
      await supabaseAdmin
        .from('profiles')
        .update({ user_id: data.user.id })
        .eq('email', acc.email);
    }
  }
}

createUsers().catch(console.error);
