const fs = require('fs');

function replace(file, searchValue, replaceValue) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(searchValue, replaceValue);
  fs.writeFileSync(file, content, 'utf8');
}

replace('src/views/DataSiswa.tsx', 'text-amber-600 dark:text-amber-400 font-bold overflow-hidden', 'text-white font-bold overflow-hidden');
replace('src/views/DataPenguji.tsx', 'text-amber-600 font-bold overflow-hidden', 'text-white font-bold overflow-hidden');
replace('src/views/GuruDashboard.tsx', 'text-amber-600 border border-emerald-200', 'text-white border border-emerald-200');
replace('src/views/GuruDashboard.tsx', 'text-amber-600 font-bold mr-3 shrink-0 shadow-sm overflow-hidden', 'text-white font-bold mr-3 shrink-0 shadow-sm overflow-hidden');
console.log("Done");
