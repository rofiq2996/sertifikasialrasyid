const fs = require('fs');

const files = [
  'src/views/Laporan.tsx',
  'src/views/SiswaRiwayatSetoran.tsx',
  'src/views/GuruRiwayat.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  
  // Replace Laporan text shapes for Juz
  text = text.replace(/<span className="text-xs text-amber-600 dark:text-amber-400 font-bold ml-1 border border-emerald-200 px-1\.5 py-0\.5 rounded bg-slate-50 dark:bg-emerald-900\/40 dark:border-emerald-700">Juz \{s\.juz\}<\/span>/g,
    '<span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono ml-1">Juz {s.juz}</span>');

  text = text.replace(/<span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-1 border border-emerald-200 px-1\.5 py-0\.5 rounded bg-slate-50 dark:bg-emerald-900\/40 dark:border-emerald-700">Juz \{s\.juz\}<\/span>/g,
    '<span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono ml-1">Juz {s.juz}</span>');

  // Laporan Nilai BG
  text = text.replace(/<span className={`px-2 py-1 rounded-md font-semibold text-\[10px\] sm:text-xs \$\{\n\s*s\.nilai === 'Mumtaz \(M\)' \? '[^']+' :\n\s*s\.nilai === 'Jayyid Jiddan \(JJ\)' \? '[^']+' :\n\s*'[^']+'\n\s*\}`}>/g,
    '<span className={`font-bold text-[10px] sm:text-xs ${\\n                      s.nilai === \\\'Mumtaz (M)\\\' ? \\\'text-amber-600 dark:text-amber-400\\\' :\\n                      s.nilai === \\\'Jayyid Jiddan (JJ)\\\' ? \\\'text-blue-600 dark:text-blue-400\\\' :\\n                      \\\'text-slate-600 dark:text-slate-400\\\'\\n                    }`}>');

  // SiswaRiwayatSetoran Juz
  text = text.replace(/<span className="inline-flex items-center px-2\.5 py-0\.5 rounded-full text-xs font-bold bg-slate-50 dark:bg-emerald-950\/40 text-emerald-700 dark:text-amber-400 border border-amber-100 dark:border-emerald-900\/40">/g,
    '<span className="text-xs font-bold text-slate-600 dark:text-slate-300">');
  
  // SiswaRiwayatSetoran Nilai BG
  text = text.replace(/<span className={`inline-block px-3 py-1\.5 rounded-xl font-bold text-xs shadow-xs \$\{getNilaiColor\(s\.nilai\)\}`}>/g,
    '<span className={`font-bold text-xs ${getNilaiColor(s.nilai)}`}>');

  // GuruRiwayat Juz
  text = text.replace(/<span className="text-\[10px\] text-amber-600 dark:text-amber-400 font-bold border border-emerald-200 px-1\.5 py-0\.5 rounded bg-slate-50 dark:bg-emerald-900\/40 dark:border-emerald-700 mt-0\.5 inline-block">/g,
    '<span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">');

  // GuruRiwayat Nilai BG
  text = text.replace(/<span className={`px-2\.5 py-1 rounded-lg font-bold text-xs \$\{\n\s*s\.nilai === 'Mumtaz \(M\)' \? '[^']+' :\n\s*s\.nilai === 'Jayyid Jiddan \(JJ\)' \? '[^']+' :\n\s*'[^']+'\n\s*\}`}>/g,
    '<span className={`font-bold text-xs ${\\n                      s.nilai === \\\'Mumtaz (M)\\\' ? \\\'text-amber-600 dark:text-amber-400\\\' :\\n                      s.nilai === \\\'Jayyid Jiddan (JJ)\\\' ? \\\'text-blue-600 dark:text-blue-400\\\' :\\n                      \\\'text-slate-600 dark:text-slate-400\\\'\\n                    }`}>');

  fs.writeFileSync(file, text, 'utf8');
}
console.log('Shapes removed');
