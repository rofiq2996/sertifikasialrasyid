export const ASMAUL_HUSNA = [
  "Ar-Rahman", "Ar-Rahim", "Al-Malik", "Al-Quddus", "As-Salam", "Al-Mu'min", 
  "Al-Muhaimin", "Al-Aziz", "Al-Jabbar", "Al-Mutakabbir", "Al-Khaliq", "Al-Bari'", 
  "Al-Musawwir", "Al-Ghaffar", "Al-Qahhar", "Al-Wahhab", "Ar-Razzaq", "Al-Fattah", 
  "Al-Alim", "Al-Qabidh", "Al-Basit", "Al-Khafid", "Ar-Rafi'", "Al-Mu'izz", 
  "Al-Mudhill", "As-Sami'", "Al-Basir", "Al-Hakam", "Al-Adl", "Al-Latif"
];

export const STATUS_OPTIONS = [
  { value: 'Mumtaz (M)', color: 'text-[#d19e44] dark:text-[#d19e44] font-bold' },
  { value: 'Jayyid Jiddan (JJ)', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
  { value: 'Jayyid (J)', color: 'text-blue-600 dark:text-blue-400 font-bold' }
];

export function formatNilai(n: string) {
  if(n === 'Mumtaz (M)' || n === 'M') return 'M';
  if(n === 'Jayyid Jiddan (JJ)' || n === 'JJ') return 'JJ';
  if(n === 'Jayyid (J)' || n === 'J') return 'J';
  return n;
}

export function getNilaiColor(n: string) {
  if(n === 'Mumtaz (M)' || n === 'M') return 'text-[#d19e44] dark:text-[#d19e44]';
  if(n === 'Jayyid Jiddan (JJ)' || n === 'JJ') return 'text-emerald-600 dark:text-emerald-400';
  if(n === 'Jayyid (J)' || n === 'J') return 'text-blue-600 dark:text-blue-400';
  return '';
}

export function getNilaiBgColor(n: string) {
  if(n === 'Mumtaz (M)' || n === 'M') return 'bg-[#d19e44]/10 border-[#d19e44]/30 text-[#d19e44] dark:bg-[#d19e44]/20 dark:border-[#d19e44]/50 dark:text-[#d19e44]';
  if(n === 'Jayyid Jiddan (JJ)' || n === 'JJ') return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400';
  if(n === 'Jayyid (J)' || n === 'J') return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400';
  return 'bg-white dark:bg-[#031433] border-slate-200 dark:border-slate-700';
}

export function getJuzProgress(juz: number, setoranRecords: any[]) {
  const maxSurahs = JUZ_SURAH_MAP[juz] || [];
  
  if (juz <= 28) {
    let totalAyatInJuz = 0;
    const surahAyatRange = JUZ_SURAH_AYAT_RANGE[juz] || {};
    
    Object.keys(surahAyatRange).forEach(surah => {
      const [start, end] = surahAyatRange[surah] || [0, 0];
      totalAyatInJuz += (end - start + 1);
    });

    if (totalAyatInJuz === 0) return { percentage: 0, text: '0 Ayat', covered: 0, total: 0 };

    let coveredAyatCount = 0;
    
    Object.keys(surahAyatRange).forEach(surah => {
      const recordsForSurah = setoranRecords.filter(r => r.surah === surah);
      const [juzStart, juzEnd] = surahAyatRange[surah] || [0, 0];
      
      const coveredInSurah = new Set<number>();
      
      recordsForSurah.forEach(record => {
        const ayatStr = record.ayat;
        if (!ayatStr || ayatStr === 'Lengkap 1 Surah' || ayatStr === 'Lengkap') {
           for (let i = juzStart; i <= juzEnd; i++) coveredInSurah.add(i);
        } else if (ayatStr.startsWith('Ayat ')) {
           const rangeStr = ayatStr.replace('Ayat ', '');
           if (rangeStr.includes('-')) {
              const parts = rangeStr.split('-');
              const start = parseInt(parts[0], 10);
              const end = parseInt(parts[1], 10);
              if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                  if (i >= juzStart && i <= juzEnd) coveredInSurah.add(i);
                }
              }
           } else {
              const num = parseInt(rangeStr, 10);
              if (!isNaN(num)) {
                if (num >= juzStart && num <= juzEnd) coveredInSurah.add(num);
              }
           }
        }
      });
      coveredAyatCount += coveredInSurah.size;
    });

    const percentage = Math.round((coveredAyatCount / totalAyatInJuz) * 100);
    return { percentage, text: `${coveredAyatCount}/${totalAyatInJuz} Ayat`, covered: coveredAyatCount, total: totalAyatInJuz };
  } else {
    const setoranSurahSet = new Set();
    setoranRecords.forEach(r => {
       if (maxSurahs.includes(r.surah)) {
         setoranSurahSet.add(r.surah);
       }
    });
    const completeCount = setoranSurahSet.size;
    const maxS = maxSurahs.length;
    const percentage = maxS > 0 ? Math.round((completeCount / maxS) * 100) : 0;
    return { percentage, text: `${completeCount}/${maxS} Surat`, covered: completeCount, total: maxS };
  }
}

