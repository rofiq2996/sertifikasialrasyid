import React, { useState, useEffect } from 'react';
import { useAppContext } from '../lib/AppContext';
import { Eye, EyeOff, Save, Lock, ShieldCheck, Medal, User, Globe, Info, LogOut, Edit3, Bell, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { useTranslation, Language } from '../lib/i18n';
import Swal from 'sweetalert2';

export const UserEditProfil = () => {
  const { user, siswa, penguji, updateSiswa, updatePenguji, setUser, language, setLanguage } = useAppContext();
  
  const t = useTranslation(language as Language);
  const [activeView, setActiveView] = useState<'menu' | 'edit_profil' | 'keamanan' | 'bahasa' | 'tentang'>('menu');
  
  const [formData, setFormData] = useState({
    nama: '',
    username: '', // for guru and admin
    password: '',
    nama_ayah: '',
    bin_binti: 'Bin'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar Akun?',
      text: 'Apakah Anda yakin ingin keluar dari akun ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold tracking-wide uppercase',
        cancelButton: 'rounded-xl font-bold tracking-wide uppercase',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setUser(null);
      }
    });
  };

  useEffect(() => {
    if (user?.role === 'siswa') {
      const currentSiswa = siswa.find(s => s.id === user.id);
      if (currentSiswa) {
        setFormData(prev => ({
          ...prev,
          nama: currentSiswa.nama || '',
          username: currentSiswa.username || '',
          password: currentSiswa.password || '',
          nama_ayah: currentSiswa.nama_ayah || '',
          bin_binti: currentSiswa.bin_binti || 'Bin'
        }));
      }
    } else if (user?.role === 'guru') {
      const currentGuru = penguji.find(p => p.id === user.id);
      if (currentGuru) {
        setFormData(prev => ({
          ...prev,
          nama: currentGuru.nama || '',
          username: currentGuru.username || '',
          password: currentGuru.password || ''
        }));
      }
    } else if (user?.role === 'admin') {
      setFormData(prev => ({
        ...prev,
        nama: user.nama || 'Administrator',
        username: 'admin'
      }));
    }
  }, [user, siswa, penguji]);

  if (!user) return null;

  const currentSiswa = user.role === 'siswa' ? siswa.find(s => s.id === user?.id) : null;
  const currentGuru = user.role === 'guru' ? penguji.find(p => p.id === user?.id) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'admin') {
      Swal.fire('Info', 'Akun admin tidak dapat diubah.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      if (user.role === 'siswa') {
        const freshSiswa = siswa.find(s => s.id === user.id);
        if (freshSiswa) {
          await updateSiswa({
            ...freshSiswa,
            nama: formData.nama.trim(),
            username: formData.username.trim(),
            password: formData.password.trim(),
            nama_ayah: formData.nama_ayah.trim(),
            bin_binti: formData.bin_binti
          });
          setUser({ ...user, nama: formData.nama.trim() });
        }
      } else if (user.role === 'guru') {
        const freshGuru = penguji.find(p => p.id === user.id);
        if (freshGuru) {
          await updatePenguji({
            ...freshGuru,
            nama: formData.nama.trim(),
            username: formData.username.trim(),
            password: formData.password.trim()
          });
          setUser({ ...user, nama: formData.nama.trim() });
        }
      }

      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil Anda telah berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Tutup'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageChange = (langId: string) => {
    setLanguage(langId as Language);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: langId === 'id' ? 'Bahasa diperbarui' : langId === 'en' ? 'Language updated' : 'تم تحديث اللغة',
      showConfirmButton: false,
      timer: 1500
    });
    setTimeout(() => setActiveView('menu'), 500);
  };

  const MenuItem = ({ icon: Icon, label, rightText, onClick }: { icon: any, label: string, rightText?: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-[#031433]/30 transition-colors cursor-pointer outline-none group border-b border-slate-100 dark:border-slate-700/50 last:border-0 bg-white dark:bg-[#031433]">
      <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
         <div className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#041e49] rounded-[14px]">
           <Icon className="w-5 h-5 text-slate-500 group-hover:text-[#d19e44] transition-colors" strokeWidth={2} />
         </div>
         <span className="font-semibold text-[15px] text-slate-800 dark:text-slate-100">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
         {rightText && <span className="text-[13px] font-medium text-slate-500 hidden sm:block">{rightText}</span>}
         <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
      </div>
    </button>
  );

  return (
    <div className="space-y-6 md:space-y-8 fade-in pb-10">
      
      {/* Top Navy Background with User Info */}
      <div className="-mt-4 sm:-mt-6 -mx-4 sm:-mx-6 px-4 sm:px-8 pt-10 pb-16 md:rounded-b-[2.5rem] bg-[#041e49] text-white relative flex flex-col items-center shadow-lg shadow-slate-900/10">
        
        <div className="w-24 h-24 bg-transparent p-1.5 rounded-full border-2 border-white shadow-inner mb-4 relative z-10">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
            {user.role === 'siswa' && currentSiswa?.foto ? (
              <img src={currentSiswa.foto} alt={currentSiswa.nama} className="w-full h-full object-cover" />
            ) : user.role === 'guru' && currentGuru?.foto ? (
              <img src={currentGuru.foto} alt={currentGuru.nama} className="w-full h-full object-cover" />
            ) : (
               <span className="text-4xl font-black text-[#041e49] font-sans uppercase">{formData.nama.charAt(0) || 'U'}</span>
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-extrabold tracking-wide mb-1.5 relative z-10">{formData.nama || 'Admiusernametrator'}</h2>
        
        <div className="flex flex-col items-center gap-1.5 z-10">
           {user.role === 'siswa' && currentSiswa && (
             <>
               <span className="flex items-center gap-1 bg-[#d19e44]/20 text-[#d19e44] border border-[#d19e44]/30 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Medal className="w-3.5 h-3.5" /> {currentSiswa.gender === 'P' || currentSiswa.gender === 'Perempuan' ? 'Hafizhah Muda' : 'Hafizh Muda'}
               </span>
               <span className="text-slate-300 text-sm font-medium tracking-wide mt-1">
                 {currentSiswa.username}
               </span>
             </>
           )}
           {user.role === 'guru' && (
             <span className="text-slate-300 text-sm font-medium tracking-wide bg-[#031433]/50 px-3 py-1 rounded-full">
                 Penguji • {currentGuru?.username}
             </span>
           )}
           {user.role === 'admin' && (
             <span className="text-slate-300 text-sm font-medium tracking-wide uppercase bg-[#031433]/50 px-3 py-1 rounded-full">
                 Admiusernametrator
             </span>
           )}
        </div>
      </div>

      <div className="-mt-14 relative z-20 mx-0 sm:mx-0">
        
        {activeView === 'menu' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-[#031433] rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
              <MenuItem icon={Edit3} label={t('menu.edit_profil')} onClick={() => setActiveView('edit_profil')} />
              <MenuItem icon={Lock} label={t('menu.keamanan_akun')} onClick={() => setActiveView('keamanan')} />
              <MenuItem icon={Info} label={t('menu.tentang_aplikasi')} onClick={() => setActiveView('tentang')} />
            </div>

            <div className="mt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#031433] border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95 text-red-600 dark:text-red-400 font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all shadow-sm cursor-pointer outline-none"
                >
                  <LogOut className="w-5 h-5" />
                  {t('menu.keluar')}
                </button>
            </div>
          </div>
        )}

        {activeView !== 'menu' && (
          <div className="bg-white dark:bg-[#031433] rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-700/60 p-5 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setActiveView('menu')} 
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-bold text-sm transition-colors w-fit pt-1 pb-2 outline-none group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {t('menu.kembali')}
            </button>

            {activeView === 'edit_profil' && (
              <div>
                <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    {t('profil.title')}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('profil.subtitle')}
                  </p>
                </div>

                {user.role !== 'admin' ? (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {user.role === 'siswa' && (
                      <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('profil.nama_siswa')}
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.nama}
                            onChange={e => setFormData({ ...formData, nama: e.target.value })}
                            className="w-full p-2.5 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] focus:bg-white outline-none transition-all"
                            placeholder="Nama Lengkap"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('profil.bin_binti')}
                          </label>
                          <CustomSelect
                            required
                            value={formData.bin_binti}
                            onChange={v => setFormData({ ...formData, bin_binti: v })}
                            options={[
                              { value: 'Bin', label: 'Bin (Laki-Laki)' },
                              { value: 'Binti', label: 'Binti (Perempuan)' }
                            ]}
                            className="w-full p-2.5 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white flex items-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('profil.nama_ayah')}
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.nama_ayah}
                            onChange={e => setFormData({ ...formData, nama_ayah: e.target.value })}
                            className="w-full p-2.5 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] focus:bg-white outline-none transition-all"
                            placeholder="Nama Ayah kandung"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Username
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="w-full p-2.5 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] focus:bg-white outline-none transition-all font-mono"
                            placeholder="Username"
                            readOnly
                          />
                        </div>
                      </div>
                      </>
                    )}

                    {user.role === 'guru' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('profil.nama_penguji')}
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.nama}
                            onChange={e => setFormData({ ...formData, nama: e.target.value })}
                            className="w-full p-2.5 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] focus:bg-white outline-none transition-all"
                            placeholder="Nama Lengkap"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('profil.username')}
                          </label>
                          <input
                            required
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="w-full p-2.5 md:p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] focus:bg-white outline-none transition-all font-mono"
                            placeholder="Username"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 bg-[#041e49] hover:bg-[#031433] text-white font-black text-sm md:text-base px-6 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer w-full md:w-auto uppercase tracking-wide"
                      >
                        <Save className="w-5 h-5" />
                        {isSubmitting ? t('profil.menyimpan') : t('profil.simpan')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-[#041e49]/50">
                      Informasi profil Admiusernametrator hanya dapat diubah melalui sistem core.
                  </div>
                )}
              </div>
            )}

            {activeView === 'keamanan' && (
              <div>
                <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    {t('keamanan.title')}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('keamanan.subtitle')}
                  </p>
                </div>

                {user.role !== 'admin' ? (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-lg">
                    <div className="space-y-1.5 mt-4">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        {t('keamanan.sandi_baru')}
                      </label>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className="w-full p-2.5 md:p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#041e49] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] focus:bg-white outline-none transition-all font-mono"
                          placeholder="••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-transparent border-none outline-none"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 bg-[#041e49] hover:bg-[#031433] text-white font-black text-sm md:text-base px-6 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer w-full md:w-auto uppercase tracking-wide"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        {isSubmitting ? t('profil.menyimpan') : t('keamanan.perbarui')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-[#041e49]/50">
                      Sandi Admiusernametrator hanya dapat diubah melalui sistem core.
                  </div>
                )}
              </div>
            )}

            {activeView === 'tentang' && (
              <div>
                 <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      {t('menu.tentang_aplikasi')}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Informasi versi dan detail pengembangan aplikasi Sertifikasi Al-Qur'an.
                    </p>
                 </div>
                 
                 <div className="bg-slate-50 dark:bg-[#041e49]/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 text-center">
                     <div className="w-24 h-24 mx-auto mb-4">
                       <img src="https://iili.io/Fr7hdzb.png" alt="Logo Sertifikasi Al-Qur'an" className="w-full h-full object-contain" />
                     </div>
                     <h4 className="text-xl font-black text-slate-800 dark:text-white">Sertifikasi Al-Qur'an</h4>
                     
                     <div className="mt-5 px-4 py-5 bg-white dark:bg-[#031433] rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm leading-relaxed">
                        <p className="text-xl md:text-2xl text-[#d19e44] font-arabic mb-3 leading-relaxed tracking-wide" dir="rtl">
                          خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                          "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">(HR. Bukhari)</p>
                     </div>

                     <p className="text-sm font-bold text-[#d19e44] mt-6">Versi 1.2.0 (Stable)</p>
                     
                     <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4 text-left">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-1 sm:gap-0">
                           <span className="text-slate-500 font-medium whitespace-nowrap">Developer</span>
                           <span className="text-slate-800 dark:text-slate-200 font-bold sm:text-right">PT. Al-Fatih Digital Learning</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-1 sm:gap-0">
                           <span className="text-slate-500 font-medium whitespace-nowrap">Terakhir Diperbarui</span>
                           <span className="text-slate-800 dark:text-slate-200 font-bold sm:text-right">Mei 2026</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-1 sm:gap-0">
                           <span className="text-slate-500 font-medium whitespace-nowrap">Sistem</span>
                           <span className="text-slate-800 dark:text-slate-200 font-bold sm:text-right">React Frontend</span>
                        </div>
                     </div>
                     
                     <div className="mt-8">
                        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed text-justify md:text-center">
                           Aplikasi pencatatan setoran hafalan Al-Qur'an terintegrasi khusus untuk program Sertifikasi Al-Qur'an.
                        </p>
                     </div>
                 </div>
              </div>
            )}
            
          </div>
        )}
      </div>

    </div>
  );
};
