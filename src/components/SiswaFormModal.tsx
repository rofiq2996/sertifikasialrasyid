import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { Siswa, Penguji } from '../types';
import { CustomSelect } from './CustomSelect';
import { useAppContext } from '../lib/AppContext';

interface SiswaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (siswa: Siswa) => Promise<void>;
  existingSiswa?: Siswa | null;
  pengujiList: Penguji[];
}

const TINGKAT_OPTIONS = ['1', '2', '3', '4', '5', '6'];
const ROMBEL_OPTIONS = [
  'Ar-Rohman', 'Ar-Rohim', 'Al-Malik', 'Al-Quddus', 'As-Salam',
  'Al-Mu’min', 'Al-Muhaimin', 'Al-‘Aziz', 'Al-Jabbar', 'Al-Mutakabbir',
  'Al-Kholiq', 'Al-Bari’', 'Al-Mushowwir', 'Al-Ghoffar', 'Al-Qohhar',
  'Al-Wahhab', 'Ar-Rozzaq', 'Al-Fattah', 'Al-‘Alim', 'Al-Qobidh',
  'Al-Basith', 'Al-Khofidh', 'Ar-Rofi’', 'Al-Mu’iz', 'Al-Mudzill',
  'As-Sami’', 'Al-Bashir', 'Al-Hakam', 'Al-‘Adl', 'Al-Lathif'
];
const STATUS_OPTIONS = ['Aktif', 'Lulus', 'Pindah', 'Non-Aktif'];

export const SiswaFormModal: React.FC<SiswaFormModalProps> = ({ isOpen, onClose, onSave, existingSiswa, pengujiList }) => {
  const { user, siswa } = useAppContext();
  const [formData, setFormData] = useState({
    id: '',
    nis: '',
    password: '',
    nama: '',
    status: 'Aktif',
    nama_ayah: '',
    gender: 'L',
    bin_binti: 'Bin',
    penguji_id: '',
  });
  
  const [target, setTarget] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingSiswa && isOpen) {
      setFormData({
        id: existingSiswa.id,
        nis: existingSiswa.nis || '',
        password: existingSiswa.password || '123',
        nama: existingSiswa.nama || '',
        status: existingSiswa.status || 'Aktif',
        bin_binti: existingSiswa.bin_binti || 'Bin',
        nama_ayah: existingSiswa.nama_ayah || '',
        gender: existingSiswa.gender || 'L',
        penguji_id: existingSiswa.penguji_id || '',
      });
      setTarget(existingSiswa.target || []);
    } else if (isOpen) {
      setFormData({
        id: 'S' + Date.now(),
        nis: '',
        password: '123',
        nama: '',
        status: 'Aktif',
        bin_binti: 'Bin',
        nama_ayah: '',
        gender: 'L',
        penguji_id: user?.role === 'guru' ? (user.id || '') : '',
      });
      setTarget([]);
    }
    setShowPassword(false);
  }, [existingSiswa, isOpen, user]);

  if (!isOpen) return null;

  const handleCheckboxChange = (juz: number) => {
    setTarget(prev => 
      prev.includes(juz) ? prev.filter(t => t !== juz) : [...prev, juz].sort((a, b) => a - b)
    );
  };

  const generateUsername = (nama: string) => {
    if (!nama) return 'siswa';
    const firstName = nama.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let newUsername = firstName;
    let counter = 1;
    while (siswa.some(s => s.username === newUsername && s.id !== formData.id)) {
      newUsername = `${firstName}${counter}`;
      counter++;
    }
    return newUsername;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const generatedUsername = existingSiswa?.username || generateUsername(formData.nama);
      
      const siswaToSave: Siswa = {
        id: formData.id,
        nis: formData.nis,
        username: generatedUsername,
        password: formData.password || '123',
        nama: formData.nama,
        bin_binti: formData.bin_binti,
        nama_ayah: formData.nama_ayah,
        target: target,
        gender: formData.gender,
        penguji_id: formData.penguji_id,
      };
      await onSave(siswaToSave);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#041e49]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-xl w-full max-w-3xl max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 md:p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            {existingSiswa ? 'Edit Siswa' : 'Tambah Siswa'}
          </h2>
          <button onClick={onClose} className="absolute right-4 md:right-5 p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 md:p-6 pb-32 md:pb-40 flex-1 custom-scrollbar">
          <form id="siswa-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5 text-sm">
            
            <div className="grid grid-cols-1 gap-4 md:gap-5">
              {/* Nama Lengkap */}
              <div className="space-y-1.5 md:space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Nama Lengkap</label>
                <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none" placeholder="Contoh: Ahmad" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="grid grid-cols-2 gap-4 md:gap-5">
                {/* Bin / Binti */}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Bin / Binti</label>
                  <CustomSelect 
                    required 
                    value={formData.bin_binti || ''} 
                    onChange={v => setFormData({...formData, bin_binti: v})}
                    options={[
                      { value: 'Bin', label: 'Bin (L)' },
                      { value: 'Binti', label: 'Binti (P)' }
                    ]}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
                  />
                </div>

                {/* Nama Ayah */}
                <div className="space-y-1.5 md:space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Nama Ayah</label>
                  <input required type="text" value={formData.nama_ayah} onChange={e => setFormData({...formData, nama_ayah: e.target.value})} className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none" placeholder="Nama Ayah" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-5">
                {/* Jenis Kelamin */}
                <div className="space-y-1.5 md:space-y-2 col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Jenis Kelamin</label>
                  <CustomSelect 
                    required 
                    value={formData.gender || ''} 
                    onChange={v => setFormData({...formData, gender: v})}
                    options={[
                      { value: 'L', label: 'Laki-Laki' },
                      { value: 'P', label: 'Perempuan' }
                    ]}
                    className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
                  />
                </div>
              </div>

              {/* Guru Penguji */}
              <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Guru Penguji</label>
                <CustomSelect 
                  required 
                  value={formData.penguji_id || ''} 
                  onChange={v => setFormData({...formData, penguji_id: v})}
                  placeholder="-- Pilih Guru --"
                  options={pengujiList.map(p => ({ value: p.id, label: p.nama }))}
                  className={`w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none ${user?.role === 'guru' ? 'opacity-70 pointer-events-none' : ''}`}
                />
              </div>
            </div>

            {/* Target Hafalan */}
            <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block text-xs md:text-sm">Target Hafalan</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3 max-h-40 md:max-h-48 overflow-y-auto p-1 custom-scrollbar">
                {Array.from({length: 30}, (_, i) => i + 1).map(juz => (
                  <label key={juz} className={`flex items-center space-x-2 border border-slate-200 dark:border-slate-700 p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${target.includes(juz) ? 'bg-slate-50 border-[#d19e44] dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#d19e44] rounded border-slate-300 focus:ring-[#d19e44]"
                      checked={target.includes(juz)}
                      onChange={() => handleCheckboxChange(juz)}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-xs md:text-sm whitespace-nowrap">Juz {juz}</span>
                  </label>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#031433]/80 flex justify-center space-x-3 md:space-x-4">
          <button type="submit" form="siswa-form" disabled={isSubmitting} className="px-6 md:px-8 py-2 md:py-2.5 bg-[#d19e44] hover:bg-[#d19e44] text-white font-semibold rounded-lg transition-colors disabled:opacity-70 text-sm md:text-base">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 md:px-8 py-2 md:py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 text-sm md:text-base">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