export function getKriteriaNilai(juz: number, surahName?: string) {
  let m = 3;
  let jj = 4;
  let j = 5;

  if (juz === 30) {
    if (surahName) {
      const num = getSurahNumber(surahName);
      if (num >= 93 && num <= 114) {
        // Surah An-Nas (114) sampai Ad-Dhuha (93)
        m = 2; jj = 4; j = 6;
      } else {
        // Surah Al-Lail (92) sampai An-Naba' (78)
        m = 3; jj = 5; j = 7;
      }
    } else {
      m = 2; jj = 4; j = 6;
    }
  } else if (juz === 29) {
    m = 3; jj = 5; j = 6;
  } else {
    // Juz 1 s.d. 28
    m = 3; jj = 4; j = 5;
  }

  return { m, jj, j };
}

export function calculatePredikatAkhir(juz: number, setoranList: any[]) {
  if (!setoranList || setoranList.length === 0) return '-';

  const getSalah = (list: any[]) => {
    let salahCount = 0;
    for (const s of list) {
      if (!s.nilai) continue;
      if (s.nilai.includes('JJ')) {
        salahCount += 1;
      } else if (s.nilai === 'Jayyid (J)' || s.nilai === 'J') {
        salahCount += 2; // Jayyid is considered a major mistake (2 minor mistakes)
      }
    }
    return salahCount;
  };

  if (typeof setoranList[0] === 'string') {
    let salah = 0;
    for (const n of setoranList) {
      if (n.includes('JJ')) salah += 1;
      else if (n === 'Jayyid (J)' || n === 'J') salah += 2;
    }

    if (juz === 30) {
      if (salah <= 5) return 'Mumtaz (M)';
      if (salah <= 9) return 'Jayyid Jiddan (JJ)';
      if (salah <= 13) return 'Jayyid (J)';
      return '-';
    } else if (juz === 29) {
      if (salah <= 3) return 'Mumtaz (M)';
      if (salah <= 5) return 'Jayyid Jiddan (JJ)';
      if (salah <= 6) return 'Jayyid (J)';
      return '-';
    } else {
      if (salah <= 3) return 'Mumtaz (M)';
      if (salah <= 4) return 'Jayyid Jiddan (JJ)';
      if (salah <= 5) return 'Jayyid (J)';
      return '-';
    }
  }

  const latestSetoranMap = new Map<string, any>();
  const sortedSetoran = [...setoranList].sort((a, b) => new Date(a.tgl).getTime() - new Date(b.tgl).getTime());
  for (const s of sortedSetoran) {
    latestSetoranMap.set(s.surah, s);
  }
  const latestSetorans = Array.from(latestSetoranMap.values());

  if (juz === 30) {
    const part1 = latestSetorans.filter(s => {
      const num = getSurahNumber(s.surah);
      return num >= 93 && num <= 114;
    });
    const part2 = latestSetorans.filter(s => {
      const num = getSurahNumber(s.surah);
      return num >= 78 && num <= 92;
    });

    const salah1 = getSalah(part1);
    const salah2 = getSalah(part2);

    let grade1 = 0; 
    if (salah1 <= 2) grade1 = 3;
    else if (salah1 <= 4) grade1 = 2;
    else if (salah1 <= 6) grade1 = 1;

    let grade2 = 0;
    if (salah2 <= 3) grade2 = 3;
    else if (salah2 <= 5) grade2 = 2;
    else if (salah2 <= 7) grade2 = 1;

    const finalGrade = Math.min(grade1, grade2);
    if (finalGrade === 3) return 'Mumtaz (M)';
    if (finalGrade === 2) return 'Jayyid Jiddan (JJ)';
    if (finalGrade === 1) return 'Jayyid (J)';
    return '-';

  } else if (juz === 29) {
    const salah = getSalah(latestSetorans);
    if (salah <= 3) return 'Mumtaz (M)';
    if (salah <= 5) return 'Jayyid Jiddan (JJ)';
    if (salah <= 6) return 'Jayyid (J)';
    return '-';
  } else {
    const salah = getSalah(latestSetorans);
    if (salah <= 3) return 'Mumtaz (M)';
    if (salah <= 4) return 'Jayyid Jiddan (JJ)';
    if (salah <= 5) return 'Jayyid (J)';
    return '-';
  }
}

