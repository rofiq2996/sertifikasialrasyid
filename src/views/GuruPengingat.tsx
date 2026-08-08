import React, { useState, useMemo } from 'react';
import { useAppContext } from '../lib/AppContext';
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search
} from 'lucide-react';

export const GuruPengingat = () => {
  const { user, siswa, setoran } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const siswaBinaan = useMemo(() => {
    return siswa.filter(s => s.penguji_id === user?.id);
  }, [siswa, user]);

  const pengingatList = useMemo(() => {
    const list: Array<{
      siswa: any;
      lastSetoranTgl: number | null;
      lastSetoran: any;
      daysSinceLast: number;
    }> = [];
    
    const now = new Date().getTime();
    
    siswaBinaan.forEach(s => {
      const siswaSetoran = setoran.filter(set => set.siswa_id === s.id);
      
      if (siswaSetoran.length === 0) {
        list.push({
          siswa: s,
          lastSetoranTgl: null,
          lastSetoran: null,
          daysSinceLast: Infinity
        });
      } else {
        const sorted = [...siswaSetoran].sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());
        const last = sorted[0];
        const lastTgl = new Date(last.tgl).getTime();
        const diffTime = Math.abs(now - lastTgl);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 7) {
          list.push({
            siswa: s,
            lastSetoranTgl: lastTgl,
            lastSetoran: last,
            daysSinceLast: diffDays
          });
        }
      }
    });

    return list.sort((a, b) => b.daysSinceLast - a.daysSinceLast);
  }, [siswaBinaan, setoran]);

  // Statistics
  const stats = useMemo(() => {
    const totalDelayed = pengingatList.filter(item => item.daysSinceLast !== Infinity).length;
    const neverDeposited = pengingatList.filter(item => item.daysSinceLast === Infinity).length;
    
    let avgDays = 0;
    const itemsWithDays = pengingatList.filter(item => item.daysSinceLast !== Infinity && item.daysSinceLast < 1000);
    if (itemsWithDays.length > 0) {
      const sum = itemsWithDays.reduce((acc, curr) => acc + curr.daysSinceLast, 0);
      avgDays = Math.round(sum / itemsWithDays.length);
    }

    return {
      totalBinaan: siswaBinaan.length,
      totalLate: pengingatList.length,
      totalDelayed,
      neverDeposited,
      avgDays
    };
  }, [siswaBinaan, pengingatList]);

  // Combined filters
  const filteredList = useMemo(() => {
    return pengingatList.filter(item => {
      return item.siswa.nama.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [pengingatList, searchTerm]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedData = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 fade-in">
      {/* Premium Header Banner */}
      <div className="bg-[#d19e44] rounded-3xl p-6 md:p-8 text-[#041e49] shadow-sm border border-[#d19e44] relative overflow-hidden">
        {/* Ambient background glowing orbs */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-left">
            <span className="bg-[#041e49]/10 text-[#041e49] font-extrabold text-xs tracking-wider uppercase px-3 py-1 rounded-full border border-[#041e49]/20 inline-block mb-1">
              Evaluasi & Monitoring
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-[#041e49] animate-pulse" />
              Pengingat Setoran Hafalan
            </h2>
            <p className="text-[#041e49]/80 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
              Pantau keaktifan siswa binaan Anda secara berkala. Siswa yang tidak menyetorkan hafalan selama 7 hari atau lebih akan tampil di bawah ini.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 w-full md:w-auto">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/40 text-center flex-1 md:flex-initial shadow-sm">
              <p className="text-[10px] uppercase font-bold text-[#041e49]/80">Siswa Anda</p>
              <p className="text-2xl font-black text-[#041e49]">{stats.totalBinaan}</p>
            </div>
            <div className="bg-red-500/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-red-500/30 text-center flex-1 md:flex-initial shadow-sm">
              <p className="text-[10px] uppercase font-bold text-red-900 dark:text-red-100">Perlu Diingatkan</p>
              <p className="text-2xl font-black text-red-600 dark:text-red-500">{stats.totalLate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pengingat List Container */}
      <div className="bg-white dark:bg-[#031433] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-left">
        
        {/* Info Alert (from image) */}
        <div className="bg-[#fff9f0] border border-[#d19e44]/20 dark:bg-[#d19e44]/30 dark:border-[#d19e44]/40 text-[#d19e44]/90 dark:text-[#d19e44] p-4 rounded-2xl mb-6 text-sm font-medium">
           Daftar siswa yang belum melakukan setoran tahfidz selama <span className="font-extrabold text-[#d19e44]/80 dark:text-[#d19e44]/70">7 hari atau lebih</span>.
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#041e49]/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#d19e44] outline-none text-sm text-slate-800 dark:text-slate-200 transition-all font-medium"
          />
        </div>

        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
          <div className="col-span-5">Siswa</div>
          <div className="col-span-4">Terakhir Setor</div>
          <div className="col-span-3 text-right">Status</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50 border-t border-slate-100 dark:border-slate-700/50 md:border-0 md:pt-0 pt-2">
          {paginatedData.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center fade-in">
              <div className="w-14 h-14 flex items-center justify-center mb-4">
                {/* Exclamation within a green circle */}
                <div className="w-10 h-10 border-[2.5px] border-emerald-500 text-emerald-500 rounded-full flex items-center justify-center font-bold text-xl pb-0.5">
                  !
                </div>
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold tracking-wide">
                Alhamdulillah, tidak ada siswa yang terlambat setoran.
              </p>
            </div>
          ) : (
            paginatedData.map((item) => {
              const isNever = item.daysSinceLast === Infinity;
              return (
                <div key={item.siswa.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 hover:bg-slate-50/50 dark:hover:bg-[#031433]/40 items-center transition-colors">
                  
                  {/* Siswa Column */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-black text-sm text-slate-500 dark:text-slate-400 shrink-0">
                      {item.siswa.nama.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-800 dark:text-white">{item.siswa.nama}</p>
                    </div>
                  </div>

                  {/* Terakhir Setor Column */}
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase mb-1">Terakhir Setor</span>
                    {item.lastSetoran ? (
                      <div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          {new Date(item.lastSetoran.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Juz {item.lastSetoran.juz} • {item.lastSetoran.surah}</p>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-slate-400 italic">Belum pernah setor</span>
                    )}
                  </div>

                  {/* Status & Action Column */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-700/50">
                    <div className="font-bold text-sm">
                      {isNever ? (
                        <span className="text-[#d19e44]">Tanpa Setoran</span>
                      ) : (
                        <span className="text-red-500">{item.daysSinceLast} Hari</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>


        {/* Dynamic Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} siswa
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

