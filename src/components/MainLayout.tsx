import React, { useState } from "react";
import { useAppContext } from "../lib/AppContext";
import {
  Sun,
  Moon,
  LogOut,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Home,
  History,
  TrendingUp,
  AlertCircle,
  Bell,
  Trophy,
  FolderOpen,
  Trash2,
  CheckCircle,
  QrCode,
  ShieldCheck,
  User,
  Layers,
  UserCheck,
} from "lucide-react";
import { AdminDashboard } from "../views/AdminDashboard";
import { DataSiswa } from "../views/DataSiswa";
import { DataPenguji } from "../views/DataPenguji";
import { Laporan } from "../views/Laporan";
import { Sertifikat } from "../views/Sertifikat";
import { GuruDashboard } from "../views/GuruDashboard";
import { GuruRiwayat } from "../views/GuruRiwayat";
import { GuruAktivitas } from "../views/GuruAktivitas";
import { GuruInputSetoran } from "../views/GuruInputSetoran";
import { SiswaProfil } from "../views/SiswaProfil";
import { SiswaNilai } from "../views/SiswaNilai";
import { SiswaRiwayatSetoran } from "../views/SiswaRiwayatSetoran";
import { SiswaPengingat } from "../views/SiswaPengingat";
import { SiswaPeringkat } from "../views/SiswaPeringkat";
import { SiswaSertifikat } from "../views/SiswaSertifikat";
import { UserEditProfil } from '../views/UserEditProfil';
import { AdminPengaturan } from "../views/AdminPengaturan";
import { AdminRecycleBin } from "../views/AdminRecycleBin";
import { AdminValidasiSertifikat } from "../views/AdminValidasiSertifikat";
import { GuruPengingat } from "../views/GuruPengingat";
import { GuruPeringkat } from "../views/GuruPeringkat";
import { Settings } from "lucide-react";
import { JUZ_SURAH_MAP } from "../lib/constants";
import Swal from "sweetalert2";

