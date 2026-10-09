import fs from 'fs';

// Setup environment for Node environment
const envContent = fs.readFileSync('.env', 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
});

const { loginWithCredentials } = await import('../src/services/authService.js');

async function testAllLogins() {
  const roles = [
    'student@nivara.edu',
    'faculty@nivara.edu',
    'hod@nivara.edu',
    'principal@nivara.edu',
    'admin@nivara.edu',
    'examcell@nivara.edu',
    'finance@nivara.edu',
    'placement@nivara.edu'
  ];

  for (const email of roles) {
    const res = await loginWithCredentials(email, 'Password@123', true);
    console.log(`Login ${email}: success=${res.success}, role=${res.session?.user?.role}, provider=${res.session?.provider}`);
  }
}

testAllLogins();
