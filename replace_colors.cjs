const fs = require('fs');
const files = [
  'src/views/GuruDashboard.tsx',
  'src/views/AdminDashboard.tsx',
  'src/views/SiswaNilai.tsx',
  'src/views/DataSiswa.tsx',
  'src/views/DataPenguji.tsx',
  'src/views/GuruPeringkat.tsx',
  'src/views/GuruRiwayat.tsx',
  'src/views/SiswaRiwayatSetoran.tsx',
  'src/views/SiswaSertifikat.tsx',
  'src/views/GuruAktivitas.tsx',
  'src/views/Laporan.tsx',
  'src/components/MainLayout.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Custom color replacements to enforce the Oxford/Harvard aesthetic
  content = content.replace(/emerald-500/g, 'amber-500');
  content = content.replace(/emerald-600/g, 'amber-600');
  content = content.replace(/emerald-400/g, 'amber-400');
  content = content.replace(/emerald-300/g, 'amber-300');
  
  // Specific backgrounds that shouldn't be amber if they were large headers
  content = content.replace(/bg-emerald-600/g, 'bg-[#0a192f]');
  content = content.replace(/bg-emerald-700/g, 'bg-[#0a192f]');
  content = content.replace(/bg-emerald-800/g, 'bg-[#0a192f]');
  content = content.replace(/bg-emerald-100 dark:bg-emerald-900\/10/g, 'bg-[#0a192f]/5 dark:bg-[#0a192f]/40');
  content = content.replace(/bg-emerald-[15]0/g, 'bg-slate-50');
  
  // Gray to Slate 
  content = content.replace(/bg-gray-/g, 'bg-slate-');
  content = content.replace(/text-gray-/g, 'text-slate-');
  content = content.replace(/border-gray-/g, 'border-slate-');
  
  fs.writeFileSync(file, content);
}
console.log('Mass replacement complete');
