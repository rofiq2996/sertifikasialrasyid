import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import Swal from 'sweetalert2';
import { Penguji } from '../types';
import { PengujiFormModal } from '../components/PengujiFormModal';

export const DataPenguji = () => {
  const { penguji, siswa, addPenguji, updatePenguji, deletePenguji } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPenguji, setEditingPenguji] = useState<Penguji | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openFormModal = (existing?: Penguji) => {
    setEditingPenguji(existing || null);
    setIsModalOpen(true);
  };

  const handleSavePenguji = async (formData: Penguji) => {
    try {
      if (editingPenguji) {
        await updatePenguji(formData);
        Swal.fire('Berhasil', 'Data penguji berhasil diupdate', 'success');
      } else {
        await addPenguji({ ...formData, siswaBinaan: 0 });
        Swal.fire('Berhasil', 'Penguji berhasil ditambahkan', 'success');
      }
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    const res = await Swal.fire({
      title: `Hapus Penguji`,
      text: `Apakah Anda yakin ingin menghapus data ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });
    
    if (res.isConfirmed) {
      try {
        await deletePenguji(id);
        Swal.fire('Terhapus!', 'Data penguji telah dihapus.', 'success');
      } catch (e) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Daftar Guru Penguji</h3>
        <button 
          onClick={() => openFormModal()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#d19e44] hover:bg-[#041e49] text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold transition-all tap-bounce"
        >
          <UserPlus className="w-4 h-4" /> <span>Tambah Penguji</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {penguji.map(p => (
          <div key={p.id} className="bg-white dark:bg-[#031433] p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#031433] flex items-center justify-center text-white font-bold overflow-hidden">
                  {p.foto ? <img src={p.foto} alt={p.nama} /> : p.nama[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{p.nama}</h4>
                  <p className="text-xs text-slate-500 mb-1">@{p.username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">ID: {p.id}</code>
                    <button 
                      onClick={() => handleCopyId(p.id)}
                      className="text-slate-400 hover:text-[#d19e44] dark:hover:text-[#d19e44] transition-colors"
                      title="Salin ID Penguji"
                    >
                      {copiedId === p.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => openFormModal(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id, p.nama)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-500 mb-1">Siswa Binaan</p>
                <div className="flex items-center space-x-1"><span className="text-sm font-black text-slate-800 dark:text-white">{siswa.filter(s => s.penguji_id === p.id).length}</span><span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-sm dark:bg-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600">Siswa</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PengujiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePenguji}
        existingPenguji={editingPenguji}
      />
    </div>
  );
};
