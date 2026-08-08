const fs = require('fs');

const filesToUpdate = ['src/views/AdminDashboard.tsx', 'src/views/SiswaProfil.tsx', 'src/components/Login.tsx'];

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-\[\#0a192f\]/g, 'text-[#041e49]');
  fs.writeFileSync(file, content, 'utf8');
}
