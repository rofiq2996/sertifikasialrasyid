import React, { useState } from 'react';
import { useAppContext } from '../lib/AppContext';
import { AlertTriangle, HardDrive, Trash2, Calendar, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminPengaturan = () => {
  const { clearAllData, settings, updateSettings } = useAppContext();
  const [isResetting, setIsResetting] = useState(false);
  const [batasAkhir, setBatasAkhir] = useState(settings?.batasAkhirSetoran || '');
  const [waAdmin, setWaAdmin] = useState(settings?.waAdmin || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      let formattedWa = waAdmin.trim();
      // Auto-format format WA
      if (formattedWa.startsWith('0')) formattedWa = '62' + formattedWa.slice(1);
      if (formattedWa.startsWith('+62')) formattedWa = '62' + formattedWa.slice(3);

      await updateSettings({ batasAkhirSetoran: batasAkhir, waAdmin: formattedWa });
      setWaAdmin(formattedWa);
      Swal.fire('Tersimpan', 'Pengaturan berhasil diperbarui', 'success');
    } catch (e) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan', 'error');
    }
    setIsSavingSettings(false);
  };

  const handleHardReset = async () => {
    const { value: token } = await Swal.fire({
      title: 'KONFIRMASI RESET TOTAL',
      html: `
        <div class="text-left text-sm text-gray-600 dark:text-gray-400 space-y-3 mb-4">
          <div class="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            <strong>PERINGATAN:</strong> Aksi ini akan menghapus <strong>SELURUH</strong> data aplikasi yang meliputi:
            <ul class="list-disc ml-5 mt-2">
              <li>Data Penguji</li>
              <li>Data Siswa</li>
              <li>Riwayat & Nilai Setoran</li>
            </ul>
          </div>
          <p>Jika proses sertifikasi telah selesai dan Anda ingin memulai lembaran baru, masukkan frasa: <br/><strong class="text-red-600 block mt-2 text-center text-lg">HAPUS SEMUA DATA</strong></p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Ketik: HAPUS SEMUA DATA',
      showCancelButton: true,
      confirmButtonText: 'Reset Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      width: '32em',
      inputValidator: (value) => {
        if (value !== 'HAPUS SEMUA DATA') {
          return 'Frasa token tidak sesuai. Reset dibatalkan.';
        }
      }
    });

    if (token === 'HAPUS SEMUA DATA') {
      setIsResetting(true);
      try {
        await clearAllData();
        Swal.fire(
          'Tereset!',
          'Seluruh data sistem berhasil dihapus.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Gagal!',
          'Terjadi kesalahan saat menghapus data.',
          'error'
        );
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 fade-in h-full flex flex-col pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <HardDrive className="w-5 h-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Sistem</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-6 max-w-3xl">
        <div className="space-y-8">

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-[#041e49] dark:text-[#d19e44] flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Batas Akhir Setoran</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-justify md:text-left">
                    Tentukan tanggal batas akhir bagi siswa untuk menyelesaikan target hafalan sertifikasi mereka.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="date"
                    value={batasAkhir}
                    onChange={(e) => setBatasAkhir(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#d19e44] outline-none text-slate-800 dark:text-slate-200 flex-1"
                  />
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Nomor WhatsApp Admin</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-justify md:text-left">
                    Digunakan untuk fitur lupa password pengguna. Contoh: 6281234567890
                  </p>
                  <input 
                    type="text"
                    placeholder="6281234567890"
                    value={waAdmin}
                    onChange={(e) => setWaAdmin(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#d19e44] outline-none text-slate-800 dark:text-slate-200 w-full"
                  />
                </div>

                <div className="flex pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-5 py-2.5 bg-[#d19e44] hover:bg-[#b88636] disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-5 bg-red-50/50 dark:bg-red-900/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-1">Hard Reset Database</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4 text-justify md:text-left">
                  Gunakan fitur ini hanya ketika masa (tahun) sertifikasi telah selesai atau Anda benar-benar ingin membersihkan seluruh data (Penguji, Siswa, Setoran).
                  <br />
                  <strong className="block mt-1">Gunakan dengan sangat hati-hati, data yang dihapus tidak dapat dikembalikan.</strong>
                </p>
                
                <button
                  onClick={handleHardReset}
                  disabled={isResetting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isResetting ? (
                    <>Menghapus Data...</>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Reset Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
