import React, { useState, useEffect } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { formatNilai, getNilaiColor } from '../lib/constants';
import { exportLaporanToExcel } from '../lib/excelExport';
import { exportLaporanToPDF } from '../lib/pdfExport';
import { CustomSelect } from '../components/CustomSelect';
import Swal from 'sweetalert2';

export const Laporan = () => {
  const { setoran, siswa, penguji, clearAllSetoran } = useAppContext();
  const [exportFormat, setExportFormat] = useState('semua_nilai');
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getSiswaName = (id: string) => {
    return siswa.find(s => s.id === id)?.nama || 'Unknown';
  };

  const filteredSetoran = setoran.filter(s => {
    const sName = getSiswaName(s.siswa_id).toLowerCase();
    if (search && !sName.includes(search.toLowerCase()) && !s.surah.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime());

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredSetoran.length / itemsPerPage);
  const paginatedSetoran = filteredSetoran.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportExcel = async () => {
    const filteredSiswa = siswa.filter(s => {
      if (search && !s.nama.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    await exportLaporanToExcel(setoran, filteredSiswa, exportFormat);
  };

  const exportPDF = () => {
    const filteredSiswa = siswa.filter(s => {
      if (search && !s.nama.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    exportLaporanToPDF(setoran, filteredSiswa);
  };

  const handleClearAll = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Semua data riwayat setoran di sistem akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Bersihkan Semua!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        clearAllSetoran().then(() => {
          Swal.fire('Berhasil!', 'Semua riwayat setoran telah dibersihkan.', 'success');
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari (Siswa/Surat)..." 
              className="w-full pl-10 pr-4 py-3 md:py-2.5 text-base md:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
            />
          </div>
          <div className="flex w-full sm:w-auto">
            <CustomSelect
              value={exportFormat}
              onChange={setExportFormat}
              options={[
                { value: 'semua_nilai', label: 'Semua Nilai' },
                { value: 'predikat_saja', label: 'Predikat Saja' }
              ]}
              className="py-3 md:py-2.5 px-3 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#d19e44] w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto flex-wrap justify-end">
          <button 
            onClick={exportPDF}
            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300 py-3 md:py-2 px-4 rounded-xl text-sm font-bold transition-all tap-bounce border border-red-200 dark:border-red-800"
          >
            <Download className="w-4 h-4" /> <span>Export PDF</span>
          </button>
          <button 
            onClick={exportExcel}
            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 py-3 md:py-2 px-4 rounded-xl text-sm font-bold transition-all tap-bounce border border-emerald-200 dark:border-emerald-800"
          >
            <Download className="w-4 h-4" /> <span>Export Excel</span>
          </button>
          <button 
            onClick={handleClearAll}
            disabled={setoran.length === 0}
            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-red-100/50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 py-3 md:py-2 px-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-200/50 dark:border-red-900/50"
          >
            <Trash2 className="w-4 h-4" /> <span>Bersihkan Semua</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <table className="w-full text-left text-xs md:text-sm text-slate-600 dark:text-slate-300 min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-4 py-3">Surah (Juz)</th>
                <th className="px-4 py-3">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {paginatedSetoran.map(s => (
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
              {filteredSetoran.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Tidak ada riwayat setoran</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredSetoran.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#031433]/50">
            <span className="text-xs text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSetoran.length)} dari {filteredSetoran.length} data
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