export const formatPredikatCert = (predikat: string) => {
  if (predikat === 'Mumtaz (M)') return 'MUMTAZ';
  if (predikat === 'Jayyid Jiddan (JJ)') return 'JAYYID JIDDAN';
  if (predikat === 'Jayyid (J)') return 'JAYYID';
  return predikat?.toUpperCase() || '-';
}

export const getPredikatAkhir = calculatePredikatAkhir; // just alias if needed

export const SURAH_AYAT_COUNT: Record<string, number> = {
  "Al-Fatihah": 7, "Al-Baqarah": 286, "Ali Imran": 200, "An-Nisa": 176, "Al-Ma'idah": 120, "Al-An'am": 165,
  "Al-A'raf": 206, "Al-Anfal": 75, "At-Taubah": 129, "Yunus": 109, "Hud": 123, "Yusuf": 111,
  "Ar-Ra'd": 43, "Ibrahim": 52, "Al-Hijr": 99, "An-Nahl": 128, "Al-Isra": 111, "Al-Kahfi": 110,
  "Maryam": 98, "Thaha": 135, "Al-Anbiya": 112, "Al-Hajj": 78, "Al-Mu'minun": 118, "An-Nur": 64,
  "Al-Furqan": 77, "Asy-Syu'ara": 227, "An-Naml": 93, "Al-Qasas": 88, "Al-Ankabut": 69, "Ar-Rum": 60,
  "Luqman": 34, "As-Sajdah": 30, "Al-Ahzab": 73, "Saba' ": 54, "Fathir": 45, "Yasin": 83,
  "Ash-Shaffat": 182, "Shad": 88, "Az-Zumar": 75, "Ghafir": 85, "Fushshilat": 54, "Asy-Syura": 53,
  "Az-Zukhruf": 89, "Ad-Dukhan": 59, "Al-Jatsiyah": 37, "Al-Ahqaf": 35, "Muhammad": 38, "Al-Fath": 29,
  "Al-Hujurat": 18, "Qaf": 45, "Az-Zariyat": 60, "At-Tur": 49, "An-Najm": 62, "Al-Qamar": 55,
  "Ar-Rahman": 78, "Al-Waqi'ah": 96, "Al-Hadid": 29, "Al-Mujadilah": 22, "Al-Hasyr": 24, "Al-Mumtahanah": 13,
  "As-Saff": 14, "Al-Jumu'ah": 11, "Al-Munafiqun": 11, "At-Tagabun": 18, "At-Talaq": 12, "At-Tahrim": 12,
  "Al-Mulk": 30, "Al-Qalam": 52, "Al-Haqqah": 52, "Al-Ma'arij": 44, "Nuh": 28, "Al-Jinn": 28,
  "Al-Muzzammil": 20, "Al-Muddassir": 56, "Al-Qiyamah": 40, "Al-Insan": 31, "Al-Mursalat": 50, "An-Naba": 40,
  "An-Nazi'at": 46, "Abasa": 42, "At-Takwir": 29, "Al-Infitar": 19, "Al-Mutaffifin": 36, "Al-Insyiqaq": 25,
  "Al-Buruj": 22, "At-Tariq": 17, "Al-A'la": 19, "Al-Ghasyiyah": 26, "Al-Fajr": 30, "Al-Balad": 20,
  "Asy-Syams": 15, "Al-Lail": 21, "Ad-Duha": 11, "Asy-Syarh": 8, "At-Tin": 8, "Al-Alaq": 19,
  "Al-Qadr": 5, "Al-Bayyinah": 8, "Az-Zalzalah": 8, "Al-Adiyat": 11, "Al-Qari'ah": 11, "At-Takasur": 8,
  "Al-Asr": 3, "Al-Humazah": 9, "Al-Fil": 5, "Quraisy": 4, "Al-Ma'un": 7, "Al-Kausar": 3,
  "Al-Kafirun": 6, "An-Nasr": 3, "Al-Lahab": 5, "Al-Ikhlas": 4, "Al-Falaq": 5, "An-Nas": 6
};

