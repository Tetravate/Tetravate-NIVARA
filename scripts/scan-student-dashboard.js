import fs from 'fs';

const content = fs.readFileSync('src/components/roles/StudentDashboard.jsx', 'utf-8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('.split(') || line.includes('.substring(') || line.includes('.slice(') || line.includes('.toLowerCase(') || line.includes('.replace(')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
