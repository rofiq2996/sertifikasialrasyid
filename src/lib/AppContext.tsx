import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Penguji, Siswa, Setoran, Kelas } from '../types';
import { store } from './store';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  penguji: Penguji[];
  siswa: Siswa[];
  setoran: Setoran[];
  kelas: Kelas[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'id' | 'en' | 'ar';
  settings: any;
  setLanguage: (lang: 'id' | 'en' | 'ar') => void;
  updateSettings: (newSettings: any) => Promise<void>;
  refreshData: () => Promise<void>;
  addSetoran: (setoranInfo: any) => Promise<void>;
  updateSetoran: (setoranInfo: any) => Promise<void>;
  deleteSetoran: (id: string | number) => Promise<void>;
  clearSetoranSiswa: (siswaIds: string[]) => Promise<void>;
  clearAllSetoran: () => Promise<void>;
  addSiswa: (siswa: Siswa) => Promise<void>;
  updateSiswa: (siswa: Siswa) => Promise<void>;
  deleteSiswa: (id: string) => Promise<void>;
  addPenguji: (penguji: Penguji) => Promise<void>;
  updatePenguji: (penguji: Penguji) => Promise<void>;
  deletePenguji: (id: string) => Promise<void>;
  addKelas: (kelas: Kelas) => Promise<void>;
  updateKelas: (kelas: Kelas) => Promise<void>;
  deleteKelas: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(store.user);
  const [penguji, setPenguji] = useState<Penguji[]>(store.penguji);
  const [siswa, setSiswa] = useState<Siswa[]>(store.siswa);
  const [setoran, setSetoran] = useState<Setoran[]>(store.setoran);
  const [kelas, setKelasState] = useState<Kelas[]>(store.kelas);
  const [theme, setThemeState] = useState<'light' | 'dark'>(store.theme);
  const [language, setLanguageState] = useState<'id' | 'en' | 'ar'>(store.language);
  const [settings, setSettingsState] = useState<any>(store.settings);

  const setLanguage = (lang: 'id' | 'en' | 'ar') => {
    localStorage.setItem('language', lang);
    store.language = lang;
    setLanguageState(lang);
  };

  const refreshData = async () => {
    await store.initDatabase();
    setPenguji([...store.penguji]);
    setSiswa([...store.siswa]);
    setSetoran([...store.setoran]);
    setKelasState([...store.kelas]);
    setSettingsState({ ...store.settings });
  };

  const setUser = (newUser: User | null) => {
    store.setSession(newUser);
    setUserState(newUser);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    refreshData();
    
    // Auto sync fallback
    const interval = setInterval(() => {
      if (user) {
        refreshData();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const addSetoran = async (setoranInfo: any) => {
    const newId = Date.now();
    const newSetoranData = { id: newId, ...setoranInfo };
    await store.addSetoran(newSetoranData);
    setSetoran([...store.setoran]);
  };

  const updateSetoran = async (setoranInfo: any) => {
    await store.updateSetoran(setoranInfo);
    setSetoran([...store.setoran]);
  };

  const deleteSetoran = async (id: string | number) => {
    await store.deleteSetoran(id);
    setSetoran([...store.setoran]);
  };

  const clearSetoranSiswa = async (siswaIds: string[]) => {
    await store.clearSetoranSiswa(siswaIds);
    setSetoran([...store.setoran]);
  };

  const clearAllSetoran = async () => {
    await store.clearAllSetoran();
    setSetoran([...store.setoran]);
  };

  const addSiswa = async (s: Siswa) => {
    await store.addSiswa(s);
    setSiswa([...store.siswa]);
  };
  const updateSiswa = async (s: Siswa) => {
    await store.updateSiswa(s);
    setSiswa([...store.siswa]);
    if (user && user.id === s.id) {
      setUser({ ...user, nama: s.nama, nis: s.nis, username: s.nis });
    }
  };
  const deleteSiswa = async (id: string) => {
    await store.deleteSiswa(id);
    setSiswa([...store.siswa]);
    setSetoran([...store.setoran]);
  };

  const updateSettings = async (newSettings: any) => {
    await store.updateSettings(newSettings);
    setSettingsState({ ...store.settings });
  };

  const addPenguji = async (p: Penguji) => {
    await store.addPenguji(p);
    setPenguji([...store.penguji]);
  };
  const updatePenguji = async (p: Penguji) => {
    await store.updatePenguji(p);
    setPenguji([...store.penguji]);
    if (user && user.id === p.id) {
      setUser({ ...user, nama: p.nama, username: p.username });
    }
  };
  const deletePenguji = async (id: string) => {
    await store.deletePenguji(id);
    setPenguji([...store.penguji]);
  };

  const addKelas = async (k: Kelas) => {
    await store.addKelas(k);
    setKelasState([...store.kelas]);
  };
  const updateKelas = async (k: Kelas) => {
    await store.updateKelas(k);
    setKelasState([...store.kelas]);
  };
  const deleteKelas = async (id: string) => {
    await store.deleteKelas(id);
    setKelasState([...store.kelas]);
  };

  const clearAllData = async () => {
    await store.clearAllData();
    setPenguji([]);
    setSiswa([]);
    setSetoran([]);
    setKelasState([]);
  };

  return (
    <AppContext.Provider value={{ user, setUser, penguji, siswa, setoran, kelas, theme, toggleTheme, language, setLanguage, settings, updateSettings, refreshData, addSetoran, updateSetoran, deleteSetoran, clearSetoranSiswa, clearAllSetoran, addSiswa, updateSiswa, deleteSiswa, addPenguji, updatePenguji, deletePenguji, addKelas, updateKelas, deleteKelas, clearAllData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
