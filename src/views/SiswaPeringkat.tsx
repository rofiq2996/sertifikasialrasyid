import React, { useState, useMemo } from 'react';
import { useAppContext } from '../lib/AppContext';
import { Trophy, Medal, Users, Globe, BookOpen } from 'lucide-react';
import { getJuzProgress } from '../lib/constants';

export const SiswaPeringkat = () => {
  const { siswa, setoran, user, penguji } = useAppContext();
  const [selectedJuzStr, setSelectedJuzStr] = useState<string>('');

  // Get current siswa
  const currentSiswa = siswa.find(s => s.id === user?.id);
  const currentPenguji = penguji.find(p => p.id === currentSiswa?.penguji_id);

  // What juz has the current student deposited?
  const mySetoran = useMemo(() => setoran.filter(s => s.siswa_id === user?.id), [setoran, user?.id]);
  const myJuzes = useMemo(() => {
    const juzes = new Set(mySetoran.map(s => s.juz));
    return Array.from(juzes).sort((a: any, b: any) => a - b);
  }, [mySetoran]);

  const activeJuz = useMemo(() => {
    if (myJuzes.length === 0) return null;
    const parsed = parseInt(selectedJuzStr);
    if (!isNaN(parsed) && myJuzes.includes(parsed)) {
      return parsed;
    }
    return myJuzes[0];
  }, [selectedJuzStr, myJuzes]);

  // Determine leaderboard
  const rawLeaderboard = useMemo(() => {
    if (activeJuz === null) return [];

    let targetSiswa = siswa;
    
    const map = new Map();
    targetSiswa.forEach(s => {
      map.set(s.id, {
        ...s,
        totalSetoran: 0,
        mumtazCount: 0,
        lastActive: 0,
        setoranList: [] as any[],
      });
    });

    setoran.forEach(set => {
      if (set.juz !== activeJuz) return;
      if (map.has(set.siswa_id)) {
        const p = map.get(set.siswa_id);
        p.totalSetoran += 1;
        p.setoranList.push(set);
        if (set.nilai === 'Mumtaz (M)') p.mumtazCount += 1;
        
        const timestamp = new Date(set.tgl).getTime();
        if (timestamp > p.lastActive) p.lastActive = timestamp;
      }
    });

    const isSurah = activeJuz >= 29;

    return Array.from(map.values())
      .filter(s => s.totalSetoran > 0)
      .map(s => {
         const progress = getJuzProgress(activeJuz, s.setoranList);
         return {
           ...s,
           coveredCount: progress.covered,
           unit: isSurah ? 'SURAH' : 'AYAT'
         };
      })
      .sort((a, b) => {
        // Sort primarily by Mumtaz count
        if (b.mumtazCount !== a.mumtazCount) return b.mumtazCount - a.mumtazCount;
        // Then by total covered
        if (b.coveredCount !== a.coveredCount) return b.coveredCount - a.coveredCount;
        // Then by most recent active
        return b.lastActive - a.lastActive;
      })
      .slice(0, 3); // Hanya 3 terbaik
  }, [siswa, setoran, currentSiswa, activeJuz]);

  const leaderboard = rawLeaderboard;

  return (
    <div className="space-y-6 fade-in pb-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Papan Peringkat {activeJuz !== null && `(Juz ${activeJuz})`}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Pantau 3 peringkat terbaik berdasarkan pencapaian nilai Mumtaz dan total setoran pada juz yang Anda setorkan.
        </p>
      </div>

      {myJuzes.length === 0 ? (
        <div className="bg-[#d19e44]/10 dark:bg-[#d19e44]/20 border border-[#d19e44]/30 dark:border-[#d19e44]/90 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#d19e44]/20 dark:bg-[#d19e44]/50 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[#d19e44] dark:text-[#d19e44]" />
          </div>
          <h3 className="text-lg font-bold text-[#d19e44]/90 dark:text-[#d19e44] mb-2">Belum Ada Setoran</h3>
          <p className="text-[#d19e44] dark:text-[#d19e44]/70 max-w-md mx-auto text-justify md:text-center">
            Anda belum pernah melakukan setoran. Papan peringkat akan muncul setelah Anda mulai menyetorkan hafalan.
          </p>
        </div>
      ) : (
        <>
          {myJuzes.length > 1 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#031433] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
                  <select
                    value={activeJuz ?? ''}
                    onChange={(e) => setSelectedJuzStr(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#041e49] focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    {myJuzes.map(j => (
                      <option key={j} value={j}>Juz {j}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaderboard.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-[#031433] rounded-2xl border border-slate-100 dark:border-slate-700">
                <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-sm">Belum ada data setoran yang masuk dalam peringkat</p>
              </div>
            ) : (
              leaderboard.map((item, index) => {
                const isMe = item.id === user?.id;

                return (
                  <div 
                    key={item.id} 
                    className={`relative bg-white dark:bg-[#031433] rounded-3xl p-6 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                      isMe 
                        ? 'border-2 border-blue-200 dark:border-blue-800' 
                        : 'border border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    {/* Decorative Background Blob matching the image */}
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-slate-50 dark:bg-emerald-900/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-[#d19e44] text-xs font-bold rounded-lg tracking-wide">
                        Juz {activeJuz}
                      </span>
                      {index === 0 ? (
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-slate-400" />
                      ) : (
                        <Medal className="w-6 h-6 text-[#d19e44]" />
                      )}
                    </div>

                    <h3 className="relative z-10 text-xl font-bold text-slate-800 dark:text-white mb-8 pr-4">
                      {item.nama}
                      {isMe && (
                        <span className="inline-block ml-2 align-middle text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                          SAYA
                        </span>
                      )}
                    </h3>

                    <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-slate-500 font-medium">Hafalan Disetor</span>
                        <div className="text-right">
                          <span className="block text-2xl font-extrabold text-[#d19e44] dark:text-[#d19e44] leading-none mb-0.5">
                            {item.coveredCount}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                            {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-slate-500 font-medium">Nilai Mumtaz</span>
                        <div className="text-right">
                          <span className="block text-2xl font-extrabold text-[#d19e44] dark:text-[#d19e44] leading-none mb-0.5">
                            {item.mumtazCount}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                            KALI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
