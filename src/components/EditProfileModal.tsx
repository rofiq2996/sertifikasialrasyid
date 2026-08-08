import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { User, Siswa, Penguji } from '../types';
import { CustomSelect } from './CustomSelect';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userContext: User;
  siswaData?: Siswa;
  pengujiData?: Penguji;
  onSaveSiswa?: (s: Siswa) => Promise<void>;
  onSavePenguji?: (p: Penguji) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userContext, siswaData, pengujiData, onSaveSiswa, onSavePenguji }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    nama_ayah: '',
    bin_binti: 'Bin'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userContext.role === 'siswa' && siswaData) {
        setFormData({
          username: siswaData.username || siswaData.nis || '',
          password: siswaData.password || '123',
          nama: siswaData.nama || '',
          nama_ayah: siswaData.nama_ayah || '',
          bin_binti: siswaData.bin_binti || 'Bin'
        });
      } else if (userContext.role === 'guru' && pengujiData) {
        setFormData({
          username: pengujiData.username || '',
          password: pengujiData.password || '',
          nama: pengujiData.nama || '',
          nama_ayah: '',
          bin_binti: 'Bin'
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, userContext, siswaData, pengujiData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (userContext.role === 'siswa' && siswaData && onSaveSiswa) {
        await onSaveSiswa({
          ...siswaData,
          username: formData.username,
          password: formData.password,
          nama: formData.nama,
          nama_ayah: formData.nama_ayah,
          bin_binti: formData.bin_binti
        });
      } else if (userContext.role === 'guru' && pengujiData && onSavePenguji) {
        await onSavePenguji({
          ...pengujiData,
          username: formData.username,
          password: formData.password,
          nama: formData.nama,
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#041e49]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#031433] rounded-2xl shadow-xl w-full max-w-md max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 md:p-5 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            Edit Profil
          </h2>
          <button onClick={onClose} className="absolute right-4 md:right-5 p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 md:p-6 pb-20 flex-1 custom-scrollbar">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4 text-sm">
            
            <div className="space-y-1.5 md:space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">
                Nama Lengkap
              </label>
              <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none" placeholder="Nama Lengkap" />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">
                Username
              </label>
              <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none" placeholder="Username" readOnly={userContext.role === 'siswa'} />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Password</label>
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 md:p-3 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none" placeholder="•••" readOnly={userContext.role === 'siswa'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            </div>

            {userContext.role === 'siswa' && (
              <>
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

                <div className="space-y-1.5 md:space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Nama Ayah</label>
                  <input required type="text" value={formData.nama_ayah} onChange={e => setFormData({...formData, nama_ayah: e.target.value})} className="w-full p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none" placeholder="Nama Ayah" />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#031433]/80 flex justify-center space-x-3 md:space-x-4">
          <button type="submit" form="edit-profile-form" disabled={isSubmitting} className="px-6 md:px-8 py-2 md:py-2.5 bg-[#d19e44] hover:bg-[#d19e44] text-white font-semibold rounded-lg transition-colors disabled:opacity-70 text-sm md:text-base cursor-pointer">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 md:px-8 py-2 md:py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 text-sm md:text-base cursor-pointer">
            Batal
          </button>
        </div>

      </div>
    </div>
  );
};
