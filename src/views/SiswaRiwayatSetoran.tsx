import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Calendar, BookOpen } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { formatNilai, getNilaiColor } from '../lib/constants';

export const SiswaRiwayatSetoran = () => {
  const { user, siswa, setoran } = useAppContext();
  const currentSiswa = siswa.find(s => s.id === user?.id);
  
  const mySetoranAll = setoran
    .filter(s => s.siswa_id === user?.id)
    .sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  if (!currentSiswa || !user) return null;

  const totalPages = Math.ceil(mySetoranAll.length / itemsPerPage);
  const paginatedSetoran = mySetoranAll.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 md:space-y-6 fade-in">
      <div className="bg-white dark:bg-[#031433] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Riwayat Setoran Hafalan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar lengkap seluruh setoran hafalan yang telah dinilai penguji</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <table className="w-full text-left text-xs md:text-sm text-slate-600 dark:text-slate-300 min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Surah (Juz)</th>
                <th className="px-4 py-3">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {paginatedSetoran.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3">{new Date(s.tgl).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="block font-medium text-slate-800 dark:text-slate-200">{s.surah}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 block">Juz {s.juz}{s.juz <= 28 ? ` • ${s.ayat || 'Lengkap'}` : (s.ayat && s.ayat !== 'Lengkap 1 Surah' && s.ayat !== 'Lengkap' ? ` • ${s.ayat}` : '')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-[10px] sm:text-xs ${getNilaiColor(s.nilai)}`}>
                      <span className="hidden md:inline">{s.nilai}</span>
                      <span className="md:hidden">{formatNilai(s.nilai)}</span>
                    </span>
                  </td>
                </tr>
              ))}
              {mySetoranAll.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">Tidak ada riwayat setoran</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {mySetoranAll.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#031433]/50">
            <span className="text-xs text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, mySetoranAll.length)} dari {mySetoranAll.length} data
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
