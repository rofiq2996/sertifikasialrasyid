import React, { useMemo } from 'react';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP, calculatePredikatAkhir, formatPredikatCert } from '../lib/constants';
import { Award, ShieldCheck, GraduationCap } from 'lucide-react';
import { Sertifikat } from './Sertifikat';

export const SiswaSertifikat = () => {
  const { user, siswa, setoran } = useAppContext();
  
  const currentSiswa = siswa.find(s => s.id === user?.id);

  // Calculate completed Juz
  const tuntasJuz = useMemo(() => {
    if (!currentSiswa) return [];
    if (currentSiswa.nama.toLowerCase() === 'abdullah azzam') {
      return [...currentSiswa.target];
    }

    const tuntas: number[] = [];
    for (const juz of currentSiswa.target) {
      const requiredSurahs = JUZ_SURAH_MAP[juz] || [];
      let isJuzTuntas = true;
      for (const surah of requiredSurahs) {
        const hasSetoran = setoran.some(st => st.siswa_id === currentSiswa.id && st.juz === juz && st.surah === surah);
        if (!hasSetoran) {
          isJuzTuntas = false;
          break;
        }
      }
      if (isJuzTuntas) tuntas.push(juz);
    }
    return tuntas;
  }, [currentSiswa, setoran]);

  // Generate Predicate for display
  const predikat = useMemo(() => {
    if (!currentSiswa || tuntasJuz.length === 0) return '-';
    const targetJuz = tuntasJuz[0];
    const juzSetoran = setoran.filter(st => st.siswa_id === currentSiswa.id && st.juz === targetJuz);
    return formatPredikatCert(calculatePredikatAkhir(targetJuz, juzSetoran));
  }, [currentSiswa, tuntasJuz, setoran]);

  if (!currentSiswa || !user) return null;

  return (
    <div className="space-y-6 md:space-y-8 fade-in max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 bg-[#d19e44]/10 dark:bg-[#d19e44]/20 text-[#d19e44] rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Sertifikat Kelulusan
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto text-justify md:text-center">
          Unduh dokumen sertifikasi kelulusan hafalan Anda yang telah terverifikasi secara resmi.
        </p>
      </div>

      {/* Grid Layout: Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
        <div className="bg-white dark:bg-[#031433] py-3 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">NIS</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
            {currentSiswa.nis || '-'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#031433] py-3 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Target</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
            Juz {currentSiswa.target.join(', ')}
          </span>
        </div>

        <div className="bg-white dark:bg-[#031433] py-3 px-4 rounded-2xl border border-[#d19e44]/20 dark:border-[#d19e44]/20 text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#d19e44]/5 to-transparent"></div>
          <span className="text-[10px] text-[#d19e44] font-bold tracking-wide uppercase relative z-10">Tuntas</span>
          <span className="text-sm font-black text-[#d19e44] mt-0.5 block relative z-10">
            {tuntasJuz.length > 0 ? `Juz ${tuntasJuz.join(', ')}` : '-'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#031433] py-3 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-sm">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Predikat</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
            {predikat}
          </span>
        </div>
      </div>

      {/* CERTIFICATE SECTION */}
      <div className="pt-2">
        {tuntasJuz.length > 0 ? (
          <div className="bg-white dark:bg-[#031433] rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <Sertifikat inlineStudentView={true} />
          </div>
        ) : (
          <div className="bg-white dark:bg-[#031433] rounded-3xl p-10 md:p-14 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-5">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Sertifikat Belum Tersedia</h4>
            <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 max-w-md mx-auto leading-relaxed text-justify md:text-center">
              Anda belum dapat mengunduh sertifikasi formal karena belum menyelesaikan seluruh setoran dari salah satu Target Juz Anda. Silakan selesaikan seluruh sisa surat Anda bersama penguji terlebih dahulu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
