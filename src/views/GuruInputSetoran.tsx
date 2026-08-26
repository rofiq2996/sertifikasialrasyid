import React, { useState } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP, formatNilai, getNilaiBgColor, SURAH_AYAT_COUNT, JUZ_SURAH_AYAT_RANGE, getJuzProgress, getKriteriaNilai } from '../lib/constants';
import Swal from 'sweetalert2';
import { CustomSelect } from '../components/CustomSelect';

export const GuruInputSetoran = () => {
  const { user, siswa, setoran, addSetoran, updateSetoran, deleteSetoran } = useAppContext();
  const siswaBinaan = siswa.filter(s => s.penguji_id === user?.id);
  
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  const [siswaSearchTerm, setSiswaSearchTerm] = useState("");

  const selectedSiswa = siswa.find(s => s.id === selectedSiswaId);

  const juzCount = siswaBinaan.reduce((acc, curr) => {
    curr.target.forEach(j => { acc[j] = (acc[j] || 0) + 1 });
    return acc;
  }, {} as Record<number, number>);

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

    const todayDateStr = new Date().toISOString().split('T')[0];

    const result = await Swal.fire({
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
        <div class="mb-4 text-left">
          <label class="block text-sm font-semibold text-slate-800 mb-2">Tanggal Setor</label>
          <input type="date" id="swal-tgl-setor" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-[#d19e44] focus:border-[#d19e44] outline-none text-slate-800 font-medium bg-slate-50" value="${todayDateStr}">
        </div>
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
      showDenyButton: surahHistory.length > 0,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      denyButtonText: 'Hapus',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-3xl p-5 sm:p-8 !pb-7 w-full max-w-md',
        confirmButton: 'bg-[#d19e44] hover:bg-[#d19e44] text-white font-bold py-3 px-6 rounded-xl mx-1 shadow-sm transition-colors text-sm flex-1 uppercase tracking-wide',
        cancelButton: 'bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl mx-1 shadow-sm transition-colors text-sm flex-1 uppercase tracking-wide',
        denyButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl mx-1 shadow-sm transition-colors text-sm flex-1 uppercase tracking-wide',
        actions: 'mt-8 border-t border-slate-100 pt-6 w-full flex justify-center gap-2 flex-wrap',
        htmlContainer: '!mx-1 !my-0',
      },
      preConfirm: () => {
        const checked = document.querySelector('input[name="swal-rating"]:checked') as HTMLInputElement;
        const ayatAwalInput = document.getElementById('swal-ayat-awal') as HTMLInputElement | null;
        const ayatAkhirInput = document.getElementById('swal-ayat-akhir') as HTMLInputElement | null;
        const tglSetorInput = document.getElementById('swal-tgl-setor') as HTMLInputElement | null;
        
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

        let tglValue = new Date().toISOString();
        if (tglSetorInput && tglSetorInput.value) {
            const selectedDate = new Date(tglSetorInput.value);
            const now = new Date();
            selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            tglValue = selectedDate.toISOString();
        }

        return {
          status: checked.value,
          ayat: ayatValue,
          tgl: tglValue
        };
      }
    });

    if (result.isDenied) {
      const confirmDelete = await Swal.fire({
        title: 'Hapus Nilai?',
        text: `Anda yakin ingin menghapus semua nilai setoran untuk ${surah}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        customClass: {
          popup: 'rounded-3xl',
          confirmButton: 'rounded-xl font-bold tracking-wide uppercase',
          cancelButton: 'rounded-xl font-bold tracking-wide uppercase',
        }
      });

      if (confirmDelete.isConfirmed) {
        for (const history of surahHistory) {
          if (history.id) {
            await deleteSetoran(history.id);
          }
        }
        Swal.fire('Terhapus!', `Nilai setoran ${surah} telah dihapus.`, 'success');
      }
      return;
    }

    const formValues = result.value;
    if (formValues) {
      const existingMatch = surahHistory.find(s => s.ayat === formValues.ayat) || 
                            (!isJuz1To28 && surahHistory.length > 0 ? surahHistory[0] : null);

      if (existingMatch) {
         await updateSetoran({
           ...existingMatch,
           nilai: formValues.status,
           tgl: formValues.tgl,
           is_revised: true
         });
         Swal.fire('Catatan Diperbarui!', `Nilai ${surah} berhasil disimpan`, 'success');
      } else {
         await addSetoran({
           id: 'ST' + Date.now() + Math.floor(Math.random() * 1000),
           siswa_id: selectedSiswaId,
           juz: selectedJuz,
           surah: surah,
           ayat: formValues.ayat,
           nilai: formValues.status,
           tgl: formValues.tgl
         });
         Swal.fire('Tersimpan!', `Nilai ${surah} berhasil disimpan`, 'success');
      }
    }
  };

  const getSurahStatus = (surah: string) => {
    if (!selectedSiswaId || !selectedJuz) return null;
    const records = setoran.filter(s => s.siswa_id === selectedSiswaId && s.juz === selectedJuz && s.surah === surah);
    if(records.length === 0) return null;
    return records.sort((a,b) => new Date(b.tgl).getTime() - new Date(a.tgl).getTime())[0];
  };

  return (
    <div className="space-y-4 md:space-y-6 fade-in p-4 md:p-6 custom-scrollbar overflow-y-auto w-full h-[calc(100vh-60px)] md:h-screen">
      <div className="bg-white dark:bg-[#031433] rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Input Setoran</h3>
        </div>
        
        {(!selectedJuz || !selectedSiswaId || !selectedSiswa) ? (
          <div className="space-y-4 mb-4 fade-in">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">1. Pilih Juz</label>
              {Object.keys(juzCount).length === 0 ? (
                <span className="text-sm text-slate-500">Anda tidak memiliki siswa binaan.</span>
              ) : (
                <CustomSelect
                  value={selectedJuz ? selectedJuz.toString() : ""}
                  onChange={(val) => setSelectedJuz(Number(val))}
                  options={[
                    { value: "", label: "-- Pilih Juz --" },
                    ...Object.keys(juzCount).map((juz) => ({ value: juz, label: `Juz ${juz}` }))
                  ]}
                  className="w-full py-3 md:py-2.5 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#d19e44]"
                />
              )}
            </div>
            
            {selectedJuz !== null && (
              <div className="fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 mt-4 gap-2">
                <label className="block text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">2. Pilih Siswa (Target Juz {selectedJuz})</label>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={siswaSearchTerm}
                    onChange={(e) => setSiswaSearchTerm(e.target.value)}
                    placeholder="Cari nama siswa..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#031433] text-slate-800 dark:text-white focus:ring-2 focus:ring-[#d19e44] outline-none"
                  />
                </div>
              </div>
              <div className="max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-2">
                  {siswaBinaan
                    .filter(s => s.target.includes(selectedJuz) && s.nama.toLowerCase().includes(siswaSearchTerm.toLowerCase()))
                    .map(s => {
                      const sSetoran = setoran.filter(set => set.siswa_id === s.id && set.juz === selectedJuz);
                      const progressInfo = getJuzProgress(selectedJuz, sSetoran);

                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSiswaId(s.id)}
                          className={`flex flex-col p-3.5 rounded-xl border text-left transition-all relative overflow-hidden shrink-0 ${
                            selectedSiswaId === s.id 
                            ? 'border-[#d19e44] bg-slate-50 dark:bg-emerald-900/30 shadow-sm ring-1 ring-[#d19e44]/20' 
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center w-full mb-3 z-10 relative">
                            <div className="w-10 h-10 rounded-full bg-[#031433] flex items-center justify-center text-white font-bold mr-3 shrink-0 shadow-sm overflow-hidden">
                              {s.foto ? (
                                <img src={s.foto} alt={s.nama} className="w-full h-full object-cover" />
                              ) : (
                                s.nama[0]
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{s.nama}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Username: {s.username || s.nis || '-'} • {s.bin_binti || ''} {s.nama_ayah || ''}</p>
                            </div>
                            {selectedSiswaId === s.id && (
                              <div className="text-[#d19e44] shrink-0">
                                <CheckCircle className="w-5 h-5 drop-shadow-sm" />
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full z-10 relative">
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Progres Juz</span>
                              <span className="text-[10px] font-bold text-[#d19e44] dark:text-[#d19e44]">{progressInfo.text}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#d19e44] h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressInfo.percentage}%` }}></div>
                            </div>
                          </div>
                          
                          {selectedSiswaId === s.id && (
                            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-[#d19e44]/[0.15] to-transparent rounded-bl-full pointer-events-none"></div>
                          )}
                        </button>
                      );
                  })}
                  {siswaBinaan.filter(s => s.target.includes(selectedJuz) && s.nama.toLowerCase().includes(siswaSearchTerm.toLowerCase())).length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      Tidak ada siswa yang cocok dengan pencarian.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        ) : (
          <div className="mt-4 fade-in">
            <button 
              onClick={() => setSelectedSiswaId(null)}
              className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-4 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 w-fit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m15 18-6-6 6-6"/></svg>
              Kembali
            </button>
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#031433] flex items-center justify-center text-white font-bold shrink-0 shadow-sm overflow-hidden">
                    {selectedSiswa.foto ? (
                      <img src={selectedSiswa.foto} alt={selectedSiswa.nama} className="w-full h-full object-cover" />
                    ) : (
                      selectedSiswa.nama[0]
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base md:text-lg">
                      {selectedSiswa.nama}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Username: {selectedSiswa.username || selectedSiswa.nis || '-'}
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#031433] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2 w-fit">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Juz</span>
                  <span className="font-black text-[#d19e44] text-sm">{selectedJuz}</span>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-600 font-medium text-justify md:text-left">Klik pada surat untuk input nilai baru, atau klik pada kotak berwarna untuk merevisi.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {JUZ_SURAH_MAP[selectedJuz]?.map((surah) => {
                const status = getSurahStatus(surah);
                const allStatuses = setoran.filter(s => s.siswa_id === selectedSiswaId && s.juz === selectedJuz && s.surah === surah);
                const hasProgress = allStatuses.length > 0;
                
                if (selectedJuz <= 28) {
                  const rangeArr = JUZ_SURAH_AYAT_RANGE[selectedJuz]?.[surah];
                  const minA = rangeArr ? rangeArr[0] : 1;
                  const maxA = rangeArr ? rangeArr[1] : (SURAH_AYAT_COUNT[surah] || 286);
                  return (
                    <button 
                      key={surah}
                      onClick={() => handleSurahClick(surah)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:-translate-y-0.5 shadow-sm tap-bounce text-center ${
                        hasProgress 
                        ? 'bg-slate-50 border-[#d19e44]/70 dark:bg-emerald-900/30 dark:border-emerald-700/50'
                        : 'bg-white dark:bg-[#031433] border-slate-200 dark:border-slate-600 hover:border-[#d19e44]/70'
                      }`}
                    >
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{surah}</span>
                      <span className="text-[11px] font-medium text-slate-400 mt-1">
                        Ayat {minA}-{maxA}
                      </span>
                    </button>
                  );
                }

                const optColor = status ? getNilaiBgColor(status.nilai) : '';
                return (
                  <button 
                    key={surah}
                    onClick={() => handleSurahClick(surah)}
                    className={`flex flex-col p-3 rounded-xl border transition-all hover:-translate-y-0.5 shadow-sm tap-bounce text-left ${
                      status 
                      ? optColor
                      : 'bg-white dark:bg-[#031433] border-slate-200 dark:border-slate-600 hover:border-[#d19e44]/70'
                    }`}
                  >
                    <span className={`text-sm font-bold ${status ? '' : 'text-slate-700 dark:text-slate-200'}`}>{surah}</span>
                    <span className={`text-[10px] mt-1 font-semibold flex flex-col gap-1 ${status ? '' : 'text-slate-400 mt-2'}`}>
                      {status ? (
                        <>
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {formatNilai(status.nilai)}</span>
                            <span className="opacity-75">{new Date(status.tgl).toLocaleDateString('id-ID')}</span>
                          </span>
                        </>
                      ) : (
                        'Belum disetorkan'
                      )}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedJuz <= 28 && setoran.filter(s => s.siswa_id === selectedSiswaId && s.juz === selectedJuz).length > 0 && (
              <div className="mt-8 fade-in">
                <h3 className="font-bold text-slate-800 dark:text-white text-base mb-4">Ayat yang sudah dinilai:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {setoran
                    .filter(s => s.siswa_id === selectedSiswaId && s.juz === selectedJuz)
                    .sort((a,b) => {
                       const surahDiff = a.surah.localeCompare(b.surah);
                       if (surahDiff !== 0) return surahDiff;
                       // sort by ayat awal
                       const getAwal = (ayat: string) => {
                         if (!ayat || ayat === 'Lengkap 1 Surah' || ayat === 'Lengkap') return 0;
                         const m = ayat.match(/\d+/);
                         return m ? parseInt(m[0], 10) : 0;
                       };
                       return getAwal(a.ayat) - getAwal(b.ayat);
                    })
                    .map((status, idx) => {
                      const optColor = getNilaiBgColor(status.nilai);
                      
                      return (
                        <button 
                          key={status.id || idx}
                          onClick={() => handleSurahClick(status.surah, status.ayat)}
                          className={`flex flex-col p-3 rounded-xl border transition-all hover:-translate-y-0.5 shadow-sm tap-bounce text-left ${optColor}`}
                        >
                          <span className="text-sm font-bold">{status.surah}</span>
                          <span className="text-[10px] mt-1 font-semibold flex flex-col gap-1">
                            <span className="mb-0.5">{status.juz <= 28 ? (status.ayat ? `Ayat ${status.ayat}` : 'Lengkap') : (status.ayat && status.ayat !== 'Lengkap 1 Surah' && status.ayat !== 'Lengkap' ? `Ayat ${status.ayat}` : '')}</span>
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> {formatNilai(status.nilai)}</span>
                              <span className="opacity-75">{new Date(status.tgl).toLocaleDateString('id-ID')}</span>
                            </span>
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
