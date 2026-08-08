import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import Swal from 'sweetalert2';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { penguji, siswa, setUser, settings } = useAppContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setUser({ id: 'admin', role: 'admin', nama: 'Administrator' });
      return;
    }

    const guru = penguji.find(p => p.username === username && p.password === password);
    if (guru) {
      setUser({ id: guru.id, role: 'guru', nama: guru.nama, foto: guru.foto });
      return;
    }

    const mSiswa = siswa.find(s => (s.username === username || (s.nis === username && !s.username)) && s.password === password);
    if (mSiswa) {
      setUser({ id: mSiswa.id, role: 'siswa', nama: mSiswa.nama, penguji_id: mSiswa.penguji_id });
      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Akses Ditolak',
      text: 'Username atau Password salah!',
      confirmButtonColor: '#041e49'
    });
  };

  const handleLupaPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    let inputUsername = username;
    
    if (!inputUsername) {
      const { value } = await Swal.fire({
        title: 'Lupa Password',
        text: 'Masukkan Username atau NIS Anda',
        input: 'text',
        inputPlaceholder: 'Username / NIS',
        showCancelButton: true,
        confirmButtonText: 'Lanjut',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#041e49',
        cancelButtonColor: '#d33',
      });
      if (!value) return;
      inputUsername = value;
    }
    
    const guru = penguji.find(p => p.username === inputUsername);
    const mSiswa = siswa.find(s => s.nis === inputUsername);
    
    if (guru || mSiswa) {
      const targetUser = guru || mSiswa;
      const targetRole = guru ? 'Penguji/Guru' : 'Siswa';
      
      const { value: waInput } = await Swal.fire({
        title: 'Kirim Password',
        text: 'Masukkan nomor WhatsApp Anda untuk menerima password',
        input: 'text',
        inputPlaceholder: '081234567890',
        showCancelButton: true,
        confirmButtonText: 'Kirim',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#041e49',
      });

      if (!waInput) return;

      Swal.fire({
        title: 'Sedang mengirim...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const formData = new FormData();
        formData.append('target', waInput);
        formData.append('message', `Assalamu'alaikum ${targetUser.nama},\n\nBerikut adalah detail akun Sertifikasi Al-Qur'an Anda:\n- Username: ${inputUsername}\n- Password: ${targetUser.password || 'Tidak ada password'}\n- Peran: ${targetRole}\n\nPastikan untuk menjaga kerahasiaan akun Anda. Syukron.`);
        formData.append('countryCode', '62');

        const res = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': 'wXQcgP8NRL3aCnUgCG5t'
          },
          body: formData
        });

        const data = await res.json();
        if (data.status) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Password telah dikirim ke nomor WhatsApp Anda.',
            confirmButtonColor: '#041e49'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: `Gagal mengirim pesan: ${data.reason || data.detail || 'Cek koneksi internet.'}`,
            confirmButtonColor: '#041e49'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Mengirim',
          text: 'Terjadi kesalahan jaringan.',
          confirmButtonColor: '#041e49'
        });
      }
    } else if (inputUsername === 'admin') {
       Swal.fire({
        icon: 'info',
        title: 'Admin',
        text: 'Anda adalah admin. Password default adalah "admin".',
        confirmButtonColor: '#041e49'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Tidak Ditemukan',
        text: 'Username atau NIS tidak terdaftar di sistem. Silakan hubungi Admin.',
        confirmButtonColor: '#041e49'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#041e49] md:bg-slate-50 md:dark:bg-[#041e49] p-0 md:p-4 font-sans fade-in">
      <div className="w-full max-w-4xl max-md:min-h-screen bg-[#041e49] md:bg-white md:dark:bg-[#031433] md:rounded-[2rem] md:shadow-xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side / Top Side - Colored Background */}
        <div className="w-full md:w-1/2 bg-[#041e49] p-8 md:p-12 pt-12 pb-16 md:pb-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-6 x relative z-10">
             <img src="https://iili.io/Fr7hdzb.png" alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>

          <div className="mb-6 md:hidden">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Sertifikasi</h1>
            <p className="text-sm font-bold text-[#d19e44] mt-1">Al-Qur'an</p>
          </div>

          <div className="space-y-6 relative z-10 text-white max-md:hidden">
            <h2 className="text-xl md:text-2xl font-bold">Keutamaan Al-Qur'an</h2>
            
            <div className="space-y-6">
               <p className="text-2xl md:text-3xl font-arabic leading-relaxed text-[#d19e44] tracking-wide" dir="rtl">
                 خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
               </p>
               <p className="text-sm md:text-base font-medium italic opacity-90 px-4">
                 "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
               </p>
               <p className="text-xs md:text-sm font-bold opacity-75">
                 (HR. Bukhari)
               </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10 text-white md:hidden">
               <p className="text-xs font-medium italic opacity-90 px-2 leading-relaxed">
                 "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
                 <br />
                 <span className="font-bold opacity-75 mt-1 block">(HR. Bukhari)</span>
               </p>
          </div>
        </div>

        {/* Right Side / Bottom Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white dark:bg-[#031433] rounded-t-[2rem] md:rounded-none -mt-8 md:mt-0 relative z-20 flex-1">
          <div className="mb-8 lg:mb-12 hidden md:block">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#041e49] dark:text-white mb-2 tracking-tight">Sertifikasi</h1>
            <p className="text-base font-bold text-[#d19e44]">Al-Qur'an</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#041e49] dark:text-slate-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" strokeWidth={2} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-[#0ab186] dark:focus:border-[#10b981] outline-none bg-slate-50 dark:bg-[#041e49] dark:text-white transition-all text-sm font-medium" 
                  required 
                  placeholder="Masukkan Username" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#041e49] dark:text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" strokeWidth={2} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-[#0ab186] dark:focus:border-[#10b981] outline-none bg-slate-50 dark:bg-[#041e49] dark:text-white transition-all text-sm font-medium" 
                  required 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                     <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" strokeWidth={2} />
                  ) : (
                     <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" strokeWidth={2} />
                  )}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button 
                  type="button"
                  onClick={handleLupaPassword}
                  className="text-xs font-bold text-[#d19e44] hover:text-[#b8860b] transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-4 mt-4 bg-[#041e49] hover:bg-[#031433] active:bg-[#041e49] text-white rounded-xl font-bold transition-all tap-bounce text-[15px] tracking-wide"
            >
              Masuk
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
