const fs = require('fs');

const files = [
  'src/views/Laporan.tsx',
  'src/views/SiswaRiwayatSetoran.tsx',
  'src/views/GuruRiwayat.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\'/g, "'");
  fs.writeFileSync(file, text, 'utf8');
}
console.log('Fixed literal newlines');
