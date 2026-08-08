import React, { useState } from 'react';
import { ClipboardCheck, Edit3, UserCheck, CheckCircle, Search, Award, TrendingUp, Users } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP, STATUS_OPTIONS, formatNilai, getNilaiColor, getNilaiBgColor, SURAH_AYAT_COUNT, JUZ_SURAH_AYAT_RANGE, getJuzProgress, getKriteriaNilai } from '../lib/constants';
import Swal from 'sweetalert2';
import { EditProfileModal } from '../components/EditProfileModal';
import { CustomSelect } from '../components/CustomSelect';

export const GuruDashboard = ({ setActiveMenu }: { setActiveMenu?: (menu: string) => void }) => {
  const { user, penguji, siswa, setoran, addSetoran, updateSetoran, updatePenguji, theme } = useAppContext();
  const siswaBinaan = siswa.filter(s => s.penguji_id === user?.id);
  const currentPenguji = penguji.find(p => p.id === user?.id);
  
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  const [siswaSearchTerm, setSiswaSearchTerm] = useState("");

  const selectedSiswa = siswa.find(s => s.id === selectedSiswaId);

  const handleSaveProfile = async (p: any) => {
    await updatePenguji(p);
    Swal.fire('Berhasil', 'Profil berhasil diupdate', 'success');
  };

  // Collect juz breakdown counts for Input Setoran
  const juzCount = siswaBinaan.reduce((acc, curr) => {
    curr.target.forEach(j => { acc[j] = (acc[j] || 0) + 1 });
    return acc;
  }, {} as Record<number, number>);

  // Collect grouped breakdown counts for the Top stats
  const targetGroupCount = siswaBinaan.reduce((acc, curr) => {
    const targetStr = [...curr.target].sort((a,b) => b - a).join(', ');
    if (targetStr) {
      acc[targetStr] = (acc[targetStr] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const siswaTuntasList = siswaBinaan.map(s => {
    const tuntasJuz: number[] = [];
    s.target.forEach(juz => {
      const sSetoran = setoran.filter(set => set.siswa_id === s.id && set.juz === juz);
      if (getJuzProgress(juz, sSetoran).percentage === 100) {
        tuntasJuz.push(juz);
      }
    });
    return { ...s, tuntasJuz };
  }).filter(s => s.tuntasJuz.length > 0);

  const handleSurahClick = async (surah: string, reviseModeAyat?: string) => {
    if (!selectedSiswaId || !selectedJuz) return;

    const isJuz1To28 = selectedJuz <= 28;
    const studentName = siswaBinaan.find(s => s.id === selectedSiswaId)?.nama || '';
    
    const rangeArr = JUZ_SURAH_AYAT_RANGE[selectedJuz]?.[surah];
    const minAllowed = rangeArr ? rangeArr[0] : 1;
    const maxAllowed = rangeArr ? rangeArr[1] : (SURAH_AYAT_COUNT[surah] || 286);
    
    let defaultAwal = '';
    let defaultAkhir = '';
    if (reviseModeAyat && reviseModeAyat.startsWith('Ayat ')) {
      const match = reviseModeAyat.replace('Ayat ', '').split('-');
      if (match.length === 2) {
        defaultAwal = match[0];
        defaultAkhir = match[1];
      } else if (match.length === 1) {
        defaultAwal = match[0];
        defaultAkhir = match[0];
      }
    }

    const { m, jj, j } = getKriteriaNilai(selectedJuz || 30, surah);
    let kriteriaHtml = `
      <div class="mb-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-3 text-left">
        <div class="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          Kriteria Nilai (Max Kesalahan)
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white dark:bg-[#031433] rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
            <div class="text-[10px] text-slate-500 font-bold mb-0.5">Mumtaz</div>
            <div class="text-sm font-black text-[#d19e44]">${m}</div>
          </div>
          <div class="bg-white dark:bg-[#031433] rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
            <div class="text-[10px] text-slate-500 font-bold mb-0.5">Jayyid Jiddan</div>
            <div class="text-sm font-black text-emerald-500">${jj}</div>
          </div>
          <div class="bg-white dark:bg-[#031433] rounded-lg p-2 text-center border border-slate-100 dark:border-slate-700">
            <div class="text-[10px] text-slate-500 font-bold mb-0.5">Jayyid</div>
            <div class="text-sm font-black text-blue-500">${j}</div>
          </div>
        </div>
      </div>
    `;

    // Get history for this surah
    const surahHistory = setoran
      .filter(s => s.siswa_id === selectedSiswaId && s.juz === selectedJuz && s.surah === surah)
      .sort((a, b) => new Date(a.tgl).getTime() - new Date(b.tgl).getTime());

    const historyHtml = isJuz1To28 && surahHistory.length > 0 ? `
      <div class="mb-6 text-left">
        <label class="block text-sm font-semibold text-slate-800 mb-2">Setoran Terakhir Surah Ini:</label>
        <div class="flex flex-col gap-2">
          ${surahHistory.slice(-1).map(s => `
            <div class="border border-slate-200 rounded-xl p-3 flex justify-between items-center text-sm">
              <span class="text-slate-700">${s.juz <= 28 ? (s.ayat || 'Lengkap') : (s.ayat && s.ayat !== 'Lengkap 1 Surah' && s.ayat !== 'Lengkap' ? s.ayat : '')}</span>
              <span class="font-bold text-[13px] tracking-wide ${
                s.nilai.includes('M') && !s.nilai.includes('JJ') ? 'text-[#d19e44]' :
                s.nilai.includes('JJ') ? 'text-blue-600' :
                'text-[#d19e44]'
              }">${s.nilai.includes('M') && !s.nilai.includes('JJ') ? 'M' : s.nilai.includes('JJ') ? 'JJ' : 'J'}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="border-t border-slate-100 mb-6 w-full"></div>
    ` : '';

    const { value: formValues } = await Swal.fire({
      html: `
        <h2 class="text-xl sm:text-2xl font-bold text-slate-800 text-center mb-6 mt-2">Input Setoran</h2>
        
        <div class="border border-slate-200 rounded-2xl p-4 flex justify-between items-center mb-6 text-sm">
           <div class="text-left w-1/2 pr-2">
              <div class="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">SISWA</div>
              <div class="font-bold text-slate-800 text-base truncate">${studentName}</div>
           </div>
           <div class="text-right w-1/2 pl-2">
              <div class="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">SURAH</div>
              <div class="font-bold text-slate-800 text-base truncate">${surah}</div>
           </div>
        </div>

        ${historyHtml}

        ${isJuz1To28 ? `
        <div class="mb-4 text-left">
          <label class="block text-base font-bold text-slate-800 mb-3">Input Setoran Baru</label>
          <div class="flex gap-4">
            <div class="flex-1">
               <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ayat Awal</label>
               <input type="number" id="swal-ayat-awal" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-[#d19e44] focus:border-[#d19e44] outline-none text-slate-800 font-medium placeholder-gray-400" min="${minAllowed || 1}" max="${maxAllowed || 286}" placeholder="${minAllowed || 1}" value="${defaultAwal}">
            </div>
            <div class="flex-1">
               <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ayat Akhir</label>
               <input type="number" id="swal-ayat-akhir" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-[#d19e44] focus:border-[#d19e44] outline-none text-slate-800 font-medium placeholder-gray-400" min="${minAllowed || 1}" max="${maxAllowed || 286}" placeholder="${maxAllowed || 286}" value="${defaultAkhir}">
            </div>
          </div>
        </div>
        ` : ''}

        ${kriteriaHtml}
        <div class="text-left mt-2 mb-4">
          <label class="block text-sm font-semibold text-slate-800 mb-3">Nilai Kelancaran</label>
          <div class="grid grid-cols-3 gap-3">
             <label class="cursor-pointer group flex-1">
                <input type="radio" name="swal-rating" value="Mumtaz (M)" class="peer hidden">
                <div class="py-3 text-center flex items-center justify-center rounded-xl border border-slate-200 peer-checked:border-2 peer-checked:border-[#d19e44] peer-checked:bg-[#d19e44]/10 peer-checked:text-[#d19e44] font-bold text-slate-600 text-lg group-hover:border-[#d19e44]/70 transition-all h-full">M</div>
             </label>
             <label class="cursor-pointer group flex-1">
                <input type="radio" name="swal-rating" value="Jayyid Jiddan (JJ)" class="peer hidden">
                <div class="py-3 text-center flex items-center justify-center rounded-xl border border-slate-200 peer-checked:border-2 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600 font-bold text-slate-600 text-lg group-hover:border-emerald-300 transition-all h-full">JJ</div>
             </label>
             <label class="cursor-pointer group flex-1">
                <input type="radio" name="swal-rating" value="Jayyid (J)" class="peer hidden">
                <div class="py-3 text-center flex items-center justify-center rounded-xl border border-slate-200 peer-checked:border-2 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 font-bold text-slate-600 text-lg group-hover:border-blue-300 transition-all h-full">J</div>
             </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl p-5 sm:p-8 !pb-7 w-full max-w-md',
        confirmButton: 'bg-[#d19e44] hover:bg-[#d19e44] text-white font-bold py-3 px-8 rounded-xl mx-2 shadow-sm transition-colors text-base flex-1 sm:flex-none uppercase tracking-wide',
        cancelButton: 'bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl mx-2 shadow-sm transition-colors text-base flex-1 sm:flex-none uppercase tracking-wide',
        actions: 'mt-8 border-t border-slate-100 pt-6 w-full flex justify-center gap-2',
        htmlContainer: '!mx-1 !my-0',
      },
      preConfirm: () => {
        const checked = document.querySelector('input[name="swal-rating"]:checked') as HTMLInputElement;
        const ayatAwalInput = document.getElementById('swal-ayat-awal') as HTMLInputElement | null;
        const ayatAkhirInput = document.getElementById('swal-ayat-akhir') as HTMLInputElement | null;
        
        if (!checked) {
          Swal.showValidationMessage('Pilih nilai terlebih dahulu');
          return null;
        }

        let ayatValue = 'Lengkap 1 Surah';
        if (isJuz1To28) {
          const isLengkap = surahHistory.some(s => !s.ayat || s.ayat === 'Lengkap 1 Surah' || s.ayat === 'Lengkap');
          const hasAwal = ayatAwalInput && ayatAwalInput.value;
          const hasAkhir = ayatAkhirInput && ayatAkhirInput.value;

          if (hasAwal || hasAkhir) {
            if (!hasAwal || !hasAkhir) {
              Swal.showValidationMessage('Masukkan ayat awal dan ayat akhir');
              return null;
            }

            const awal = parseInt(ayatAwalInput.value, 10);
            const akhir = parseInt(ayatAkhirInput.value, 10);

            if (isNaN(awal) || isNaN(akhir) || awal < minAllowed || akhir > maxAllowed || awal > akhir) {
              Swal.showValidationMessage(`Rentang ayat ${surah} untuk Juz ${selectedJuz} adalah ayat ${minAllowed}-${maxAllowed}`);
              return null;
            }

            if (awal === akhir) {
              ayatValue = `Ayat ${awal}`;
            } else {
              ayatValue = `Ayat ${awal}-${akhir}`;
            }

            if (isLengkap) {
               Swal.showValidationMessage('Surah ini sudah disetor lengkap');
               return null;
            }
            
            const isExactMatch = surahHistory.some(s => s.ayat === ayatValue);

            const coveredVerses = new Set<number>();
            surahHistory.forEach(s => {
              if (s.ayat !== ayatValue && s.ayat && s.ayat.startsWith('Ayat ')) {
                const rangeStr = s.ayat.replace('Ayat ', '');
                if (rangeStr.includes('-')) {
                  const parts = rangeStr.split('-');
                  const startOffset = parseInt(parts[0], 10);
                  const endOffset = parseInt(parts[1], 10);
                  for (let i = startOffset; i <= endOffset; i++) coveredVerses.add(i);
                } else {
                  coveredVerses.add(parseInt(rangeStr, 10));
                }
              }
            });
            
            const duplicateVerses = [];
            for (let i = awal; i <= akhir; i++) {
              if (coveredVerses.has(i)) {
                 duplicateVerses.push(i);
              }
            }
            
            if (!isExactMatch && duplicateVerses.length > 0) {
              const ranges = [];
              let curStart = duplicateVerses[0];
              let curPrev = duplicateVerses[0];
              for(let i=1; i<duplicateVerses.length; i++) {
                if (duplicateVerses[i] === curPrev + 1) {
                  curPrev = duplicateVerses[i];
                } else {
                  ranges.push(curStart === curPrev ? `${curStart}` : `${curStart}-${curPrev}`);
                  curStart = duplicateVerses[i];
                  curPrev = duplicateVerses[i];
                }
              }
              ranges.push(curStart === curPrev ? `${curStart}` : `${curStart}-${curPrev}`);
              
              Swal.showValidationMessage(`Ayat ${ranges.join(', ')} sudah pernah disetor`);
              return null;
            }
          } else {
            if (isLengkap) {
               // allow revision of Lengkap
               const ls = surahHistory.find(s => !s.ayat || s.ayat === 'Lengkap 1 Surah' || s.ayat === 'Lengkap');
               ayatValue = ls?.ayat || 'Lengkap 1 Surah';
            } else if (surahHistory.length > 0) {
               Swal.showValidationMessage('Masukkan rentang ayat, sebagian ayat sudah disetor');
               return null;
            } else {
               ayatValue = `Ayat ${minAllowed}-${maxAllowed}`;
            }
          }
        }

        return {
          status: checked.value,
          ayat: ayatValue
        };
      }
    });

    if (formValues) {
      const existingMatch = surahHistory.find(s => s.ayat === formValues.ayat) || 
                            (!isJuz1To28 && surahHistory.length > 0 ? surahHistory[0] : null);

      if (existingMatch) {
         await updateSetoran({
           ...existingMatch,
           nilai: formValues.status,
           tgl: new Date().toISOString(),
           is_revised: true
         });
         Swal.fire('Catatan Diperbarui!', `Nilai ${surah} berhasil disimpan`, 'success');
      } else {
         await addSetoran({
           siswa_id: selectedSiswaId,
           juz: selectedJuz,
           surah: surah,
           ayat: formValues.ayat,
           nilai: formValues.status,
           tgl: new Date().toISOString()
         });
         Swal.fire('Tersimpan!', `Nilai ${surah} berhasil disimpan`, 'success');
      }
    }
  };

  const getSurahStatus = (surah: string) => {
    if (!selectedSiswaId || !selectedJuz) return null;
    const records = setoran.filter(s => s.siswa_id === selectedSiswaId && s.juz === selectedJuz && s.surah === surah);
    if(records.length === 0) return null;
    // Get latest record
    return records.sort((a,b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime())[0];
  };

  const totalSiswa = siswaBinaan.length;
  const tuntasCount = siswaTuntasList.length;
  const belumCount = totalSiswa - tuntasCount;
  
  const mumtazCount = setoran.filter(s => {
    return siswaBinaan.some(siswa => siswa.id === s.siswa_id) && s.nilai && s.nilai.includes('M') && !s.nilai.includes('JJ');
  }).length;
  const totalSetoranBinaan = setoran.filter(s => siswaBinaan.some(siswa => siswa.id === s.siswa_id)).length;
  const mumtazPerc = totalSetoranBinaan > 0 ? Math.round((mumtazCount / totalSetoranBinaan) * 100) : 0;

  const tuntasPerc = totalSiswa > 0 ? Math.round((tuntasCount / totalSiswa) * 100) : 0;

  return (
    <div className="space-y-4 md:space-y-6 fade-in">
      <div className="flex justify-between items-center mb-2">
         <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#031433] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white border border-slate-700 shadow-sm overflow-hidden">
              {user?.foto ? <img src={user.foto} alt="Avatar" className="w-full h-full object-cover" /> : user?.nama?.[0]}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">Ahlan wa Sahlan,</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">{user?.nama}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 fade-in">
        <div className="bg-white dark:bg-[#031433] p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3 md:mb-4 gap-3">
            <div className="bg-[#041e49]/5 dark:bg-[#041e49]/40 text-[#d19e44] p-2.5 md:p-3 rounded-xl inline-block shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {Object.entries(targetGroupCount).map(([juz, count]) => (
                <div key={juz} className="bg-slate-50 dark:bg-slate-700 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-center flex gap-1.5 md:gap-2 items-center">
                  <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400">Juz {juz}</span>
                  <span className="bg-slate-200 text-slate-700 dark:bg-[#031433] dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-black">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">{siswaBinaan.length}</p>
            <p className="text-sm md:text-base text-slate-500 font-bold uppercase tracking-wide">TOTAL SISWA BINAAN</p>
          </div>
        </div>

        <div className="bg-[#d19e44] dark:bg-[#041e49] p-4 md:p-5 rounded-2xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 md:-top-4 opacity-20"><Award className="w-24 h-24 md:w-32 md:h-32" /></div>
          <div className="relative z-10 mb-3 md:mb-4">
            <div className="bg-white/20 backdrop-blur-md p-2.5 md:p-3 rounded-xl inline-block">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-2xl md:text-3xl font-black">{mumtazPerc}%</p>
            <p className="text-xs md:text-sm text-white/90 font-bold mt-0.5 tracking-wide uppercase">KUALITAS SETORAN MUMTAZ</p>
          </div>
        </div>
      </div>

      {setActiveMenu && (
        <div className="md:hidden mt-4 text-center">
          <div className="grid grid-cols-3 gap-4 px-2">
            {[
              { id: 'siswa', label: 'Siswa', icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
              { id: 'riwayat', label: 'Riwayat', icon: ClipboardCheck, color: 'text-indigo-500', bg: 'bg-indigo-100' },
              { id: 'aktivitas', label: 'Aktivitas', icon: TrendingUp, color: 'text-[#d19e44]', bg: 'bg-[#d19e44]/20' },
            ].map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveMenu(menu.id)}
                  className="flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 dark:bg-[#031433] ${menu.bg} dark:bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${menu.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    {menu.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-[#031433] p-4 md:p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg pl-2 border-l-4 border-[#d19e44]">Presentase Progress Kelulusan Siswa</h3>
        </div>
        
        <div className="w-full mt-4">
          {siswaBinaan.length === 0 ? (
            <div className="py-10 flex items-center justify-center text-slate-400 font-medium">
              Belum ada data siswa
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-4">
              {/* Progress Bar Container */}
              <div className="w-full">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-300">Total Kelulusan</span>
                  <span className="text-3xl font-black text-[#d19e44] dark:text-[#d19e44] leading-none">{tuntasPerc}%</span>
                </div>
                <div className="w-full h-4 md:h-5 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d19e44] to-[#f5c674] transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${tuntasPerc}%` }}
                  />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                <div className="bg-white dark:bg-[#041e49]/40 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center shadow-sm">
                  <span className="text-3xl md:text-4xl font-black text-[#d19e44] mb-1">{tuntasCount}</span>
                  <span className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Siswa Tuntas</span>
                </div>
                <div className="bg-white dark:bg-[#041e49]/40 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center shadow-sm">
                  <span className="text-3xl md:text-4xl font-black text-slate-700 dark:text-slate-300 mb-1">{belumCount}</span>
                  <span className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Belum Tuntas</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
