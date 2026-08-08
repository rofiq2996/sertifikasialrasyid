import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Penguji } from '../types';

interface PengujiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (penguji: Penguji) => Promise<void>;
  existingPenguji: Penguji | null;
}

export const PengujiFormModal: React.FC<PengujiFormModalProps> = ({ isOpen, onClose, onSave, existingPenguji }) => {
  const [formData, setFormData] = useState<Partial<Penguji>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingPenguji) {
        setFormData(existingPenguji);
      } else {
        setFormData({ id: 'G' + Math.floor(1000 + Math.random() * 9000), nama: '', username: '', password: '', role: 'guru', foto: '' });
      }
      setShowPassword(false);
    }
  }, [isOpen, existingPenguji]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.username || !formData.password) {
      alert('Nama, Username, dan Password wajib diisi!');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData as Penguji);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041e49]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#031433] rounded-3xl shadow-xl w-full max-w-lg overflow-hidden p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">
          {existingPenguji ? 'Edit Penguji' : 'Tambah Penguji'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              value={formData.nama || ''}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-[#d19e44] hover:bg-[#d19e44] text-white font-bold rounded-lg transition-colors min-w-[120px]"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-8 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors min-w-[120px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
