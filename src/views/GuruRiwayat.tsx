import React, { useState, useEffect } from 'react';
import { useAppContext } from '../lib/AppContext';
import { formatNilai, getNilaiColor } from '../lib/constants';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { CustomSelect } from '../components/CustomSelect';
import { Trash2 } from 'lucide-react';

export const GuruRiwayat = () => {
  const { setoran, siswa, user, clearSetoranSiswa } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJuz, setSelectedJuz] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const siswaBinaan = siswa.filter(s => s.penguji_id === user?.id);
  const siswaIds = new Set(siswaBinaan.map(s => s.id));
  
  const history = setoran
    .filter(s => siswaIds.has(s.siswa_id))
    .sort((a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());

  const filteredHistory = history.filter(h => {
    const s = siswaBinaan.find(siswa => siswa.id === h.siswa_id);
    const matchesSearch = s?.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJuz = selectedJuz === 'All' || h.juz === Number(selectedJuz);
    return matchesSearch && matchesJuz;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJuz]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const availableJuz = Array.from(new Set(history.map(h => Number(h.juz)))).sort((a: any, b: any) => a - b);

  const getSiswaName = (id: string) => {
    return siswaBinaan.find(s => s.id === id)?.nama || 'Unknown';
  };

  const handleClear = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Semua riwayat setoran siswa binaan Anda akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Bersihkan!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        clearSetoranSiswa(Array.from(siswaIds)).then(() => {
          Swal.fire('Berhasil!', 'Riwayat setoran telah dibersihkan.', 'success');
        }).catch(err => {
          Swal.fire('Error!', 'Gagal membersihkan riwayat.', 'error');
        });
      }
    });
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto xl:flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari (Siswa/Surat)..." 
              className="w-full pl-10 pr-4 py-3 md:py-2.5 text-base md:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
            />
          </div>
          <div className="w-full sm:w-auto">
            <CustomSelect 
              value={selectedJuz}
              onChange={setSelectedJuz}
              options={[
                { value: 'All', label: 'Semua Juz' },
                ...availableJuz.map(j => ({ value: j.toString(), label: `Juz ${j}` }))
              ]}
              className="py-3 md:py-2.5 px-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#d19e44] w-full min-w-[150px]"
            />
          </div>
        </div>
        <div className="w-full xl:w-auto flex justify-end">
          <button 
            onClick={handleClear}
            disabled={history.length === 0}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-red-100/50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 py-3 md:py-2 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-200/50 dark:border-red-900/50"
          >
            <Trash2 className="w-4 h-4" /> <span>Bersihkan Riwayat</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <table className="w-full text-left text-xs md:text-sm text-slate-600 dark:text-slate-300 min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Surah (Juz)</th>
                <th className="px-4 py-3">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {paginatedHistory.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3">{new Date(s.tgl).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{getSiswaName(s.siswa_id)}</td>
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
              {filteredHistory.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Tidak ada riwayat setoran</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredHistory.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#031433]/50">
            <span className="text-xs text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredHistory.length)} dari {filteredHistory.length} data
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
