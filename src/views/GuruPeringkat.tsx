import React, { useState, useMemo } from 'react';
import { useAppContext } from '../lib/AppContext';
import { Trophy, Medal, Users, Globe, BookOpen, Search, Star, Award } from 'lucide-react';
import { getJuzProgress } from '../lib/constants';

type LeaderboardItem = {
  id: string;
  nama: string;
  kelas?: string;
  bin_binti: string;
  nama_ayah: string;
  totalSetoran: number;
  mumtazCount: number;
  jayyidJiddanCount: number;
  jayyidCount: number;
  lastActive: number;
  coveredCount: number;
  unit: string;
};

export const GuruPeringkat = () => {
  const { siswa, setoran, user, penguji } = useAppContext();
  const [filterMode, setFilterMode] = useState<'global' | 'binaan'>('binaan');
  const [selectedJuzStr, setSelectedJuzStr] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Determine available Juz based on the students this penguji handles
  const availableJuzList = useMemo(() => {
    if (!user) return [];
    
    // Only check binaanSiswa for the currently logged-in penguji
    const binaanSiswa = siswa.filter(s => s.penguji_id === user.id);
    const juzSet = new Set<number>();
    
    binaanSiswa.forEach(s => {
      if (s.target && Array.isArray(s.target)) {
        s.target.forEach(j => juzSet.add(j));
      }
    });
    
    setoran.forEach(set => {
      if (binaanSiswa.some(s => s.id === set.siswa_id)) {
        juzSet.add(Number(set.juz));
      }
    });
    
    return Array.from(juzSet).sort((a, b) => a - b);
  }, [siswa, user, setoran]);

  // 1. Get current penguji (must be logged-in user)
  const currentPenguji = penguji.find(p => p.id === user?.id);

  // 2. Determine raw list of students based on filterMode
  const activeSiswa = useMemo(() => {
    let list = siswa;
    if (filterMode === 'binaan' && user?.id) {
      list = list.filter(s => s.penguji_id === user.id);
    }
    return list;
  }, [siswa, filterMode, user?.id]);

  // 3. Generate leaderboard data
  const leaderboardData = useMemo(() => {
    const isJuzSpecific = selectedJuzStr !== 'all';
    const targetJuz = isJuzSpecific ? parseInt(selectedJuzStr, 10) : null;

    const studentMap = new Map<string, LeaderboardItem>();

    // Prepare map with active students
    activeSiswa.forEach(s => {
      studentMap.set(s.id, {
        id: s.id,
        nama: s.nama,
        kelas: s.kelas,
        bin_binti: s.bin_binti || 'Bin',
        nama_ayah: s.nama_ayah || '',
        totalSetoran: 0,
        mumtazCount: 0,
        jayyidJiddanCount: 0,
        jayyidCount: 0,
        lastActive: 0,
        coveredCount: 0,
        unit: targetJuz && targetJuz >= 29 ? 'SURAH' : 'AYAT'
      });
    });

    // Populate setoran achievements
    setoran.forEach(set => {
      // Check if Juz filter applies
      if (isJuzSpecific && set.juz !== targetJuz) return;

      if (studentMap.has(set.siswa_id)) {
        const item = studentMap.get(set.siswa_id)!;
        item.totalSetoran += 1;

        // Count grade frequencies
        const grade = set.nilai || '';
        if (grade.includes('Mumtaz') || grade === 'M') {
          item.mumtazCount += 1;
        } else if (grade.includes('Jayyid Jiddan') || grade === 'JJ') {
          item.jayyidJiddanCount += 1;
        } else if (grade.includes('Jayyid') || grade === 'J') {
          item.jayyidCount += 1;
        }

        // Track last active date
        const time = new Date(set.tgl).getTime();
        if (time > item.lastActive) {
          item.lastActive = time;
        }
      }
    });

    // Calculate covered progress details if target Juz is selected, otherwise use generic setoran accumulation
    const result = Array.from(studentMap.values())
      .map(item => {
        if (targetJuz !== null) {
          const studentSetoran = setoran.filter(s => s.siswa_id === item.id && s.juz === targetJuz);
          const progress = getJuzProgress(targetJuz, studentSetoran);
          return {
            ...item,
            coveredCount: progress.covered,
          };
        } else {
          return {
            ...item,
            coveredCount: item.totalSetoran,
            unit: 'SETORAN'
          };
        }
      })
      .filter(item => item.totalSetoran > 0)
      .sort((a, b) => {
        // 1. Primary sort: Mumtaz rating count
        if (b.mumtazCount !== a.mumtazCount) return b.mumtazCount - a.mumtazCount;
        // 2. Secondary sort: total setoran / covered count
        if (b.coveredCount !== a.coveredCount) return b.coveredCount - a.coveredCount;
        // 3. Tertiary sort: latest active
        return b.lastActive - a.lastActive;
      });

    return result;
  }, [activeSiswa, setoran, selectedJuzStr]);

  // 4. Client-side search within the computed leaderboard
  const searchedLeaderboard = useMemo(() => {
    return leaderboardData.filter(item => 
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaderboardData, searchTerm]);

  return (
    <div className="space-y-6 fade-in pb-8">
      {/* Clean Simplified Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Papan Peringkat Santri {selectedJuzStr !== 'all' && `(Juz ${selectedJuzStr})`}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Urutan prestasi santri berdasarkan keaktifan, total hafalan disetor, dan banyaknya perolehan nilai Mumtaz.
        </p>
      </div>

      {/* Filter and Search Bar aligned to standard layout */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-[#031433] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Global vs Binaan Saya tabs */}
          <div className="flex bg-slate-100 dark:bg-[#041e49] rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setFilterMode('binaan')}
              className={`flex-1 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center cursor-pointer ${
                filterMode === 'binaan'
                  ? 'bg-white dark:bg-[#031433] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 mr-1.5" /> Binaan Saya
            </button>
            <button
              onClick={() => setFilterMode('global')}
              className={`flex-1 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center cursor-pointer ${
                filterMode === 'global'
                  ? 'bg-white dark:bg-[#031433] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Globe className="w-4 h-4 mr-1.5" /> Global
            </button>
          </div>

          {/* Juz Selector dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedJuzStr}
              onChange={(e) => setSelectedJuzStr(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-[#041e49] focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="all">Semua Juz (Akumulasi)</option>
              {availableJuzList.map(juzNum => (
                <option key={juzNum} value={juzNum.toString()}>Juz {juzNum}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari murid..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#041e49] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-gray-400 outline-none transition-all"
          />
        </div>
      </div>

      {filterMode === 'binaan' && currentPenguji && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm border border-blue-100 dark:border-blue-800 flex items-center text-left">
          <Users className="w-5 h-5 mr-2 shrink-0 text-blue-500" />
          <span>
            Hanya menampilkan peringkat santri di bawah bimbingan langsung Anda, <strong>Ustadz {currentPenguji.nama}</strong>.
          </span>
        </div>
      )}

      {/* Main Ranking Table/List */}
      <div className="bg-white dark:bg-[#031433] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="space-y-4">
          {searchedLeaderboard.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-sm">Belum ada data setoran yang masuk dalam peringkat</p>
            </div>
          ) : (
            searchedLeaderboard.map((item, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={item.id} 
                  className="p-4 border border-slate-100 dark:border-slate-700/60 rounded-xl hover:shadow-sm hover:bg-slate-50/50 dark:hover:bg-[#041e49]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Compact Circle Badges for Ranks */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      rank === 1 
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-905 dark:text-yellow-400 font-extrabold border border-yellow-200' 
                        : rank === 2 
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-905 dark:text-slate-400 font-extrabold border border-slate-200'
                        : rank === 3 
                        ? 'bg-[#d19e44]/20 text-[#d19e44] dark:bg-amber-905 dark:text-[#d19e44] font-extrabold border border-[#d19e44]/30'
                        : 'bg-slate-50 text-slate-500 dark:bg-[#041e49] dark:text-slate-400'
                    }`}>
                      {rank}
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm md:text-base leading-tight">
                        {item.nama}
                      </p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Ayah ({item.bin_binti} {item.nama_ayah})
                      </p>
                    </div>
                  </div>

                  {/* Visual progress states / values */}
                  <div className="flex items-center gap-6 justify-between md:justify-end bg-slate-50/40 dark:bg-[#041e49]/20 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-750 flex-1 md:flex-initial">
                    <div className="text-left md:text-right min-w-[70px]">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Mumtaz</span>
                      <span className="text-sm font-extrabold text-[#d19e44] dark:text-[#d19e44] flex items-center gap-1 md:justify-end">
                        <Star className="w-3.5 h-3.5 fill-[#d19e44] text-[#d19e44] shrink-0" />
                        {item.mumtazCount} M
                      </span>
                    </div>

                    <div className="text-left md:text-right min-w-[80px]">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {item.unit === 'SETORAN' ? 'Total Setor' : item.unit}
                      </span>
                      <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                        {item.coveredCount}
                      </span>
                    </div>

                    <div className="hidden sm:block text-right min-w-[90px]">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Lain (JJ / J)</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {item.jayyidJiddanCount} JJ • {item.jayyidCount} J
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