export const MainLayout = () => {
  const { user, theme, toggleTheme, setUser, siswa, setoran } = useAppContext();
  
  const initialMenu = user?.role === "admin" ? "dashboard" : user?.role === "guru" ? "dashboard" : "profil";
  const [activeMenu, _setActiveMenu] = useState(initialMenu);

  const activeMenuRef = React.useRef(activeMenu);
  React.useEffect(() => {
    activeMenuRef.current = activeMenu;
  }, [activeMenu]);

  const setActiveMenu = React.useCallback((menuId: string | Function) => {
    const newMenu = typeof menuId === 'function' ? menuId(activeMenuRef.current) : menuId;
    const currentMenu = activeMenuRef.current;
    
    if (newMenu !== currentMenu) {
      if (newMenu === initialMenu) {
        // Navigating to Home from a sub-page
        window.history.back(); // Triggers popstate
      } else {
        if (currentMenu === initialMenu) {
          // Navigating from Home to Sub-page
          window.history.pushState({ type: 'menu', menu: newMenu }, '', '#' + newMenu);
        } else {
          // Navigating from Sub-page to another Sub-page
          window.history.replaceState({ type: 'menu', menu: newMenu }, '', '#' + newMenu);
        }
        _setActiveMenu(newMenu);
      }
    }
  }, [initialMenu]);

  React.useEffect(() => {
    // 2-level stack model
    window.history.replaceState({ type: 'trap' }, '', '#trap');
    window.history.pushState({ type: 'menu', menu: initialMenu }, '', '#' + initialMenu);

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      if (state && state.type === 'menu') {
        _setActiveMenu(state.menu);
      } else if (state && state.type === 'trap') {
        // User pressed back from Home
        window.history.pushState({ type: 'menu', menu: initialMenu }, '', '#' + initialMenu);
        _setActiveMenu(initialMenu);
        
        if (Swal.isVisible()) {
          Swal.close();
        } else {
          Swal.fire({
            title: 'Keluar Aplikasi?',
            text: 'Apakah Anda yakin ingin keluar dari aplikasi?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              window.history.go(-2);
            }
          });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialMenu]); // Only run once on mount or when role changes

  // Determine if there's any reminder
  const hasReminder = React.useMemo(() => {
    if (user?.role === "admin") return false;

    const now = new Date().getTime();

    if (user?.role === "siswa") {
      const mySetoran = setoran.filter((s) => s.siswa_id === user?.id);
      if (mySetoran.length === 0) {
        return true;
      }
      if (mySetoran.length > 0) {
        const sorted = [...mySetoran].sort(
          (a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime(),
        );
        const last = sorted[0];
        const lastTgl = new Date(last.tgl).getTime();
        const diffTime = Math.abs(now - lastTgl);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) return true;
      }
    } else if (user?.role === "guru") {
      const siswaBinaan = siswa.filter(s => s.penguji_id === user?.id);
      for (const s of siswaBinaan) {
        const siswaSetoran = setoran.filter(set => set.siswa_id === s.id);
        if (siswaSetoran.length === 0) return true;
        
        const sorted = [...siswaSetoran].sort(
          (a, b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime(),
        );
        const last = sorted[0];
        const lastTgl = new Date(last.tgl).getTime();
        const diffTime = Math.abs(now - lastTgl);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) return true;
      }
    }
    return false;
  }, [user, siswa, setoran]);

  React.useEffect(() => {
    if (hasReminder && (user?.role === "siswa" || user?.role === "guru")) {
      try {
        const audioCtx = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        
        const playBellSound = () => {
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          const now = audioCtx.currentTime;
          // Frequencies for a bright, pleasant bell chime
          const frequencies = [830.61, 1108.73, 1661.22]; 
          
          frequencies.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            
            // Stagger slightly for a bell-like attack and add decay
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05 + (i * 0.02));
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + (i * 0.2));
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + 2.0);
          });
        };

        playBellSound();
        
      } catch (e) {
        console.log("Audio not supported or blocked");
      }
    }
  }, [hasReminder, user]);

  const adminMenu = [
    {
      id: "dashboard",
      label: "Home",
      icon: Home,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      id: "siswa",
      label: "Siswa",
      icon: Users,
      color: "text-purple-500 dark:text-purple-400",
    },
    {
      id: "penguji",
      label: "Penguji",
      icon: UserCheck,
      color: "text-[#d19e44] dark:text-[#d19e44]",
    },
    {
      id: "validasi",
      label: "Validasi Sertifikat",
      icon: QrCode,
      color: "text-teal-500 dark:text-teal-400",
    },
    {
      id: "laporan",
      label: "Laporan",
      icon: BarChart3,
      color: "text-[#d19e44] dark:text-[#d19e44]",
    },
    {
      id: "sertifikat",
      label: "Sertifikat",
      icon: Award,
      color: "text-indigo-500 dark:text-indigo-400",
    },
    {
      id: "recycle",
      label: "Recycle Bin",
      icon: Trash2,
      color: "text-red-500 dark:text-red-400",
    },
    {
      id: "edit_profil",
      label: "Profil",
      icon: User,
      color: "text-purple-500 dark:text-purple-400",
    },
  ];

  const guruMenu = [
    {
      id: "dashboard",
      label: "Beranda",
      icon: BookOpen,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      id: "siswa",
      label: "Siswa",
      icon: Users,
      color: "text-purple-500 dark:text-purple-400",
    },
    {
      id: "input_setoran",
      label: "Input Setoran",
      icon: CheckCircle,
      color: "text-teal-500 dark:text-teal-400",
    },
    {
      id: "riwayat",
      label: "Riwayat Setoran",
      icon: History,
      color: "text-indigo-500 dark:text-indigo-400",
    },
    {
      id: "aktivitas",
      label: "Siswa Teraktif",
      icon: TrendingUp,
      color: "text-[#d19e44] dark:text-[#d19e44]",
    },
    {
      id: "edit_profil",
      label: "Profil",
      icon: User,
      color: "text-purple-500 dark:text-purple-400",
    },
  ];

  const siswaMenu = [
    {
      id: "profil",
      label: "Beranda",
      icon: Home,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      id: "nilai",
      label: "Nilai",
      icon: Award,
      color: "text-[#d19e44] dark:text-[#d19e44]",
    },
    {
      id: "riwayat",
      label: "Riwayat Setoran",
      icon: History,
      color: "text-indigo-500 dark:text-indigo-400",
    },
    {
      id: "peringkat",
      label: "Papan Peringkat",
      icon: Trophy,
      color: "text-yellow-500 dark:text-yellow-400",
    },
    {
      id: "sertifikat",
      label: "Sertifikat",
      icon: ShieldCheck,
      color: "text-[#d19e44] dark:text-[#d19e44]",
    },
    {
      id: "edit_profil",
      label: "Profil",
      icon: User,
      color: "text-purple-500 dark:text-purple-400",
    },
  ];

  const adminMobileMenu = [
    { id: "dashboard", label: "Home", icon: Home, color: "text-blue-500" },
    { id: "validasi", label: "Validasi", icon: QrCode, color: "text-teal-500" },
    { id: "sertifikat", label: "Sertifikat", icon: Award, color: "text-indigo-500" },
    { id: "edit_profil", label: "Profil", icon: User, color: "text-purple-500" },
  ];

  const guruMobileMenu = [
    { id: "dashboard", label: "Beranda", icon: BookOpen, color: "text-blue-500" },
    { id: "input_setoran", label: "Input", icon: CheckCircle, color: "text-teal-500" },
    { id: "edit_profil", label: "Profil", icon: User, color: "text-purple-500" },
  ];

  const siswaMobileMenu = [
    { id: "profil", label: "Beranda", icon: Home, color: "text-slate-500" },
    { id: "sertifikat", label: "Sertifikat", icon: ShieldCheck, color: "text-slate-500" },
    { id: "edit_profil", label: "Profil", icon: User, color: "text-slate-500" },
  ];

  const mobileBottomMenu = 
    user?.role === "admin"
      ? adminMobileMenu
      : user?.role === "guru"
        ? guruMobileMenu
        : siswaMobileMenu;

  const currentMenu =
    user?.role === "admin"
      ? adminMenu
      : user?.role === "guru"
        ? guruMenu
        : siswaMenu;

  const renderContent = () => {
    if (user?.role === "admin") {
      switch (activeMenu) {
        case "dashboard":
          return <AdminDashboard setActiveMenu={setActiveMenu} />;
        case "siswa":
          return <DataSiswa />;
        case "penguji":
          return <DataPenguji />;
        case "validasi":
          return <AdminValidasiSertifikat />;
        case "laporan":
          return <Laporan />;
        case "sertifikat":
          return <Sertifikat />;
        case "recycle":
          return <AdminRecycleBin />;
        case "pengaturan":
          return <AdminPengaturan />;
        case "edit_profil":
          return <UserEditProfil />;
      }
    } else if (user?.role === "guru") {
      switch (activeMenu) {
        case "dashboard":
          return <GuruDashboard setActiveMenu={setActiveMenu} />;
        case "siswa":
          return <DataSiswa />;
        case "input_setoran":
          return <GuruInputSetoran />;
        case "riwayat":
          return <GuruRiwayat />;
        case "aktivitas":
          return <GuruAktivitas />;
        case "peringkat":
          return <GuruPeringkat />;
        case "pengingat":
          return <GuruPengingat />;
        case "edit_profil":
          return <UserEditProfil />;
      }
    } else if (user?.role === "siswa") {
      switch (activeMenu) {
        case "profil":
          return <SiswaProfil setActiveMenu={setActiveMenu} hasReminder={hasReminder} />;
        case "nilai":
          return <SiswaNilai />;
        case "riwayat":
          return <SiswaRiwayatSetoran />;
        case "peringkat":
          return <SiswaPeringkat />;
        case "pengingat":
          return <SiswaPengingat />;
        case "sertifikat":
          return <SiswaSertifikat />;
        case "edit_profil":
          return <UserEditProfil />;
      }
    }
    return <div>Content Not Found</div>;
  };

  let menuTitle = currentMenu.find((m) => m.id === activeMenu)?.label;
  if (!menuTitle) {
    if (activeMenu === "pengaturan") menuTitle = "Pengaturan Sistem";
    else if (activeMenu === "pengingat") menuTitle = "Pengingat Setoran";
    else if (activeMenu === "peringkat") menuTitle = "Papan Peringkat";
    else menuTitle = activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1).replace(/_/g, ' ');
  }

  return (
    <div className="flex w-full h-[100dvh] overflow-hidden print:h-auto print:overflow-visible bg-slate-50 dark:bg-[#041e49] transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 print:hidden bg-[#041e49] text-white border-r border-slate-800 z-20 transition-all">
        <div className="p-6 border-b border-slate-700/50 flex items-center space-x-3">
          <div className="w-11 h-11 flex items-center justify-center">
            <img
              src="https://iili.io/Fr7hdzb.png"
              alt="Logo Sertifikasi Al-Qur'an"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide leading-tight">
              Sertifikasi
            </h2>
            <p className="text-[10px] text-[#d19e44] font-medium uppercase tracking-wider">
              Al-Qur'an
            </p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {currentMenu.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? "bg-[#031433] text-white font-bold shadow-sm"
                    : "text-slate-400 hover:bg-[#031433]/50 hover:text-slate-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span>{menu.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50 relative flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-transparent border border-white flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
              {user?.foto ? (
                <img src={user.foto} alt="User avatar" />
              ) : (
                user?.nama?.[0] || "A"
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">
                {user?.nama}
              </p>
              <p className="text-xs text-slate-400 font-medium truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden print:overflow-visible print:h-auto relative">
        <header className="h-[60px] md:h-16 print:hidden flex bg-[#041e49] border-b border-slate-800 sticky top-0 z-30 items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 md:hidden mr-3 flex items-center justify-center">
               <img
                 src="https://iili.io/Fr7hdzb.png"
                 alt="Logo"
                 className="w-full h-full object-contain"
               />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              {menuTitle}
            </h2>
          </div>
          <div className="flex items-center space-x-1.5">
            {(user?.role === "siswa" || user?.role === "guru") && (
              <button
                onClick={() => setActiveMenu("pengingat")}
                className={`p-2 rounded-full relative transition-colors ${
                  hasReminder
                    ? "bg-[#d19e44]/20 text-[#d19e44] hover:bg-[#d19e44]/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
                title="Pengingat Setoran"
              >
                <Bell
                  className={`w-5 h-5 ${hasReminder ? "animate-ring" : ""}`}
                />
                {hasReminder && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#041e49]"></span>
                )}
              </button>
            )}
            {user?.role === "admin" && (
              <button
                onClick={() => setActiveMenu("pengaturan")}
                className="p-2 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                title="Pengaturan"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto print:overflow-visible print:p-0 p-4 sm:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden print:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#041e49] border-t border-slate-200 dark:border-slate-800 z-40 pb-[env(safe-area-inset-bottom)] flex justify-around items-center px-2 pt-2 pb-2">
          {mobileBottomMenu.map((menu) => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.id;

            const isCenterButton = menu.id === "input_setoran";

            if (isCenterButton) {
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className="relative -top-5 flex flex-col items-center justify-center transition-all duration-300 z-50"
                >
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors ${isActive ? "bg-[#d19e44]" : "bg-[#041e49] dark:bg-[#031433]"} text-white border-4 border-white dark:border-[#041e49]`}>
                    <Icon className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                  <span className={`text-[10px] mt-1 transition-all duration-300 font-bold ${isActive ? 'text-[#d19e44]' : 'text-slate-500 dark:text-slate-400'}`}>
                    {menu.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 flex-1 ${
                  isActive
                    ? "text-[#041e49] dark:text-[#d19e44]"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
                }`}
              >
                <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? "-translate-y-1" : "scale-100"}`}>
                   <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] mt-1 transition-all duration-300 font-medium ${isActive ? 'opacity-100 font-bold' : 'opacity-80'}`}>
                  {menu.label}
                </span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
};
