import fs from 'fs';
import path from 'path';

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = findFiles('src/components');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for unguarded calls like .split( or .substring( on properties without optional chaining
    const matches = line.match(/(\w+\.\w+)\.(split|substring|toLowerCase|slice)\(/g);
    if (matches) {
      matches.forEach(m => {
        // filter out safe things like window.location or String literals
        if (!m.startsWith('e.') && !m.startsWith('event.') && !m.startsWith('item.') && !m.startsWith('str.') && !m.startsWith('line.')) {
          console.log(`${file}:${idx + 1}: ${m} in line: ${line.trim()}`);
        }
      });
    }
  });
});
