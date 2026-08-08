const fs = require('fs');
const files = [
  'src/views/Laporan.tsx',
  'src/views/Sertifikat.tsx',
  'src/views/AdminValidasiSertifikat.tsx',
  'src/views/SiswaPengingat.tsx',
  'src/views/SiswaRiwayatSetoran.tsx',
  'src/views/SiswaSertifikat.tsx',
  'src/views/GuruAktivitas.tsx',
  'src/views/GuruDashboard.tsx',
  'src/views/DataSiswa.tsx',
  'src/views/GuruPengingat.tsx',
  'src/views/SiswaPeringkat.tsx',
  'src/views/GuruRiwayat.tsx',
  'src/views/DataPenguji.tsx',
  'src/components/PengujiFormModal.tsx',
  'src/components/SiswaFormModal.tsx',
  'src/components/EditProfileModal.tsx',
  'src/components/CustomTemplateEditor.tsx',
  'src/components/SiswaStatistikModal.tsx',
  'src/components/CustomSelect.tsx',
  'src/lib/constants.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/emerald-500/g, 'amber-500');
  content = content.replace(/emerald-600/g, 'amber-600');
  content = content.replace(/emerald-400/g, 'amber-400');
  content = content.replace(/emerald-300/g, 'amber-300');
  
  content = content.replace(/bg-emerald-600/g, 'bg-[#0a192f]');
  content = content.replace(/bg-emerald-700/g, 'bg-[#0a192f]');
  content = content.replace(/bg-emerald-800/g, 'bg-[#0a192f]');
  content = content.replace(/bg-emerald-[15]0 /g, 'bg-slate-50 ');
  content = content.replace(/bg-emerald-[15]0/g, 'bg-slate-50');
  content = content.replace(/emerald-100/g, 'amber-100');
  
  // Quick fix for gray
  content = content.replace(/bg-gray-/g, 'bg-slate-');
  content = content.replace(/text-gray-/g, 'text-slate-');
  content = content.replace(/border-gray-/g, 'border-slate-');
  
  fs.writeFileSync(file, content);
}
console.log('Mass replacement complete');
