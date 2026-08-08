import React, { useMemo } from 'react';
import { useAppContext } from '../lib/AppContext';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const SiswaPengingat = () => {
  const { user, setoran } = useAppContext();

  const mySetoran = useMemo(() => {
    return setoran
      .filter(s => s.siswa_id === user?.id)
      .sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());
  }, [setoran, user]);

  const daysSinceLastSetoran = useMemo(() => {
    if (mySetoran.length === 0) return null;
    const lastDate = new Date(mySetoran[0].tgl);
    const today = new Date();
    // Reset time for accurate day calculation
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [mySetoran]);

  const hasWarning = daysSinceLastSetoran !== null && daysSinceLastSetoran >= 7;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <Bell className="w-6 h-6 mr-2 text-rose-500" />
          Pengingat Setoran
        </h2>
        <p className="text-slate-500 text-sm mt-1">Pantau status keaktifan setoran hafalan Anda.</p>
      </div>

      {mySetoran.length === 0 ? (
        <div className="bg-[#d19e44]/10 dark:bg-[#d19e44]/20 border border-[#d19e44]/30 dark:border-[#d19e44]/90 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#d19e44]/20 dark:bg-[#d19e44]/50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-[#d19e44] dark:text-[#d19e44]" />
          </div>
          <h3 className="text-lg font-bold text-[#d19e44]/90 dark:text-[#d19e44] mb-2">Belum Ada Setoran</h3>
          <p className="text-[#d19e44] dark:text-[#d19e44]/70 max-w-md mx-auto text-justify md:text-center">
            Anda belum pernah melakukan setoran. Ayo segera mulai hafalan dan setorkan kepada guru pembimbing Anda!
          </p>
        </div>
      ) : hasWarning ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-500" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-rose-800 dark:text-rose-400 mb-2">Peringatan: Tidak Setor {daysSinceLastSetoran} Hari</h3>
            <p className="text-rose-700 dark:text-rose-300 leading-relaxed text-justify md:text-left">
              Anda belum menyetorkan hafalan lagi sejak <span className="font-bold">{new Date(mySetoran[0].tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>.
              Teruslah bersemangat murojaah dan menambah hafalan. Jangan biarkan hafalan Anda hilang. Segera setorkan hafalan Anda!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="w-8 h-8 text-[#d19e44] dark:text-[#d19e44]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-emerald-800 dark:text-[#d19e44] mb-2">Alhamdulillah, Setoran Aktif</h3>
            <p className="text-emerald-700 dark:text-[#d19e44]/70 leading-relaxed mb-4 text-justify md:text-left">
              Anda terakhir kali menyetorkan hafalan pada <span className="font-bold">{new Date(mySetoran[0].tgl).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span> ({daysSinceLastSetoran === 0 ? 'Hari ini' : `${daysSinceLastSetoran} hari yang lalu`}).
              Pertahankan semangat Anda dan teruslah istiqomah dengan hafalan ini!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