export const JUZ_SURAH_AYAT_RANGE: Record<number, Record<string, [number, number]>> = {
  1: { "Al-Fatihah": [1, 7], "Al-Baqarah": [1, 141] },
  2: { "Al-Baqarah": [142, 252] },
  3: { "Al-Baqarah": [253, 286], "Ali Imran": [1, 92] },
  4: { "Ali Imran": [93, 200], "An-Nisa": [1, 23] },
  5: { "An-Nisa": [24, 147] },
  6: { "An-Nisa": [148, 176], "Al-Ma'idah": [1, 81] },
  7: { "Al-Ma'idah": [82, 120], "Al-An'am": [1, 110] },
  8: { "Al-An'am": [111, 165], "Al-A'raf": [1, 87] },
  9: { "Al-A'raf": [88, 206], "Al-Anfal": [1, 40] },
  10: { "Al-Anfal": [41, 75], "At-Taubah": [1, 92] },
  11: { "At-Taubah": [93, 129], "Yunus": [1, 109], "Hud": [1, 5] },
  12: { "Hud": [6, 123], "Yusuf": [1, 52] },
  13: { "Yusuf": [53, 111], "Ar-Ra'd": [1, 43], "Ibrahim": [1, 52] },
  14: { "Al-Hijr": [1, 99], "An-Nahl": [1, 128] },
  15: { "Al-Isra": [1, 111], "Al-Kahfi": [1, 74] },
  16: { "Al-Kahfi": [75, 110], "Maryam": [1, 98], "Thaha": [1, 135] },
  17: { "Al-Anbiya": [1, 112], "Al-Hajj": [1, 78] },
  18: { "Al-Mu'minun": [1, 118], "An-Nur": [1, 64], "Al-Furqan": [1, 20] },
  19: { "Al-Furqan": [21, 77], "Asy-Syu'ara": [1, 227], "An-Naml": [1, 55] },
  20: { "An-Naml": [56, 93], "Al-Qasas": [1, 88], "Al-Ankabut": [1, 45] },
  21: { "Al-Ankabut": [46, 69], "Ar-Rum": [1, 60], "Luqman": [1, 34], "As-Sajdah": [1, 30], "Al-Ahzab": [1, 30] },
  22: { "Al-Ahzab": [31, 73], "Saba' ": [1, 54], "Fathir": [1, 45], "Yasin": [1, 27] },
  23: { "Yasin": [28, 83], "Ash-Shaffat": [1, 182], "Shad": [1, 88], "Az-Zumar": [1, 31] },
  24: { "Az-Zumar": [32, 75], "Ghafir": [1, 85], "Fushshilat": [1, 46] },
  25: { "Fushshilat": [47, 54], "Asy-Syura": [1, 53], "Az-Zukhruf": [1, 89], "Ad-Dukhan": [1, 59], "Al-Jatsiyah": [1, 37] },
  26: { "Al-Ahqaf": [1, 35], "Muhammad": [1, 38], "Al-Fath": [1, 29], "Al-Hujurat": [1, 18], "Qaf": [1, 45], "Az-Zariyat": [1, 30] },
  27: { "Az-Zariyat": [31, 60], "At-Tur": [1, 49], "An-Najm": [1, 62], "Al-Qamar": [1, 55], "Ar-Rahman": [1, 78], "Al-Waqi'ah": [1, 96], "Al-Hadid": [1, 29] },
  28: { "Al-Mujadilah": [1, 22], "Al-Hasyr": [1, 24], "Al-Mumtahanah": [1, 13], "As-Saff": [1, 14], "Al-Jumu'ah": [1, 11], "Al-Munafiqun": [1, 11], "At-Tagabun": [1, 18], "At-Talaq": [1, 12], "At-Tahrim": [1, 12] }
};

