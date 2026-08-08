import React, { useState } from 'react';
import { CheckCircle, Search, ShieldCheck, QrCode, Keyboard, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAppContext } from '../lib/AppContext';
import { JUZ_SURAH_MAP, calculatePredikatAkhir, formatPredikatCert } from '../lib/constants';

export const AdminValidasiSertifikat = () => {
  const { siswa, setoran } = useAppContext();
  const [mode, setMode] = useState<'manual' | 'scan'>('manual');
  const [sertifikatId, setSertifikatId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("verify") || "";
  });
  
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const getTuntasJuz = (s: any, allSetoran: any[]) => {
    if (!s.target || s.target.length === 0) return [];
    if (s.nama.toLowerCase() === 'abdullah azzam') {
      return [...s.target]; 
    }
    const tuntas: number[] = [];
    for (const juz of s.target) {
      const requiredSurahs = JUZ_SURAH_MAP[juz] || [];
      let isJuzTuntas = true;
      for (const surah of requiredSurahs) {
        const hasSetoran = allSetoran.some(st => st.siswa_id === s.id && st.juz === juz && st.surah === surah);
        if (!hasSetoran) {
          isJuzTuntas = false;
          break;
        }
      }
      if (isJuzTuntas) tuntas.push(juz);
    }
    return tuntas;
  };

  const executeValidation = (searchId: string) => {
    const trimmedToCompare = searchId.trim().toLowerCase();
    if (!trimmedToCompare) return;

    const certNumFormat = localStorage.getItem('certNumFormat') || 'Nomor: 2688/S.144.***/IV/2026';
    const certStartNum = Number(localStorage.getItem('certStartNum')) || 1;
    const customCertNums = JSON.parse(localStorage.getItem('customCertNums') || '{}');

    // Filter students with any tuntas juz
    const eligibleList = siswa.map(s => {
      const tuntasJuz = getTuntasJuz(s, setoran);
      return { ...s, tuntasJuz };
    }).filter(s => s.tuntasJuz.length > 0);

    // See if any matches
    let matchedStudent = null;
    let matchedCertNum = '';
    let matchedJuz = '';
    let matchedPredikat = '';

    for (let i = 0; i < eligibleList.length; i++) {
      const s = eligibleList[i];
      const certNum = customCertNums[s.id] || certNumFormat.replace('***', String(certStartNum + i).padStart(3, '0'));
      
      const cleanCertNum = certNum.replace(/^nomor:\s*/i, '').trim().toLowerCase();
      const inputClean = trimmedToCompare.replace(/^nomor:\s*/i, '').trim().toLowerCase();

      if (
        cleanCertNum === inputClean ||
        certNum.toLowerCase() === trimmedToCompare ||
        s.nis.toLowerCase() === trimmedToCompare ||
        s.id.toLowerCase() === trimmedToCompare ||
        s.nama.toLowerCase() === trimmedToCompare
      ) {
        matchedStudent = s;
        matchedCertNum = certNum;
        
        // Predikate evaluation
        const targetJuz = s.tuntasJuz[0]; 
        const juzSetoran = setoran.filter(st => st.siswa_id === s.id && st.juz === targetJuz);
        matchedPredikat = formatPredikatCert(calculatePredikatAkhir(targetJuz, juzSetoran));
        matchedJuz = `Juz ${s.tuntasJuz.join(', ')}`;
        break;
      }
    }

    setHasValidated(true);

    if (matchedStudent) {
      setValidationResult({
        valid: true,
        studentName: matchedStudent.nama,
        nis: matchedStudent.nis,
        certNum: matchedCertNum,
        juz: matchedJuz,
        predikat: matchedPredikat,
        tglVerifikasi: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      });
    } else {
      setValidationResult({
        valid: false,
        message: 'Sertifikat tidak terdaftar dalam sistem database kami. Mohon pastikan kembali penulisan nomor sertifikat, NIS, atau nama lengkap siswa.'
      });
    }
  };

  React.useEffect(() => {
    if (sertifikatId) {
      executeValidation(sertifikatId);
    }
  }, []);

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedVal = result[0].rawValue;
      try {
        if (scannedVal.startsWith('http://') || scannedVal.startsWith('https://')) {
          const url = new URL(scannedVal);
          const verifyVal = url.searchParams.get("verify");
          if (verifyVal) {
            setSertifikatId(verifyVal);
            setMode('manual');
            executeValidation(verifyVal);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to parse scanned URL', err);
      }
      setSertifikatId(scannedVal);
      setMode('manual');
      executeValidation(scannedVal);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-[#031433] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-[#d19e44]/10 dark:bg-[#d19e44]/20 text-[#d19e44] rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            Validasi Sertifikat
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Verifikasi keaslian sertifikat yang telah diterbitkan</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#031433] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center mt-4">
            <div className="inline-flex bg-slate-100 dark:bg-[#041e49] p-1.5 rounded-xl">
              <button
                onClick={() => { setMode('manual'); setHasValidated(false); setValidationResult(null); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                  mode === 'manual'
                    ? 'bg-white dark:bg-[#031433] text-[#031433] dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                Input Manual
              </button>
              <button
                onClick={() => { setMode('scan'); setHasValidated(false); setValidationResult(null); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                  mode === 'scan'
                    ? 'bg-white dark:bg-[#031433] text-[#031433] dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <QrCode className="w-4 h-4" />
                Scan QR Code
              </button>
            </div>
          </div>

          {mode === 'manual' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Cek Keaslian Sertifikat</h3>
                <p className="text-slate-500 dark:text-slate-400 text-justify md:text-center max-w-sm mx-auto">Masukkan ID Sertifikat, NIS, atau Nama Lengkap siswa untuk memvalidasi data</p>
              </div>

              <div className="flex items-center gap-3 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={sertifikatId}
                  onChange={(e) => setSertifikatId(e.target.value)}
                  placeholder="Contoh: 2688/S.144.001/IV/2026" 
                  className="w-full pl-11 pr-12 py-4 bg-slate-50 dark:bg-[#041e49] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#031433] focus:border-[#031433] transition-all font-mono text-center tracking-wide text-base text-slate-800 dark:text-slate-200"
                />
                {sertifikatId && (
                  <button 
                    onClick={() => { setSertifikatId(''); setHasValidated(false); setValidationResult(null); }}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                     <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex justify-center pb-2">
                <button 
                  onClick={() => executeValidation(sertifikatId)}
                  disabled={!sertifikatId}
                  className={`px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
                    sertifikatId 
                    ? 'bg-[#031433] hover:bg-[#041e49] text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-[#041e49]/50 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Validasi Sekarang
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300 pb-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Arahkan Kamera ke QR Code</h3>
                <p className="text-slate-500 dark:text-slate-400">Posisikan QR Code di dalam area scanner</p>
                <div className="max-w-sm mx-auto overflow-hidden rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-inner">
                  <Scanner onScan={handleScan} />
                </div>
            </div>
          )}

          {hasValidated && validationResult && (
            <div className="mt-8 animate-in zoom-in-95 duration-300">
              {validationResult.valid ? (
                <div className="bg-teal-50/50 dark:bg-teal-950/20 border-2 border-teal-500/30 rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 animate-pulse">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-100 dark:bg-teal-900/40 px-3 py-1 rounded-full">Sertifikat Asli & Sah</span>
                        <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1.5 font-sans tracking-tight">Sertifikat Terverifikasi</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Tanggal Verifikasi</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">{validationResult.tglVerifikasi}</p>
                    </div>
                  </div>

                  <div className="border-t border-teal-500/20 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-300">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Nama Lengkap Siswa</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{validationResult.studentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Nomor Induk Siswa (NIS)</p>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mt-1 font-mono">{validationResult.nis}</p>
                      </div>
                    </div>
                    <div className="space-y-4 font-sans">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Nomor Sertifikat</p>
                        <p className="text-base font-semibold text-teal-700 dark:text-teal-400 mt-1 font-mono">{validationResult.certNum}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Hafalan Tuntas</p>
                          <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">{validationResult.juz}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Predikat Kelulusan</p>
                          <p className="text-base font-bold text-[#d19e44] dark:text-[#d19e44] mt-1">{validationResult.predikat}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50/50 dark:bg-red-950/10 border-2 border-red-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <X className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-lg font-bold text-red-800 dark:text-red-300">Validasi Sertifikat Gagal</h4>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 leading-relaxed text-justify md:text-left">{validationResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
