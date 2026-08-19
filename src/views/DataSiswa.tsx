import React, { useState, useEffect } from 'react';
import { Search, DownloadCloud, UploadCloud, Plus, Edit2, Trash2, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Siswa } from '../types';
import { SiswaFormModal } from '../components/SiswaFormModal';
import { SiswaStatistikModal } from '../components/SiswaStatistikModal';
import { exportUserToPDF } from '../lib/pdfUserExport';

export const DataSiswa = () => {
  const { user, siswa, penguji, addSiswa, updateSiswa, deleteSiswa } = useAppContext();
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);

  // Statistik Modal state
  const [isStatistikOpen, setIsStatistikOpen] = useState(false);
  const [statistikSiswa, setStatistikSiswa] = useState<Siswa | null>(null);

  const isAdmin = user?.role === 'admin';

  const filteredSiswa = siswa.filter(s => {
    if (user?.role === 'guru' && s.penguji_id !== user.id) return false;
    if (search && !s.nama.toLowerCase().includes(search.toLowerCase()) && !((s.username || s.nis || '').toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
  const paginatedSiswa = filteredSiswa.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPengujiName = (id: string) => {
    return penguji.find(p => p.id === id)?.nama || 'Belum Diatur';
  };

  const openFormModal = (existing?: Siswa) => {
    setEditingSiswa(existing || null);
    setIsModalOpen(true);
  };

  const openStatistikModal = (siswa: Siswa) => {
    setStatistikSiswa(siswa);
    setIsStatistikOpen(true);
  };

  const handleSaveSiswa = async (formData: Siswa) => {
    try {
      if (editingSiswa) {
        await updateSiswa(formData);
        Swal.fire({ title: 'Berhasil', text: 'Data siswa berhasil diupdate', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      } else {
        await addSiswa(formData);
        Swal.fire({ title: 'Berhasil', text: 'Siswa berhasil ditambahkan', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
    } catch (e) {
      Swal.fire('Error', 'Gagal menyimpan data', 'error');
      throw e; // To keep modal open if there's an error
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    const res = await Swal.fire({
      title: `Hapus Siswa`,
      text: `Apakah Anda yakin ingin menghapus data ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });
    
    if (res.isConfirmed) {
      try {
        await deleteSiswa(id);
        Swal.fire('Terhapus!', 'Data siswa telah dihapus.', 'success');
      } catch (e) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Nama', 'Bin/Binti', 'Nama Ayah', 'Jenis Kelamin', 'Target Juz', 'Username Penguji'],
      ['Ahmad', 'Bin', 'Fulan', 'L', '30,29,1', 'penguji1']
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FormatSiswa");
    XLSX.writeFile(wb, "Template_Siswa.xlsx");
  };

  const handleExportUserPDF = () => {
    // If Admin, export all siswa. If Guru, export only their binaan (filteredSiswa without search text)
    const siswaToExport = isAdmin ? siswa : filteredSiswa.length > 0 ? filteredSiswa : siswa.filter(s => s.penguji_id === user?.id);
    exportUserToPDF(siswaToExport, penguji);
  };

  const generateUsername = (nama: string, existingUsernames: Set<string>) => {
    if (!nama) return 'siswa';
    const firstName = nama.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let newUsername = firstName;
    let counter = 1;
    while (existingUsernames.has(newUsername)) {
      newUsername = `${firstName}${counter}`;
      counter++;
    }
    existingUsernames.add(newUsername);
    return newUsername;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        let successCount = 0;
        let failCount = 0;

        Swal.fire({
          title: 'Memproses Data...',
          text: 'Mohon tunggu sebentar',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        
        const existingUsernames = new Set<string>();
        siswa.forEach(s => {
           if(s.username) existingUsernames.add(s.username);
           else if(s.nis) existingUsernames.add(s.nis);
        });

        for (const row of data) {
          if (!row.Nama || !row['Target Juz']) {
            failCount++;
            continue;
          }
          
          try {
            const rowNama = String(row.Nama);
            const generatedUsername = generateUsername(rowNama, existingUsernames);
            
            let pengujiId = '';
            if (row['Username Penguji']) {
              const matchedPenguji = penguji.find(p => p.username === String(row['Username Penguji']));
              if (matchedPenguji) pengujiId = matchedPenguji.id;
            }
            
            await addSiswa({
              id: 'S' + Date.now() + Math.floor(Math.random() * 1000),
              nis: '',
              username: generatedUsername,
              password: '123',
              nama: rowNama,
              bin_binti: row['Bin/Binti'] || '',
              nama_ayah: String(row['Nama Ayah'] || ''),
              gender: (row['Jenis Kelamin'] === 'L' || row['Jenis Kelamin'] === 'P') ? row['Jenis Kelamin'] : 'L',
              target: String(row['Target Juz']).split(',').map((n: string) => Number(n.trim())).filter((n: number) => !isNaN(n)),
              penguji_id: pengujiId
            });
            successCount++;
          } catch (err) {
            failCount++;
          }
        }

        Swal.fire(
          'Upload Selesai',
          `Berhasil: ${successCount} data.\nGagal: ${failCount} data.`,
          successCount > 0 ? 'success' : 'warning'
        );
      } catch (err) {
        Swal.fire('Error', 'Gagal memproses file Excel', 'error');
      }
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa (Nama/NIS)..." 
            className="w-full pl-10 pr-4 py-3 md:py-2.5 text-base md:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto flex-wrap">
          {(isAdmin || user?.role === 'guru') && (
            <button onClick={handleExportUserPDF} className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 hover:bg-red-100 active:scale-[0.98] dark:bg-red-900/30 dark:text-red-400 py-3 md:py-2 md:px-4 rounded-xl text-sm font-semibold transition-all border border-red-100 dark:border-red-800/50 tap-bounce" title="Download Data User PDF">
              <DownloadCloud className="w-4 h-4" /> <span>User</span>
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={downloadTemplate} className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.98] dark:bg-blue-900/30 dark:text-blue-400 py-3 md:py-2 md:px-4 rounded-xl text-sm font-semibold transition-all border border-blue-100 dark:border-blue-800/50 tap-bounce" title="Download Template Excel">
                <DownloadCloud className="w-4 h-4" /> <span>Template</span>
              </button>
              <label className="flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-[0.98] dark:bg-indigo-900/30 dark:text-indigo-400 py-3 md:py-2 md:px-4 rounded-xl text-sm font-semibold transition-all border border-indigo-100 dark:border-indigo-800/50 cursor-pointer tap-bounce" title="Upload Excel Data Siswa">
                <UploadCloud className="w-4 h-4" /> <span>Upload</span>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
              </label>
            </>
          )}
          {(isAdmin || user?.role === 'guru') && (
            <button className={`${isAdmin ? '' : 'col-span-2 md:col-span-1 '}flex items-center justify-center space-x-2 bg-[#d19e44] hover:bg-[#041e49] active:bg-[#041e49] text-white py-3 md:py-2 px-4 rounded-xl text-sm font-bold transition-all shadow-sm tap-bounce`} onClick={() => openFormModal()}>
              <Plus className="w-4 h-4" /> <span>Tambah Siswa</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <table className="w-full text-left text-xs md:text-sm text-slate-600 dark:text-slate-300 min-w-[600px]">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 md:py-4">Nama Siswa</th>
                <th className="px-4 py-3 md:py-4">Target Juz</th>
                {isAdmin && <th className="px-4 py-3 md:py-4">Penguji</th>}
                <th className="px-4 py-3 md:py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {paginatedSiswa.map((s, i) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white mb-0.5">{s.nama}</p>
                        <p className="text-xs text-slate-500">Username: {s.username || s.nis || '-'} • {s.bin_binti} {s.nama_ayah}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.target.map(j => (
                        <span key={j} className="px-2 py-0.5 bg-slate-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-[#d19e44] border border-[#d19e44]/20 dark:border-emerald-800 rounded-md text-[10px] font-bold">Juz {j}</span>
                      ))}
                    </div>
                  </td>
                  {isAdmin && <td className="px-4 py-3 text-xs">{getPengujiName(s.penguji_id)}</td>}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => openStatistikModal(s)} className="p-1.5 text-[#d19e44] hover:bg-slate-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Statistik Hafalan"><BarChart2 className="w-4 h-4" /></button>
                      <button onClick={() => openFormModal(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id, s.nama)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSiswa.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Data tidak ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredSiswa.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#031433]/50">
            <span className="text-xs text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSiswa.length)} dari {filteredSiswa.length} data
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
      
      <SiswaFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSiswa}
        existingSiswa={editingSiswa}
        pengujiList={penguji}
      />
      
      <SiswaStatistikModal 
        isOpen={isStatistikOpen}
        onClose={() => setIsStatistikOpen(false)}
        siswa={statistikSiswa}
      />
    </div>
  );
};