export const JUZ_SURAH_MAP: Record<number, string[]> = {
  1: ["Al-Fatihah", "Al-Baqarah"],
  2: ["Al-Baqarah"],
  3: ["Al-Baqarah", "Ali Imran"],
  4: ["Ali Imran", "An-Nisa"],
  5: ["An-Nisa"],
  6: ["An-Nisa", "Al-Ma'idah"],
  7: ["Al-Ma'idah", "Al-An'am"],
  8: ["Al-An'am", "Al-A'raf"],
  9: ["Al-A'raf", "Al-Anfal"],
  10: ["Al-Anfal", "At-Taubah"],
  11: ["At-Taubah", "Yunus", "Hud"],
  12: ["Hud", "Yusuf"],
  13: ["Yusuf", "Ar-Ra'd", "Ibrahim"],
  14: ["Al-Hijr", "An-Nahl"],
  15: ["Al-Isra", "Al-Kahfi"],
  16: ["Al-Kahfi", "Maryam", "Thaha"],
  17: ["Al-Anbiya", "Al-Hajj"],
  18: ["Al-Mu'minun", "An-Nur", "Al-Furqan"],
  19: ["Al-Furqan", "Asy-Syu'ara", "An-Naml"],
  20: ["An-Naml", "Al-Qasas", "Al-Ankabut"],
  21: ["Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab"],
  22: ["Al-Ahzab", "Saba' ", "Fathir", "Yasin"],
  23: ["Yasin", "Ash-Shaffat", "Shad", "Az-Zumar"],
  24: ["Az-Zumar", "Ghafir", "Fushshilat"],
  25: ["Fushshilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jatsiyah"],
  26: ["Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Az-Zariyat"],
  27: ["Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid"],
  28: ["Al-Mujadilah", "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim"],
  29: ["Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat"],
  30: ["An-Naba", "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qari'ah", "At-Takasur", "Al-Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"]
};

export const SURAH_LIST_ORDERED = Object.keys(SURAH_AYAT_COUNT);
export const getSurahNumber = (surahName: string): number => {
  return SURAH_LIST_ORDERED.indexOf(surahName) + 1;
};
