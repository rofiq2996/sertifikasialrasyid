export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  role: Role;
  nama: string;
  username?: string;
  nis?: string;
  foto?: string;
  penguji_id?: string;
}

export interface Penguji {
  id: string;
  nama: string;
  username: string;
  password?: string;
  siswaBinaan: number;
  foto?: string;
}

export interface Siswa {
  id: string;
  nis?: string;
  username?: string;
  password?: string;
  nama: string;
  status?: string;
  bin_binti: string;
  nama_ayah: string;
  kelas?: string;
  gender: string;
  target: number[];
  penguji_id: string;
}

export interface Kelas {
  id: string;
  tingkat: string;
  rombel: string;
}

export type Nilai = 'Mumtaz (M)' | 'Jayyid Jiddan (JJ)' | 'Jayyid (J)';

export interface Setoran {
  id: number | string;
  tgl: string;
  siswa_id: string;
  juz: number;
  surah: string;
  ayat: string;
  nilai: Nilai;
  is_revised?: boolean;
}
