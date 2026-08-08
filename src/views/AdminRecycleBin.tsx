import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

export const AdminRecycleBin = () => {
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

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Keranjang Sampah Kosong</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Data siswa, penguji, atau setoran yang Anda hapus akan muncul di sini. Anda dapat memulihkannya kapan saja dalam jangka waktu 30 hari.
        </p>
      </div>
    </div>
  );
};
