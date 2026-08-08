import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP, STATUS_OPTIONS, formatNilai, getNilaiBgColor, getJuzProgress, JUZ_SURAH_AYAT_RANGE } from '../lib/constants';
import { Siswa } from '../types';
import { CustomSelect } from './CustomSelect';

interface SiswaStatistikModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa | null;
}

export const SiswaStatistikModal: React.FC<SiswaStatistikModalProps> = ({ isOpen, onClose, siswa: currentSiswa }) => {
  const { setoran } = useAppContext();
  
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && currentSiswa && currentSiswa.target && currentSiswa.target.length > 0) {
      if (!selectedJuz || !currentSiswa.target.includes(selectedJuz)) {
        setSelectedJuz(currentSiswa.target[0]);
      }
    } else if (!isOpen) {
      setSelectedJuz(null);
    }
  }, [isOpen, currentSiswa, selectedJuz]);

  if (!isOpen || !currentSiswa) return null;

  const mySetoran = setoran.filter(s => s.siswa_id === currentSiswa.id && s.juz === selectedJuz);

  // Stats
  const statM = mySetoran.filter(s => s.nilai.includes('M') && !s.nilai.includes('JJ')).length;
  const statJJ = mySetoran.filter(s => s.nilai.includes('JJ')).length;
  const statJ = mySetoran.filter(s => s.nilai === 'Jayyid (J)' || s.nilai === 'J').length;

  const getSurahRecords = (surah: string) => {
    if (!selectedJuz) return [];
    return mySetoran.filter(s => s.juz === selectedJuz && s.surah === surah)
      .sort((a,b) => {
         const getAwal = (ayat: string) => {
           if (!ayat || ayat === 'Lengkap 1 Surah' || ayat === 'Lengkap') return 0;
           const m = ayat.match(/\d+/);
           return m ? parseInt(m[0], 10) : 0;
         };
         return getAwal(a.ayat) - getAwal(b.ayat);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#041e49]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 md:p-5 border-b border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
              Statistik <br className="md:hidden" /> <span className="text-[#d19e44] dark:text-[#d19e44]">{currentSiswa.nama}</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Username: {currentSiswa.username || currentSiswa.nis} • {currentSiswa.bin_binti} {currentSiswa.nama_ayah}</p>
          </div>
          <button onClick={onClose} className="absolute right-4 md:right-5 p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 md:p-6 flex-1 custom-scrollbar space-y-4 md:space-y-6">
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Mumtaz', value: statM, colors: { bg: 'bg-slate-50 dark:bg-[#d19e44]/10', border: 'border-[#d19e44]/20 dark:border-[#d19e44]/50', text: 'text-[#d19e44] dark:text-[#d19e44]' } },
              { label: 'J. Jiddan', value: statJJ, colors: { bg: 'bg-slate-50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400' } },
              { label: 'Jayyid', value: statJ, colors: { bg: 'bg-slate-50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-900/50', text: 'text-blue-600 dark:text-blue-400' } },
            ].map((s, i) => (
              <div key={i} className={`bg-white dark:bg-[#031433] p-3 sm:p-4 rounded-2xl shadow-sm border text-center relative overflow-hidden ${s.colors.border}`}>
                <div className={`absolute inset-0 opacity-50 ${s.colors.bg}`}></div>
                <div className={`relative z-10 text-[9px] min-[375px]:text-[10px] sm:text-xs font-bold mb-1 uppercase tracking-wider ${s.colors.text}`}>{s.label}</div>
                <div className={`relative z-10 text-2xl sm:text-3xl font-black ${s.colors.text}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-[#031433] rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            {currentSiswa.target.length === 0 ? (
              <div>
                <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4">Target Juz</h3>
                <span className="text-sm text-slate-500">Siswa ini belum memiliki target juz.</span>
              </div>
            ) : (
              <>
                {currentSiswa.target.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-3">Pilih Target Juz</h3>
                    <CustomSelect
                      value={selectedJuz?.toString() || ''}
                      onChange={(val) => setSelectedJuz(Number(val))}
                      options={currentSiswa.target.map(j => ({ value: j.toString(), label: `Juz ${j}` }))}
                      className="w-full md:w-64 px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#d19e44] outline-none"
                    />
                  </div>
                )}
                
                {selectedJuz && (() => {
                  const currentJuzSurahs = JUZ_SURAH_MAP[selectedJuz] || [];
                  const progressInfo = getJuzProgress(selectedJuz, mySetoran);
                  const isJuz1To28 = selectedJuz <= 28;

                  return (
                  <div className={`${currentSiswa.target.length > 1 ? 'pt-6 border-t border-slate-100 dark:border-slate-700' : ''} fade-in`}>
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Progress Juz {selectedJuz}
                    </span>
                    <span className="text-sm font-bold text-[#d19e44] dark:text-[#d19e44]">
                      {progressInfo.percentage}% <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">({progressInfo.text})</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-[#d19e44] h-2.5 rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${progressInfo.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {isJuz1To28 ? (
                    <>
                      {currentJuzSurahs.map((surah) => {
                        const surahRange = JUZ_SURAH_AYAT_RANGE[selectedJuz]?.[surah];
                        const rangeStr = surahRange ? `Ayat ${surahRange[0]}-${surahRange[1]}` : '';
                        const hasRecords = mySetoran.some(s => s.juz === selectedJuz && s.surah === surah);
                        return (
                          <div key={surah} className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${hasRecords ? 'bg-slate-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-white dark:bg-[#031433] border-slate-200 dark:border-slate-700'}`}>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{surah}</span>
                            <span className="text-[10px] text-slate-500 mt-1">{rangeStr}</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {currentJuzSurahs.map((surah) => {
                        const records = mySetoran.filter(s => s.juz === selectedJuz && s.surah === surah)
                                        .sort((a,b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());
                        const hasRecords = records.length > 0;
                        const r = records[0];
                        const containerColor = hasRecords ? getNilaiBgColor(r.nilai) : 'bg-slate-50 dark:bg-[#031433]/50 border-slate-200 dark:border-slate-700';
                        
                        return (
                          <div key={surah} className={`flex flex-col p-3 rounded-xl border text-left ${containerColor}`}>
                            <span className={`text-sm font-bold block ${hasRecords ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{surah}</span>
                            {hasRecords ? (
                                <span className="text-[10px] mt-1 font-semibold flex flex-col gap-1">
                                  <span className="mb-0.5">{(r.juz <= 28 ? (r.ayat ? `Ayat ${r.ayat}` : 'Lengkap') : (r.ayat && r.ayat !== 'Lengkap 1 Surah' && r.ayat !== 'Lengkap' ? `Ayat ${r.ayat}` : ''))}</span>
                                  <span className="flex flex-wrap items-center gap-1.5">
                                    <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {formatNilai(r.nilai)}</span>
                                    <span className="opacity-75">{new Date(r.tgl).toLocaleDateString('id-ID')}</span>
                                  </span>
                                </span>
                            ) : (
                              <span className="text-[10px] mt-2 font-semibold text-slate-400">Belum disetorkan</span>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {isJuz1To28 && (
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Ayat yang sudah dinilai:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {mySetoran
                        .filter(s => s.juz === selectedJuz)
                        .sort((a,b) => {
                           const surahDiff = a.surah.localeCompare(b.surah);
                           if (surahDiff !== 0) return surahDiff;
                           const getAwal = (ayat: string) => {
                             if (!ayat || ayat === 'Lengkap 1 Surah' || ayat === 'Lengkap') return 0;
                             const m = ayat.match(/\d+/);
                             return m ? parseInt(m[0], 10) : 0;
                           };
                           return getAwal(a.ayat) - getAwal(b.ayat);
                        })
                        .map((r, idx) => {
                           const recordColor = getNilaiBgColor(r.nilai);
                           return (
                             <div key={r.id || idx} className={`flex flex-col p-3 rounded-xl border text-left ${recordColor}`}>
                               <span className="text-sm font-bold">{r.surah}</span>
                               <span className="text-[10px] mt-1 font-semibold flex flex-col gap-1">
                                 <span className="mb-0.5">{(r.juz <= 28 ? (r.ayat ? `Ayat ${r.ayat}` : 'Lengkap') : (r.ayat && r.ayat !== 'Lengkap 1 Surah' && r.ayat !== 'Lengkap' ? `Ayat ${r.ayat}` : ''))}</span>
                                 <span className="flex flex-wrap items-center gap-1.5">
                                   <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {formatNilai(r.nilai)}</span>
                                   <span className="opacity-75">{new Date(r.tgl).toLocaleDateString('id-ID')}</span>
                                 </span>
                               </span>
                             </div>
                           );
                        })}
                        {mySetoran.filter(s => s.juz === selectedJuz).length === 0 && (
                          <div className="col-span-full py-4 text-center text-sm text-slate-500 italic">Belum ada setoran di juz ini.</div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )})()}
            </>
          )}
          </div>

        </div>

      </div>
    </div>
  );
};
