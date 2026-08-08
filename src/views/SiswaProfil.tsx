import React from 'react';
import { Medal, UserCheck, Info, Trophy, History, TrendingUp, Award } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { getJuzProgress } from '../lib/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const SiswaProfil = ({ setActiveMenu, hasReminder }: { setActiveMenu?: (menu: string) => void, hasReminder?: boolean }) => {
  const { user, siswa, penguji, settings, setoran } = useAppContext();
  const currentSiswa = siswa.find(s => s.id === user?.id);
  const currentPenguji = penguji.find(p => p.id === currentSiswa?.penguji_id);
  const batasAkhir = settings?.batasAkhirSetoran;

  if (!currentSiswa || !user) return null;

  const targets = currentSiswa.target || [];
  const targetLabel = targets.length > 0 ? `Juz ${targets.join(', ')}` : 'Belum Ada Target';
  
  const studentSetoran = setoran.filter(s => s.siswa_id === currentSiswa.id);

  const targetDetails = targets.map(juz => {
    const records = studentSetoran.filter(s => parseInt(String(s.juz)) === parseInt(String(juz)));
    const progress = getJuzProgress(juz, records);
    return {
      juz,
      progress
    }
  });

  const totalPercentage = targetDetails.reduce((acc, detail) => acc + detail.progress.percentage, 0);
  const avgPercentage = targets.length > 0 ? Math.round(totalPercentage / targets.length) : 0;

  // Chart data calculations
  const uniqueDates = Array.from(new Set(studentSetoran.map(s => s.tgl))).sort();
  const chartData = uniqueDates.map(date => {
    const recordsUpToDate = studentSetoran.filter(s => s.tgl <= date);
    const targetP = targets.map(juz => {
      const records = recordsUpToDate.filter(s => parseInt(String(s.juz)) === parseInt(String(juz)));
      return getJuzProgress(juz, records).percentage;
    });
    const sumP = targetP.reduce((acc, p) => acc + p, 0);
    const avgP = targets.length > 0 ? Math.round(sumP / targets.length) : 0;
    
    const dateObj = new Date(date as string);
    const dStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    return {
      tglRaw: date,
      tgl: dStr,
      progress: avgP
    };
  });

  return (
    <div className="space-y-6 md:space-y-8 fade-in pb-10">
      
      {/* Top Navy Background with User Info */}
      <div className="-mt-4 sm:-mt-6 -mx-4 sm:-mx-6 px-4 sm:px-8 pt-4 md:pt-6 pb-12 md:pb-16 md:rounded-b-[2.5rem] bg-[#041e49] text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="z-10 relative">
          <div className="flex items-center gap-3 sm:gap-4">
             <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border border-white/20 shrink-0 shadow-lg shadow-black/10">
              {currentSiswa.foto ? (
                <img src={currentSiswa.foto} alt={currentSiswa.nama} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl sm:text-2xl font-black text-[#041e49] font-sans uppercase">{currentSiswa.nama[0]}</span>
              )}
             </div>
             <div className="min-w-0">
               <div className="flex items-center gap-2 flex-wrap">
                 <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-white leading-tight truncate">{currentSiswa.nama}</h2>
               </div>
               <p className="text-white/90 text-xs sm:text-sm font-medium mt-0.5">
                 ({currentSiswa.bin_binti || 'Bin'} {currentSiswa.nama_ayah || ''})
               </p>
             </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-[#031433]/50 dark:bg-black/30 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold text-white tracking-wide flex items-center select-none max-w-max">
                Username: {currentSiswa.username || currentSiswa.nis || '-'}
              </div>
              <span className="flex items-center gap-1 bg-[#d19e44]/30 text-white border border-[#d19e44]/50 px-2 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap inline-flex">
                <Medal className="w-3 h-3 text-[#d19e44]" /> {currentSiswa.gender === 'P' || currentSiswa.gender === 'Perempuan' ? 'Hafizhah Muda' : 'Hafizh Muda'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-medium pl-0.5">
              <UserCheck className="w-[16px] h-[16px] text-white/95 stroke-[2.5]" />
              <span>Penguji: <strong className="font-extrabold text-white">{currentPenguji?.nama || '-'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping Progress Card */}
      <div className="-mt-8 md:-mt-12 relative z-20 mx-0 sm:mx-0 bg-white dark:bg-[#031433] rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Progress Hafalan</h3>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-extrabold text-[#041e49] dark:text-white leading-none">{avgPercentage}%</span>
          <span className="text-sm font-semibold text-slate-500">Target: {targetLabel}</span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
          <div className="bg-[#d19e44] h-2 rounded-full" style={{ width: `${avgPercentage}%` }}></div>
        </div>
        
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex justify-between items-start w-full">
            <span className="text-xs font-medium text-slate-500">Terus semangat!</span>
            {targetDetails.length > 0 && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-right">
                {targetDetails.map(d => d.progress.text).join(', ')}
              </span>
            )}
          </div>
          {batasAkhir && (
            <span className="text-[10px] font-bold text-red-500 dark:text-red-400">
              Batas Akhir: {new Date(batasAkhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>


      </div>

      {setActiveMenu && (
        <div className="md:hidden mt-6 mb-4 text-center">
          <div className="grid grid-cols-3 gap-4 px-4 max-w-[340px] mx-auto">
            {[
              { id: 'nilai', label: 'Nilai', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-100' },
              { id: 'riwayat', label: 'Riwayat Setoran', icon: History, color: 'text-indigo-500', bg: 'bg-indigo-100' },
              { id: 'peringkat', label: 'Papan Peringkat', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100' },
            ].map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className="flex flex-col items-center justify-center space-y-2 group transition-all active:scale-95"
                >
                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 dark:bg-[#031433] ${menu.bg} dark:bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${menu.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {menu.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white dark:bg-[#031433] border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#d19e44]" />
            <h3 className="font-bold text-slate-800 dark:text-white">Grafik Tren Kemajuan Hafalan</h3>
          </div>
          
          <div className="h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height={192} minWidth={0}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="tgl" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Progress']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#d19e44" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#d19e44', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
