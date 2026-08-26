import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppContext } from '../lib/AppContext';
import { RecycleBinItem } from '../types';
import Swal from 'sweetalert2';

export const AdminRecycleBin = () => {
  const { addSiswa, addPenguji, addSetoran, addKelas } = useAppContext();
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'recycle_bin'));
      const fetchedItems = snap.docs.map(d => d.data() as RecycleBinItem);
      fetchedItems.sort((a, b) => b.deletedAt - a.deletedAt);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching recycle bin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestore = async (item: RecycleBinItem) => {
    try {
      if (item.type === 'siswa') await addSiswa(item.originalData);
      else if (item.type === 'penguji') await addPenguji(item.originalData);
      else if (item.type === 'setoran') await addSetoran(item.originalData);
      else if (item.type === 'kelas') await addKelas(item.originalData);
      
      await deleteDoc(doc(db, 'recycle_bin', item.id));
      setItems(items.filter(i => i.id !== item.id));
      Swal.fire({ title: 'Berhasil', text: 'Data berhasil dipulihkan', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (e) {
      Swal.fire('Error', 'Gagal memulihkan data', 'error');
    }
  };

  const handleDeletePermanent = async (item: RecycleBinItem) => {
    const res = await Swal.fire({
      title: 'Hapus Permanen?',
      text: 'Data ini tidak dapat dikembalikan lagi!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444'
    });

    if (res.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'recycle_bin', item.id));
        setItems(items.filter(i => i.id !== item.id));
        Swal.fire({ title: 'Berhasil', text: 'Data dihapus permanen', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      } catch (e) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const renderItemData = (item: RecycleBinItem) => {
    if (item.type === 'siswa' || item.type === 'penguji') {
      return item.originalData?.nama || 'Tanpa Nama';
    }
    if (item.type === 'kelas') {
      return `${item.originalData?.tingkat} - ${item.originalData?.rombel}`;
    }
    if (item.type === 'setoran') {
      return `Setoran Juz ${item.originalData?.juz} - ${item.originalData?.surah}`;
    }
    return 'Data Tidak Diketahui';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            Recycle Bin
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Pulihkan atau hapus permanen data yang telah dihapus</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-500">Memuat data...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Keranjang Sampah Kosong</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Data siswa, penguji, atau setoran yang Anda hapus akan muncul di sini. Anda dapat memulihkannya kapan saja.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            <table className="w-full text-left text-xs md:text-sm text-slate-600 dark:text-slate-300 min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 md:py-4">Tipe Data</th>
                  <th className="px-4 py-3 md:py-4">Keterangan</th>
                  <th className="px-4 py-3 md:py-4">Waktu Dihapus</th>
                  <th className="px-4 py-3 md:py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 font-semibold capitalize">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs">{item.type}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                      {renderItemData(item)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(item.deletedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleRestore(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Pulihkan">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePermanent(item)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus Permanen">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
