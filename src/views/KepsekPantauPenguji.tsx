import React, { useState } from 'react';
import { useAppContext } from '../lib/AppContext';
import { UserCheck, Users, Search, ChevronRight, Award } from 'lucide-react';
import { getJuzProgress } from '../lib/constants';

export const KepsekPantauPenguji = () => {
  const { penguji, siswa, setoran } = useAppContext();
  const [selectedPengujiId, setSelectedPengujiId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterJuz, setFilterJuz] = useState<number | 'Semua'>('Semua');

  const selectedPenguji = penguji.find(p => p.id === selectedPengujiId);
  const siswaBinaan = selectedPengujiId ? siswa.filter(s => s.penguji_id === selectedPengujiId) : [];
  const allJuzTargets = Array.from(new Set(siswaBinaan.flatMap(s => s.target))).sort((a, b) => b - a);
  
  const displayedSiswa = filterJuz === 'Semua' 
    ? siswaBinaan 
    : siswaBinaan.filter(s => s.target.includes(filterJuz));

  const filteredPenguji = penguji.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 fade-in">
      {!selectedPengujiId ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
              <UserCheck className="w-6 h-6 mr-2 text-[#d19e44]" /> Pantau Penguji
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama penguji..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white outline-none focus:border-[#d19e44] focus:ring-1 focus:ring-[#d19e44]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPenguji.map(p => {
              const students = siswa.filter(s => s.penguji_id === p.id);
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPengujiId(p.id)}
                  className="bg-white dark:bg-[#031433] p-4 md:p-5 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[#d19e44] cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#041e49] shrink-0 text-white flex items-center justify-center font-bold text-lg">
                      {p.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-[15px] group-hover:text-[#d19e44] transition-colors line-clamp-1">{p.nama}</h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">@{p.username}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end shrink-0 pl-2">
                    <p className="text-[11px] text-slate-500 mb-1 font-medium">Siswa Binaan</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white group-hover:text-[#d19e44] transition-colors">{students.length}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-sm dark:bg-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600 group-hover:border-[#d19e44]/30 group-hover:bg-[#d19e44]/10 group-hover:text-[#d19e44] transition-colors">Siswa</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredPenguji.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                Penguji tidak ditemukan.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <button 
                onClick={() => { setSelectedPengujiId(null); setFilterJuz('Semua'); }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors text-slate-700 dark:text-slate-300 flex items-center"
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Kembali
              </button>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white border-l-2 pl-3 border-[#d19e44]">
                {selectedPenguji?.nama}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-4 px-1 mt-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-4 py-3 md:py-2 md:min-w-[140px]">
                <span className="text-[11px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Sudah Tuntas</span>
                <span className="text-xl md:text-lg font-black text-emerald-700 dark:text-emerald-300">
                  {siswaBinaan.filter(s => {
                    const sSetoran = setoran.filter(set => set.siswa_id === s.id);
                    return s.target.length > 0 && s.target.every(juz => getJuzProgress(juz, sSetoran.filter(st => st.juz === juz)).percentage === 100);
                  }).length} Siswa
                </span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3 md:py-2 md:min-w-[140px]">
                <span className="text-[11px] md:text-xs font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Belum Tuntas</span>
                <span className="text-xl md:text-lg font-black text-amber-700 dark:text-amber-300">
                  {siswaBinaan.filter(s => {
                    const sSetoran = setoran.filter(set => set.siswa_id === s.id);
                    return s.target.length === 0 || !s.target.every(juz => getJuzProgress(juz, sSetoran.filter(st => st.juz === juz)).percentage === 100);
                  }).length} Siswa
                </span>
              </div>
            </div>

            {/* Filter Dropdown */}
            {allJuzTargets.length > 0 && (
              <div className="mt-4 px-1">
                <div className="relative w-full md:w-64">
                  <select
                    value={filterJuz}
                    onChange={(e) => setFilterJuz(e.target.value === 'Semua' ? 'Semua' : parseInt(e.target.value, 10))}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white font-bold outline-none focus:border-[#d19e44] focus:ring-1 focus:ring-[#d19e44] appearance-none"
                  >
                    <option value="Semua">Semua Data</option>
                    {allJuzTargets.map(juz => (
                      <option key={juz} value={juz}>
                        Juz {juz}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedSiswa.map(s => {
              const siswaSetoran = setoran.filter(set => set.siswa_id === s.id);
              
              return (
                <div key={s.id} className="bg-white dark:bg-[#031433] p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg">{s.nama}</h3>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Target</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {s.target.map(juz => (
                            <span key={juz} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-semibold">
                              Juz {juz}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {s.target
                      .filter(juz => filterJuz === 'Semua' || juz === filterJuz)
                      .map(juz => {
                      const juzSetoran = siswaSetoran.filter(st => st.juz === juz);
                      const progress = getJuzProgress(juz, juzSetoran);
                      const isComplete = progress.percentage === 100;
                      
                      const countM = juzSetoran.filter(st => st.nilai === 'Mumtaz (M)' || st.nilai === 'M').length;
                      const countJJ = juzSetoran.filter(st => st.nilai === 'Jayyid Jiddan (JJ)' || st.nilai === 'JJ').length;
                      const countJ = juzSetoran.filter(st => st.nilai === 'Jayyid (J)' || st.nilai === 'J').length;

                      return (
                        <div key={juz} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">Progres Juz {juz}</span>
                            <span className={`text-xs md:text-sm font-black ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#d19e44]'}`}>
                              {progress.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 md:h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#d19e44] to-[#e5b869]'}`}
                              style={{ width: `${progress.percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {progress.text} Selesai
                            </span>
                            <div className="flex gap-2">
                              {countM > 0 && <span className="text-[10px] font-bold text-[#d19e44] bg-[#d19e44]/10 px-1.5 py-0.5 rounded">M: {countM}</span>}
                              {countJJ > 0 && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">JJ: {countJJ}</span>}
                              {countJ > 0 && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">J: {countJ}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {displayedSiswa.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-500 bg-white dark:bg-[#031433] rounded-2xl border border-slate-200 dark:border-slate-700">
                Data tidak ditemukan.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
