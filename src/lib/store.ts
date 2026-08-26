import { collection, doc, getDocs, setDoc, writeBatch, query, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Penguji, Setoran, Siswa, User, Kelas } from '../types';

export const GAS_URL = "";

class AppState {
  user: User | null = null;
  penguji: Penguji[] = [];
  siswa: Siswa[] = [];
  setoran: Setoran[] = [];
  kelas: Kelas[] = [];
  theme: 'light' | 'dark' = 'light';
  language: 'id' | 'en' | 'ar' = 'id';
  settings: any = { batasAkhirSetoran: '' };

  constructor() {
    this.user = JSON.parse(localStorage.getItem('sertifikasi_session') || 'null');
    this.theme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.language = (localStorage.getItem('language') as 'id' | 'en' | 'ar') || 'id';
  }

  setSession(user: User | null) {
    this.user = user;
    if (user) {
      localStorage.setItem('sertifikasi_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('sertifikasi_session');
    }
  }

  async initDatabase() {
    try {
      const [pengujiSnap, siswaSnap, setoranSnap, settingsSnap, kelasSnap] = await Promise.all([
        getDocs(collection(db, 'penguji')),
        getDocs(collection(db, 'siswa')),
        getDocs(collection(db, 'setoran')),
        getDocs(collection(db, 'settings')),
        getDocs(collection(db, 'kelas'))
      ]);

      if (pengujiSnap.empty && siswaSnap.empty) {
        // Basis data kosong, biarkan kosong tanpa seed data dummmy
      } else {
        this.penguji = pengujiSnap.docs.map(d => d.data() as Penguji);
        this.siswa = siswaSnap.docs.map(d => d.data() as Siswa);
        this.setoran = setoranSnap.docs.map(d => d.data() as Setoran);
        this.kelas = kelasSnap.docs.map(d => d.data() as Kelas);
        settingsSnap.docs.forEach(d => { if (d.id === 'general') this.settings = d.data(); });
      }
    } catch (error) {
      console.error("Gagal terhubung ke Database Google Sheets/Firestore:", error);
      // Removed loadMockData() to prevent overwriting local state with dummy data during offline mode
    }
  }

  async clearSetoranSiswa(siswaIds: string[]) {
    const idsToDelete = new Set(siswaIds);
    const setoranToDelete = this.setoran.filter(s => idsToDelete.has(s.siswa_id));
    
    // Optimistic update
    this.setoran = this.setoran.filter(s => !idsToDelete.has(s.siswa_id));
    
    try {
      const batch = writeBatch(db);
      setoranToDelete.forEach(st => {
        batch.delete(doc(db, 'setoran', String(st.id)));
      });
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  }

  async clearAllSetoran() {
    const setoranToDelete = [...this.setoran];
    this.setoran = [];
    try {
      const batch = writeBatch(db);
      // Firestore batch has a limit of 500, but for simple app this is fine
      // Or we can chunk it
      for (let i = 0; i < setoranToDelete.length; i += 500) {
        const chunk = setoranToDelete.slice(i, i + 500);
        const chunkBatch = writeBatch(db);
        chunk.forEach(st => {
          chunkBatch.delete(doc(db, 'setoran', String(st.id)));
        });
        await chunkBatch.commit();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async addSetoran(setoranInfo: Setoran) {
    this.setoran.push(setoranInfo);
    this.setoran = [...this.setoran];
    try { await setDoc(doc(db, 'setoran', String(setoranInfo.id)), setoranInfo); } catch(e) {}
  }

  async deleteSetoran(id: string | number) {
    const itemToDelete = this.setoran.find(s => s.id === id);
    if (itemToDelete) {
      try {
        await setDoc(doc(db, 'recycle_bin', String(id)), {
          id: String(id),
          type: 'setoran',
          originalData: itemToDelete,
          deletedAt: Date.now()
        });
      } catch (e) { console.error(e); }
    }
    this.setoran = this.setoran.filter(s => s.id !== id);
    try { await deleteDoc(doc(db, 'setoran', String(id))); } catch(e) {}
  }

  async updateSetoran(setoranInfo: Setoran) {
    const idx = this.setoran.findIndex(s => s.id === setoranInfo.id);
    if (idx >= 0) {
      this.setoran[idx] = setoranInfo;
      this.setoran = [...this.setoran];
      try { await setDoc(doc(db, 'setoran', String(setoranInfo.id)), setoranInfo); } catch(e) {}
    }
  }

  async addSiswa(siswaInfo: Siswa) {
    this.siswa.push(siswaInfo);
    await setDoc(doc(db, 'siswa', String(siswaInfo.id)), siswaInfo);
  }

  async updateSiswa(siswaInfo: Siswa) {
    const idx = this.siswa.findIndex(s => s.id === siswaInfo.id);
    if (idx >= 0) {
      this.siswa[idx] = siswaInfo;
      await setDoc(doc(db, 'siswa', String(siswaInfo.id)), siswaInfo);
    }
  }

  async deleteSiswa(id: string) {
    const itemToDelete = this.siswa.find(s => s.id === id);
    if (itemToDelete) {
      try {
        await setDoc(doc(db, 'recycle_bin', String(id)), {
          id: String(id),
          type: 'siswa',
          originalData: itemToDelete,
          deletedAt: Date.now()
        });
      } catch (e) { console.error(e); }
    }
    this.siswa = this.siswa.filter(s => s.id !== id);
    await deleteDoc(doc(db, 'siswa', String(id)));
    await this.clearSetoranSiswa([id]);
  }

  async addPenguji(pengujiInfo: Penguji) {
    this.penguji.push(pengujiInfo);
    await setDoc(doc(db, 'penguji', String(pengujiInfo.id)), pengujiInfo);
  }

  async updatePenguji(pengujiInfo: Penguji) {
    const idx = this.penguji.findIndex(p => p.id === pengujiInfo.id);
    if (idx >= 0) {
      this.penguji[idx] = pengujiInfo;
      await setDoc(doc(db, 'penguji', String(pengujiInfo.id)), pengujiInfo);
    }
  }

  async deletePenguji(id: string) {
    const itemToDelete = this.penguji.find(p => p.id === id);
    if (itemToDelete) {
      try {
        await setDoc(doc(db, 'recycle_bin', String(id)), {
          id: String(id),
          type: 'penguji',
          originalData: itemToDelete,
          deletedAt: Date.now()
        });
      } catch (e) { console.error(e); }
    }
    this.penguji = this.penguji.filter(p => p.id !== id);
    await deleteDoc(doc(db, 'penguji', String(id)));
  }

  async addKelas(kelasInfo: Kelas) {
    this.kelas.push(kelasInfo);
    await setDoc(doc(db, 'kelas', String(kelasInfo.id)), kelasInfo);
  }

  async updateKelas(kelasInfo: Kelas) {
    const idx = this.kelas.findIndex(k => k.id === kelasInfo.id);
    if (idx >= 0) {
      this.kelas[idx] = kelasInfo;
      await setDoc(doc(db, 'kelas', String(kelasInfo.id)), kelasInfo);
    }
  }

  async deleteKelas(id: string) {
    const itemToDelete = this.kelas.find(k => k.id === id);
    if (itemToDelete) {
      try {
        await setDoc(doc(db, 'recycle_bin', String(id)), {
          id: String(id),
          type: 'kelas',
          originalData: itemToDelete,
          deletedAt: Date.now()
        });
      } catch (e) { console.error(e); }
    }
    this.kelas = this.kelas.filter(k => k.id !== id);
    await deleteDoc(doc(db, 'kelas', String(id)));
  }

  async updateSettings(newSettings: any) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      await setDoc(doc(db, 'settings', 'general'), this.settings);
    } catch (e) {
      localStorage.setItem('batasAkhirSetoran', this.settings.batasAkhirSetoran || '');
    }
  }

  async clearAllData() {
    this.penguji = [];
    this.siswa = [];
    this.setoran = [];
    this.kelas = [];
    
    try {
      const batch = writeBatch(db);
      
      const pSnap = await getDocs(collection(db, 'penguji'));
      pSnap.docs.forEach(d => batch.delete(d.ref));
      
      const sSnap = await getDocs(collection(db, 'siswa'));
      sSnap.docs.forEach(d => batch.delete(d.ref));
      
      const setSnap = await getDocs(collection(db, 'setoran'));
      setSnap.docs.forEach(d => batch.delete(d.ref));
      
      const kSnap = await getDocs(collection(db, 'kelas'));
      kSnap.docs.forEach(d => batch.delete(d.ref));
      
      await batch.commit();
    } catch(e) {
      console.error("Gagal mereset data:", e);
    }
  }

}

export const store = new AppState();
