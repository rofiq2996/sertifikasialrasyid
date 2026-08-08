import React from 'react';
import { useAppContext } from '../lib/AppContext';
import { TrendingUp, Medal, Trophy } from 'lucide-react';
import { SURAH_AYAT_COUNT } from '../lib/constants';

export const GuruAktivitas = () => {
  const { setoran, siswa, user } = useAppContext();
  
  const siswaBinaan = siswa.filter(s => s.penguji_id === user?.id);
  const siswaIds = new Set(siswaBinaan.map(s => s.id));
  
  const relevantSetoran = setoran.filter(s => siswaIds.has(s.siswa_id));

  // Determine available juz from setoran
  const availableJuz: number[] = Array.from(new Set(relevantSetoran.map(s => Number(s.juz)))).sort((a: any, b: any) => a - b) as number[];

  const activeStudentsPerJuz = availableJuz.map((juz: number) => {
    const targetSetoran = relevantSetoran.filter(s => s.juz === juz);
    
    const activityMap: Record<string, { nama: string; totalSkor: number; lastSetoranTgl: number }> = {};
    
    targetSetoran.forEach(s => {
      if (!activityMap[s.siswa_id]) {
        const studentInfo = siswaBinaan.find(siswa => siswa.id === s.siswa_id);
        activityMap[s.siswa_id] = {
          nama: studentInfo?.nama || 'Unknown',
          totalSkor: 0,
          lastSetoranTgl: 0,
        };
      }
      
      let poin = 1;
      if (s.juz <= 28) {
        if (s.ayat && s.ayat.toLowerCase().includes('lengkap')) {
          poin = SURAH_AYAT_COUNT[s.surah] || 1;
        } else if (s.ayat) {
          const match = s.ayat.match(/(\d+)/);
          if (match) {
            poin = parseInt(match[1], 10);
          }
        }
      }
      
      const sTime = new Date(s.tgl).getTime();
      if (sTime > activityMap[s.siswa_id].lastSetoranTgl) {
        activityMap[s.siswa_id].lastSetoranTgl = sTime;
      }
      
      activityMap[s.siswa_id].totalSkor += poin;
    });

    const topStudent = Object.values(activityMap).sort((a, b) => {
      if (b.totalSkor !== a.totalSkor) {
        return b.totalSkor - a.totalSkor;
      }
      return a.lastSetoranTgl - b.lastSetoranTgl;
    })[0];

    return {
      juz,
      student: topStudent
    };
  }).filter(item => item.student != null);

  return (
    <div className="space-y-6 fade-in h-full flex flex-col pb-6">
      <div className="bg-white dark:bg-[#031433] rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d19e44]/20 dark:bg-[#d19e44]/50 flex items-center justify-center text-[#d19e44]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Siswa Teraktif per Juz</h2>
          </div>
        </div>

        {activeStudentsPerJuz.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <p>Belum ada data aktivitas siswa.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeStudentsPerJuz.map((item, idx) => (
              <div key={idx} className="flex flex-col p-5 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:-translate-y-1 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                     <span className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1 md:py-1.5 rounded-lg flex items-center">Juz {item.juz}</span>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500 opacity-80" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{item.student.nama}</h3>
                  <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-600 pt-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Skor</p>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#d19e44] dark:text-[#d19e44] leading-none">{item.student.totalSkor}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.juz <= 28 ? 'Ayat' : 'Surah'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tl from-[#d19e44]/[0.08] to-transparent rounded-tl-full pointer-events-none transition-transform group-hover:scale-125"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

